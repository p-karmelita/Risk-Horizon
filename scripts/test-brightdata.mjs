// Standalone smoke test for the Bright Data integration.
// Mirrors the request logic in lib/brightdata.ts.
// Run with:  node --env-file=.env scripts/test-brightdata.mjs

const API_KEY = process.env.BRIGHT_DATA_API_KEY;
const SERP_ZONE = process.env.BRIGHT_DATA_SERP_ZONE;
const UNLOCKER_ZONE = process.env.BRIGHT_DATA_UNLOCKER_ZONE;
const ENDPOINT =
  process.env.BRIGHT_DATA_REQUEST_ENDPOINT ?? "https://api.brightdata.com/request";

function authMode() {
  if (!API_KEY) return null;
  if (API_KEY.startsWith("http://") || API_KEY.startsWith("https://")) return "proxy_url";
  return "request_api";
}

function configured() {
  return Boolean(API_KEY && SERP_ZONE && UNLOCKER_ZONE);
}

async function request({ zone, targetUrl, format, method = "GET", country = "us" }) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ zone, url: targetUrl, format, method, country }),
    cache: "no-store"
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${body ? ` - ${body.slice(0, 300)}` : ""}`);
  }
  return format === "json" ? res.json() : res.text();
}

function line() {
  console.log("=".repeat(60));
}

async function main() {
  line();
  console.log("Bright Data integration smoke test");
  line();
  console.log("Config check:");
  console.log("  API key present :", Boolean(API_KEY), API_KEY ? `(${API_KEY.slice(0, 6)}…)` : "");
  console.log("  SERP zone       :", SERP_ZONE || "(missing)");
  console.log("  Unlocker zone   :", UNLOCKER_ZONE || "(missing)");
  console.log("  Endpoint        :", ENDPOINT);
  console.log("  Auth mode       :", authMode());
  console.log("  Fully configured:", configured());
  line();

  if (!configured()) {
    console.error("✗ Not fully configured — aborting. Check .env values.");
    process.exit(1);
  }
  if (authMode() !== "request_api") {
    console.warn("⚠ Auth mode is proxy_url; this script only tests request_api mode.");
    process.exit(1);
  }

  let failures = 0;

  // --- Test 1: SERP search ---
  const query = "TSMC supply chain disruption";
  console.log(`\n[1] SERP API search — zone="${SERP_ZONE}", query="${query}"`);
  let firstResultUrl;
  try {
    const t = Date.now();
    // format:"raw" + brd_json=1 returns parsed SERP JSON as text (organic[] at top level)
    const raw = await request({
      zone: SERP_ZONE,
      targetUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&gl=us&brd_json=1`,
      format: "raw"
    });
    let body;
    try { body = JSON.parse(raw); } catch { body = {}; }
    const organic = body?.organic ?? [];
    console.log(`  ✓ ${Date.now() - t}ms — ${organic.length} organic results`);
    organic.slice(0, 3).forEach((e, i) =>
      console.log(`     ${i + 1}. ${(e.title || "").slice(0, 70)}\n        ${e.link}`)
    );
    firstResultUrl = organic[0]?.link;
    if (organic.length === 0) {
      console.warn("  ⚠ No organic results returned.");
      failures++;
    }
  } catch (err) {
    console.error("  ✗ SERP search failed:", err.message);
    failures++;
  }

  // --- Test 2: Web Unlocker scrape ---
  const scrapeUrl = firstResultUrl ?? "https://example.com";
  console.log(`\n[2] Web Unlocker scrape — zone="${UNLOCKER_ZONE}", url="${scrapeUrl}"`);
  try {
    const t = Date.now();
    const html = await request({
      zone: UNLOCKER_ZONE,
      targetUrl: scrapeUrl,
      format: "raw"
    });
    const text = String(html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    console.log(`  ✓ ${Date.now() - t}ms — ${String(html).length} bytes raw, ${text.length} chars text`);
    console.log(`     preview: ${text.slice(0, 160)}…`);
    if (text.length === 0) {
      console.warn("  ⚠ Empty page text.");
      failures++;
    }
  } catch (err) {
    console.error("  ✗ Scrape failed:", err.message);
    failures++;
  }

  line();
  if (failures === 0) {
    console.log("✅ All Bright Data checks passed.");
  } else {
    console.log(`❌ ${failures} check(s) failed.`);
    process.exit(1);
  }
  line();
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
