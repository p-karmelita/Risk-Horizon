"use client";

import { motion } from "framer-motion";
import { DataPulse } from "@/components/DataPulse";
import { cn } from "@/lib/utils";

export function GlowingPipe({
  active,
  className
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative hidden h-24 w-16 items-center justify-center xl:flex 2xl:w-20", className)}>
      <svg
        viewBox="0 0 120 120"
        className="absolute inset-0 h-full w-full overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id="pipeBase" x1="0%" x2="100%" y1="50%" y2="50%">
            <stop offset="0%" stopColor="rgba(19,31,49,0.95)" />
            <stop offset="50%" stopColor="rgba(12,22,38,1)" />
            <stop offset="100%" stopColor="rgba(19,31,49,0.95)" />
          </linearGradient>
          <linearGradient id="pipeGlow" x1="0%" x2="100%" y1="50%" y2="50%">
            <stop offset="0%" stopColor="rgba(71,215,255,0.05)" />
            <stop offset="50%" stopColor="rgba(71,215,255,0.9)" />
            <stop offset="100%" stopColor="rgba(35,140,255,0.08)" />
          </linearGradient>
          <filter id="pipeBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>

        <path
          d="M8 60 C 34 60, 38 22, 60 22 C 82 22, 86 60, 112 60"
          stroke="url(#pipeBase)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M8 60 C 34 60, 38 22, 60 22 C 82 22, 86 60, 112 60"
          stroke="url(#pipeGlow)"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#pipeBlur)"
          opacity={active ? 1 : 0.32}
        />
        <motion.path
          d="M8 60 C 34 60, 38 22, 60 22 C 82 22, 86 60, 112 60"
          stroke="url(#pipeGlow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={false}
          animate={{
            pathLength: active ? [0.15, 1] : 0.35,
            opacity: active ? [0.35, 1, 0.35] : 0.18
          }}
          transition={{
            repeat: active ? Infinity : 0,
            duration: 1.8,
            ease: "easeInOut"
          }}
        />
      </svg>
      <motion.div
        animate={{ x: active ? ["-38%", "38%"] : "0%" }}
        transition={{ repeat: active ? Infinity : 0, duration: 1.6, ease: "linear" }}
        className="absolute inset-0"
      >
        <DataPulse active={active} />
      </motion.div>
    </div>
  );
}
