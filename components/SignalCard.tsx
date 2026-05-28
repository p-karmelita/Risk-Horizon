"use client";

import { AlertTriangle, ArrowUpRight, ShieldAlert } from "lucide-react";
import type { RiskSignal } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { formatRiskTone } from "@/lib/utils";

export function SignalCard({ signal }: { signal: RiskSignal }) {
  return (
    <article className="rounded-[28px] bg-white/[0.04] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-2xl bg-warning/10 p-2 text-warning ring-1 ring-warning/10">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-display text-lg font-semibold text-white">
              {signal.title}
            </h4>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
              {signal.category}
            </p>
          </div>
        </div>
        <StatusBadge label={signal.severity} tone={formatRiskTone(signal.severity) as never} />
      </div>

      <div className="grid gap-3 text-sm text-slate-300 md:grid-cols-3">
        <div className="rounded-[22px] bg-black/20 p-3 ring-1 ring-white/5">
          <div className="mb-2 flex items-center gap-2 text-slate-100">
            <AlertTriangle className="h-4 w-4 text-cyan" />
            Signal
          </div>
          <p>{signal.summary}</p>
        </div>
        <div className="rounded-[22px] bg-black/20 p-3 ring-1 ring-white/5">
          <div className="mb-2 text-slate-100">Business impact</div>
          <p>{signal.business_impact}</p>
        </div>
        <div className="rounded-[22px] bg-black/20 p-3 ring-1 ring-white/5">
          <div className="mb-2 text-slate-100">Recommended action</div>
          <p>{signal.recommended_action}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {signal.sources.map((source) => (
          <a
            key={`${signal.id}-${source.url}`}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-full bg-cyan/10 px-3 py-1.5 text-xs text-cyan hover:bg-cyan/15 ring-1 ring-cyan-400/10"
          >
            {source.publisher}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </article>
  );
}
