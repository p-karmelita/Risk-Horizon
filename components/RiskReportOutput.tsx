"use client";

import { ArrowUpRight, Radar, ShieldCheck, Siren, Sparkles } from "lucide-react";
import { SignalCard } from "@/components/SignalCard";
import { StatusBadge } from "@/components/StatusBadge";
import type { SupplierRiskReport } from "@/lib/types";
import { formatRiskTone } from "@/lib/utils";

function scoreColor(score: number) {
  if (score >= 70) return "text-rose-300";
  if (score >= 50) return "text-amber-300";
  return "text-emerald-300";
}

export function RiskReportOutput({
  report,
  mode
}: {
  report: SupplierRiskReport | null;
  mode: "mock" | "live";
}) {
  if (!report) {
    return (
      <div className="relative overflow-hidden rounded-[36px] bg-slate-950/55 p-8 shadow-2xl shadow-cyan-500/10 ring-1 ring-white/5 backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[radial-gradient(circle_at_left,rgba(71,215,255,0.22),transparent_70%)]" />
        <div className="relative z-10 flex min-h-[320px] items-center justify-center">
          <div className="max-w-md text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan/10 text-cyan shadow-[0_0_40px_rgba(71,215,255,0.14)] ring-1 ring-cyan-400/10">
              <Radar className="h-8 w-8" />
            </div>
            <h3 className="mt-5 font-display text-3xl font-semibold tracking-tight text-white">
              Awaiting report synthesis
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Run a supplier scan to project a translucent, source-backed risk
              brief into this report surface.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 overflow-hidden rounded-[38px] bg-slate-950/58 p-6 shadow-2xl shadow-cyan-500/10 ring-1 ring-white/5 backdrop-blur-2xl lg:p-7">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-[radial-gradient(circle_at_left,rgba(71,215,255,0.22),transparent_74%)]" />
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.16),transparent_70%)] blur-2xl" />
      <div className="relative z-10 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.34em] text-cyan/70">
              Holographic Risk Report
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
              {report.supplier_name}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              {report.summary}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge label={mode === "live" ? "Live mode" : "Mock mode"} tone={mode === "live" ? "active" : "warning"} />
            <StatusBadge label={report.risk_level} tone={formatRiskTone(report.risk_level) as never} />
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[26px] bg-gradient-to-br from-white/10 to-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/5">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <Siren className="h-4 w-4 text-cyan" />
                Overall risk
              </div>
              <div className={`font-display text-5xl font-semibold ${scoreColor(report.risk_score)}`}>
                {report.risk_score}
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">score / 100</p>
            </div>
            <div className="rounded-[26px] bg-gradient-to-br from-white/10 to-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/5">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <ShieldCheck className="h-4 w-4 text-cyan" />
                Confidence
              </div>
              <div className="font-display text-3xl font-semibold text-white">{report.confidence}</div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">evidence strength</p>
            </div>
            <div className="rounded-[26px] bg-gradient-to-br from-white/10 to-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/5">
              <div className="mb-2 flex items-center gap-2 text-slate-200">
                <Sparkles className="h-4 w-4 text-cyan" />
                Generated
              </div>
              <div className="font-display text-xl font-semibold text-white">
                {new Date(report.generated_at).toLocaleString()}
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">timestamp</p>
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-white/10 to-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/5">
            <h3 className="mb-4 font-display text-xl font-semibold text-white">
              Risk categories
            </h3>
            <div className="space-y-3">
              {report.risk_categories.map((category) => (
                <div key={category.category} className="rounded-[22px] bg-black/20 px-4 py-4 ring-1 ring-white/5">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-display text-lg text-white">{category.category}</div>
                      <div className="text-sm leading-6 text-slate-300">{category.reason}</div>
                    </div>
                    <div className="text-right">
                      <StatusBadge label={category.level} tone={formatRiskTone(category.level) as never} />
                      <div className={`mt-2 font-display text-2xl ${scoreColor(category.score)}`}>
                        {category.score}
                      </div>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div style={{ width: `${category.score}%` }} className="h-full rounded-full bg-gradient-to-r from-cyan via-sky-400 to-indigo-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[30px] bg-gradient-to-br from-white/10 to-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/5">
          <h3 className="mb-4 font-display text-xl font-semibold text-white">Top signals</h3>
          <div className="space-y-4">
            {report.signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[30px] bg-gradient-to-br from-white/10 to-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/5">
            <h3 className="mb-4 font-display text-xl font-semibold text-white">Recommended actions</h3>
            <div className="space-y-3">
              {report.recommendations.map((recommendation) => (
                <div key={recommendation} className="rounded-[22px] bg-black/20 px-4 py-3 text-sm leading-6 text-slate-200 ring-1 ring-white/5">
                  {recommendation}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[30px] bg-gradient-to-br from-white/10 to-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/5">
            <h3 className="mb-4 font-display text-xl font-semibold text-white">Source links</h3>
            <div className="space-y-3">
              {report.sources_used.map((source) => (
                <a
                  key={`${source.url}-${source.title}`}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start justify-between gap-3 rounded-[22px] bg-black/20 p-4 transition hover:bg-cyan/5 ring-1 ring-white/5"
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
    </div>
  );
}
