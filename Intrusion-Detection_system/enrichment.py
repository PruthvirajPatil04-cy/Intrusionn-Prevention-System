"""
Alert Enrichment Module:
Provides offline GeoIP, Autonomous System Number (ASN), and Threat Reputation Scoring.
Operates with zero runtime network dependencies.
"""
from __future__ import annotations

import ipaddress
from typing import Any, Dict, Optional, Tuple

# Offline fast CIDR / ASN classification table for prominent internet infrastructures
OFFLINE_ASN_TABLE: list[Tuple[ipaddress.IPv4Network, str, str]] = [
    (ipaddress.IPv4Network("8.8.8.0/24"), "US", "AS15169 Google LLC"),
    (ipaddress.IPv4Network("8.8.4.0/24"), "US", "AS15169 Google LLC"),
    (ipaddress.IPv4Network("1.1.1.0/24"), "AU", "AS13335 Cloudflare, Inc."),
    (ipaddress.IPv4Network("1.0.0.0/24"), "AU", "AS13335 Cloudflare, Inc."),
    (ipaddress.IPv4Network("198.51.100.0/24"), "TEST", "AS64496 Documentation / Sandbox"),
    (ipaddress.IPv4Network("203.0.113.0/24"), "TEST", "AS64497 Documentation / Sandbox"),
    (ipaddress.IPv4Network("192.0.2.0/24"), "TEST", "AS64498 Documentation / Sandbox"),
]


class AlertEnricher:
    """Enriches intrusion alert records with geographic country, ASN, and reputation metrics."""

    def __init__(self, custom_mmdb_path: Optional[str] = None):
        self.custom_mmdb_path = custom_mmdb_path

    def lookup_ip(self, ip_str: str) -> Tuple[str, str]:
        """Resolves country code and ASN description offline without network I/O."""
        if not ip_str:
            return "UNKNOWN", "UNKNOWN"

        try:
            addr = ipaddress.ip_address(ip_str.strip())
            if addr.is_private or addr.is_loopback or addr.is_link_local:
                return "PRIVATE", "RFC1918 Private Network"

            if isinstance(addr, ipaddress.IPv4Address):
                for network, country, asn in OFFLINE_ASN_TABLE:
                    if addr in network:
                        return country, asn

            # Default public internet range
            return "GLOBAL", "Public Autonomous System"
        except ValueError:
            return "INVALID", "Unparseable IP"

    def calculate_reputation_score(self, severity: str, action: str) -> int:
        """
        Calculates threat reputation score between 0 (benign) and 100 (critical risk).
        """
        base_scores = {
            "CRITICAL": 95,
            "HIGH": 75,
            "MEDIUM": 50,
            "LOW": 25,
        }
        score = base_scores.get(severity.upper(), 50)
        if action in ("FIREWALL_BLOCKED", "SIMULATED_BLOCK"):
            score = min(100, score + 5)
        return score

    def enrich(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Annotates alert record with geo_country, geo_asn, and reputation_score."""
        src_ip = event.get("src_ip") or event.get("source_ip") or ""
        country, asn = self.lookup_ip(src_ip)
        severity = event.get("severity", "MEDIUM")
        action = event.get("action", "MONITORED")
        reputation = self.calculate_reputation_score(severity, action)

        event["geo_country"] = country
        event["geo_asn"] = asn
        event["reputation_score"] = reputation
        return event
