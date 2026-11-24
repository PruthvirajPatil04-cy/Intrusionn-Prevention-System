"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckSquare,
  Square,
  Search,
  Filter,
  Download,
  Printer,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { generateChecklist } from "@/data/programData";
import { ChecklistItem, Priority } from "@/data/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CopyButton } from "@/components/CopyButton";
import { ExportPrintButton } from "@/components/ExportPrintButton";
import { useProgramStore } from "@/lib/store";

export function ChecklistManager() {
  const allItems: ChecklistItem[] = useMemo(() => generateChecklist(), []);
  const [mounted, setMounted] = useState<boolean>(false);

  // Zustand persistent store
  const {
    checkedMap,
    toggleItem,
    selectAll,
    clearAll,
    searchQuery,
    setSearchQuery,
    selectedSection,
    setSelectedSection,
    selectedPriority,
    setSelectedPriority,
    selectedFramework,
    setSelectedFramework,
    expandedId,
    setExpandedId,
  } = useProgramStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectAll = () => {
    selectAll(allItems.map((i) => i.id));
  };

  const handleClearAll = () => {
    clearAll();
  };

  // Sections list
  const sections = ["All", ...Array.from(new Set(allItems.map(i => i.section)))];
  const priorities = ["All", "P1", "P2", "P3"];
  const frameworks = ["All", "NIST SP 800-94", "NIST CSF 2.0", "CIS Controls v8", "MITRE ATT&CK"];

  // Filtered Items
  const filteredItems = allItems.filter(item => {
    const matchSection = selectedSection === "All" || item.section === selectedSection;
    const matchPriority = selectedPriority === "All" || item.priority === selectedPriority;
    const matchFramework =
      selectedFramework === "All" ||
      item.frameworks.some(f => f.toLowerCase().includes(selectedFramework.toLowerCase()));

    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.controlId.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.implementationNotes.toLowerCase().includes(q);

    return matchSection && matchPriority && matchFramework && matchQuery;
  });

  // Calculate statistics
  const totalItems = allItems.length;
  const completedItems = Object.values(checkedMap).filter(Boolean).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Export JSON Report
  const handleExportJson = () => {
    const report = {
      program: "Intrusion Prevention Program (IPP) Blueprint",
      exportedAt: new Date().toISOString(),
      statistics: {
        totalControls: totalItems,
        verifiedControls: completedItems,
        compliancePercentage: `${progressPercent}%`,
      },
      items: allItems.map(item => ({
        controlId: item.controlId,
        title: item.title,
        section: item.section,
        priority: item.priority,
        status: checkedMap[item.id] ? "COMPLIANT / VERIFIED" : "PENDING / IN_PROGRESS",
        frameworks: item.frameworks,
        implementationNotes: item.implementationNotes
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ipp-blueprint-controls-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Executive Progress Overview Card */}
      <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Operational Compliance Tracker
              </span>
              <StatusBadge status={`${progressPercent}% Implemented`} variant={progressPercent > 75 ? "emerald" : "cyan"} />
            </div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              Enterprise Intrusion Prevention Control Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Progress is continuously persisted locally in your browser storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            <ExportPrintButton label="Print Assessment" variant="both" onExportJson={handleExportJson} />
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Mark all as verified"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition"
              title="Clear all checks"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Progress Bar & KPI Metrics */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
          <div className="sm:col-span-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">
                Overall Program Implementation ({completedItems} of {totalItems} Controls Verified)
              </span>
              <span className="font-bold text-cyan-400">{progressPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-mono">P1 Critical Controls</div>
            <div className="text-base font-bold text-emerald-400 font-mono">
              {allItems.filter(i => i.priority === "P1" && checkedMap[i.id]).length} /{" "}
              {allItems.filter(i => i.priority === "P1").length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-3 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter controls by ID, title, keyword or notes..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Section Filter */}
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {sections.map(s => (
                <option key={s} value={s}>
                  Section: {s}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {priorities.map(p => (
                <option key={p} value={p}>
                  Priority: {p}
                </option>
              ))}
            </select>

            {/* Framework Filter */}
            <select
              value={selectedFramework}
              onChange={e => setSelectedFramework(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              {frameworks.map(f => (
                <option key={f} value={f}>
                  Framework: {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
          <span>
            Showing <strong className="text-cyan-400">{filteredItems.length}</strong> of{" "}
            {totalItems} total controls
          </span>
          {(selectedSection !== "All" || selectedPriority !== "All" || selectedFramework !== "All" || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSection("All");
                setSelectedPriority("All");
                setSelectedFramework("All");
                setSearchQuery("");
              }}
              className="text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Controls Interactive List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-slate-400 text-sm">
            <CheckSquare className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p>No controls match your active filter criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting your search query or selecting &quot;All&quot; in filters.</p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isChecked = mounted && !!checkedMap[item.id];
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-xl border transition-all ${
                  isChecked
                    ? "bg-slate-900/40 border-slate-800/80"
                    : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Header Row */}
                <div className="p-3.5 sm:p-4 flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    aria-label={`Mark ${item.controlId} as ${isChecked ? "unverified" : "verified"}`}
                    className="mt-0.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded"
                  >
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <CopyButton text={item.controlId} label={item.controlId} />
                      <StatusBadge status={item.priority} variant={item.priority === "P1" ? "rose" : item.priority === "P2" ? "amber" : "indigo"} />
                      <span className="text-[11px] font-mono text-slate-400">{item.section}</span>
                    </div>

                    <div
                      className={`text-sm font-semibold transition-colors cursor-pointer ${
                        isChecked ? "text-slate-400 line-through" : "text-slate-100"
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      {item.title}
                    </div>

                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Framework Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {item.frameworks.map((fw, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                        >
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Expand / Collapse Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    aria-label={isExpanded ? "Collapse notes" : "Expand notes"}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 shrink-0"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Collapsible Details Drawer */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 bg-slate-950/40 rounded-b-xl text-xs space-y-2">
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="font-bold text-cyan-400 font-mono uppercase tracking-wider block mb-1">
                        Technical Implementation Guidance:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {item.implementationNotes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
