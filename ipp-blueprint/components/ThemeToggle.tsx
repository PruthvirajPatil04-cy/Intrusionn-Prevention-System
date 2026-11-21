"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-slate-800/50 border border-slate-700/50 animate-pulse" />
    );
  }

  const isDark = theme === "dark" || (!theme && true);

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle dark/light mode"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 border border-slate-700 transition focus:outline-none focus:ring-2 focus:ring-cyan-500"
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
    </button>
  );
}
