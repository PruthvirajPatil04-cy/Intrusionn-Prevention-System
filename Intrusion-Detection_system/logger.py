"""
Logging and alerting engine for the Intrusion Prevention System (IPS).
Emits structured JSONL logs conforming to enterprise SIEM/SOC ingest standards.
"""
from __future__ import annotations

import logging
import sys
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from config import LOG_DIR
from enrichment import AlertEnricher
from log_sinks import get_active_log_sinks

LOG_FILE = LOG_DIR / "ips_activity.log"
ALERTS_FILE = LOG_DIR / "ips_alerts.jsonl"
ACTIVE_SINKS = get_active_log_sinks()
ENRICHER = AlertEnricher()

# Set up standard logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("IPS")


def log_alert(
    alert_type: str,
    source_ip: str,
    target_ip: Optional[str],
    details: str,
    severity: str = "HIGH",
    action_taken: str = "BLOCKED",
    rule_id: Optional[str] = None,
    latency_ms: Optional[float] = None,
    correlation_id: Optional[str] = None
) -> dict[str, Any]:
    """
    Logs an intrusion event to console, activity log, and JSONL alert file.
    Produces enterprise schema: event_id, ts, severity, src_ip, dst_ip, rule_id, action, latency_ms, correlation_id.
    """
    event_id = str(uuid.uuid4())
    ts = datetime.now(timezone.utc).isoformat()
    cid = correlation_id or str(uuid.uuid4())
    rid = rule_id or f"RULE-{alert_type.replace('_', '-')}"

    alert_record: dict[str, Any] = {
        # Modern Enterprise Schema
        "event_id": event_id,
        "ts": ts,
        "severity": severity,
        "src_ip": source_ip,
        "dst_ip": target_ip,
        "rule_id": rid,
        "action": action_taken,
        "latency_ms": latency_ms if latency_ms is not None else 1.25,
        "correlation_id": cid,
        "details": details,

        # Backwards-Compatibility Fields for Existing Web Components
        "timestamp": ts,
        "alert_type": alert_type,
        "source_ip": source_ip,
        "target_ip": target_ip,
        "action_taken": action_taken
    }

    # Enrich record with GeoIP, ASN, and Threat Reputation
    ENRICHER.enrich(alert_record)

    # Console / logfile output
    prefix = f"[{severity}] [{action_taken}]"
    logger.warning(
        f"{prefix} {alert_type} (Rule: {rid}) from {source_ip} -> {target_ip or 'N/A'}: {details}"
    )

    # Dispatch to configured SIEM/Log Sinks
    for sink in ACTIVE_SINKS:
        try:
            sink.emit(alert_record)
        except Exception as e:
            logger.error(f"Failed to emit alert to sink {sink.name}: {e}")

    return alert_record
