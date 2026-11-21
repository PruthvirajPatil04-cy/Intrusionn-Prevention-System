"use client";

import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import {
  SAMPLE_CHART_DATA_MONTHLY,
  SAMPLE_CHART_DATA_ATTACK_DISTRIBUTION,
  SAMPLE_CHART_DATA_ATTACK_COVERAGE
} from "@/data/programData";
import { Activity, ShieldCheck, PieChart as PieIcon, BarChart2 } from "lucide-react";

export function MetricsCharts() {
  const [metricView, setMetricView] = useState<"throughput" | "efficacy">("throughput");

  return (
    <div className="space-y-6">
      {/* Chart 1: Inspection Throughput & Block Rate Monthly Trend */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Telemetry Time-Series
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Live Aggregated 6-Month Trend
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Inspection Throughput vs. Blocked Threat Volume
            </h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setMetricView("throughput")}
              className={`px-2.5 py-1 rounded font-medium transition ${
                metricView === "throughput"
                  ? "bg-cyan-500 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Throughput & Blocks
            </button>
            <button
              type="button"
              onClick={() => setMetricView("efficacy")}
              className={`px-2.5 py-1 rounded font-medium transition ${
                metricView === "efficacy"
                  ? "bg-cyan-500 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              False Positive Ratio (%)
            </button>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {metricView === "throughput" ? (
              <AreaChart data={SAMPLE_CHART_DATA_MONTHLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGbps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBlocks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "12px", color: "#F8FAFC" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area type="monotone" dataKey="inspectedGbps" name="Throughput (Gbps)" stroke="#06B6D4" strokeWidth={2} fillOpacity={1} fill="url(#colorGbps)" />
                <Area type="monotone" dataKey="blockedEventsK" name="Blocked Events (x1000)" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorBlocks)" />
              </AreaChart>
            ) : (
              <AreaChart data={SAMPLE_CHART_DATA_MONTHLY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 0.06]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "12px", color: "#F8FAFC" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area type="monotone" dataKey="falsePositiveRate" name="False Positive Ratio (%)" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorFp)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Grid: Attack Distribution & ATT&CK Matrix Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Threat Classification Distribution */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              Blocked Threat Payload Classification
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Breakdown of top 1.54M blocked threat vectors in the last 30 days.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SAMPLE_CHART_DATA_ATTACK_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {SAMPLE_CHART_DATA_ATTACK_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "12px", color: "#F8FAFC" }}
                  formatter={(value: any) => [`${value}% of total blocks`, "Share"]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  layout="horizontal"
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: MITRE ATT&CK Matrix Coverage */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              MITRE ATT&CK Tactic Prevention Coverage (%)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Empirically validated block efficacy across enterprise attack tactics.
            </p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={SAMPLE_CHART_DATA_ATTACK_COVERAGE}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="#64748B"
                  fontSize={9}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748B" fontSize={11} domain={[70, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "12px", color: "#F8FAFC" }}
                  formatter={(value: any) => [`${value}% Coverage`, "Prevented"]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }} />
                <Bar dataKey="covered" name="Current Coverage (%)" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Target SLA (%)" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
