"use client";

import React from "react";
import NextLink from "next/link";
import {
  Info,
  ShieldAlert,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Scale
} from "lucide-react";
import { PROGRAM_METADATA } from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";
import { ExportPrintButton } from "@/components/ExportPrintButton";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Governance & Disclaimer
            </span>
            <StatusBadge status="Planning Blueprint" variant="slate" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Info className="w-6 h-6 text-cyan-400" />
            About This Blueprint & Operating Assumptions
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Architectural scope, design assumptions, regulatory framing, and legal compliance disclaimers.
          </p>
        </div>
        <ExportPrintButton label="Print Charter" variant="print" className="no-print" />
      </div>

      {/* Blueprint Scope & Metadata Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Architectural Scope & Operating Boundaries
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Program Name:</span>
            <span className="text-slate-100 font-bold">{PROGRAM_METADATA.name}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Target Architecture:</span>
            <span className="text-cyan-400 font-bold">{PROGRAM_METADATA.scope}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Release Version:</span>
            <span className="text-indigo-400 font-bold">{PROGRAM_METADATA.version}</span>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Document Date:</span>
            <span className="text-emerald-400 font-bold">{PROGRAM_METADATA.updatedAt}</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed pt-2">
          This blueprint serves as a comprehensive, referenceable operating model for organizations deploying inline intrusion prevention capabilities. It assumes a hybrid infrastructure consisting of physical enterprise campuses, carrier-grade data centers, and multi-cloud virtual network enclaves (AWS Transit Gateways, Azure vWAN, GCP Shared VPCs).
        </p>
      </div>

      {/* Architectural Assumptions */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-6 space-y-4 shadow-lg">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          Core Engineering Assumptions
        </h2>

        <ul className="space-y-2.5 text-xs text-slate-300">
          <li className="flex items-start gap-2.5">
            <span className="text-amber-400 font-mono font-bold mt-0.5">•</span>
            <span>
              <strong>Hardware Bypass Switches:</strong> Physical perimeter and data center inline sensors are deployed with external fail-open optical bypass switches to prevent network blackouts in case of hardware or power failures.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-amber-400 font-mono font-bold mt-0.5">•</span>
            <span>
              <strong>Synchronized Identity Source:</strong> The enterprise maintains a centralized, authoritative Identity Provider (e.g., Okta, Microsoft Entra ID) with user-ID mapping agents syncing logon sessions with firewall connection tables.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-amber-400 font-mono font-bold mt-0.5">•</span>
            <span>
              <strong>Centralized SIEM/SOAR:</strong> The SOC operates an enterprise security data lake (Splunk, Microsoft Sentinel, or Google SecOps) capable of ingesting high-throughput normalized CEF syslog telemetry without dropping events.
            </span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-amber-400 font-mono font-bold mt-0.5">•</span>
            <span>
              <strong>Pre-Production Canary Sensors:</strong> The organization maintains an isolated pre-production network to test vendor signature updates and custom Snort/Suricata rules prior to global production rollout.
            </span>
          </li>
        </ul>
      </div>

      {/* Regulatory & Legal Compliance Disclaimer */}
      <div className="rounded-xl border border-rose-500/30 bg-slate-900/90 p-6 space-y-3 shadow-lg">
        <div className="flex items-center gap-2 text-rose-400 text-sm font-bold font-mono uppercase tracking-wider">
          <Scale className="w-4 h-4" />
          Legal & Compliance Advisory Notice
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The Intrusion Prevention Program (IPP) Blueprint is provided strictly as an educational and technical planning architecture framework. It does not constitute formal legal, regulatory, or certified audit advice. While controls are mapped to industry standards including NIST SP 800-94, NIST CSF 2.0, CIS Controls v8, and MITRE ATT&CK, implementation within specific regulated environments (such as PCI-DSS, HIPAA, GLBA, or FedRAMP) requires formal review by your organization&apos;s legal counsel and certified Qualified Security Assessors (QSA).
        </p>
      </div>
    </div>
  );
}
