"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  BookmarkCheck,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  ExternalLink
} from "lucide-react";
import { FRAMEWORK_MAPPINGS, CONTROLS } from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { ExportPrintButton } from "@/components/ExportPrintButton";

export default function FrameworksPage() {
  const [selectedFramework, setSelectedFramework] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const frameworks = ["All", "NIST SP 800-94", "NIST CSF 2.0", "CIS Controls v8", "MITRE ATT&CK"];

  const filteredMappings = FRAMEWORK_MAPPINGS.filter(item => {
    const matchFw = selectedFramework === "All" || item.framework === selectedFramework;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      item.controlRef.toLowerCase().includes(q) ||
      item.frameworkTitle.toLowerCase().includes(q) ||
      item.ippCoverage.toLowerCase().includes(q) ||
      item.primaryIppControls.some(c => c.toLowerCase().includes(q));
    return matchFw && matchQuery;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Pillar 07 / Regulatory & Standards Crosswalk
            </span>
            <StatusBadge status="Audited Alignment" variant="cyan" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <BookmarkCheck className="w-6 h-6 text-cyan-400" />
            Compliance & Industry Framework Mapping
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Direct crosswalk mapping Intrusion Prevention Program safeguards to NIST SP 800-94 (IDPS), NIST Cybersecurity Framework (CSF 2.0), CIS Critical Security Controls v8 (Controls 12–13), and the MITRE ATT&CK Enterprise Matrix.
          </p>
        </div>
        <ExportPrintButton label="Export Crosswalk" variant="print" className="no-print" />
      </div>

      {/* Framework Summary Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-md">
          <div className="text-xs font-mono font-bold text-cyan-400">NIST SP 800-94</div>
          <div className="text-xs font-bold text-slate-100">IDPS Special Publication</div>
          <p className="text-[11px] text-slate-400">
            Guide to Intrusion Detection and Prevention Systems architecture, sensor tuning, and maintenance.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-md">
          <div className="text-xs font-mono font-bold text-emerald-400">NIST CSF 2.0</div>
          <div className="text-xs font-bold text-slate-100">Cybersecurity Framework</div>
          <p className="text-[11px] text-slate-400">
            Functions: Protect (PR.IR, PR.PS), Detect (DE.CM, DE.AE), and Respond (RS.CO, RS.MI).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-md">
          <div className="text-xs font-mono font-bold text-indigo-400">CIS Controls v8</div>
          <div className="text-xs font-bold text-slate-100">Controls 12 & 13</div>
          <p className="text-[11px] text-slate-400">
            Network Infrastructure Management (12.1-12.8) and Network Monitoring/Defense (13.1-13.11).
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 shadow-md">
          <div className="text-xs font-mono font-bold text-amber-400">MITRE ATT&CK</div>
          <div className="text-xs font-bold text-slate-100">Enterprise Techniques</div>
          <p className="text-[11px] text-slate-400">
            T1190 (Public Exploits), T1071 (C2 Protocols), T1046 (Discovery), T1021 (Remote Services).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3 no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search framework reference, title, or mapped controls..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {frameworks.map(fw => (
              <button
                key={fw}
                type="button"
                onClick={() => setSelectedFramework(fw)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedFramework === fw
                    ? "bg-cyan-500 text-slate-950 font-semibold"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {fw}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Showing <strong className="text-cyan-400">{filteredMappings.length}</strong> of{" "}
          {FRAMEWORK_MAPPINGS.length} framework mapping entries
        </div>
      </div>

      {/* Crosswalk Data Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400 bg-slate-950/70">
                <th className="py-3 px-4">Standard</th>
                <th className="py-3 px-4">Control Reference</th>
                <th className="py-3 px-4">Framework Objective / Title</th>
                <th className="py-3 px-4">IPP Implementation Coverage</th>
                <th className="py-3 px-4">Coverage Level</th>
                <th className="py-3 px-4">Mapped IPP Safeguards</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredMappings.map(item => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-cyan-400 whitespace-nowrap">
                    {item.framework}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-200 whitespace-nowrap">
                    {item.controlRef}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-100 max-w-xs">
                    {item.frameworkTitle}
                  </td>
                  <td className="py-3 px-4 leading-relaxed text-slate-300 max-w-md">
                    {item.ippCoverage}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={item.coverageLevel} variant={item.coverageLevel === "Full" ? "emerald" : "cyan"} size="sm" />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1.5">
                      {item.primaryIppControls.map(cId => (
                        <CopyButton key={cId} text={cId} label={cId} />
                      ))}
                    </div>
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
