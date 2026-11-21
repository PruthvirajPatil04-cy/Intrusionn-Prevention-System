"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export function CopyButton({ text, label, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label || `Copy ${text} to clipboard`}
      title={label || `Copy ${text}`}
      className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-mono rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700/80 transition-all focus:outline-none focus:ring-1 focus:ring-cyan-400 ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-sans text-[11px]">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-sans text-[11px]">{label || text}</span>
        </>
      )}
    </button>
  );
}
