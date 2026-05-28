"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

type StageState = "idle" | "active" | "complete";

export function MachineStage({
  title,
  label,
  description,
  icon: Icon,
  state,
  children,
  className
}: {
  title: string;
  label: string;
  description: string;
  icon: LucideIcon;
  state: StageState;
  children: ReactNode;
  className?: string;
}) {
  const isActive = state === "active";
  const isComplete = state === "complete";

  return (
    <motion.section
      animate={{
        y: isActive ? -6 : 0,
        scale: isActive ? 1.01 : 1,
        opacity: state === "idle" ? 0.9 : 1
      }}
      transition={{ duration: 0.35 }}
      className={cn(
        "relative min-w-0 overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,rgba(8,16,30,0.74),rgba(6,11,22,0.94))] p-4 shadow-[0_20px_56px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.04)] ring-1 ring-white/5 backdrop-blur-2xl lg:p-5",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,230,255,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(109,40,217,0.08),transparent_26%)]" />
      <motion.div
        animate={{ opacity: isActive ? [0.25, 0.55, 0.25] : 0.14 }}
        transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(71,215,255,0.18),transparent_36%)]"
      />
      <div className="relative z-10 flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2.5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-gradient-to-br from-white/10 to-white/[0.02] text-cyan shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_24px_rgba(35,140,255,0.16)] ring-1 ring-cyan-400/10">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    isComplete
                      ? "bg-success shadow-[0_0_16px_rgba(30,225,168,0.75)]"
                      : isActive
                        ? "bg-cyan shadow-[0_0_16px_rgba(71,215,255,0.82)]"
                        : "bg-slate-500"
                  )}
                />
                <span className="text-[10px] uppercase tracking-[0.32em] text-cyan/65">
                  {label}
                </span>
              </div>
            </div>
            <h3 className="font-display text-[22px] font-semibold tracking-tight text-white lg:text-[24px]">
              {title}
            </h3>
            <p className="mt-1.5 max-w-sm text-[13px] leading-5 text-slate-300 lg:text-sm lg:leading-6">
              {description}
            </p>
          </div>
          <StatusBadge
            label={isActive ? "Active" : isComplete ? "Ready" : "Idle"}
            tone={isActive ? "active" : isComplete ? "complete" : "idle"}
          />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </motion.section>
  );
}
