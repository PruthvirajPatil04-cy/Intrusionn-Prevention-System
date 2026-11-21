import React from "react";

interface StatusBadgeProps {
  status: string;
  variant?: "cyan" | "emerald" | "amber" | "rose" | "indigo" | "slate" | "auto";
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, variant = "auto", size = "sm", className = "" }: StatusBadgeProps) {
  let resolvedVariant = variant;

  if (variant === "auto") {
    const s = status.toLowerCase();
    if (s.includes("p1") || s.includes("critical") || s.includes("alert") || s.includes("fail")) {
      resolvedVariant = "rose";
    } else if (s.includes("p2") || s.includes("high") || s.includes("warning") || s.includes("optimize")) {
      resolvedVariant = "amber";
    } else if (s.includes("optimal") || s.includes("full") || s.includes("pass") || s.includes("verified") || s.includes("inline block")) {
      resolvedVariant = "emerald";
    } else if (s.includes("p3") || s.includes("medium") || s.includes("hybrid") || s.includes("scope")) {
      resolvedVariant = "indigo";
    } else if (s.includes("protect") || s.includes("discover") || s.includes("perimeter")) {
      resolvedVariant = "cyan";
    } else {
      resolvedVariant = "slate";
    }
  }

  const colorStyles: Record<string, string> = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    slate: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  };

  const sizeStyles = size === "sm" ? "px-2 py-0.5 text-xs font-medium" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border ${colorStyles[resolvedVariant] || colorStyles.slate} ${sizeStyles} ${className}`}
    >
      {status}
    </span>
  );
}
