"use client";

import React, { useState } from "react";
import {
  Compass,
  Radio,
  Shield,
  Sliders,
  Wrench,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Clock
} from "lucide-react";
import { LIFECYCLE_STAGES } from "@/data/programData";
import { LifecycleStage } from "@/data/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";

export function LifecycleStepper() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const currentStage: LifecycleStage =
    LIFECYCLE_STAGES.find(s => s.step === activeStep) || LIFECYCLE_STAGES[0];

  const getStageIcon = (step: number) => {
    switch (step) {
      case 1:
        return Compass;
      case 2:
        return Radio;
      case 3:
        return Shield;
      case 4:
        return Sliders;
      case 5:
        return Wrench;
      default:
        return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* 5-Step Visual Stepper Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4 backdrop-blur-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {LIFECYCLE_STAGES.map(stage => {
            const Icon = getStageIcon(stage.step);
            const isActive = stage.step === activeStep;
            const isCompleted = stage.step < activeStep;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setActiveStep(stage.step)}
                className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all ${
                  isActive
                    ? "bg-cyan-950/60 border-cyan-500/60 text-cyan-300 ring-1 ring-cyan-500/50 shadow-sm"
                    : isCompleted
                    ? "bg-slate-900/80 border-emerald-500/30 text-slate-300 hover:border-slate-700"
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : isCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Step {stage.step}
                  </div>
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {stage.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Stage Detailed Workspace */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-xl animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Lifecycle Phase {currentStage.step} of 5
              </span>
              <StatusBadge status={currentStage.name} variant="cyan" />
            </div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>{currentStage.name}: {currentStage.tagline}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={activeStep === 1}
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <button
              type="button"
              disabled={activeStep === 5}
              onClick={() => setActiveStep(prev => Math.min(5, prev + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-slate-950 font-semibold transition"
            >
              Next <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Alert-First Callout Banner */}
        <div className="my-5 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider mr-2">
              Alert-First Tuning Rule:
            </span>
            <span className="text-xs text-amber-200/90 leading-relaxed">
              {currentStage.alertFirstGuidance}
            </span>
          </div>
        </div>

        {/* Content Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Objectives & Concrete Actions */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Strategic Objectives
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {currentStage.objectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-mono font-bold mt-0.5">0{i + 1}.</span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Operational Engineering Actions
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {currentStage.actions.map((act, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-mono font-bold mt-0.5">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tuning Notes & Exit Criteria */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-indigo-400 uppercase font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" /> Fine-Tuning & Noise Suppression
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {currentStage.tuningNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-mono font-bold mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Gate Exit Criteria (Phase Sign-Off)
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {currentStage.exitCriteria.map((exit, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{exit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Phase aligned to: <span className="text-slate-200">NIST SP 800-94 Section 4.1 - 4.4</span>
          </span>
          <CopyButton text={`Lifecycle Phase ${currentStage.step}: ${currentStage.name} - ${currentStage.tagline}`} label="Copy Phase Guidance" />
        </div>
      </div>
    </div>
  );
}
