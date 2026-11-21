"use client";

import React, { useState } from "react";
import {
  Globe,
  Server,
  Cloud,
  ShieldCheck,
  Laptop,
  ArrowDownUp,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  X
} from "lucide-react";
import { ARCHITECTURE_NODES, CONTROLS } from "@/data/programData";
import { ArchitectureNode } from "@/data/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";

export function ArchitectureDiagram() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-perimeter");

  const selectedNode = ARCHITECTURE_NODES.find(n => n.id === selectedNodeId) || ARCHITECTURE_NODES[0];

  const getLayerIcon = (layer: ArchitectureNode["layer"]) => {
    switch (layer) {
      case "perimeter":
        return Globe;
      case "datacenter":
        return Server;
      case "cloud":
        return Cloud;
      case "segmentation":
        return ShieldCheck;
      case "endpoint":
        return Laptop;
      default:
        return Layers;
    }
  };

  const getLayerColor = (layer: ArchitectureNode["layer"], isSelected: boolean) => {
    if (isSelected) {
      return "border-cyan-400 bg-cyan-950/40 text-cyan-300 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/20";
    }
    switch (layer) {
      case "perimeter":
        return "border-cyan-500/30 bg-slate-900/90 hover:border-cyan-500/60 text-slate-200";
      case "datacenter":
        return "border-indigo-500/30 bg-slate-900/90 hover:border-indigo-500/60 text-slate-200";
      case "cloud":
        return "border-blue-500/30 bg-slate-900/90 hover:border-blue-500/60 text-slate-200";
      case "segmentation":
        return "border-emerald-500/30 bg-slate-900/90 hover:border-emerald-500/60 text-slate-200";
      case "endpoint":
        return "border-amber-500/30 bg-slate-900/90 hover:border-amber-500/60 text-slate-200";
      default:
        return "border-slate-700 bg-slate-900 text-slate-200";
    }
  };

  // Associated controls for this layer
  const associatedControls = CONTROLS.filter(c => c.sectionId === "architecture" || c.sectionId === "zero-trust");

  return (
    <div className="space-y-6">
      {/* Visual Defense-in-Depth Diagram Canvas */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-6 backdrop-blur-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Concentric Rings of Defense & Chokepoint Placement
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any architecture enforcement tier to inspect chokepoints, inspection focus, and telemetry output.
            </p>
          </div>
          <span className="hidden sm:inline-flex text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-full">
            Inline Active Prevention Architecture
          </span>
        </div>

        {/* Layer Nodes Stack */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 my-3">
          {ARCHITECTURE_NODES.map((node, index) => {
            const Icon = getLayerIcon(node.layer);
            const isSelected = selectedNode.id === node.id;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNodeId(node.id)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all relative ${getLayerColor(
                  node.layer,
                  isSelected
                )}`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="p-1.5 rounded-lg bg-slate-800/80">
                    <Icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded">
                    Tier {index + 1}
                  </span>
                </div>

                <div className="font-semibold text-xs text-slate-100 line-clamp-1">
                  {node.name.split("(")[0]}
                </div>
                <div className="text-[11px] text-cyan-400 font-mono mt-0.5 flex items-center gap-1">
                  <ArrowDownUp className="w-3 h-3" />
                  {node.direction}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 line-clamp-2">
                  {node.enforcementMode}
                </div>

                {isSelected && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rotate-45 rounded-sm shadow-md" />
                )}
              </button>
            );
          })}
        </div>

        {/* Direction Flow Labels */}
        <div className="hidden sm:flex items-center justify-between px-2 pt-3 text-[11px] text-slate-400 font-mono border-t border-slate-800/60">
          <span>External Untrusted Network Ingress</span>
          <span className="flex items-center gap-2 text-cyan-400">
            <span>→ Layered Decryption & Deep Inspection →</span>
          </span>
          <span>Crown Jewel Core Workloads & Databases</span>
        </div>
      </div>

      {/* Selected Node Detailed Specification Panel */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-5 sm:p-6 shadow-xl relative animate-in fade-in duration-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Enforcement Tier Specification
              </span>
              <StatusBadge status={selectedNode.direction} variant="cyan" />
              <StatusBadge status={selectedNode.enforcementMode} variant="emerald" />
            </div>
            <h2 className="text-lg font-bold text-slate-100">{selectedNode.name}</h2>
          </div>

          {/* Node KPI Highlights */}
          <div className="flex items-center gap-2">
            {selectedNode.kpis.map(kpi => (
              <div
                key={kpi.label}
                className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center"
              >
                <div className="text-[10px] text-slate-400 font-mono">{kpi.label}</div>
                <div className="text-xs font-bold text-cyan-300 font-mono">{kpi.value}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-300 mt-4 leading-relaxed">
          {selectedNode.description}
        </p>

        {/* Two-Column Deep-Dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* Left: Chokepoints & Inspection Focus */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Physical & Virtual Chokepoints
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedNode.chokepoints.map((cp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-mono mt-0.5">•</span>
                    <span>{cp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Targeted Attack Vectors & Threat Focus
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedNode.inspectionFocus.map((focus, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-mono mt-0.5">•</span>
                    <span>{focus}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right: Telemetry & Tuning Guidance */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider mb-2.5 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Telemetry Streaming & SIEM Output
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {selectedNode.telemetryOutput.map((tel, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-mono mt-0.5">•</span>
                    <span>{tel}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-cyan-950/20 border border-cyan-800/40">
              <h4 className="text-xs font-bold text-cyan-300 uppercase font-mono tracking-wider mb-2 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                Engineering Tuning Guidance
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedNode.tuningGuidance}
              </p>
            </div>
          </div>
        </div>

        {/* Associated Controls Row */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 font-mono">
            Directly governs controls:{" "}
            <span className="text-cyan-400 font-semibold">IPP-ARC-01 through IPP-ARC-05</span>
          </span>
          <CopyButton text={`Tier: ${selectedNode.name} (${selectedNode.direction}) - Mode: ${selectedNode.enforcementMode}`} label="Copy Layer Blueprint" />
        </div>
      </div>
    </div>
  );
}
