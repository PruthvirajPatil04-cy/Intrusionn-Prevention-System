"use client";

import React, { useState } from "react";
import NextLink from "next/link";
import {
  Cpu,
  Lock,
  Network,
  Code2,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  CheckSquare
} from "lucide-react";
import { EMERGING_TOPICS, CONTROLS } from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { ExportPrintButton } from "@/components/ExportPrintButton";

export default function EmergingPage() {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(EMERGING_TOPICS[0].id);
  const emgControls = CONTROLS.filter(c => c.sectionId === "emerging");

  const currentTopic = EMERGING_TOPICS.find(t => t.id === selectedTopicId) || EMERGING_TOPICS[0];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Pillar 08 / Future-Ready Security Architecture
            </span>
            <StatusBadge status="Active Innovation" variant="indigo" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-cyan-400" />
            Emerging Considerations & Modern Threat Landscapes
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Addressing encrypted traffic visibility (TLS 1.3 / ESNI / ETA), AI/ML-assisted behavioral anomaly detection, microservice API inspection, and Security-Policy-as-Code automation.
          </p>
        </div>
        <ExportPrintButton label="Export Emerging Brief" variant="print" className="no-print" />
      </div>

      {/* 4 Emerging Domains Visual Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {EMERGING_TOPICS.map(topic => {
          const isSelected = topic.id === selectedTopicId;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => setSelectedTopicId(topic.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-cyan-950/50 border-cyan-500/60 ring-2 ring-cyan-500/40 shadow-lg"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                  {topic.category.split("&")[0]}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-100 line-clamp-1">{topic.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{topic.subtitle}</p>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Workspace on Selected Emerging Domain */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-6 shadow-xl space-y-6">
        <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                {currentTopic.category}
              </span>
              <StatusBadge status="Architectural Blueprint" variant="cyan" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">{currentTopic.title}</h2>
            <p className="text-xs text-slate-300 mt-1">{currentTopic.subtitle}</p>
          </div>

          <CopyButton text={`Topic: ${currentTopic.title}\nPattern: ${currentTopic.architecturalPattern}`} label="Copy Architectural Pattern" />
        </div>

        {/* Impact & Architectural Pattern */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-rose-400 font-mono uppercase tracking-wider block">
              Threat Landscape & Operational Impact
            </span>
            <p className="text-slate-300 leading-relaxed">{currentTopic.impact}</p>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
            <span className="font-bold text-cyan-300 font-mono uppercase tracking-wider block">
              Target Architectural Pattern
            </span>
            <p className="text-slate-200 leading-relaxed">{currentTopic.architecturalPattern}</p>
          </div>
        </div>

        {/* Operational Risks vs Recommended Safeguards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-amber-400 font-mono uppercase tracking-wider block flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Known Engineering & Operational Risks
            </span>
            <ul className="space-y-1.5 text-slate-300">
              {currentTopic.operationalRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-mono mt-0.5">•</span>
                  <span>{risk}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-emerald-400 font-mono uppercase tracking-wider block flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Recommended Architectural Controls
            </span>
            <ul className="space-y-1.5 text-slate-300">
              {currentTopic.recommendedControls.map((ctrl, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono mt-0.5">•</span>
                  <span>{ctrl}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Emerging Controls Summary */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            Emerging & Innovation Safeguards (Controls)
          </h2>
          <NextLink
            href="/checklist"
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            Open Full Checklist <ArrowRight className="w-3 h-3" />
          </NextLink>
        </div>

        <div className="space-y-3">
          {emgControls.map(c => (
            <div
              key={c.id}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CopyButton text={c.id} label={c.id} />
                  <StatusBadge status={c.priority} variant={c.priority === "P1" ? "rose" : c.priority === "P2" ? "amber" : "indigo"} />
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
