"use client";

import React from "react";
import NextLink from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  Layers,
  ActivitySquare,
  LockKeyhole,
  RotateCcw,
  CheckSquare,
  BookmarkCheck,
  TrendingUp,
  FileCheck2,
  Printer,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import {
  PROGRAM_METADATA,
  KPIS_SUMMARY,
  SUMMARY_TABLE,
  STRATEGIC_OBJECTIVES
} from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";
import { ExportPrintButton } from "@/components/ExportPrintButton";
import { CopyButton } from "@/components/CopyButton";
import { LiveEngineStatus } from "@/components/LiveEngineStatus";

export default function ExecutiveDashboard() {
  return (
    <div className="space-y-8">
      {/* Executive Hero Banner */}
      <div className="relative rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-cyan-950/30 p-6 sm:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Enterprise Security Architecture
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded-full">
                {PROGRAM_METADATA.version}
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded-full">
                Standards: NIST SP 800-94 | CSF 2.0 | CIS v8
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
              Intrusion Prevention Program (IPP) Blueprint
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              An enterprise-grade operational blueprint designed for Security Architects, SOC Teams, and Compliance Stakeholders to navigate, operationalize, and continuously govern inline network intrusion prevention across hybrid cloud, data center, and perimeter fabrics.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <NextLink
                href="/architecture"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition shadow-lg shadow-cyan-500/25"
              >
                <Layers className="w-4 h-4" />
                Interactive Architecture
                <ArrowRight className="w-3.5 h-3.5" />
              </NextLink>

              <NextLink
                href="/lifecycle"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                5-Stage Lifecycle
              </NextLink>

              <NextLink
                href="/checklist"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
              >
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                Actionable Checklist
              </NextLink>

              <ExportPrintButton label="Export Summary" variant="print" className="no-print" />
            </div>
          </div>

          {/* Quick Status Pill Box */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 shrink-0 lg:w-72">
            <div className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center justify-between">
              <span>Program Health</span>
              <span className="text-emerald-400">OPTIMAL</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Inline Sensors:</span>
                <span className="text-cyan-400 font-bold">142 Active</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bypass Readiness:</span>
                <span className="text-emerald-400 font-bold">100% Optical</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ATT&CK Alignment:</span>
                <span className="text-indigo-400 font-bold">92.4% Covered</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Exceptions Active:</span>
                <span className="text-amber-400 font-bold">4 (Expiring &lt;30d)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS_SUMMARY.map((kpi, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
              <span>{kpi.label}</span>
              <StatusBadge status={kpi.status} variant="emerald" size="sm" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
                {kpi.value}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Target: {kpi.target}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{kpi.change}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">
              {kpi.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* Live Python IPS Engine Telemetry Integration */}
      <LiveEngineStatus />

      {/* Strategic Objectives Grid */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Strategic Program Objectives
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Core mandates driving enterprise intrusion prevention architecture and SOC operations.
            </p>
          </div>
          <NextLink
            href="/program"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Full Governance Policy <ArrowRight className="w-3 h-3" />
          </NextLink>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STRATEGIC_OBJECTIVES.map((obj) => (
            <div
              key={obj.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition space-y-2"
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

      {/* One-Page Summary Table (Full Blueprint Map) */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-cyan-400" />
              One-Page Intrusion Prevention Program Summary Table
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Condensed cross-domain reference table mapping all program pillars to standards and success factors.
            </p>
          </div>
          <ExportPrintButton label="Print One-Page Summary" variant="print" className="no-print" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 bg-slate-950/60">
                <th className="py-3 px-3">Program Area</th>
                <th className="py-3 px-3">Key Architectural Components</th>
                <th className="py-3 px-3">Aligned Standards</th>
                <th className="py-3 px-3">Critical Success Factor</th>
                <th className="py-3 px-2 text-right no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {SUMMARY_TABLE.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-slate-800/40 transition group"
                >
                  <td className="py-3 px-3 font-semibold text-slate-100 whitespace-nowrap">
                    <NextLink
                      href={row.route}
                      className="text-cyan-400 hover:underline flex items-center gap-1.5"
                    >
                      {row.area}
                    </NextLink>
                  </td>
                  <td className="py-3 px-3 leading-relaxed max-w-sm">
                    {row.keyComponents}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {row.standards}
                  </td>
                  <td className="py-3 px-3 leading-relaxed text-slate-200">
                    {row.criticalSuccessFactor}
                  </td>
                  <td className="py-3 px-2 text-right whitespace-nowrap no-print">
                    <NextLink
                      href={row.route}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 inline-flex items-center text-[11px]"
                      title={`Open ${row.area}`}
                    >
                      Explore <ArrowRight className="w-3 h-3 ml-1" />
                    </NextLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
