"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  Globe2,
  Radar,
  ScanSearch,
  Shield,
  Terminal,
  Zap
} from "lucide-react";
import { AgentLog } from "@/components/AgentLog";
import { GlowingPipe } from "@/components/GlowingPipe";
import { MachineStage } from "@/components/MachineStage";
import { RiskReportOutput } from "@/components/RiskReportOutput";
import { SupplierInput } from "@/components/SupplierInput";
import { WorkflowMachine } from "@/components/WorkflowMachine";
import { getMockSupplierFixture } from "@/lib/mockData";
import { buildSupplierQueries } from "@/lib/prompts";
import type { SearchResult, SupplierRiskReport, AgentPerformanceMetrics } from "@/lib/types";

type StageKey = "input" | "search" | "analysis" | "report";

const stageOrder: StageKey[] = ["input", "search", "analysis", "report"];

const baseLogItems = [
  "Searching live web...",
  "Scraping supplier sources...",
  "Extracting signals...",
  "Scoring disruption risk...",
  "Generating report..."
];

const analysisTaskLabels = [
  "Extracting disruption signals",
  "Classifying risk categories",
  "Scoring severity and confidence",
  "Generating recommended actions"
];

const idleLogItems = ["System idle. Awaiting supplier target."];

function wait(durationMs: number) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

export default function HomePage() {
  const [supplierName, setSupplierName] = useState("Maersk");
  const [report, setReport] = useState<SupplierRiskReport | null>(null);
  const [running, setRunning] = useState(false);
  const [activeStage, setActiveStage] = useState<StageKey>("input");
  const [completedStages, setCompletedStages] = useState<StageKey[]>([]);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [mode, setMode] = useState<"mock" | "live">("mock");
  const [liveMode, setLiveMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [discoveredSources, setDiscoveredSources] = useState<SearchResult[]>([]);
  const [analysisTasks, setAnalysisTasks] = useState<string[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<AgentPerformanceMetrics[]>([]);

  function pushLiveLog(message: string) {
    setLiveLogs((current) => {
      if (current[current.length - 1] === message) {
        return current;
      }

      return [...current.slice(-5), message];
    });
  }

  function resetWorkflowState(nextSupplierName: string, isLive = false) {
    setSupplierName(nextSupplierName);
    setRunning(true);
    setError(null);
    setReport(null);
    setMode(isLive ? "live" : "mock");
    setActiveStage("input");
    setCompletedStages(["input"]);
    setLiveLogs([`Pipeline initialized for ${nextSupplierName}. Mode: ${isLive ? "LIVE" : "MOCK"}`]);
    setSearchQueries([]);
    setDiscoveredSources([]);
    setAnalysisTasks([]);
    setPerformanceMetrics([]);
  }

  function finalizeWorkflow(nextReport: SupplierRiskReport, nextMode: "mock" | "live") {
    setReport(nextReport);
    setMode(nextMode);
    setActiveStage("report");
    setCompletedStages(stageOrder);
    pushLiveLog("Risk report compiled. Output surface online.");
    setRunning(false);
  }

  async function handleAnalyze(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    resetWorkflowState(trimmed, liveMode);
    const queries = buildSupplierQueries(trimmed).slice(0, 4);
    setSearchQueries(queries);
    pushLiveLog(`Supplier target received: ${trimmed}.`);

    const liveTimeline = [
      `Generating search patterns for ${trimmed}.`,
      "Dispatching Bright Data search requests.",
      "Collecting and deduplicating search results.",
      "Unlocking source pages for extraction.",
      "Parsing source text into evidence packets.",
      "Extracting disruption signals from source evidence.",
      "Scoring risk categories, confidence, and severity.",
      "Composing final supplier risk brief."
    ];

    let timelineIndex = 0;
    const liveTimer = setInterval(() => {
      const nextMessage = liveTimeline[timelineIndex];
      if (!nextMessage) return;

      pushLiveLog(nextMessage);

      if (timelineIndex <= 2) {
        setActiveStage("search");
      } else if (timelineIndex <= 6) {
        setCompletedStages(["input", "search"]);
        setActiveStage("analysis");
      } else {
        setCompletedStages(["input", "search", "analysis"]);
        setActiveStage("report");
      }

      timelineIndex += 1;
    }, 650);

    try {
      setActiveStage("search");

      const response = await fetch("/api/analyze-supplier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierName: trimmed, liveMode })
      });

      if (!response.ok) {
        throw new Error("The supplier analysis request failed.");
      }

      const data = (await response.json()) as SupplierRiskReport & {
        _performance?: {
          metrics: AgentPerformanceMetrics[];
          totalDuration: number;
          liveMode: boolean;
        };
      };

      // Extract performance metrics if available
      if (data._performance?.metrics) {
        setPerformanceMetrics(data._performance.metrics);
        pushLiveLog(`Performance: ${data._performance.totalDuration}ms total, ${data._performance.metrics.length} stages tracked`);
      }

      const searchPreview = data.sources_used.slice(0, 5).map((source) => ({
        title: source.title,
        url: source.url,
        snippet: "Selected for supplier risk review and source-backed analysis.",
        publisher: source.publisher,
        publishedAt: source.published_at,
        sourceType: source.source_type ?? "News"
      }));

      clearInterval(liveTimer);
      setDiscoveredSources(searchPreview);
      pushLiveLog(`${searchPreview.length} source packets selected for supplier review.`);
      setCompletedStages(["input", "search"]);
      setActiveStage("analysis");
      setAnalysisTasks(analysisTaskLabels);
      pushLiveLog("Analysis core completed category scoring and action drafting.");

      const sourceDomainSet = new Set(
        data.sources_used.map((source) => {
          try {
            return new URL(source.url).hostname;
          } catch {
            return "example.com";
          }
        })
      );

      const detectedMode = liveMode && data._performance?.liveMode ? "live" : "mock";
      finalizeWorkflow(data, detectedMode);
    } catch (caughtError) {
      clearInterval(liveTimer);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The workflow could not complete."
      );
      pushLiveLog("Pipeline interrupted. Falling back or retry required.");
      setRunning(false);
    }
  }

  async function handleRunSimulation(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    resetWorkflowState(trimmed, false);

    const fixture = getMockSupplierFixture(trimmed);
    const queries = buildSupplierQueries(trimmed).slice(0, 4);
    const stagedSources = fixture.searchResults.slice(0, 5);
    const mockReport = {
      ...fixture.report,
      supplier_name: trimmed,
      generated_at: new Date().toISOString()
    };

    try {
      setSearchQueries(queries);
      await wait(400);
      pushLiveLog(`Supplier target received: ${trimmed}.`);

      setActiveStage("search");
      pushLiveLog(`Generating search patterns for ${trimmed}.`);

      for (let index = 0; index < queries.length; index += 1) {
        pushLiveLog(`Running query ${index + 1}/${queries.length}: ${queries[index]}`);
        await wait(520);
      }

      for (let index = 0; index < stagedSources.length; index += 1) {
        setDiscoveredSources((current) => [...current, stagedSources[index]]);
        pushLiveLog(
          `Captured source ${index + 1}/${stagedSources.length}: ${stagedSources[index].publisher}`
        );
        await wait(460);
      }

      setCompletedStages(["input", "search"]);
      setActiveStage("analysis");

      for (let index = 0; index < analysisTaskLabels.length; index += 1) {
        setAnalysisTasks((current) => [...current, analysisTaskLabels[index]]);
        pushLiveLog(
          `AI core task ${index + 1}/${analysisTaskLabels.length}: ${analysisTaskLabels[index]}`
        );
        await wait(620);
      }

      pushLiveLog("Mock evidence synthesis complete. Preparing report surface.");
      await wait(450);
      finalizeWorkflow(mockReport, "mock");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The mock simulation could not complete."
      );
      pushLiveLog("Mock simulation interrupted.");
      setRunning(false);
    }
  }

  const logItems = useMemo(() => {
    const current = liveLogs.length > 0 ? liveLogs : report ? baseLogItems : idleLogItems;

    return current.map((label, index) => ({
      label,
      active: running && index === current.length - 1,
      complete: !running && Boolean(report) && index !== current.length - 1
    }));
  }, [liveLogs, report, running]);

  function getNodeState(stage: StageKey) {
    if (running && activeStage === stage) return "active" as const;
    if (completedStages.includes(stage) || (!running && report && stage === "report")) {
      return "complete" as const;
    }
    return "idle" as const;
  }

  const sourceCount = discoveredSources.length || report?.sources_used.length || 0;

  return (
    <main className="min-h-screen overflow-hidden bg-shell text-white">
      <div className="pointer-events-none fixed inset-0 bg-grid bg-[size:88px_88px] opacity-[0.08]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_22%_28%,rgba(71,215,255,0.12),transparent_24%),radial-gradient(circle_at_62%_42%,rgba(59,130,246,0.08),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(99,102,241,0.1),transparent_22%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:radial-gradient(rgba(255,255,255,0.6)_0.7px,transparent_0.7px)] [background-size:16px_16px]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1650px] flex-col px-5 py-6 lg:px-8 xl:px-10">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-cyan/80 ring-1 ring-cyan-400/10 backdrop-blur-xl">
                <Shield className="h-3.5 w-3.5" />
                Supplier Risk & Market Disruption Agent
              </div>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-[0.95] tracking-tight text-white md:text-6xl xl:text-[72px]">
                Risk Horizon is a premium operations console for supplier disruption intelligence.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Public web signals flow through one connected machine and emerge as a
                source-backed risk brief for procurement and resilience teams.
              </p>
            </div>

            <div className="grid w-full max-w-xl grid-cols-3 gap-3">
              <div className="rounded-[28px] bg-white/[0.04] px-5 py-4 ring-1 ring-white/5 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Mode</div>
                <div className="mt-2 font-display text-2xl text-white">{running ? "Flowing" : mode === "live" ? "Live" : "Mock"}</div>
              </div>
              <div className="rounded-[28px] bg-white/[0.04] px-5 py-4 ring-1 ring-white/5 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Sources</div>
                <div className="mt-2 font-display text-2xl text-white">{sourceCount}</div>
              </div>
              <div className="rounded-[28px] bg-white/[0.04] px-5 py-4 ring-1 ring-white/5 backdrop-blur-xl">
                <div className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Stage</div>
                <div className="mt-2 font-display text-2xl text-white">{stageOrder.indexOf(activeStage) + 1}</div>
              </div>
            </div>
          </div>
        </motion.header>

        <WorkflowMachine>
          <div className="mb-4">
            <div className="text-[11px] uppercase tracking-[0.32em] text-cyan/70">
              Workflow Machine
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[0.98fr_auto_0.94fr_auto_0.94fr_auto_1fr] xl:items-start 2xl:grid-cols-[1fr_auto_0.96fr_auto_0.96fr_auto_1.02fr]">
            <MachineStage
              title="User Input Terminal"
              label="Stage 01"
              description="Embedded command input for supplier monitoring."
              icon={Terminal}
              state={getNodeState("input")}
            >
              <SupplierInput
                supplierName={supplierName}
                onSupplierNameChange={setSupplierName}
                onSubmit={handleAnalyze}
                onRunSimulation={handleRunSimulation}
                running={running}
                liveMode={liveMode}
                onLiveModeChange={setLiveMode}
              />
            </MachineStage>

            <GlowingPipe active={running && ["search", "analysis", "report"].includes(activeStage)} />

            <MachineStage
              title="Web Intelligence Engine"
              label="Stage 02"
              description="Radar-driven web scan across supplier, logistics, and regulatory sources."
              icon={ScanSearch}
              state={getNodeState("search")}
            >
              <div className="space-y-5">
                <div className="relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-[28px] bg-[radial-gradient(circle,rgba(71,215,255,0.16),rgba(7,14,26,0.55)_42%,rgba(5,10,19,0.96)_76%)] ring-1 ring-cyan-400/10 lg:min-h-[200px]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                    className="absolute h-36 w-36 rounded-full border border-cyan-400/10 lg:h-40 lg:w-40"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                    className="absolute h-24 w-24 rounded-full border border-dashed border-cyan-400/20 lg:h-28 lg:w-28"
                  />
                  <motion.div
                    animate={{ scale: running && activeStage === "search" ? [0.92, 1.08, 0.92] : 1 }}
                    transition={{ repeat: running && activeStage === "search" ? Infinity : 0, duration: 2 }}
                    className="relative flex h-20 w-20 items-center justify-center rounded-full bg-cyan/10 text-cyan shadow-[0_0_50px_rgba(71,215,255,0.18)] ring-1 ring-cyan-400/15 lg:h-24 lg:w-24"
                  >
                    <Globe2 className="h-7 w-7 lg:h-8 lg:w-8" />
                  </motion.div>

                  <div className="pointer-events-none absolute left-3 top-4 rounded-full bg-white/[0.05] px-2.5 py-1 text-[9px] uppercase tracking-[0.24em] text-slate-300 ring-1 ring-white/5 lg:left-5 lg:top-7 lg:px-3 lg:text-[10px]">
                    News
                  </div>
                  <div className="pointer-events-none absolute right-3 top-8 rounded-full bg-white/[0.05] px-2.5 py-1 text-[9px] uppercase tracking-[0.24em] text-slate-300 ring-1 ring-white/5 lg:right-4 lg:top-12 lg:px-3 lg:text-[10px]">
                    Logistics
                  </div>
                  <div className="pointer-events-none absolute bottom-5 left-4 rounded-full bg-white/[0.05] px-2.5 py-1 text-[9px] uppercase tracking-[0.24em] text-slate-300 ring-1 ring-white/5 lg:bottom-8 lg:left-8 lg:px-3 lg:text-[10px]">
                    Supplier sites
                  </div>
                  <div className="pointer-events-none absolute bottom-4 right-4 rounded-full bg-white/[0.05] px-2.5 py-1 text-[9px] uppercase tracking-[0.24em] text-slate-300 ring-1 ring-white/5 lg:bottom-6 lg:right-6 lg:px-3 lg:text-[10px]">
                    Regulation
                  </div>
                </div>

                <div className="rounded-[28px] bg-white/[0.04] p-4 ring-1 ring-white/5">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-100">
                    <Zap className="h-4 w-4 text-cyan" />
                    Query generation
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchQueries.length > 0 ? (
                      searchQueries.map((query) => (
                        <span key={query} className="rounded-full bg-cyan/10 px-3 py-1.5 text-xs text-cyan ring-1 ring-cyan-400/10">
                          {query}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">Search patterns will appear during the scan.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-[28px] bg-white/[0.04] p-4 ring-1 ring-white/5">
                  <div className="mb-3 flex items-center gap-2 text-sm text-slate-100">
                    <CheckCircle2 className="h-4 w-4 text-cyan" />
                    Source packets
                  </div>
                  <div className="space-y-2">
                    {discoveredSources.length > 0 ? (
                      discoveredSources.map((source) => (
                        <div key={source.url} className="rounded-[22px] bg-black/20 px-3 py-3 ring-1 ring-white/5">
                          <div className="text-sm text-white">{source.title}</div>
                          <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-cyan/70">
                            {source.publisher}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-400">No sources collected yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </MachineStage>

            <GlowingPipe active={running && ["analysis", "report"].includes(activeStage)} />

            <MachineStage
              title="AI Analysis Core"
              label="Stage 03"
              description="Central processor for classification, severity scoring, and recommendations."
              icon={BrainCircuit}
              state={getNodeState("analysis")}
            >
              <div className="space-y-5">
                <div className="relative flex min-h-[190px] items-center justify-center overflow-hidden rounded-[999px] bg-[radial-gradient(circle,rgba(71,215,255,0.18),rgba(12,19,38,0.55)_38%,rgba(5,10,19,0.98)_72%)] lg:min-h-[210px]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 9, ease: "linear" }}
                    className="absolute h-40 w-40 rounded-full border border-cyan-400/10 lg:h-44 lg:w-44"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
                    className="absolute h-28 w-28 rounded-full border border-dashed border-cyan-400/20 lg:h-32 lg:w-32"
                  />
                  <motion.div
                    animate={{
                      boxShadow:
                        running && activeStage === "analysis"
                          ? [
                              "0 0 0 rgba(71,215,255,0.18)",
                              "0 0 50px rgba(71,215,255,0.28)",
                              "0 0 0 rgba(71,215,255,0.18)"
                            ]
                          : "0 0 24px rgba(71,215,255,0.14)"
                    }}
                    transition={{ repeat: running && activeStage === "analysis" ? Infinity : 0, duration: 2 }}
                    className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full bg-gradient-to-br from-cyan/20 to-indigo-500/10 text-cyan ring-1 ring-cyan-400/15 lg:h-24 lg:w-24"
                  >
                    <BrainCircuit className="h-8 w-8 lg:h-9 lg:w-9" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  {analysisTaskLabels.map((task) => {
                    const complete = analysisTasks.includes(task) || (!running && Boolean(report));
                    const active =
                      running &&
                      activeStage === "analysis" &&
                      analysisTasks[analysisTasks.length - 1] === task;

                    return (
                      <div
                        key={task}
                        className="flex items-center gap-3 rounded-[22px] bg-white/[0.04] px-4 py-3 text-sm text-slate-200 ring-1 ring-white/5"
                      >
                        <span
                          className={
                            complete
                              ? "h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_14px_rgba(30,225,168,0.75)]"
                              : active
                                ? "h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_14px_rgba(71,215,255,0.75)]"
                                : "h-2.5 w-2.5 rounded-full bg-slate-500"
                          }
                        />
                        {task}
                      </div>
                    );
                  })}
                </div>
              </div>
            </MachineStage>

            <GlowingPipe active={running && activeStage === "report"} />

            <MachineStage
              title="Risk Report Output"
              label="Stage 04"
              description="Translucent risk surface for source-backed decisions."
              icon={Radar}
              state={getNodeState("report")}
            >
              <div className="rounded-[26px] bg-white/[0.04] px-4 py-4 text-sm leading-7 text-slate-300 ring-1 ring-white/5">
                {error
                  ? error
                  : running
                    ? "The report surface is receiving final findings from the analysis core."
                    : report
                      ? "Final intelligence report projected below."
                      : "Run a supplier scan to render the final risk report."}
              </div>
            </MachineStage>
          </div>
        </WorkflowMachine>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[0.3fr_0.7fr]">
          <AgentLog
            items={logItems}
            performanceMetrics={performanceMetrics}
            liveMode={mode === "live"}
          />
          <RiskReportOutput report={report} mode={mode} />
        </section>
      </div>
    </main>
  );
}
