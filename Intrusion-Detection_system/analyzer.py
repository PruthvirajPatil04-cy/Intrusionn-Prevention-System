"""
Detection & Analysis Engine for identifying intrusions and anomalies.
"""
import re
import time
from collections import defaultdict, deque
from typing import Dict, Any, Optional, Tuple, Set
from blocker import Blocker
from logger import logger, log_alert


class IntrusionAnalyzer:
    """
    Analyzes network packets against signature and anomaly rules.
    """

    def __init__(self, rules: Dict[str, Any], blocker: Blocker):
        self.rules = rules
        self.blocker = blocker
        self.whitelist = set(rules.get("general", {}).get("whitelist", []))
        self.blacklisted_ips = set(rules.get("blacklisted_ips", []))
        self.sensitive_ports = set(rules.get("sensitive_ports", []))

        # Compiled payload regex signatures
        self.payload_signatures = []
        for sig in rules.get("payload_signatures", []):
            try:
                self.payload_signatures.append({
                    "name": sig.get("name", "Unknown Pattern"),
                    "compiled": re.compile(sig["pattern"])
                })
            except Exception as e:
                logger.error(f"Invalid regex signature {sig}: {e}")

        # Rate limiting state trackers:
        # IP -> deque of (timestamp, dst_port)
        self.port_scan_tracker: Dict[str, deque] = defaultdict(deque)
        # IP -> deque of timestamps
        self.syn_flood_tracker: Dict[str, deque] = defaultdict(deque)
        # IP -> deque of timestamps
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
            # Check for pure SYN packet (flags 'S' or flag 0x02)
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
            # Just log high-visibility warning or block if repeated
            log_alert(
                alert_type="SENSITIVE_PORT_PROBE",
                source_ip=src_ip,
                target_ip=dst_ip,
                details=f"Targeted sensitive port {dst_port}",
                severity="MEDIUM",
                action_taken="MONITORED"
            )

        # 6. Deep Packet Inspection (DPI) for malicious payload patterns
        if payload_bytes:
            try:
                payload_str = payload_bytes.decode("utf-8", errors="ignore")
                for sig in self.payload_signatures:
                    if sig["compiled"].search(payload_str):
                        reason = f"Malicious payload signature matched: '{sig['name']}'"
                        self.blocker.block_ip(src_ip, reason, severity="CRITICAL")
                        return
            except Exception:
                pass
