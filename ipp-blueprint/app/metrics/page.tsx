"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  BarChart3,
  TrendingUp,
  Activity,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  Filter,
  CheckSquare
} from "lucide-react";
import { MetricsCharts } from "@/components/MetricsCharts";
import { PROGRAM_METRICS_LIST, CONTROLS } from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { ExportPrintButton } from "@/components/ExportPrintButton";

export default function MetricsAssurancePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const metControls = CONTROLS.filter(c => c.sectionId === "metrics");

  const categories = ["All", "Coverage", "Efficacy", "Operational Health", "SOC Integration"];

  const filteredMetrics = PROGRAM_METRICS_LIST.filter(
    m => selectedCategory === "All" || m.category === selectedCategory
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Pillar 06 / Governance & KPIs
            </span>
            <StatusBadge status="Empirical Health" variant="emerald" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            Program Metrics, Assurance & Continuous Improvement
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Data-driven governance tracking network coverage percentages, attack block efficacy, false-positive ratios, hardware latency penalties, and compliance evidentiary audits.
          </p>
        </div>
        <ExportPrintButton label="Export Metrics Report" variant="print" className="no-print" />
      </div>

      {/* Interactive Visual Recharts Dashboard */}
      <MetricsCharts />

      {/* Categorized Operational Metrics Table & Cards */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Operational Health & Efficacy Telemetry Matrix
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Target SLAs vs. empirical metrics measured across global sensor clusters.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedCategory === cat
                    ? "bg-cyan-500 text-slate-950 font-semibold"
                    : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMetrics.map(item => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-cyan-400 font-semibold">{item.category}</span>
                <StatusBadge status={item.status} variant="emerald" size="sm" />
              </div>

              <div className="font-semibold text-xs text-slate-100">{item.name}</div>

              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-bold font-mono text-slate-100">{item.value}</span>
                <span className="text-xs font-mono text-slate-400">Target: {item.target}</span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800/60 pt-2">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Assurance Activities & Evidentiary Audit Protocols */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-indigo-400" />
            Continuous Assurance & Compliance Evidentiary Activities
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured controls verifying that defense-in-depth posture does not degrade over time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-cyan-400 font-mono uppercase block">
              01. Bi-Weekly Configuration Baseline Audit
            </span>
            <p className="text-slate-300 leading-relaxed">
              Automated script checks all 142 sensor configurations against the approved Git master template. Verifies zero unauthorized bypass rules, stale whitelists, or unapproved rule suppressions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-indigo-400 font-mono uppercase block">
              02. Bi-Annual Tabletop & Red Team Simulations
            </span>
            <p className="text-slate-300 leading-relaxed">
              CSIRT and Red Team simulate active breach scenarios executing MITRE ATT&CK techniques across segmented data center zones to test automated quarantine response times.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 font-mono uppercase block">
              03. 90-Day Immutable WORM Evidence Retention
            </span>
            <p className="text-slate-300 leading-relaxed">
              All raw packet captures, session connection logs, and rule modification change tickets are written to immutable Write-Once-Read-Many (WORM) storage satisfying PCI-DSS and SOC 2 audits.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Controls Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            Metrics & Assurance Controls
          </h2>
          <NextLink
            href="/checklist"
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            Open Full Checklist <ArrowRight className="w-3 h-3" />
          </NextLink>
        </div>

        <div className="space-y-3">
          {metControls.map(c => (
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
