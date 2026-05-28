import { NextResponse } from "next/server";
import { buildSupplierQueries } from "@/lib/prompts";
import { analyzeSupplierRisk } from "@/lib/llm";
import {
  scrapeSupplierSources,
  searchSupplierWeb,
  clearMetrics,
  getMetrics
} from "@/lib/brightdata";
import { resetGlobalTracker } from "@/lib/performance";
import type { SupplierRequest, AgentPerformanceMetrics } from "@/lib/types";

export async function POST(request: Request) {
  const overallStartTime = Date.now();
  
  try {
    const body = (await request.json()) as Partial<SupplierRequest>;
    const supplierName = body.supplierName?.trim();
    const liveMode = body.liveMode ?? false;

    if (!supplierName) {
      return NextResponse.json(
        { error: "supplierName is required." },
        { status: 400 }
      );
    }

    // Reset performance tracking for this request
    clearMetrics();
    const tracker = resetGlobalTracker();

    console.log(`\n${"=".repeat(60)}`);
    console.log(`🚀 Starting Supplier Analysis`);
    console.log(`   Supplier: ${supplierName}`);
    console.log(`   Mode: ${liveMode ? "🔴 LIVE (Bright Data APIs)" : "🟢 MOCK (Simulated Data)"}`);
    console.log(`${"=".repeat(60)}\n`);

    // Stage 1: Query Generation
    const queryStartTime = Date.now();
    const queries = buildSupplierQueries(supplierName);
    const queryMetric: AgentPerformanceMetrics = {
      stage: "Query Generation",
      startTime: queryStartTime,
      endTime: Date.now(),
      duration: Date.now() - queryStartTime,
      success: true,
      details: { queriesGenerated: queries.length, queries }
    };
    tracker.addMetric(queryMetric);
    console.log(`✓ Generated ${queries.length} search queries (${queryMetric.duration}ms)`);

    // Stage 2: Web Search
    const searchStartTime = Date.now();
    const searchResults = await searchSupplierWeb(supplierName, queries, liveMode);
    const searchMetric: AgentPerformanceMetrics = {
      stage: "Web Search Aggregation",
      startTime: searchStartTime,
      endTime: Date.now(),
      duration: Date.now() - searchStartTime,
      success: true,
      details: {
        resultsFound: searchResults.length,
        liveMode,
        queries: queries.length
      }
    };
    tracker.addMetric(searchMetric);
    console.log(`✓ Found ${searchResults.length} search results (${searchMetric.duration}ms)`);

    // Stage 3: Source Scraping
    const selectedResults = searchResults.slice(0, 5);
    const scrapeStartTime = Date.now();
    const scrapedDocuments = await scrapeSupplierSources(
      supplierName,
      selectedResults,
      liveMode
    );
    const scrapeMetric: AgentPerformanceMetrics = {
      stage: "Source Scraping",
      startTime: scrapeStartTime,
      endTime: Date.now(),
      duration: Date.now() - scrapeStartTime,
      success: true,
      details: {
        documentsScraped: scrapedDocuments.length,
        liveMode,
        sources: selectedResults.length
      }
    };
    tracker.addMetric(scrapeMetric);
    console.log(`✓ Scraped ${scrapedDocuments.length} documents (${scrapeMetric.duration}ms)`);

    // Stage 4: Risk Analysis
    const analysisStartTime = Date.now();
    const report = await analyzeSupplierRisk({
      supplierName,
      queries,
      searchResults: selectedResults,
      scrapedDocuments
    });
    const analysisMetric: AgentPerformanceMetrics = {
      stage: "LLM Risk Analysis",
      startTime: analysisStartTime,
      endTime: Date.now(),
      duration: Date.now() - analysisStartTime,
      success: true,
      details: {
        riskLevel: report.risk_level,
        riskScore: report.risk_score,
        signalsDetected: report.signals.length
      }
    };
    tracker.addMetric(analysisMetric);
    console.log(`✓ Completed risk analysis (${analysisMetric.duration}ms)`);

    // Calculate total duration
    const totalDuration = Date.now() - overallStartTime;
    const summary = tracker.getSummary();

    console.log(`\n${"=".repeat(60)}`);
    console.log(`✅ Analysis Complete`);
    console.log(`   Total Duration: ${totalDuration}ms`);
    console.log(`   Success Rate: ${summary.successRate.toFixed(1)}%`);
    console.log(`   API Calls: ${summary.apiCallsCount}`);
    console.log(`   Risk Level: ${report.risk_level} (Score: ${report.risk_score})`);
    console.log(`${"=".repeat(60)}\n`);

    // Include performance metrics in response for live mode
    const response = liveMode ? {
      ...report,
      _performance: {
        totalDuration,
        metrics: tracker.getMetrics(),
        summary: summary,
        liveMode: true
      }
    } : report;

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const totalDuration = Date.now() - overallStartTime;
    console.error(`\n❌ Analysis Failed (${totalDuration}ms)`, error);
    console.log(`${"=".repeat(60)}\n`);

    return NextResponse.json(
      {
        error:
          "The supplier analysis agent could not complete the request. Please try again.",
        _performance: {
          totalDuration,
          metrics: getMetrics(),
          failed: true
        }
      },
      { status: 500 }
    );
  }
}
