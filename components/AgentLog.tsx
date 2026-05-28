"use client";

import { motion } from "framer-motion";
import { Activity, Dot } from "lucide-react";

export function AgentLog({
  items
}: {
  items: Array<{ label: string; active?: boolean; complete?: boolean }>;
}) {
  return (
    <div className="rounded-[32px] bg-slate-950/55 p-5 shadow-2xl shadow-cyan-500/10 ring-1 ring-white/5 backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-4 w-4 text-cyan" />
        <h3 className="font-display text-lg font-semibold text-white">
          Agent Activity Log
        </h3>
      </div>
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
    </div>
  );
}
