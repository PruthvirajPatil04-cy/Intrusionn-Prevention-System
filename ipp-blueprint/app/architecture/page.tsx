"use client";

import React from "react";
import NextLink from "next/link";
import {
  Network,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  Cpu,
  Globe,
  Server,
  Cloud,
  Laptop
} from "lucide-react";
import { ArchitectureDiagram } from "@/components/ArchitectureDiagram";
import { CONTROLS } from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { ExportPrintButton } from "@/components/ExportPrintButton";

export default function ArchitecturePage() {
  const arcControls = CONTROLS.filter(c => c.sectionId === "architecture");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Pillar 02 / Architecture & Sensor Placement
            </span>
            <StatusBadge status="Defense in Depth" variant="cyan" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Network className="w-6 h-6 text-cyan-400" />
            Defense-in-Depth Architecture & Sensor Placement
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Multi-tiered inspection topology spanning Internet Perimeter (North-South), Data Center Fabric (East-West), Cloud/Hybrid Transit Gateways, Network Segmentation/NAC, and Host HIPS/EDR.
          </p>
        </div>
        <ExportPrintButton label="Print Architecture Specs" variant="print" className="no-print" />
      </div>

      {/* Interactive Layered Architecture Canvas */}
      <ArchitectureDiagram />

      {/* Packet Flow Walkthrough */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            End-to-End Inline Packet Processing Walkthrough
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            How incoming network packets traverse sensor hardware and deep inspection engines at line rate.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-cyan-400">Step 01 / Ingress</div>
            <div className="font-semibold text-slate-200">Optical Bypass & NIC Driver</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Packets enter via hardware optical bypass switch; zero-copy kernel driver (e.g., DPDK/AF_XDP) ingests frame into ring buffer.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-amber-400">Step 02 / Reputation</div>
            <div className="font-semibold text-slate-200">IP/ASN Pre-Filter</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Hardware TCAM matches source/destination against known malicious IP feeds; drops 70%+ of internet scans before CPU parsing.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-indigo-400">Step 03 / Deep Inspection</div>
            <div className="font-semibold text-slate-200">Protocol Reassembly & Regex</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              TCP stream reassembly engine reconstructs payload; Aho-Corasick regex engine checks signatures and protocol compliance.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-mono font-bold text-emerald-400">Step 04 / Enforcement</div>
            <div className="font-semibold text-slate-200">Inline Drop & CEF Alert</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              If signature triggers in Block mode, packet is silently dropped and TCP RST sent; normalized CEF event emitted to SIEM within 1 sec.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Controls Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            Architecture & Placement Safeguards (Controls)
          </h2>
          <NextLink
            href="/checklist"
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            Open Full Checklist <ArrowRight className="w-3 h-3" />
          </NextLink>
        </div>

        <div className="space-y-3">
          {arcControls.map(c => (
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
