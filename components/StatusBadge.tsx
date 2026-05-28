"use client";

import { cn } from "@/lib/utils";

type StatusTone = "idle" | "active" | "complete" | "danger" | "warning";

const toneClasses: Record<StatusTone, string> = {
  idle: "bg-white/[0.05] text-slate-300 ring-white/5",
  active: "bg-cyan/10 text-cyan shadow-[0_0_24px_rgba(71,215,255,0.18)] ring-cyan-400/10",
  complete: "bg-success/10 text-success ring-success/10",
  warning: "bg-warning/10 text-warning ring-warning/10",
  danger: "bg-danger/10 text-danger ring-danger/10"
};

export function StatusBadge({
  label,
  tone = "idle"
}: {
  label: string;
  tone?: StatusTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] ring-1 backdrop-blur-md",
        toneClasses[tone]
      )}
    >
      {label}
    </span>
  );
}
