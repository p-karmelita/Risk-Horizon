import { getMockSupplierFixture } from "@/lib/mockData";
import type { ScrapedDocument, SearchResult } from "@/lib/types";

const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;
const BRIGHT_DATA_SERP_ZONE = process.env.BRIGHT_DATA_SERP_ZONE;
const BRIGHT_DATA_UNLOCKER_ZONE = process.env.BRIGHT_DATA_UNLOCKER_ZONE;
const BRIGHT_DATA_REQUEST_ENDPOINT =
  process.env.BRIGHT_DATA_REQUEST_ENDPOINT ?? "https://api.brightdata.com/request";

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
  method = "GET"
}: {
  zone: string;
  targetUrl: string;
  format: "json" | "raw";
  country?: string;
  method?: "GET" | "POST";
}): Promise<TResponse | string> {
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
    throw new Error(
      `Bright Data request failed: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody.slice(0, 240)}` : ""}`
    );
  }

  if (format === "json") {
    return (await response.json()) as TResponse;
  }

  return response.text();
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

  // Bright Data's docs currently show the REST entrypoint as POST /request with
  // `zone`, `url`, and `format`. If your account uses a different REST hostname,
  // auth method, or zone-specific parameters, update BRIGHT_DATA_REQUEST_ENDPOINT
  // or the payload below.
  const payload = (await brightDataRequest<BrightDataSerpResponse>({
    zone: BRIGHT_DATA_SERP_ZONE as string,
    targetUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=us`,
    format: "json",
    method: "GET",
    country: "us"
  })) as BrightDataSerpResponse;

  const normalized = normalizeBrightDataSearchResults(payload);

  if (normalized.length === 0) {
    throw new Error("Bright Data SERP returned no organic results.");
  }

  return normalized;
}

export async function scrapeWithBrightData(
  url: string
): Promise<BrightDataScrapeResult> {
  if (!brightDataConfigured()) {
    throw new Error("Bright Data is not fully configured.");
  }

  // Bright Data's Unlocker API also uses POST /request in the current docs.
  // Some accounts may prefer Scraping Browser or async Unlocker flows instead.
  // If so, swap this helper without changing the rest of the app.
  const payload = (await brightDataRequest<BrightDataUnlockerResponse>({
    zone: BRIGHT_DATA_UNLOCKER_ZONE as string,
    targetUrl: url,
    format: "raw",
    method: "GET",
    country: "us"
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

  return {
    url,
    title: extractTitleFromHtml(html),
    text
  };
}

export async function searchSupplierWeb(
  supplierName: string,
  queries: string[]
): Promise<SearchResult[]> {
  if (!brightDataConfigured()) {
    return getMockSupplierFixture(supplierName).searchResults;
  }

  try {
    const queryBatch = queries.slice(0, 4);
    const responses = await Promise.allSettled(
      queryBatch.map((query) => searchWithBrightData(query))
    );

    const deduped = new Map<string, SearchResult>();

    for (const response of responses) {
      if (response.status !== "fulfilled") continue;
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

    return parsed;
  } catch (error) {
    console.warn("Falling back to mock Bright Data search.", error);
    return getMockSupplierFixture(supplierName).searchResults;
  }
}

export async function scrapeSupplierSources(
  supplierName: string,
  results: SearchResult[]
): Promise<ScrapedDocument[]> {
  if (!brightDataConfigured()) {
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

    return scraped;
  } catch (error) {
    console.warn("Falling back to mock source scraping.", error);
    return getMockSupplierFixture(supplierName).scrapedDocuments;
  }
}
