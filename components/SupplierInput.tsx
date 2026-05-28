"use client";

import { motion } from "framer-motion";
import { ArrowRight, Binary, Play, TerminalSquare, Zap, Database, Brain } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

const exampleSuppliers = ["TSMC", "Maersk", "Nvidia", "CATL", "Albemarle"];

export function SupplierInput({
  supplierName,
  onSupplierNameChange,
  onSubmit,
  onRunSimulation,
  running,
  liveMode,
  onLiveModeChange,
  agenticMode,
  onAgenticModeChange
}: {
  supplierName: string;
  onSupplierNameChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onRunSimulation: (value: string) => void;
  running: boolean;
  liveMode: boolean;
  onLiveModeChange: (value: boolean) => void;
  agenticMode: boolean;
  onAgenticModeChange: (value: boolean) => void;
}) {
  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-center justify-between rounded-[24px] bg-white/[0.04] px-4 py-3 text-sm text-slate-300 ring-1 ring-white/5">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-4 w-4 text-cyan" />
          <span>Supplier command input</span>
        </div>
        <StatusBadge label={running ? "Locked" : "Editable"} tone={running ? "warning" : "idle"} />
      </div>

      <label className="space-y-3">
        <span className="text-sm font-medium text-slate-200">Target Supplier</span>
        <div className="rounded-[28px] bg-[linear-gradient(180deg,rgba(4,10,20,0.86),rgba(2,8,18,0.98))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_-16px_40px_rgba(0,0,0,0.28)] ring-1 ring-cyan-400/10">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-cyan/70">
            <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_14px_rgba(71,215,255,0.85)]" />
            <Binary className="h-3.5 w-3.5" />
            Input stream
          </div>
          <div className="rounded-[22px] bg-black/30 px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <input
              value={supplierName}
              onChange={(event) => onSupplierNameChange(event.target.value)}
              placeholder="Enter supplier name..."
              className="w-full bg-transparent text-2xl font-medium tracking-tight text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>
      </label>

      <div className="flex flex-wrap gap-2">
        {exampleSuppliers.map((supplier) => (
          <button
            key={supplier}
            type="button"
            disabled={running}
            onClick={() => onSupplierNameChange(supplier)}
            className="rounded-full bg-white/[0.04] px-3 py-1.5 text-sm text-cyan transition hover:bg-cyan/10 disabled:cursor-not-allowed disabled:opacity-50 ring-1 ring-cyan-400/10"
          >
            {supplier}
          </button>
        ))}
      </div>

      <div className="rounded-[24px] bg-white/[0.04] p-4 ring-1 ring-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              {liveMode ? (
                <Zap className="h-4 w-4 text-amber-400" />
              ) : (
                <Database className="h-4 w-4 text-cyan" />
              )}
              <span>Mode: {liveMode ? "Live API" : "Mock Data"}</span>
            </div>
            <StatusBadge
              label={liveMode ? "Bright Data Active" : "Simulation"}
              tone={liveMode ? "complete" : "idle"}
            />
          </div>
          <button
            type="button"
            disabled={running}
            onClick={() => onLiveModeChange(!liveMode)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              liveMode ? "bg-amber-500" : "bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                liveMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {liveMode && (
          <p className="mt-2 text-xs text-slate-400">
            Using Bright Data SERP API, Web Unlocker, and Scraping Browser for real-time data collection
          </p>
        )}
      </div>

      <div className="rounded-[24px] bg-white/[0.04] p-4 ring-1 ring-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              {agenticMode ? (
                <Brain className="h-4 w-4 text-purple-400" />
              ) : (
                <Zap className="h-4 w-4 text-cyan" />
              )}
              <span>AI: {agenticMode ? "Agentic (GPT-5-5)" : "Standard"}</span>
            </div>
            <StatusBadge
              label={agenticMode ? "Autonomous AI" : "Standard AI"}
              tone={agenticMode ? "active" : "idle"}
            />
          </div>
          <button
            type="button"
            disabled={running}
            onClick={() => onAgenticModeChange(!agenticMode)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              agenticMode ? "bg-purple-500" : "bg-slate-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform ${
                agenticMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {agenticMode && (
          <p className="mt-2 text-xs text-slate-400">
            Using GPT-5-5 with autonomous reasoning, multi-step analysis, and advanced pattern recognition
          </p>
        )}
      </div>

      <div className="mt-auto grid gap-3 md:grid-cols-2">
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={running || !supplierName.trim()}
          onClick={() => onRunSimulation(supplierName)}
          className="flex items-center justify-center gap-2 rounded-[24px] bg-white/[0.04] px-5 py-4 font-display text-lg font-semibold text-cyan shadow-[0_18px_50px_rgba(71,215,255,0.08)] transition hover:bg-cyan/10 disabled:cursor-not-allowed disabled:opacity-60 ring-1 ring-cyan-400/10"
        >
          {running ? "Simulation Running" : "Run Mock Simulation"}
          <Play className="h-5 w-5" />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={running || !supplierName.trim()}
          onClick={() => onSubmit(supplierName)}
          className={`flex items-center justify-center gap-2 rounded-[24px] px-5 py-4 font-display text-lg font-semibold shadow-[0_18px_50px_rgba(35,140,255,0.32)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${
            agenticMode
              ? "bg-[linear-gradient(135deg,rgba(168,85,247,0.95),rgba(139,92,246,0.96))] text-white"
              : liveMode
              ? "bg-[linear-gradient(135deg,rgba(251,191,36,0.95),rgba(245,158,11,0.96))] text-slate-950"
              : "bg-[linear-gradient(135deg,rgba(111,235,255,0.95),rgba(67,144,255,0.96))] text-slate-950"
          }`}
        >
          {running ? "Analyzing..." : agenticMode ? "🤖 Agentic Analysis" : liveMode ? "Analyze Live" : "Analyze Supplier"}
          <ArrowRight className="h-5 w-5" />
        </motion.button>
      </div>
    </div>
  );
}
