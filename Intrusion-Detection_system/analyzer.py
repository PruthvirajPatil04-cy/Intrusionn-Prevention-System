"""
Detection & Analysis Engine for identifying intrusions and anomalies.
Hardened with safe regular expression compilation and ReDoS timeout protections.
"""
from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Any, Dict, List, Optional

try:
    import regex as re_engine  # type: ignore[import-untyped]
    HAS_REGEX_MODULE = True
except ImportError:
    import re as re_engine  # Fallback to standard re if regex module not present
    HAS_REGEX_MODULE = False

from blocker import Blocker
from logger import log_alert, logger
from tls_inspector import parse_tls_client_hello

REDOS_TIMEOUT_SECONDS = 0.05  # 50ms match timeout budget


class IntrusionAnalyzer:
    """
    Analyzes network packets against signature and anomaly rules.
    Guards against ReDoS by enforcing bounded per-pattern evaluation.
    """

    def __init__(self, rules: Dict[str, Any], blocker: Blocker):
        self.rules = rules
        self.blocker = blocker
        self.whitelist = set(rules.get("general", {}).get("whitelist", []))
        self.blacklisted_ips = set(rules.get("blacklisted_ips", []))
        self.sensitive_ports = set(rules.get("sensitive_ports", []))

        # Compiled payload regex signatures
        self.payload_signatures: List[Dict[str, Any]] = []
        for sig in rules.get("payload_signatures", []):
            pattern = sig.get("pattern")
            name = sig.get("name", "Unknown Pattern")
            if not pattern:
                logger.warning(f"[!] Skipping empty payload signature: {name}")
                continue

            try:
                # Compile regex at startup
                compiled = re_engine.compile(pattern)
                self.payload_signatures.append({
                    "name": name,
                    "pattern": pattern,
                    "compiled": compiled
                })
            except Exception as e:
                logger.error(f"[!] FAILED TO COMPILE SIGNATURE '{name}' pattern='{pattern}': {e}")
                raise ValueError(f"Invalid regex signature '{name}': {e}") from e

        # Rate limiting state trackers:
        self.port_scan_tracker: Dict[str, deque] = defaultdict(deque)
        self.syn_flood_tracker: Dict[str, deque] = defaultdict(deque)
        self.icmp_flood_tracker: Dict[str, deque] = defaultdict(deque)

        # Rate limit configs
        rate_limits = rules.get("rate_limits", {})
        self.ps_threshold = rate_limits.get("port_scan", {}).get("threshold_ports", 15)
        self.ps_window = rate_limits.get("port_scan", {}).get("time_window_seconds", 5)

        self.syn_threshold = rate_limits.get("syn_flood", {}).get("threshold_packets", 30)
        self.syn_window = rate_limits.get("syn_flood", {}).get("time_window_seconds", 3)

        self.icmp_threshold = rate_limits.get("icmp_flood", {}).get("threshold_packets", 25)
        self.icmp_window = rate_limits.get("icmp_flood", {}).get("time_window_seconds", 2)

    def is_whitelisted(self, ip: str) -> bool:
        return ip in self.whitelist

    def inspect_packet(
        self,
        src_ip: str,
        dst_ip: str,
        protocol: str,
        src_port: Optional[int] = None,
        dst_port: Optional[int] = None,
        tcp_flags: Optional[str] = None,
        payload_bytes: Optional[bytes] = None
    ) -> None:
        """
        Runs comprehensive checks on a parsed packet.
        """
        if self.is_whitelisted(src_ip):
            return

        now = time.time()

        # 1. Check Blacklist
        if src_ip in self.blacklisted_ips:
            self.blocker.block_ip(src_ip, "Known malicious IP in blacklist", severity="CRITICAL")
            return

        # 2. Check Port Scan (Multiple destination ports contacted within time window)
        if dst_port is not None:
            q = self.port_scan_tracker[src_ip]
            q.append((now, dst_port))
            # Evict entries outside the time window
            while q and (now - q[0][0] > self.ps_window):
                q.popleft()

            unique_ports = {port for _, port in q}
            if len(unique_ports) >= self.ps_threshold:
                reason = f"Port scanning detected ({len(unique_ports)} ports targeted in {self.ps_window}s)"
                self.blocker.block_ip(src_ip, reason, severity="HIGH")
                return

        # 3. Check SYN Flood (TCP SYN packets without ACK)
        if protocol == "TCP" and tcp_flags:
            if "S" in tcp_flags and "A" not in tcp_flags:
                q = self.syn_flood_tracker[src_ip]
                q.append(now)
                while q and (now - q[0] > self.syn_window):
                    q.popleft()

                if len(q) >= self.syn_threshold:
                    reason = f"TCP SYN flood detected ({len(q)} SYN packets in {self.syn_window}s)"
                    self.blocker.block_ip(src_ip, reason, severity="CRITICAL")
                    return

        # 4. Check ICMP / Ping Flood
        if protocol == "ICMP":
            q = self.icmp_flood_tracker[src_ip]
            q.append(now)
            while q and (now - q[0] > self.icmp_window):
                q.popleft()

            if len(q) >= self.icmp_threshold:
                reason = f"ICMP Ping flood detected ({len(q)} packets in {self.icmp_window}s)"
                self.blocker.block_ip(src_ip, reason, severity="HIGH")
                return

        # 5. Check Sensitive Port Probing
        if dst_port in self.sensitive_ports:
            log_alert(
                alert_type="SENSITIVE_PORT_PROBE",
                source_ip=src_ip,
                target_ip=dst_ip,
                details=f"Targeted sensitive port {dst_port}",
                severity="MEDIUM",
                action_taken="MONITORED"
            )

        # 6. Deep Packet Inspection (DPI) with ReDoS protection & TLS Inspection
        if payload_bytes:
            self._inspect_payload(src_ip, payload_bytes)

    def _inspect_payload(self, src_ip: str, payload_bytes: bytes) -> None:
        """Inspects payload bytes against signatures with ReDoS timeout bounds and TLS heuristics."""
        # 6a. Check for TLS ClientHello Handshake (0x16 = Handshake, 0x01 = ClientHello)
        if len(payload_bytes) > 5 and payload_bytes[0] == 0x16:
            try:
                tls_info = parse_tls_client_hello(payload_bytes)
                if tls_info:
                    is_c2, mal_name = tls_info.is_malicious_ja3()
                    if is_c2:
                        reason = f"Malicious C2 TLS Fingerprint matched: '{mal_name}' (JA3: {tls_info.ja3_hash})"
                        self.blocker.block_ip(src_ip, reason, severity="CRITICAL")
                        return

                    if tls_info.has_suspicious_sni():
                        reason = f"Suspicious TLS SNI destination: '{tls_info.sni}' (JA4: {tls_info.ja4_fingerprint})"
                        self.blocker.block_ip(src_ip, reason, severity="HIGH")
                        return

                    logger.debug(
                        f"TLS ClientHello observed: SNI={tls_info.sni or 'None'}, "
                        f"JA3={tls_info.ja3_hash}, JA4={tls_info.ja4_fingerprint}"
                    )
            except Exception as e:
                logger.debug(f"TLS parsing error on {src_ip}: {e}")

        # 6b. Plaintext / Application Layer Pattern Inspection
        try:
            payload_str = payload_bytes.decode("utf-8", errors="ignore")
        except Exception:
            return

        for sig in self.payload_signatures:
            try:
                matched = False
                compiled = sig["compiled"]

                if HAS_REGEX_MODULE:
                    # Use timeout parameter provided by regex module
                    try:
                        match_result = compiled.search(payload_str, timeout=REDOS_TIMEOUT_SECONDS)
                        matched = bool(match_result)
                    except TimeoutError:
                        logger.warning(
                            f"[!] ReDoS TIMEOUT GUARD TRIGGERED on signature '{sig['name']}' "
                            f"for IP {src_ip} (> {REDOS_TIMEOUT_SECONDS}s)"
                        )
                        continue
                else:
                    matched = bool(compiled.search(payload_str))

                if matched:
                    reason = f"Malicious payload signature matched: '{sig['name']}'"
                    self.blocker.block_ip(src_ip, reason, severity="CRITICAL")
                    return
            except Exception as e:
                logger.error(f"[!] Error inspecting payload against {sig['name']}: {e}")
