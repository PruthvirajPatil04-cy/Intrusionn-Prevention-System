"""
Prometheus Metrics Exporter for the Intrusion Prevention System.
Exposes packet throughput, dropped buffers, alert counts, and analysis latency.
"""
from __future__ import annotations

from prometheus_client import (  # type: ignore[import-untyped]
    Counter,
    Gauge,
    Histogram,
    generate_latest,
    start_http_server,
)

from logger import logger

# Counters
PACKETS_PROCESSED = Counter(
    "ips_packets_processed_total",
    "Total number of network packets processed by the IPS engine"
)

PACKETS_DROPPED = Counter(
    "ips_packets_dropped_total",
    "Total number of network packets dropped due to buffer congestion"
)

ALERTS_TOTAL = Counter(
    "ips_alerts_total",
    "Total intrusion detection alerts triggered",
    ["severity", "rule_id", "action"]
)

FIREWALL_BLOCKS_TOTAL = Counter(
    "ips_firewall_blocks_total",
    "Total firewall blocking operations executed",
    ["action", "backend"]
)

# Gauges
ACTIVE_QUARANTINE_IPS = Gauge(
    "ips_active_quarantine_ips",
    "Number of IP addresses currently blocked in quarantine"
)

# Histograms
ANALYSIS_LATENCY = Histogram(
    "ips_analysis_latency_seconds",
    "Latency of packet inspection and signature matching in seconds",
    buckets=[0.0001, 0.0005, 0.001, 0.005, 0.01, 0.05, 0.1, 0.5]
)


def record_packet_processed() -> None:
    PACKETS_PROCESSED.inc()


def record_packet_dropped() -> None:
    PACKETS_DROPPED.inc()


def record_alert(severity: str, rule_id: str, action: str) -> None:
    ALERTS_TOTAL.labels(severity=severity, rule_id=rule_id, action=action).inc()


def record_block_op(action: str, backend: str) -> None:
    FIREWALL_BLOCKS_TOTAL.labels(action=action, backend=backend).inc()


def set_quarantine_count(count: int) -> None:
    ACTIVE_QUARANTINE_IPS.set(count)


def get_metrics_plaintext() -> str:
    """Returns Prometheus format metrics for direct scraping."""
    return generate_latest().decode("utf-8")


def start_prometheus_metrics_server(port: int = 9100) -> bool:
    """Starts Prometheus HTTP metrics server on specified port."""
    try:
        start_http_server(port)
        logger.info(f"[*] Prometheus metrics exporter running on port {port} (http://localhost:{port}/metrics)")
        return True
    except Exception as e:
        logger.error(f"[!] Failed to start Prometheus metrics server on port {port}: {e}")
        return False
