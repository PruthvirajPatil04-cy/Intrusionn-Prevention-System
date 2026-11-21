"use client";

import React, { useEffect, useState } from "react";
import { Terminal, ShieldAlert, CheckCircle, RefreshCw, AlertTriangle, Radio, Zap } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

interface AlertRecord {
  timestamp: string;
  severity: string;
  alert_type: string;
  source_ip: string;
  target_ip: string | null;
  details: string;
  action_taken: string;
}

export function LiveEngineStatus() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/ips");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to fetch IPS engine status", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateAttack = async () => {
    try {
      setSimulating(true);
      setFeedback("Simulating SQL Injection, Port Scan, and ICMP Flood attacks...");
      const res = await fetch("/api/ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate" }),
      });
      if (res.ok) {
        setFeedback("Simulated attacks successfully captured and blocked by Python IPS engine!");
        await fetchStatus();
      } else {
        setFeedback("Failed to trigger simulation.");
      }
    } catch (e) {
      setFeedback("Error executing simulation.");
    } finally {
      setSimulating(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wide">
                Live Python IPS Engine Telemetry
              </h3>
              <StatusBadge status="Engine Connected" variant="emerald" size="sm" />
            </div>
            <p className="text-[11px] text-slate-400">
              Synchronized with <code className="text-cyan-300">Intrusion-Detection_system/rules.json</code> and <code className="text-cyan-300">logs/ips_alerts.jsonl</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSimulateAttack}
            disabled={simulating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 transition disabled:opacity-50"
          >
            <Zap className={`w-3.5 h-3.5 ${simulating ? "animate-bounce text-amber-400" : "text-rose-400"}`} />
            {simulating ? "Attacking Engine..." : "Simulate Attack Traffic"}
          </button>

          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-2.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Engine Metrics & Config */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">Prevention Mode</span>
          <span className="text-emerald-400 font-bold">
            {data?.rules?.general?.simulation_mode ? "SIMULATION" : "ACTIVE BLOCK (Windows Firewall)"}
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">Quarantine TTL</span>
          <span className="text-cyan-400 font-bold">
            {data?.rules?.general?.block_duration_seconds || 300} seconds
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">Port Scan Threshold</span>
          <span className="text-indigo-400 font-bold">
            {data?.rules?.rate_limits?.port_scan?.threshold_ports || 15} ports / {data?.rules?.rate_limits?.port_scan?.time_window_seconds || 5}s
          </span>
        </div>

        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
          <span className="text-slate-400 text-[10px] block">Recorded Threat Events</span>
          <span className="text-amber-400 font-bold">
            {data?.recentAlertsCount ?? 0} Recorded
          </span>
        </div>
      </div>

      {/* Real Alert Log Stream */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block">
          Recent Engine Intrusion Alerts & Quarantine Drops:
        </span>

        {data?.alerts && data.alerts.length > 0 ? (
          <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-800/60 font-mono text-xs">
            {data.alerts.slice(0, 6).map((al: AlertRecord, idx: number) => (
              <div key={idx} className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <StatusBadge status={al.action_taken} variant="auto" size="sm" />
                  <span className="text-rose-400 font-bold">{al.source_ip}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-slate-300">{al.target_ip || "Any"}</span>
                  <span className="text-slate-400">({al.alert_type})</span>
                </div>
                <div className="text-slate-400 truncate max-w-sm">
                  {al.details}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-slate-500 text-xs font-mono">
            No live threat events recorded yet. Click <code className="text-cyan-400">Simulate Attack Traffic</code> above to test the engine!
          </div>
        )}
      </div>
    </div>
  );
}
