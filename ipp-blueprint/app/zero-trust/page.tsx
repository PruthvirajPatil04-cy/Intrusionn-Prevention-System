"use client";

import React from "react";
import NextLink from "next/link";
import {
  LockKeyhole,
  UserCheck,
  ShieldAlert,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckSquare
} from "lucide-react";
import { ZERO_TRUST_PILLARS, CONTROLS } from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { ExportPrintButton } from "@/components/ExportPrintButton";

export default function ZeroTrustPage() {
  const ztControls = CONTROLS.filter(c => c.sectionId === "zero-trust");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Pillar 05 / Zero Trust Paradigm
            </span>
            <StatusBadge status="Identity-Aware" variant="indigo" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <LockKeyhole className="w-6 h-6 text-cyan-400" />
            Zero Trust & Identity-Aware Intrusion Prevention
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Transitioning prevention from static IP boundaries to dynamic identity authentication, granular microsegmentation, continuous verification, and mid-stream anomalous session termination.
          </p>
        </div>
        <ExportPrintButton label="Print Zero Trust Specs" variant="print" className="no-print" />
      </div>

      {/* 4 Core Pillars of Zero Trust Network Defense */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Zero Trust Network Prevention Pillars (NIST SP 800-207)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ZERO_TRUST_PILLARS.map(p => (
            <div
              key={p.id}
              className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">{p.id}</span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded">
                  Pillar
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-100">{p.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{p.description}</p>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                <div className="text-[11px] font-mono text-slate-400">
                  <strong className="text-cyan-400">Mechanism:</strong> {p.technicalMechanism}
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  <strong className="text-indigo-400">IPS Integration:</strong> {p.ipsIntegration}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Validation Metric:</span>
                <span className="text-emerald-400 font-semibold">{p.metric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Identity vs Traditional IP Enforcement Comparison */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-cyan-400" />
            Architectural Paradigm Shift: IP-Based vs. Identity-Aware Prevention
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Legacy IP Model */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 opacity-80">
            <span className="text-xs font-bold text-rose-400 font-mono uppercase block">
              Legacy Perimeter Mindset (IP-Only)
            </span>
            <ul className="space-y-1.5 text-slate-400">
              <li>• Rules bound strictly to source IP/subnet addresses.</li>
              <li>• DHCP lease expiration breaks rule attribution and tracking.</li>
              <li>• Once authenticated at perimeter, lateral movement is largely unmonitored.</li>
              <li>• Attacker pivoting with stolen credentials blends with normal IP traffic.</li>
              <li>• Policy requires manual IP firewall ticket changes taking days.</li>
            </ul>
          </div>

          {/* Zero Trust Model */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
            <span className="text-xs font-bold text-cyan-300 font-mono uppercase block">
              Zero Trust Architecture (Identity + Context)
            </span>
            <ul className="space-y-1.5 text-slate-300">
              <li>• Rules bound dynamically to authenticated User ID, Device Posture & Role.</li>
              <li>• Real-time synchronization with Okta/Entra ID session tokens and risk telemetry.</li>
              <li>• Microsegmentation inspects traffic between workloads in the same subnet.</li>
              <li>• Continuous verification terminates active connections if behavioral deviation occurs.</li>
              <li>• Dynamic quarantine immediately drops trust without human intervention.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Zero Trust Controls Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            Zero Trust Network Controls
          </h2>
          <NextLink
            href="/checklist"
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            Open Full Checklist <ArrowRight className="w-3 h-3" />
          </NextLink>
        </div>

        <div className="space-y-3">
          {ztControls.map(c => (
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
