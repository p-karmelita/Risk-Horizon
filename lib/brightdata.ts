import { getMockSupplierFixture } from "@/lib/mockData";
import type {
  ScrapedDocument,
  SearchResult,
  AgentPerformanceMetrics,
  ProgressCallback
} from "@/lib/types";

const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;
const BRIGHT_DATA_SERP_ZONE = process.env.BRIGHT_DATA_SERP_ZONE;
const BRIGHT_DATA_UNLOCKER_ZONE = process.env.BRIGHT_DATA_UNLOCKER_ZONE;
const BRIGHT_DATA_REQUEST_ENDPOINT =
  process.env.BRIGHT_DATA_REQUEST_ENDPOINT ?? "https://api.brightdata.com/request";

// Per-request timeout so a single slow/dead URL can't stall the whole batch.
// (One hung sciencedirect.com scrape once held a request open for 2.4 minutes.)
const BRIGHT_DATA_REQUEST_TIMEOUT_MS = Number(
  process.env.BRIGHT_DATA_REQUEST_TIMEOUT_MS ?? 15000
);

type BrightDataAuthMode = "request_api" | "proxy_url";

// buildSupplierQueries() returns a prioritized pool; in live mode we run only
// the top N to bound cost/latency. Kept as a named constant so metrics report
// the number actually attempted rather than the size of the full pool.
const MAX_LIVE_SEARCH_QUERIES = 4;

// Performance tracking for agentic operations
export const performanceMetrics: AgentPerformanceMetrics[] = [];

function logMetric(metric: AgentPerformanceMetrics) {
  performanceMetrics.push(metric);
  console.log(`[Agent Performance] ${metric.stage}:`, {
    duration: metric.duration ? `${metric.duration}ms` : "in progress",
    success: metric.success,
    details: metric.details
  });
}

export function clearMetrics() {
  performanceMetrics.length = 0;
}

export function getMetrics(): AgentPerformanceMetrics[] {
  return [...performanceMetrics];
}

interface BrightDataNormalizedSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface BrightDataScrapeResult {
  url: string;
  title?: string;
  text: string;
}

interface BrightDataSerpOrganicEntry {
  link?: string;
  title?: string;
  description?: string;
  source?: string;
  display_link?: string;
}

interface BrightDataSerpResponse {
  organic?: BrightDataSerpOrganicEntry[];
}

// The /request API wraps responses as { status_code, headers, body } only when
// called with format:"json". We instead request format:"raw" + brd_json=1, which
// returns the parsed SERP payload directly (organic[] at the top level). This
// helper also tolerates the envelope shape and JSON-string bodies, just in case.
interface BrightDataRequestEnvelope {
  status_code?: number;
  body?: unknown;
}

function unwrapSerpResponse(payload: unknown): BrightDataSerpResponse {
  let value: unknown = payload;

  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }

  if (!value || typeof value !== "object") return {};

  const candidate = value as BrightDataRequestEnvelope & BrightDataSerpResponse;

  // Direct SERP payload — organic[] at the top level (format:"raw" + brd_json=1).
  if (Array.isArray(candidate.organic)) {
    return candidate;
  }

  // Envelope fallback (format:"json"): the SERP payload lives in `body`.
  let body = candidate.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body && typeof body === "object" ? (body as BrightDataSerpResponse) : {};
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

interface BrightDataUnlockerResponse {
  body?: string;
}

interface ProxyCredentials {
  url: string;
}

function getBrightDataAuthMode(): BrightDataAuthMode | null {
  if (!BRIGHT_DATA_API_KEY) return null;

  if (BRIGHT_DATA_API_KEY.startsWith("http://") || BRIGHT_DATA_API_KEY.startsWith("https://")) {
    return "proxy_url";
  }

  return "request_api";
}

function getProxyCredentials(): ProxyCredentials {
  if (!BRIGHT_DATA_API_KEY) {
    throw new Error("Bright Data proxy URL is missing.");
  }

  let parsed: URL;
  try {
    parsed = new URL(BRIGHT_DATA_API_KEY);
  } catch {
    throw new Error("Bright Data proxy URL is invalid.");
  }

  if (!parsed.username || !parsed.password) {
    throw new Error("Bright Data proxy URL must include username and password.");
  }

  return { url: parsed.toString() };
}

async function fetchViaBrightDataProxy(targetUrl: string, stageName?: string) {
  const edgeFetchModule = (await import(
    "next/dist/compiled/@edge-runtime/primitives/fetch.js"
  )) as unknown as {
    ProxyAgent: new (uri: string) => unknown;
    fetch: typeof fetch;
  };
  const proxy = getProxyCredentials();
  const dispatcher = new edgeFetchModule.ProxyAgent(proxy.url);

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    BRIGHT_DATA_REQUEST_TIMEOUT_MS
  );

  let response: Awaited<ReturnType<typeof fetch>>;
  try {
    response = await edgeFetchModule.fetch(targetUrl, {
      dispatcher: dispatcher as never,
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    } as never);
  } catch (fetchError) {
    if (controller.signal.aborted) {
      throw new Error(
        `${stageName ?? "Bright Data proxy request"} timed out after ${BRIGHT_DATA_REQUEST_TIMEOUT_MS}ms`
      );
    }
    throw fetchError;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(
      `${stageName ?? "Bright Data proxy request"} failed: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody.slice(0, 240)}` : ""}`
    );
  }

  return response.text();
}

export function brightDataConfigured() {
  return Boolean(
    BRIGHT_DATA_API_KEY && BRIGHT_DATA_SERP_ZONE && BRIGHT_DATA_UNLOCKER_ZONE
  );
}

async function brightDataRequest<TResponse>({
  zone,
  targetUrl,
  format,
  country = "us",
  method = "GET",
  stageName
}: {
  zone: string;
  targetUrl: string;
  format: "json" | "raw";
  country?: string;
  method?: "GET" | "POST";
  stageName?: string;
}): Promise<TResponse | string> {
  const startTime = Date.now();
  const authMode = getBrightDataAuthMode();
  const metric: AgentPerformanceMetrics = {
    stage: stageName || `Bright Data ${zone} Request`,
    startTime,
    success: false,
    details: {
      zone,
      targetUrl: targetUrl.slice(0, 100),
      format,
      method,
      authMode
    }
  };

  try {
    if (authMode === "proxy_url") {
      const result = await fetchViaBrightDataProxy(targetUrl, stageName);
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.success = true;
      metric.details = {
        ...metric.details,
        responseSize: result.length,
        mode: "proxy"
      };
      logMetric(metric);
      return result;
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      BRIGHT_DATA_REQUEST_TIMEOUT_MS
    );

    let response: Response;
    try {
      response = await fetch(BRIGHT_DATA_REQUEST_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BRIGHT_DATA_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          zone,
          url: targetUrl,
          format,
          method,
          country
        }),
        cache: "no-store",
        signal: controller.signal
      });
    } catch (fetchError) {
      if (controller.signal.aborted) {
        throw new Error(
          `Bright Data request timed out after ${BRIGHT_DATA_REQUEST_TIMEOUT_MS}ms`
        );
      }
      throw fetchError;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      const error = `Bright Data request failed: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody.slice(0, 240)}` : ""}`;
      metric.endTime = Date.now();
      metric.duration = metric.endTime - metric.startTime;
      metric.error = error;
      logMetric(metric);
      throw new Error(error);
    }

    let result: TResponse | string;
    if (format === "json") {
      result = (await response.json()) as TResponse;
    } else {
      result = await response.text();
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = true;
    metric.details = {
      ...metric.details,
      responseSize: typeof result === "string" ? result.length : JSON.stringify(result).length,
      statusCode: response.status
    };
    logMetric(metric);

    return result;
  } catch (error) {
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.error = error instanceof Error ? error.message : String(error);
    logMetric(metric);
    throw error;
  }
}

function normalizeWhitespace(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function stripHtml(html: string) {
  return normalizeWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
  );
}

function extractTitleFromHtml(html: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return titleMatch ? normalizeWhitespace(stripHtml(titleMatch[1])) : undefined;
}

function normalizeBrightDataSearchResults(
  payload: BrightDataSerpResponse
): BrightDataNormalizedSearchResult[] {
  return (payload.organic ?? [])
    .map((entry) => ({
      title: normalizeWhitespace(entry.title ?? ""),
      url: entry.link ?? "",
      snippet: normalizeWhitespace(entry.description ?? ""),
      source: normalizeWhitespace(entry.source ?? entry.display_link ?? "Public Web")
    }))
    .filter((entry) => entry.title && entry.url);
}

function normalizeSearchResultsFromHtml(html: string): BrightDataNormalizedSearchResult[] {
  const h3Matches = [
    ...html.matchAll(/<a[^>]+href="\/url\?q=([^"&]+)[^"]*"[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/gi)
  ];

  const fallbackMatches = [
    ...html.matchAll(/<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/gi)
  ];

  const matches = h3Matches.length > 0 ? h3Matches : fallbackMatches;

  return matches
    .slice(0, 10)
    .map((match) => ({
      title: normalizeWhitespace(stripHtml(match[2] ?? "")),
      url: decodeURIComponent(match[1] ?? ""),
      snippet: "Result retrieved through Bright Data proxy search.",
      source: "Public Web"
    }))
    .filter((entry) => entry.title && entry.url);
}

function mapSearchResult(result: BrightDataNormalizedSearchResult): SearchResult {
  return {
    title: result.title,
    url: result.url,
    snippet: result.snippet,
    publisher: result.source,
    publishedAt: new Date().toISOString().slice(0, 10),
    sourceType: "News"
  };
}

function mapScrapedDocument(
  supplierResult: SearchResult,
  scrape: BrightDataScrapeResult
): ScrapedDocument {
  return {
    url: scrape.url,
    title: scrape.title ?? supplierResult.title,
    sourceType: supplierResult.sourceType,
    snippet: supplierResult.snippet,
    content: scrape.text.slice(0, 4000),
    publisher: supplierResult.publisher,
    publishedAt: supplierResult.publishedAt
  };
}

export async function searchWithBrightData(
  query: string
): Promise<BrightDataNormalizedSearchResult[]> {
  if (!brightDataConfigured()) {
    throw new Error("Bright Data is not fully configured.");
  }

  const startTime = Date.now();
  const metric: AgentPerformanceMetrics = {
    stage: "SERP API Search",
    startTime,
    success: false,
    details: { query }
  };

  try {
    const isProxyMode = getBrightDataAuthMode() === "proxy_url";
    // brd_json=1 asks the SERP zone to return parsed JSON instead of HTML; only
    // meaningful for the request API (proxy mode fetches raw HTML directly).
    const serpUrl = isProxyMode
      ? `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=us`
      : `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=us&brd_json=1`;

    // format:"raw" returns the body as-is — JSON text (with brd_json=1) for the
    // request API, or raw HTML for proxy mode.
    const payload = await brightDataRequest<string>({
      zone: BRIGHT_DATA_SERP_ZONE as string,
      targetUrl: serpUrl,
      format: "raw",
      method: "GET",
      country: "us",
      stageName: `SERP Search: "${query.slice(0, 50)}"`
    });

    const normalized =
      typeof payload === "string" && !looksLikeJson(payload)
        ? normalizeSearchResultsFromHtml(payload)
        : normalizeBrightDataSearchResults(unwrapSerpResponse(payload));

    if (normalized.length === 0) {
      throw new Error("Bright Data SERP returned no organic results.");
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = true;
    metric.details = {
      ...metric.details,
      resultsCount: normalized.length
    };
    logMetric(metric);

    return normalized;
  } catch (error) {
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.error = error instanceof Error ? error.message : String(error);
    logMetric(metric);
    throw error;
  }
}

export async function scrapeWithBrightData(
  url: string
): Promise<BrightDataScrapeResult> {
  if (!brightDataConfigured()) {
    throw new Error("Bright Data is not fully configured.");
  }

  const startTime = Date.now();
  const metric: AgentPerformanceMetrics = {
    stage: "Web Unlocker Scrape",
    startTime,
    success: false,
    details: { url: url.slice(0, 100) }
  };

  try {
    const payload = await brightDataRequest<BrightDataUnlockerResponse>({
      zone: BRIGHT_DATA_UNLOCKER_ZONE as string,
      targetUrl: url,
      format: "raw",
      method: "GET",
      country: "us",
      stageName: `Scrape: ${new URL(url).hostname}`
    });

    let html = typeof payload === "string" ? payload : JSON.stringify(payload);
    try {
      const maybeWrapped = JSON.parse(html) as BrightDataUnlockerResponse;
      if (typeof maybeWrapped.body === "string") {
        html = maybeWrapped.body;
      }
    } catch {
      // Raw HTML/text is expected for most Unlocker responses.
    }

    const text = stripHtml(html).slice(0, 10000);
    if (!text) {
      throw new Error("Bright Data Unlocker returned empty page text.");
    }

    const result = {
      url,
      title: extractTitleFromHtml(html),
      text
    };

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = true;
    metric.details = {
      ...metric.details,
      title: result.title,
      contentLength: text.length
    };
    logMetric(metric);

    return result;
  } catch (error) {
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.error = error instanceof Error ? error.message : String(error);
    logMetric(metric);
    throw error;
  }
}

export async function searchSupplierWeb(
  supplierName: string,
  queries: string[],
  liveMode = false,
  onProgress?: ProgressCallback
): Promise<SearchResult[]> {
  const startTime = Date.now();
  const metric: AgentPerformanceMetrics = {
    stage: "Multi-Query Search Aggregation",
    startTime,
    success: false,
    details: {
      supplierName,
      queriesAvailable: queries.length,
      queriesCount: Math.min(queries.length, MAX_LIVE_SEARCH_QUERIES),
      liveMode
    }
  };

  if (!liveMode || !brightDataConfigured()) {
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = true;
    metric.details = { ...metric.details, mode: "mock" };
    logMetric(metric);
    return getMockSupplierFixture(supplierName).searchResults;
  }

  try {
    const queryBatch = queries.slice(0, MAX_LIVE_SEARCH_QUERIES);
    onProgress?.({
      stage: "search",
      status: "active",
      message: `Searching the web with ${queryBatch.length} queries…`
    });
    const responses = await Promise.allSettled(
      queryBatch.map(async (query) => {
        try {
          const found = await searchWithBrightData(query);
          onProgress?.({
            stage: "search",
            status: "active",
            message: `✓ "${query}" — ${found.length} results`
          });
          return found;
        } catch (queryError) {
          onProgress?.({
            stage: "search",
            status: "active",
            message: `✗ "${query}" — no results`
          });
          throw queryError;
        }
      })
    );

    const deduped = new Map<string, SearchResult>();
    let successfulQueries = 0;

    for (const response of responses) {
      if (response.status !== "fulfilled") continue;
      successfulQueries++;
      for (const result of response.value) {
        if (!deduped.has(result.url)) {
          deduped.set(result.url, mapSearchResult(result));
        }
      }
    }

    const parsed = [...deduped.values()].slice(0, 5);

    if (parsed.length === 0) {
      throw new Error("Bright Data SERP returned no usable search results.");
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = true;
    metric.details = {
      ...metric.details,
      mode: "live",
      successfulQueries,
      totalResults: parsed.length
    };
    logMetric(metric);

    return parsed;
  } catch (error) {
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.error = error instanceof Error ? error.message : String(error);
    metric.details = { ...metric.details, fallbackToMock: true };
    logMetric(metric);
    
    console.warn("Falling back to mock Bright Data search.", error);
    return getMockSupplierFixture(supplierName).searchResults;
  }
}

export async function scrapeSupplierSources(
  supplierName: string,
  results: SearchResult[],
  liveMode = false,
  onProgress?: ProgressCallback
): Promise<ScrapedDocument[]> {
  const startTime = Date.now();
  const metric: AgentPerformanceMetrics = {
    stage: "Parallel Source Scraping",
    startTime,
    success: false,
    details: {
      supplierName,
      sourcesCount: results.length,
      liveMode
    }
  };

  if (!liveMode || !brightDataConfigured()) {
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = true;
    metric.details = { ...metric.details, mode: "mock" };
    logMetric(metric);
    return getMockSupplierFixture(supplierName).scrapedDocuments;
  }

  try {
    const sources = results.slice(0, 5);
    onProgress?.({
      stage: "search",
      status: "active",
      message: `Scraping ${sources.length} sources…`
    });
    const scrapedSettled = await Promise.allSettled(
      sources.map(async (result) => {
        let hostname = result.url;
        try {
          hostname = new URL(result.url).hostname;
        } catch {
          // keep raw url if it can't be parsed
        }
        try {
          const scrapedPage = await scrapeWithBrightData(result.url);
          const doc = mapScrapedDocument(result, scrapedPage);
          onProgress?.({
            stage: "search",
            status: "active",
            message: `✓ Scraped ${hostname}`
          });
          return doc;
        } catch (scrapeError) {
          onProgress?.({
            stage: "search",
            status: "active",
            message: `✗ Skipped ${hostname} (unreachable)`
          });
          throw scrapeError;
        }
      })
    );

    const scraped = scrapedSettled
      .filter((result): result is PromiseFulfilledResult<ScrapedDocument> => {
        return result.status === "fulfilled";
      })
      .map((result) => result.value);

    if (scraped.length === 0) {
      throw new Error("Bright Data Unlocker returned no usable page content.");
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = true;
    metric.details = {
      ...metric.details,
      mode: "live",
      successfulScrapes: scraped.length,
      failedScrapes: scrapedSettled.length - scraped.length
    };
    logMetric(metric);

    return scraped;
  } catch (error) {
    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.error = error instanceof Error ? error.message : String(error);
    metric.details = { ...metric.details, fallbackToMock: true };
    logMetric(metric);
    
    console.warn("Falling back to mock source scraping.", error);
    return getMockSupplierFixture(supplierName).scrapedDocuments;
  }
}
