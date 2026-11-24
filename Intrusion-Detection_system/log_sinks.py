"""
Pluggable SIEM & Log Export Sinks for the Intrusion Prevention System:
- JSONL (Default local file format)
- Syslog RFC 5424 (Standard enterprise syslog)
- ArcSight CEF (Common Event Format)
- IBM QRadar LEEF (Log Event Extended Format)
"""
from __future__ import annotations

import json
import os
import socket
from abc import ABC, abstractmethod
from typing import Any, List, Optional

from config import LOG_DIR


class LogSink(ABC):
    """Abstract interface for intrusion alert log export sinks."""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def format_event(self, event: dict[str, Any]) -> str:
        pass

    @abstractmethod
    def emit(self, event: dict[str, Any]) -> None:
        pass


class JsonlLogSink(LogSink):
    """Local JSON Lines append sink."""

    def __init__(self, file_path: Optional[str] = None):
        self.file_path = file_path or str(LOG_DIR / "ips_alerts.jsonl")

    @property
    def name(self) -> str:
        return "JsonlLogSink"

    def format_event(self, event: dict[str, Any]) -> str:
        return json.dumps(event)

    def emit(self, event: dict[str, Any]) -> None:
        try:
            with open(self.file_path, "a", encoding="utf-8") as f:
                f.write(self.format_event(event) + "\n")
        except Exception:
            pass


class SyslogRfc5424Sink(LogSink):
    """
    RFC 5424 Structured Syslog formatter.
    Format: <PRI>VERSION TIMESTAMP HOSTNAME APP-NAME PROCID MSGID [SD-ID] MSG
    """

    def __init__(self, app_name: str = "IPS-Engine"):
        self.app_name = app_name
        self.hostname = socket.gethostname() or "ips-host"

    @property
    def name(self) -> str:
        return "SyslogRfc5424Sink"

    def format_event(self, event: dict[str, Any]) -> str:
        # Priority: Facility Local4 (16 * 8 = 128) + Severity (Notice=5, Warning=4, Alert=1)
        sev_str = event.get("severity", "HIGH").upper()
        pri_code = 129 if sev_str == "CRITICAL" else (132 if sev_str == "HIGH" else 133)
        ts = event.get("ts", event.get("timestamp", "-"))
        rule_id = event.get("rule_id", "RULE-UNKNOWN")
        event_id = event.get("event_id", "-")
        src = event.get("src_ip", "-")
        dst = event.get("dst_ip", "-") or "-"
        act = event.get("action", "-")
        details = event.get("details", "")

        sd = f'[ipsMeta@41123 ruleId="{rule_id}" eventId="{event_id}" src="{src}" dst="{dst}" action="{act}"]'
        return f"<{pri_code}>1 {ts} {self.hostname} {self.app_name} - {rule_id} {sd} {details}"

    def emit(self, event: dict[str, Any]) -> None:
        syslog_file = LOG_DIR / "ips_syslog_rfc5424.log"
        try:
            with open(syslog_file, "a", encoding="utf-8") as f:
                f.write(self.format_event(event) + "\n")
        except Exception:
            pass


class CefLogSink(LogSink):
    """
    Micro Focus ArcSight Common Event Format (CEF) formatter.
    Format: CEF:Version|Device Vendor|Device Product|Device Version|Device Event Class ID|Name|Severity|[Extension]
    """

    @property
    def name(self) -> str:
        return "CefLogSink"

    def format_event(self, event: dict[str, Any]) -> str:
        # Map severity to 1-10 scale
        sev_map = {"LOW": 3, "MEDIUM": 5, "HIGH": 8, "CRITICAL": 10}
        cef_sev = sev_map.get(event.get("severity", "HIGH").upper(), 7)

        rule_id = event.get("rule_id", "RULE-UNKNOWN")
        name = event.get("alert_type", "INTRUSION_DETECTED")
        src = event.get("src_ip", "")
        dst = event.get("dst_ip", "") or ""
        act = event.get("action", "")
        details = event.get("details", "").replace("|", "\\|")
        cid = event.get("correlation_id", "")

        ext = f"src={src} act={act} msg={details}"
        if dst:
            ext += f" dst={dst}"
        if cid:
            ext += f" externalId={cid}"

        return f"CEF:0|Cybersecurity|IPS-Engine|1.0|{rule_id}|{name}|{cef_sev}|{ext}"

    def emit(self, event: dict[str, Any]) -> None:
        cef_file = LOG_DIR / "ips_alerts_cef.log"
        try:
            with open(cef_file, "a", encoding="utf-8") as f:
                f.write(self.format_event(event) + "\n")
        except Exception:
            pass


class LeefLogSink(LogSink):
    """
    IBM QRadar Log Event Extended Format (LEEF 2.0) formatter.
    Format: LEEF:2.0|Vendor|Product|Version|EventID|Delimiter|[Attributes]
    """

    @property
    def name(self) -> str:
        return "LeefLogSink"

    def format_event(self, event: dict[str, Any]) -> str:
        rule_id = event.get("rule_id", "RULE-UNKNOWN")
        src = event.get("src_ip", "")
        dst = event.get("dst_ip", "") or ""
        act = event.get("action", "")
        sev = event.get("severity", "HIGH")
        details = event.get("details", "")

        attrs = [
            f"src={src}",
            f"action={act}",
            f"sev={sev}",
            f"desc={details}",
        ]
        if dst:
            attrs.append(f"dst={dst}")

        tab = "\t"
        return f"LEEF:2.0|Cybersecurity|IPS-Engine|1.0|{rule_id}|x09|{tab.join(attrs)}"

    def emit(self, event: dict[str, Any]) -> None:
        leef_file = LOG_DIR / "ips_alerts_leef.log"
        try:
            with open(leef_file, "a", encoding="utf-8") as f:
                f.write(self.format_event(event) + "\n")
        except Exception:
            pass


def get_active_log_sinks() -> List[LogSink]:
    """
    Instantiates active sinks based on LOG_SINKS environment variable (comma-separated).
    Defaults to JsonlLogSink and CefLogSink.
    """
    configured = os.environ.get("LOG_SINKS", "jsonl,cef,syslog,leef").lower()
    sink_names = [s.strip() for s in configured.split(",") if s.strip()]

    sinks: List[LogSink] = []
    if "jsonl" in sink_names:
        sinks.append(JsonlLogSink())
    if "syslog" in sink_names:
        sinks.append(SyslogRfc5424Sink())
    if "cef" in sink_names:
        sinks.append(CefLogSink())
    if "leef" in sink_names:
        sinks.append(LeefLogSink())

    return sinks or [JsonlLogSink()]
