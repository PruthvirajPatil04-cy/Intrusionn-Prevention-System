"use client";

import React from "react";
import { Printer, Download } from "lucide-react";

interface ExportPrintButtonProps {
  label?: string;
  variant?: "print" | "download" | "both";
  onExportJson?: () => void;
  className?: string;
}

export function ExportPrintButton({
  label = "Export / Print",
  variant = "print",
  onExportJson,
  className = ""
}: ExportPrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {(variant === "print" || variant === "both") && (
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-300 border border-slate-700 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          title="Open printer dialog or save as PDF"
        >
          <Printer className="w-3.5 h-3.5 text-cyan-400" />
          <span>{label}</span>
        </button>
      )}

      {(variant === "download" || variant === "both") && onExportJson && (
        <button
          type="button"
          onClick={onExportJson}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/80 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          title="Download data as JSON"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400" />
          <span>Export JSON</span>
        </button>
      )}
    </div>
  );
}
