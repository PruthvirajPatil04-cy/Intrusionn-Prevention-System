"use client";

import React from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
  ShieldAlert,
  LayoutDashboard,
  FileCheck2,
  Network,
  RotateCcw,
  ActivitySquare,
  LockKeyhole,
  BarChart3,
  BookmarkCheck,
  Cpu,
  CheckSquare,
  Info,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { PROGRAM_METADATA } from "@/data/programData";

const NAV_GROUPS = [
  {
    title: "Executive & Core",
    items: [
      { name: "Executive Dashboard", href: "/", icon: LayoutDashboard, badge: "Overview" },
      { name: "Program & Governance", href: "/program", icon: FileCheck2 },
    ]
  },
  {
    title: "Engineering & Architecture",
    items: [
      { name: "Defense Architecture", href: "/architecture", icon: Network, badge: "Interactive" },
      { name: "Deployment Lifecycle", href: "/lifecycle", icon: RotateCcw, badge: "5 Stages" },
      { name: "SOC & IR Playbooks", href: "/soc", icon: ActivitySquare },
      { name: "Zero Trust & Identity", href: "/zero-trust", icon: LockKeyhole },
    ]
  },
  {
    title: "Assurance & Controls",
    items: [
      { name: "Program Metrics & Health", href: "/metrics", icon: BarChart3, badge: "KPIs" },
      { name: "Compliance Crosswalk", href: "/frameworks", icon: BookmarkCheck, badge: "NIST/CIS" },
      { name: "Emerging Considerations", href: "/emerging", icon: Cpu },
      { name: "Actionable Checklist", href: "/checklist", icon: CheckSquare, badge: "25 Controls" },
    ]
  },
  {
    title: "System & Governance",
    items: [
      { name: "About & Disclaimer", href: "/about", icon: Info },
    ]
  }
];

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <NextLink href="/" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors">
              IPP Blueprint
            </div>
            <div className="text-[10px] text-cyan-400 font-mono tracking-wider">
              ENTERPRISE v2026.4
            </div>
          </div>
        </NextLink>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="space-y-1">
            <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
              {group.title}
            </div>
            <div className="mt-1 space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <NextLink
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm"
                        : "hover:bg-slate-800/80 text-slate-300 hover:text-slate-100 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-300"
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? "bg-cyan-500/20 text-cyan-300"
                            : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NextLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Program Status Footer Widget */}
      <div className="p-3 m-3 rounded-lg bg-slate-950 border border-slate-800/90 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-slate-400 font-mono">Defensive Stance</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ACTIVE BLOCK
          </span>
        </div>
        <p className="text-[11px] text-slate-400 line-clamp-2">
          Global perimeter, east-west, and cloud transit gateways synchronized.
        </p>
      </div>
    </aside>
  );
}
