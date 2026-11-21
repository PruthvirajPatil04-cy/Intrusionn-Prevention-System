"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Shield, ArrowRight, CornerDownLeft } from "lucide-react";
import { getSearchIndex } from "@/data/programData";
import { StatusBadge } from "@/components/StatusBadge";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const allItems = getSearchIndex();

  const categories = ["All", "Control", "Architecture Node", "Lifecycle Stage", "SOC & Incident Response", "Compliance Framework", "Zero Trust", "Emerging Considerations"];

  const filteredItems = allItems.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const q = query.toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  }).slice(0, 15);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
      setActiveCategory("All");
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  const handleSelect = (route: string) => {
    onClose();
    router.push(route);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex].route);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3 bg-slate-900/90">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            id="search-modal-title"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search controls, architecture nodes, playbooks, frameworks..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            ESC
          </kbd>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto text-xs no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 divide-y divide-slate-800/50 max-h-[50vh]">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Shield className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
              <p>No matching program blueprints found for &ldquo;{query}&rdquo;.</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for &quot;NIST&quot;, &quot;Perimeter&quot;, &quot;C2&quot;, &quot;Zero Trust&quot;, or &quot;P1&quot;.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.route)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-start justify-between p-3 rounded-lg cursor-pointer transition ${
                    isSelected ? "bg-cyan-950/40 border border-cyan-500/30" : "hover:bg-slate-800/40 border border-transparent"
                  }`}
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-cyan-400 font-mono">
                        {item.category}
                      </span>
                      {item.badge && <StatusBadge status={item.badge} size="sm" />}
                    </div>
                    <div className="text-sm font-medium text-slate-100 flex items-center gap-1.5">
                      {item.title}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <div className="flex items-center text-slate-500 text-xs shrink-0 pt-1">
                    {isSelected ? (
                      <span className="flex items-center text-cyan-400 gap-1 font-mono text-[11px]">
                        Open <CornerDownLeft className="w-3 h-3" />
                      </span>
                    ) : (
                      <ArrowRight className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded">↑</kbd> <kbd className="px-1 py-0.5 bg-slate-800 rounded">↓</kbd> navigate</span>
            <span><kbd className="px-1 py-0.5 bg-slate-800 rounded">↵</kbd> select</span>
          </div>
          <span>Total indexed items: {allItems.length}</span>
        </div>
      </div>
    </div>
  );
}
