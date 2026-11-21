"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
  Menu,
  X,
  Search,
  Shield,
  Layers,
  FileCheck,
  CheckSquare
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalSearchModal } from "@/components/GlobalSearchModal";
import { Sidebar } from "@/components/Sidebar";

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Executive Dashboard", subtitle: "Strategic Program Overview & Key Performance Indicators" },
  "/program": { title: "Program & Governance", subtitle: "Strategic Objectives, Guiding Principles & Exception Governance" },
  "/architecture": { title: "Defense-in-Depth Architecture", subtitle: "Interactive Sensor Placement & Layered Chokepoints" },
  "/lifecycle": { title: "Deployment Lifecycle", subtitle: "5-Stage Methodology: Scope → Discover → Protect → Optimize → Maintain" },
  "/soc": { title: "SOC & Incident Response Integration", subtitle: "SIEM/SOAR Pipelines, Detection Engineering & Containment" },
  "/zero-trust": { title: "Zero Trust & Identity-Aware Prevention", subtitle: "Dynamic Identity Enforcement & Continuous Session Verification" },
  "/metrics": { title: "Program Metrics & Assurance", subtitle: "Coverage, Efficacy, Hardware Health & Continuous Audit" },
  "/frameworks": { title: "Compliance & Industry Frameworks", subtitle: "Crosswalk Mapping to NIST SP 800-94, NIST CSF 2.0, CIS & MITRE ATT&CK" },
  "/emerging": { title: "Emerging Considerations", subtitle: "TLS 1.3 Inspection, AI/ML Detection, API Gateways & GitOps IaC" },
  "/checklist": { title: "Actionable Controls Checklist", subtitle: "25+ Program Safeguards with Local Storage Progress Tracking" },
  "/about": { title: "About This Blueprint", subtitle: "Architecture Assumptions, Operating Boundaries & Legal Disclaimers" },
};

export function Navbar() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const currentRoute = ROUTE_TITLES[pathname] || {
    title: "Intrusion Prevention Program",
    subtitle: "Enterprise Defense Architecture"
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
        {/* Left: Mobile Menu Trigger & Route Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle mobile menu"
            className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
              <span>{currentRoute.title}</span>
            </h1>
            <p className="hidden sm:block text-[11px] text-slate-400">
              {currentRoute.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Quick Search Button & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Trigger */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Open search dialog"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-400 hover:text-slate-200 text-xs transition group focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Search program...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-700 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Quick Header Links */}
          <div className="hidden lg:flex items-center gap-1 border-l border-slate-800 pl-3">
            <NextLink
              href="/architecture"
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
              title="Architecture Diagram"
            >
              <Layers className="w-4 h-4" />
            </NextLink>
            <NextLink
              href="/frameworks"
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
              title="Compliance Frameworks"
            >
              <FileCheck className="w-4 h-4" />
            </NextLink>
            <NextLink
              href="/checklist"
              className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
              title="Controls Checklist"
            >
              <CheckSquare className="w-4 h-4" />
            </NextLink>
          </div>

          {/* Theme Switcher */}
          <div className="border-l border-slate-800 pl-2 sm:pl-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Global Search Dialog */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 h-full bg-slate-900 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
