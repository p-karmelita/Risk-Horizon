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
import type {
  SupplierRequest,
  AgentPerformanceMetrics,
  StreamEvent,
  ProgressUpdate
} from "@/lib/types";

export async function POST(request: Request) {
  const overallStartTime = Date.now();

  const body = (await request
    .json()
    .catch(() => ({}))) as Partial<SupplierRequest> & { agenticMode?: boolean };
  const supplierName = body.supplierName?.trim();
  const liveMode = body.liveMode ?? false;
  const agenticMode = body.agenticMode ?? false;

  if (!supplierName) {
    return NextResponse.json({ error: "supplierName is required." }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Emit one newline-delimited JSON event to the client.
      const send = (event: StreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      const progress = (update: ProgressUpdate) => send({ type: "progress", ...update });

      // Reset performance tracking for this request.
      clearMetrics();
      const tracker = resetGlobalTracker();

      console.log(`\n${"=".repeat(60)}`);
      console.log(`🚀 Starting Supplier Analysis`);
      console.log(`   Supplier: ${supplierName}`);
      console.log(`   Data Mode: ${liveMode ? "🔴 LIVE (Bright Data APIs)" : "🟢 MOCK (Simulated Data)"}`);
      console.log(`   AI Mode: ${agenticMode ? "🤖 AGENTIC (GPT-5-5 Autonomous)" : "📊 STANDARD"}`);
      console.log(`${"=".repeat(60)}\n`);

      try {
        progress({
          stage: "input",
          status: "active",
          message: `Initializing ${liveMode ? "live" : "mock"} analysis for ${supplierName}…`
        });

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
        progress({
          stage: "input",
          status: "done",
          message: `Generated ${queries.length} search queries`
        });

        // Stage 2: Web Search
        progress({ stage: "search", status: "active", message: "Web Intelligence Engine engaged" });
        const searchStartTime = Date.now();
        const searchResults = await searchSupplierWeb(supplierName, queries, liveMode, progress);
        const searchMetric: AgentPerformanceMetrics = {
          stage: "Web Search Aggregation",
          startTime: searchStartTime,
          endTime: Date.now(),
          duration: Date.now() - searchStartTime,
          success: true,
          details: { resultsFound: searchResults.length, liveMode, queries: queries.length }
        };
        tracker.addMetric(searchMetric);
        progress({
          stage: "search",
          status: "active",
          message: `Found ${searchResults.length} relevant sources (${searchMetric.duration}ms)`
        });

        // Stage 3: Source Scraping
        const selectedResults = searchResults.slice(0, 5);
        const scrapeStartTime = Date.now();
        const scrapedDocuments = await scrapeSupplierSources(
          supplierName,
          selectedResults,
          liveMode,
          progress
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
        progress({
          stage: "search",
          status: "done",
          message: `Collected ${scrapedDocuments.length} documents (${scrapeMetric.duration}ms)`
        });

        // Surface the selected sources so the UI's "Source packets" panel fills in live.
        send({ type: "sources", sources: selectedResults });

        // Stage 4: Risk Analysis
        progress({
          stage: "analysis",
          status: "active",
          message: agenticMode
            ? "Agentic AI (GPT-5-5) reasoning through the evidence…"
            : "AI Analysis Core scoring risk signals…"
        });
        const analysisStartTime = Date.now();
        const report = await analyzeSupplierRisk(
          { supplierName, queries, searchResults: selectedResults, scrapedDocuments },
          agenticMode
        );
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
        progress({
          stage: "analysis",
          status: "done",
          message: `Risk assessed: ${report.risk_level} (${report.risk_score}) — ${report.signals.length} signals (${analysisMetric.duration}ms)`
        });

        // Merge the granular Bright Data call metrics so the summary reflects real API calls.
        for (const metric of getMetrics()) {
          tracker.addMetric(metric);
        }

        const totalDuration = Date.now() - overallStartTime;
        const summary = tracker.getSummary();

        console.log(`\n${"=".repeat(60)}`);
        console.log(`✅ Analysis Complete`);
        console.log(`   Total Duration: ${totalDuration}ms`);
        console.log(`   Success Rate: ${summary.successRate.toFixed(1)}%`);
        console.log(`   API Calls: ${summary.apiCallsCount}`);
        console.log(`   Risk Level: ${report.risk_level} (Score: ${report.risk_score})`);
        console.log(`${"=".repeat(60)}\n`);

        progress({ stage: "report", status: "done", message: "Report synthesized" });

        send({
          type: "report",
          report,
          performance: liveMode || agenticMode ? summary : undefined
        });
      } catch (error) {
        const totalDuration = Date.now() - overallStartTime;
        console.error(`\n❌ Analysis Failed (${totalDuration}ms)`, error);
        send({
          type: "error",
          message:
            "The supplier analysis agent could not complete the request. Please try again."
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive"
    }
  });
}
