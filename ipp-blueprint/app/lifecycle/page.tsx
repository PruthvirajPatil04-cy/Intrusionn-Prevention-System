"use client";

import React from "react";
import NextLink from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckSquare
} from "lucide-react";
import { LifecycleStepper } from "@/components/LifecycleStepper";
import { CONTROLS } from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { ExportPrintButton } from "@/components/ExportPrintButton";

export default function LifecyclePage() {
  const lfcControls = CONTROLS.filter(c => c.sectionId === "lifecycle");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Pillar 03 / Operational Lifecycle
            </span>
            <StatusBadge status="Alert-First Cadence" variant="cyan" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <RotateCcw className="w-6 h-6 text-cyan-400" />
            Deployment Methodology & Operational Lifecycle
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            A disciplined 5-stage engineering workflow (Scope → Discover → Protect → Optimize → Maintain) ensuring inline blocking without risking critical application outages.
          </p>
        </div>
        <ExportPrintButton label="Print Lifecycle Runbook" variant="print" className="no-print" />
      </div>

      {/* Interactive 5-Stage Stepper Workspace */}
      <LifecycleStepper />

      {/* Signature Alert-to-Block Promotion Matrix */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            Disciplined Rule Promotion & Tuning Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Decision gates required before any threat signature is granted active blocking authority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 font-mono">Stage A: Staging (Alert)</span>
              <StatusBadge status="Observation" variant="amber" />
            </div>
            <p className="text-slate-300 leading-relaxed">
              New vendor signatures, CVE rules, or custom Snort/Suricata patterns run in passive Alert Mode for a mandatory 7-day observation period across all production sensor fleets.
            </p>
            <div className="text-[11px] text-amber-400 font-mono pt-1">
              Gate: Must record &lt; 5 daily alerts on business endpoints.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 font-mono">Stage B: Triage & Noise Tuning</span>
              <StatusBadge status="Analysis" variant="indigo" />
            </div>
            <p className="text-slate-300 leading-relaxed">
              Detection engineers review every triggered event in the SIEM staging queue. Benign internal scanners, backup agents, and custom enterprise tools are filtered via variable sets.
            </p>
            <div className="text-[11px] text-indigo-400 font-mono pt-1">
              Gate: Verified 0 true production false positives.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-100 font-mono">Stage C: Inline Block Promotion</span>
              <StatusBadge status="Active Block" variant="emerald" />
            </div>
            <p className="text-slate-300 leading-relaxed">
              Signature is promoted to Inline Drop / TCP RST. Configuration is committed to Git repository with dual peer review and deployed through automated CI/CD pipeline.
            </p>
            <div className="text-[11px] text-emerald-400 font-mono pt-1">
              Gate: SOC Lead sign-off & automated rollback ticket created.
            </div>
          </div>
        </div>
      </div>

      {/* Lifecycle Controls Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            Deployment Lifecycle Controls
          </h2>
          <NextLink
            href="/checklist"
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            Open Full Checklist <ArrowRight className="w-3 h-3" />
          </NextLink>
        </div>

        <div className="space-y-3">
          {lfcControls.map(c => (
            <div
              key={c.id}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CopyButton text={c.id} label={c.id} />
                  <StatusBadge status={c.priority} variant={c.priority === "P1" ? "rose" : "amber"} />
                  <span className="font-semibold text-slate-200">{c.title}</span>
                </div>
                <p className="text-slate-400 text-[11px]">{c.description}</p>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">
                {c.frameworkRefs[0]?.framework} {c.frameworkRefs[0]?.controlId}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
