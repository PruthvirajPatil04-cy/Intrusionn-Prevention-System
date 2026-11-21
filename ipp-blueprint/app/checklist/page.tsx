"use client";

import React from "react";
import { CheckSquare } from "lucide-react";
import { ChecklistManager } from "@/components/ChecklistManager";
import { StatusBadge } from "@/components/StatusBadge";
import { ExportPrintButton } from "@/components/ExportPrintButton";

export default function ChecklistPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Assurance & Assessment Matrix
            </span>
            <StatusBadge status="Interactive Tracker" variant="emerald" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            Actionable Program Controls Checklist
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Derived directly from all 25+ blueprint controls across Governance, Architecture, Lifecycle, SOC, Zero Trust, Metrics, and Emerging Domains. Your verification progress is persisted locally.
          </p>
        </div>
      </div>

      {/* Main Interactive Checklist Component */}
      <ChecklistManager />
    </div>
  );
}
