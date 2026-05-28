"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function WorkflowConnector({
  active,
  className
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative hidden h-10 min-w-24 items-center justify-center 2xl:flex",
        className
      )}
    >
      <div className="absolute h-[2px] w-full rounded-full bg-gradient-to-r from-cyan/10 via-cyan/60 to-cyan/10" />
      <div className="absolute h-6 w-full rounded-full border border-cyan/10 bg-cyan/5 blur-md" />
      <motion.div
        animate={{
          opacity: active ? [0.2, 1, 0.2] : 0.25,
          backgroundPositionX: active ? ["0%", "100%"] : "0%"
        }}
        transition={{
          repeat: active ? Infinity : 0,
          duration: 1.4,
          ease: "linear"
        }}
        className="absolute h-[2px] w-full rounded-full bg-[linear-gradient(90deg,transparent,rgba(71,215,255,0.1),rgba(71,215,255,0.95),rgba(71,215,255,0.1),transparent)] bg-[length:40%_100%]"
      />
      <motion.div
        animate={{ x: active ? ["-45%", "45%"] : "0%" }}
        transition={{
          repeat: active ? Infinity : 0,
          duration: 1.4,
          ease: "linear"
        }}
        className="absolute h-3 w-3 rounded-full bg-cyan shadow-[0_0_20px_rgba(71,215,255,0.95)]"
      />
    </div>
  );
}
