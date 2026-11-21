"use client";

import React from "react";
import NextLink from "next/link";
import {
  FileCheck2,
  ShieldCheck,
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  CheckSquare
} from "lucide-react";
import {
  STRATEGIC_OBJECTIVES,
  GUIDING_PRINCIPLES,
  GOVERNANCE_ROLES,
  EXCEPTION_MANAGEMENT_PROCESS,
  CONTROLS
} from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { ExportPrintButton } from "@/components/ExportPrintButton";

export default function ProgramGovernancePage() {
  const govControls = CONTROLS.filter(c => c.sectionId === "program");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Pillar 01 / Foundation
            </span>
            <StatusBadge status="Enforced Policy" variant="cyan" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-cyan-400" />
            Program Objectives, Principles & Governance Foundation
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            The charter, operating principles, policy baseline, cross-functional roles, and formal exception lifecycle governing the enterprise intrusion prevention posture.
          </p>
        </div>
        <ExportPrintButton label="Print Policy Brief" variant="print" className="no-print" />
      </div>

      {/* Strategic Objectives Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Strategic Objectives
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STRATEGIC_OBJECTIVES.map(obj => (
            <div
              key={obj.id}
              className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">{obj.id}</span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {obj.kpi}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100">{obj.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{obj.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Guiding Principles */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <BookmarkCheck className="w-4 h-4 text-indigo-400" />
          Core Operating Principles
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GUIDING_PRINCIPLES.map(pr => (
            <div
              key={pr.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400">{pr.id}</span>
                <StatusBadge status={pr.category} variant="indigo" size="sm" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">{pr.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{pr.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Governance Policy Baseline & Default-Deny Protocol */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Mandatory IPS Baseline Policy
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-400 font-mono uppercase block">
              01. Authorized Traffic Baseline
            </span>
            <p className="text-slate-300 leading-relaxed">
              Every production network enclave must maintain a documented, machine-readable inventory of authorized protocols, source subnets, and expected port behaviors. Unregistered ports are blocked by default.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 font-mono uppercase block">
              02. Default-Deny Boundaries
            </span>
            <p className="text-slate-300 leading-relaxed">
              All boundary inspection points (Perimeter, East-West core, Cloud TGW) must terminate with an explicit default-deny cleanup rule. Any rule allowing non-standard protocols requires documented justification.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 font-mono uppercase block">
              03. Alert-to-Block Promotion Gate
            </span>
            <p className="text-slate-300 leading-relaxed">
              New signatures must run in Alert Mode for 7 days with zero false-positive production alerts prior to being promoted to Inline Block mode, ensuring uninterrupted business traffic.
            </p>
          </div>
        </div>
      </div>

      {/* Cross-Functional Roles & Accountability */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Cross-Functional Roles & Ownership Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Clear delineation of engineering, operational triage, forensic containment, and audit responsibilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GOVERNANCE_ROLES.map((r, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-100">{r.role}</span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/80">
                  Primary Owner
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-slate-400">Core Ownership:</strong> {r.ownership}
              </p>
              <p className="text-xs text-slate-400 border-t border-slate-800/60 pt-2">
                <strong className="text-slate-400">Collaborates with:</strong> {r.keyInteractions}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Exception Management Workflow */}
      <div className="rounded-xl border border-amber-500/30 bg-slate-900/90 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                Compliance Protocol
              </span>
              <StatusBadge status="90-Day Strict TTL" variant="amber" />
            </div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Documented Temporary Exception Lifecycle
            </h2>
          </div>
          <span className="text-xs text-amber-300 font-mono">
            {EXCEPTION_MANAGEMENT_PROCESS.maxDuration}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {EXCEPTION_MANAGEMENT_PROCESS.policy}
        </p>

        {/* 5-Step Process Visual */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {EXCEPTION_MANAGEMENT_PROCESS.steps.map(s => (
            <div
              key={s.step}
              className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5"
            >
              <div className="text-xs font-mono font-bold text-amber-400">Step 0{s.step}</div>
              <div className="text-xs font-bold text-slate-100">{s.name}</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Governance Controls Checklist Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            Governance & Policy Controls
          </h2>
          <NextLink
            href="/checklist"
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            Open Full Checklist <ArrowRight className="w-3 h-3" />
          </NextLink>
        </div>

        <div className="space-y-3">
          {govControls.map(c => (
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
