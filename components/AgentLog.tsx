"use client";

import { motion } from "framer-motion";
import { Activity, Dot, Zap, Clock } from "lucide-react";
import type { AgentPerformanceMetrics } from "@/lib/types";

export function AgentLog({
  items,
  performanceMetrics,
  liveMode
}: {
  items: Array<{ label: string; active?: boolean; complete?: boolean }>;
  performanceMetrics?: AgentPerformanceMetrics[];
  liveMode?: boolean;
}) {
  const totalDuration = performanceMetrics?.reduce((sum, m) => sum + (m.duration || 0), 0) || 0;
  const successRate = performanceMetrics?.length
    ? (performanceMetrics.filter(m => m.success).length / performanceMetrics.length) * 100
    : 0;

  return (
    <div className="rounded-[32px] bg-slate-950/55 p-5 shadow-2xl shadow-cyan-500/10 ring-1 ring-white/5 backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan" />
          <h3 className="font-display text-lg font-semibold text-white">
            Agent Activity Log
          </h3>
        </div>
        {liveMode && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-400 ring-1 ring-amber-400/20">
            <Zap className="h-3 w-3" />
            LIVE
          </div>
        )}
      </div>

      {performanceMetrics && performanceMetrics.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/5">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] text-slate-400">
              <Clock className="h-3 w-3" />
              Duration
            </div>
            <div className="mt-1 font-display text-lg text-white">
              {(totalDuration / 1000).toFixed(2)}s
            </div>
          </div>
          <div className="rounded-[22px] bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/5">
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
              Success Rate
            </div>
            <div className="mt-1 font-display text-lg text-white">
              {successRate.toFixed(0)}%
            </div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-3 rounded-[22px] bg-white/[0.04] px-3 py-3 ring-1 ring-white/5"
          >
            <motion.div
              animate={{
                opacity: item.active ? [0.4, 1, 0.4] : 1,
                scale: item.active ? [1, 1.15, 1] : 1
              }}
              transition={{ repeat: item.active ? Infinity : 0, duration: 1.2 }}
              className={
                item.complete
                  ? "mt-0.5 h-2.5 w-2.5 rounded-full bg-success shadow-[0_0_14px_rgba(30,225,168,0.75)]"
                  : "mt-0.5 h-2.5 w-2.5 rounded-full bg-cyan shadow-[0_0_14px_rgba(71,215,255,0.75)]"
              }
            />
            <div className="flex-1">
              <div className="flex items-center gap-1.5 text-sm text-slate-100">
                <Dot className="-ml-2 h-4 w-4 text-cyan/60" />
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {performanceMetrics && performanceMetrics.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
            Performance Breakdown
          </div>
          {performanceMetrics.map((metric, index) => (
            <div
              key={`${metric.stage}-${index}`}
              className="rounded-[18px] bg-white/[0.03] px-3 py-2 ring-1 ring-white/5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      metric.success
                        ? "bg-success shadow-[0_0_8px_rgba(30,225,168,0.6)]"
                        : "bg-danger shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                    }`}
                  />
                  <span className="text-xs text-slate-200">{metric.stage}</span>
                </div>
                <span className="text-xs text-slate-400">
                  {metric.duration ? `${metric.duration}ms` : "—"}
                </span>
              </div>
              {metric.error && (
                <div className="mt-1 text-[10px] text-danger/80">
                  Error: {metric.error.slice(0, 60)}...
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
