import { getMockSupplierFixture } from "@/lib/mockData";
import type { ScrapedDocument, SearchResult, AgentPerformanceMetrics } from "@/lib/types";

const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;
const BRIGHT_DATA_SERP_ZONE = process.env.BRIGHT_DATA_SERP_ZONE;
const BRIGHT_DATA_UNLOCKER_ZONE = process.env.BRIGHT_DATA_UNLOCKER_ZONE;
const BRIGHT_DATA_REQUEST_ENDPOINT =
  process.env.BRIGHT_DATA_REQUEST_ENDPOINT ?? "https://api.brightdata.com/request";

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

interface BrightDataUnlockerResponse {
  body?: string;
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
  const metric: AgentPerformanceMetrics = {
    stage: stageName || `Bright Data ${zone} Request`,
    startTime,
    success: false,
    details: {
      zone,
      targetUrl: targetUrl.slice(0, 100),
      format,
      method
    }
  };

  try {
    const response = await fetch(BRIGHT_DATA_REQUEST_ENDPOINT, {
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
      cache: "no-store"
    });

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
    const payload = (await brightDataRequest<BrightDataSerpResponse>({
      zone: BRIGHT_DATA_SERP_ZONE as string,
      targetUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=us`,
      format: "json",
      method: "GET",
      country: "us",
      stageName: `SERP Search: "${query.slice(0, 50)}"`
    })) as BrightDataSerpResponse;

    const normalized = normalizeBrightDataSearchResults(payload);

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
    const payload = (await brightDataRequest<BrightDataUnlockerResponse>({
      zone: BRIGHT_DATA_UNLOCKER_ZONE as string,
      targetUrl: url,
      format: "raw",
      method: "GET",
      country: "us",
      stageName: `Scrape: ${new URL(url).hostname}`
    })) as string;

    let html = payload;
    try {
      const maybeWrapped = JSON.parse(payload) as BrightDataUnlockerResponse;
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
  liveMode = false
): Promise<SearchResult[]> {
  const startTime = Date.now();
  const metric: AgentPerformanceMetrics = {
    stage: "Multi-Query Search Aggregation",
    startTime,
    success: false,
    details: {
      supplierName,
      queriesCount: queries.length,
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
    const queryBatch = queries.slice(0, 4);
    const responses = await Promise.allSettled(
      queryBatch.map((query) => searchWithBrightData(query))
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
  liveMode = false
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
    const scrapedSettled = await Promise.allSettled(
      results.slice(0, 5).map(async (result) => {
        const scrapedPage = await scrapeWithBrightData(result.url);
        return mapScrapedDocument(result, scrapedPage);
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
