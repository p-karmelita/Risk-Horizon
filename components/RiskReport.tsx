"use client";

import { ArrowUpRight, Radar, ShieldCheck, Siren, Sparkles } from "lucide-react";
import type { SupplierRiskReport } from "@/lib/types";
import { SignalCard } from "@/components/SignalCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRiskTone } from "@/lib/utils";

function metricTone(score: number) {
  if (score >= 70) return "text-danger";
  if (score >= 50) return "text-warning";
  return "text-success";
}

export function RiskReport({
  report,
  mode
}: {
  report: SupplierRiskReport | null;
  mode: "mock" | "live";
}) {
  if (!report) {
    return (
      <div className="flex h-full min-h-[340px] items-center justify-center rounded-[28px] border border-dashed border-cyan/20 bg-white/[0.03] p-8 text-center">
        <div className="max-w-md space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-cyan/20 bg-cyan/10 text-cyan">
            <Radar className="h-7 w-7" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-white">
            Awaiting supplier risk scan
          </h3>
          <p className="text-sm leading-6 text-slate-300">
            Enter a supplier to launch the intelligence pipeline. The final panel
            will populate with a source-backed risk report, key disruption
            signals, and recommended actions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-cyan/70">
                Supplier Risk Report
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-white">
                {report.supplier_name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                {report.summary}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge label={mode === "live" ? "Live mode" : "Mock mode"} tone={mode === "live" ? "active" : "warning"} />
              <StatusBadge label={report.risk_level} tone={formatRiskTone(report.risk_level) as never} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/8 bg-black/15 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <Siren className="h-4 w-4 text-cyan" />
                Overall risk
              </div>
              <div className={`font-display text-4xl font-semibold ${metricTone(report.risk_score)}`}>
                {report.risk_score}
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                score / 100
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/15 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <ShieldCheck className="h-4 w-4 text-cyan" />
                Confidence
              </div>
              <div className="font-display text-3xl font-semibold text-white">
                {report.confidence}
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                evidence strength
              </p>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-black/15 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <Sparkles className="h-4 w-4 text-cyan" />
                Generated
              </div>
              <div className="font-display text-xl font-semibold text-white">
                {new Date(report.generated_at).toLocaleString()}
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                report timestamp
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
          <h3 className="mb-4 font-display text-xl font-semibold text-white">
            Risk Categories
          </h3>
          <div className="space-y-3">
            {report.risk_categories.map((category) => (
              <div
                key={category.category}
                className="rounded-[22px] border border-white/8 bg-black/15 p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-display text-lg text-white">
                      {category.category}
                    </div>
                    <div className="text-sm text-slate-300">{category.reason}</div>
                  </div>
                  <div className="text-right">
                    <StatusBadge label={category.level} tone={formatRiskTone(category.level) as never} />
                    <div className={`mt-2 font-display text-2xl ${metricTone(category.score)}`}>
                      {category.score}
                    </div>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/8">
                  <div
                    style={{ width: `${category.score}%` }}
                    className="h-full rounded-full bg-[linear-gradient(90deg,#47d7ff,#238cff)]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
        <h3 className="mb-4 font-display text-xl font-semibold text-white">
          Top Warning Signals
        </h3>
        <div className="space-y-4">
          {report.signals.map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
          <h3 className="mb-4 font-display text-xl font-semibold text-white">
            Recommended Actions
          </h3>
          <div className="space-y-3">
            {report.recommendations.map((recommendation) => (
              <div
                key={recommendation}
                className="rounded-[22px] border border-white/8 bg-black/15 px-4 py-3 text-sm text-slate-200"
              >
                {recommendation}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
          <h3 className="mb-4 font-display text-xl font-semibold text-white">
            Source Links
          </h3>
          <div className="space-y-3">
            {report.sources_used.map((source) => (
              <a
                key={`${source.url}-${source.title}`}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-start justify-between gap-3 rounded-[22px] border border-white/8 bg-black/15 p-4 transition hover:border-cyan/25 hover:bg-cyan/5"
              >
                <div>
                  <div className="font-medium text-white">{source.title}</div>
                  <div className="mt-1 text-sm text-slate-300">
                    {source.publisher} • {source.published_at}
                  </div>
                  {source.source_type ? (
                    <div className="mt-2 text-xs uppercase tracking-[0.24em] text-cyan/70">
                      {source.source_type}
                    </div>
                  ) : null}
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-cyan" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
