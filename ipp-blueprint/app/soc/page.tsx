"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  ActivitySquare,
  ShieldAlert,
  Zap,
  RotateCcw,
  Terminal,
  FolderLock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckSquare
} from "lucide-react";
import { SOC_USE_CASES, CONTROLS } from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { ExportPrintButton } from "@/components/ExportPrintButton";

export default function SocIntegrationPage() {
  const [activeUseCase, setActiveUseCase] = useState<string>(SOC_USE_CASES[0].id);
  const socControls = CONTROLS.filter(c => c.sectionId === "soc");

  const selectedCase = SOC_USE_CASES.find(u => u.id === activeUseCase) || SOC_USE_CASES[0];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Pillar 04 / Incident Operations
            </span>
            <StatusBadge status="Automated Containment" variant="rose" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <ActivitySquare className="w-6 h-6 text-cyan-400" />
            SOC Integration, Detection Engineering & Incident Response
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Real-time SIEM/SOAR correlation pipelines, multi-source attack use cases, detection engineering lifecycles, purple-team test validation, and emergency containment playbooks.
          </p>
        </div>
        <ExportPrintButton label="Print SOC Runbook" variant="print" className="no-print" />
      </div>

      {/* SIEM / SOAR Normalized Pipeline Architecture */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            Real-Time SIEM/SOAR Ingestion & Automated Enrichment Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            High-speed telemetry processing from sensor drop to analyst containment dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-cyan-400">01. Sensor CEF Emitter</div>
            <div className="font-semibold text-slate-200">Sub-Second Log Streaming</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Inline sensors emit syslog CEF/ECS JSON messages containing Src/Dst IP, authenticated user ID, Signature ID, and raw payload snippet.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-indigo-400">02. Threat Intel Fusion</div>
            <div className="font-semibold text-slate-200">SOAR Auto-Enrichment</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              SOAR queries VirusTotal, AlienVault, and MISP; queries CMDB for asset criticality (Tier 0/1/2) and Okta for user risk score.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-amber-400">03. Correlation Engine</div>
            <div className="font-semibold text-slate-200">Multi-Signal Detection</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Correlates network IPS block with host EDR process telemetry and identity logins to detect complete attacker kill-chain progression.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-emerald-400">04. Automated Action</div>
            <div className="font-semibold text-slate-200">Instant Containment</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              P1 alerts trigger automated firewall dynamic blocklist push, endpoint EDR network isolation, and session revocation in under 5 minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Correlation Use Cases Workspace */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Real-World High-Fidelity Threat Correlation Use Cases
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a production use case to inspect the correlation logic, SOAR enrichment, containment protocol, and evidentiary packet artifacts.
            </p>
          </div>
        </div>

        {/* Use Case Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {SOC_USE_CASES.map(uc => (
            <button
              key={uc.id}
              type="button"
              onClick={() => setActiveUseCase(uc.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                activeUseCase === uc.id
                  ? "bg-rose-950/40 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30"
                  : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <span className="font-mono font-bold">{uc.id}</span>
              <span>{uc.name}</span>
              <StatusBadge status={uc.severity} variant={uc.severity === "Critical" ? "rose" : "amber"} size="sm" />
            </button>
          ))}
        </div>

        {/* Selected Use Case Detail Panel */}
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold">{selectedCase.id} Spec</span>
              <h3 className="text-lg font-bold text-slate-100">{selectedCase.name}</h3>
            </div>
            <CopyButton text={`Use Case: ${selectedCase.name}\nTrigger: ${selectedCase.trigger}\nContainment: ${selectedCase.containmentProtocol}`} label="Copy Playbook" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="font-bold text-rose-400 font-mono uppercase block">
                Primary Network IPS Trigger
              </span>
              <p className="text-slate-300 leading-relaxed">{selectedCase.trigger}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="font-bold text-cyan-400 font-mono uppercase block">
                SIEM Multi-Source Correlation Logic
              </span>
              <p className="text-slate-300 leading-relaxed">{selectedCase.correlationLogic}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="font-bold text-indigo-400 font-mono uppercase block">
                SOAR Automated Action & Enrichment
              </span>
              <p className="text-slate-300 leading-relaxed">{selectedCase.soarAction}</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-400 font-mono uppercase block">
                Emergency Containment Protocol
              </span>
              <p className="text-slate-300 leading-relaxed">{selectedCase.containmentProtocol}</p>
            </div>
          </div>

          {/* Forensic Evidence Retained */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider block mb-2">
              Forensic Evidence Packets & Metadata Retained (90-Day WORM):
            </span>
            <div className="flex flex-wrap gap-2">
              {selectedCase.evidenceRetained.map((ev, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-cyan-300 text-[11px] font-mono flex items-center gap-1.5"
                >
                  <FolderLock className="w-3.5 h-3.5 text-cyan-400" />
                  {ev}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detection Engineering Lifecycle & Purple-Team Testing */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            Detection Engineering Lifecycle & Purple-Team Validation
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous hypothesis-driven detection authorship tested via automated breach simulation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-cyan-400 font-mono font-bold">01. Threat Intel</span>
            <div className="font-semibold text-slate-200">Threat Ingestion</div>
            <p className="text-slate-400 text-[11px]">CISA advisories, CVE disclosure, and ISAC indicators ingested into backlog.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-indigo-400 font-mono font-bold">02. Rule Authoring</span>
            <div className="font-semibold text-slate-200">Snort/Suricata Dev</div>
            <p className="text-slate-400 text-[11px]">Craft precise regex signature with protocol constraints and byte offsets.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-amber-400 font-mono font-bold">03. Alert Staging</span>
            <div className="font-semibold text-slate-200">7-Day Test Run</div>
            <p className="text-slate-400 text-[11px]">Deploy in alert mode to measure false positives against normal traffic.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-emerald-400 font-mono font-bold">04. Purple Team</span>
            <div className="font-semibold text-slate-200">Atomic Red Team</div>
            <p className="text-slate-400 text-[11px]">Fire simulated exploit payloads to verify detection and inline drop.</p>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-rose-400 font-mono font-bold">05. Inline Block</span>
            <div className="font-semibold text-slate-200">Production Deploy</div>
            <p className="text-slate-400 text-[11px]">Sign-off ticket and promote rule to global active blocking cluster.</p>
          </div>
        </div>
      </div>

      {/* SOC Controls Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            SOC & Incident Response Controls
          </h2>
          <NextLink
            href="/checklist"
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            Open Full Checklist <ArrowRight className="w-3 h-3" />
          </NextLink>
        </div>

        <div className="space-y-3">
          {socControls.map(c => (
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
