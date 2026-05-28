"use client";

import type { ReactNode } from "react";

export function WorkflowMachine({
  children
}: {
  children: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-[42px] bg-[linear-gradient(180deg,rgba(7,13,24,0.7),rgba(4,9,18,0.94))] px-4 py-5 shadow-[0_40px_120px_rgba(0,0,0,0.32)] ring-1 ring-white/5 backdrop-blur-2xl lg:px-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(71,215,255,0.08),transparent_30%),radial-gradient(circle_at_78%_10%,rgba(99,102,241,0.1),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent opacity-70" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
