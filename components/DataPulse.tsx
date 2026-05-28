"use client";

import { motion } from "framer-motion";

export function DataPulse({ active }: { active: boolean }) {
  return (
    <motion.div
      animate={{
        opacity: active ? [0.2, 1, 0.2] : 0.18,
        scale: active ? [0.9, 1.08, 0.9] : 0.9
      }}
      transition={{ repeat: active ? Infinity : 0, duration: 1.5, ease: "linear" }}
      className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan shadow-[0_0_22px_rgba(71,215,255,0.95),0_0_48px_rgba(35,140,255,0.55)]"
    />
  );
}
