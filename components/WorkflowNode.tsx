"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

type NodeState = "idle" | "active" | "complete";

export function WorkflowNode({
  title,
  kicker,
  description,
  icon: Icon,
  state = "idle",
  children,
  className
}: {
  title: string;
  kicker: string;
  description: string;
  icon: LucideIcon;
  state?: NodeState;
  children?: ReactNode;
  className?: string;
}) {
  const active = state === "active";
  const complete = state === "complete";

  return (
    <motion.section
      animate={{
        y: active ? -4 : 0,
        boxShadow: active
          ? "0 0 0 1px rgba(92,224,255,0.26), 0 24px 70px rgba(23,102,173,0.24)"
          : complete
            ? "0 0 0 1px rgba(30,225,168,0.18), 0 20px 54px rgba(30,225,168,0.08)"
            : "0 12px 32px rgba(0,0,0,0.18)"
      }}
      transition={{ duration: 0.35 }}
      className={cn(
        "relative min-h-[240px] min-w-0 overflow-hidden rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(12,24,42,0.92),rgba(5,12,24,0.98))] p-6 backdrop-blur-xl",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(95,229,255,0.1),transparent_34%),linear-gradient(180deg,transparent,rgba(255,255,255,0.02))]" />
      <motion.div
        animate={{ opacity: active ? [0.35, 0.85, 0.35] : 0.25 }}
        transition={{ repeat: active ? Infinity : 0, duration: 1.8 }}
        className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(71,215,255,0.16),transparent_45%)]"
      />
      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-cyan/60">
              {kicker}
            </p>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-cyan/15 bg-white/[0.04] p-3 text-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-white">
                  {title}
                </h3>
                <p className="max-w-sm text-sm leading-6 text-slate-300">{description}</p>
              </div>
            </div>
          </div>
          <StatusBadge
            label={
              state === "active"
                ? "Live"
                : state === "complete"
                  ? "Ready"
                  : "Standby"
            }
            tone={
              state === "active"
                ? "active"
                : state === "complete"
                  ? "complete"
                  : "idle"
            }
          />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </motion.section>
  );
}
