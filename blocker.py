"""
Active Prevention Engine for Windows and cross-platform intrusion blocking.
Hardened against command injection, with strict IP and rule-name allowlists,
and pluggable platform firewall backends (Windows netsh, Linux nftables/iptables, Simulation).
"""
from __future__ import annotations

import ctypes
import ipaddress
import os
import re
import threading
import time
from typing import Dict, List, Optional, Set

from exceptions import (
    InvalidIPAddressError,
    InvalidRuleNameError,
)
from firewall_backends import (
    FirewallBackend,
    SimulationBackend,
    get_firewall_backend,
)
from logger import log_alert, logger

# Strict allowlist: alphanumeric, underscores, hyphens, dots, and spaces up to 64 chars
RULE_NAME_ALLOWLIST_REGEX = re.compile(r"^[A-Za-z0-9_.\- ]{1,64}$")


def is_admin() -> bool:
    """Checks if the script is running with administrative privileges."""
    try:
        if os.name == "nt":
            return bool(ctypes.windll.shell32.IsUserAnAdmin() != 0)
        return os.getuid() == 0  # type: ignore[attr-defined]
    except Exception:
        return False


def validate_ip_address(ip_str: str) -> str:
    """
    Validates that a string is a valid IPv4 or IPv6 address or CIDR network.
    Raises InvalidIPAddressError if invalid. Returns normalized string representation.
    """
    if not ip_str or not isinstance(ip_str, str):
        raise InvalidIPAddressError(f"IP address must be a non-empty string, got {type(ip_str)}")

    cleaned = ip_str.strip()
    try:
        if "/" in cleaned:
            network = ipaddress.ip_network(cleaned, strict=False)
            return str(network)
        addr = ipaddress.ip_address(cleaned)
        return str(addr)
    except ValueError as exc:
        raise InvalidIPAddressError(f"Invalid IP address or CIDR format: '{ip_str}'") from exc


def validate_rule_name(rule_name: str) -> str:
    """
    Validates that a firewall rule name matches safe allowlist pattern.
    Raises InvalidRuleNameError if invalid.
    """
    if not rule_name or not isinstance(rule_name, str):
        raise InvalidRuleNameError("Rule name must be a non-empty string")

    cleaned = rule_name.strip()
    if not RULE_NAME_ALLOWLIST_REGEX.match(cleaned):
        raise InvalidRuleNameError(
            f"Rule name '{rule_name}' contains illegal characters. "
            "Must match ^[A-Za-z0-9_.\\- ]{1,64}$"
        )
    return cleaned


class Blocker:
    """
    Manages IP blocking through pluggable platform firewall rules.
    Eliminates shell injection risks by enforcing argument lists and strict validation.
    """

    def __init__(
        self,
        simulation_mode: bool = False,
        block_duration: int = 300,
        backend: Optional[FirewallBackend] = None
    ):
        self.simulation_mode = simulation_mode
        self.block_duration = block_duration
        self.blocked_ips: Set[str] = set()
        self.block_timestamps: Dict[str, float] = {}
        self.lock = threading.Lock()
        self.has_admin = is_admin()

        if self.simulation_mode:
            self.backend = SimulationBackend()
        elif backend:
            self.backend = backend
        else:
            if not self.has_admin:
                logger.error(
                    "[!] INSUFFICIENT PRIVILEGES: Process is not running as Administrator/root. "
                    "Active firewall modifications are impossible. Automatically falling back to SIMULATION mode."
                )
                self.simulation_mode = True
                self.backend = SimulationBackend()
            else:
                self.backend = get_firewall_backend()

        logger.info(f"[*] Initialized Blocker with backend: {self.backend.name} (Simulation: {self.simulation_mode})")

        # Background thread to unblock expired IPs
        self.cleanup_thread = threading.Thread(target=self._expiration_worker, daemon=True)
        self.cleanup_thread.start()

    def block_ip(self, ip: str, reason: str, severity: str = "HIGH") -> bool:
        """
        Blocks an incoming IP via active firewall backend or simulates the block.
        Strictly validates IP address format before constructing command arguments.
        """
        normalized_ip = validate_ip_address(ip)

        with self.lock:
            if normalized_ip in self.blocked_ips:
                return False  # Already blocked

            self.blocked_ips.add(normalized_ip)
            self.block_timestamps[normalized_ip] = time.time()

        action = "SIMULATED_BLOCK" if self.simulation_mode else "FIREWALL_BLOCKED"
        rule_name = validate_rule_name(f"IPS_BLOCK_{normalized_ip.replace(':', '_').replace('/', '_')}")

        if not self.simulation_mode:
            success = self.backend.add_block(normalized_ip, rule_name)
            if not success:
                action = "BLOCK_FAILED"

        log_alert(
            alert_type="ACTIVE_PREVENTION",
            source_ip=normalized_ip,
            target_ip=None,
            details=f"Reason: {reason} (TTL: {self.block_duration}s)",
            severity=severity,
            action_taken=action
        )
        return True

    def unblock_ip(self, ip: str) -> bool:
        """
        Removes an IP block from firewall rules and internal tracking.
        """
        normalized_ip = validate_ip_address(ip)

        with self.lock:
            if normalized_ip not in self.blocked_ips:
                return False
            self.blocked_ips.remove(normalized_ip)
            self.block_timestamps.pop(normalized_ip, None)

        rule_name = validate_rule_name(f"IPS_BLOCK_{normalized_ip.replace(':', '_').replace('/', '_')}")
        if not self.simulation_mode:
            self.backend.remove_block(normalized_ip, rule_name)

        logger.info(f"[+] Unblocked IP: {normalized_ip}")
        return True

    def _expiration_worker(self) -> None:
        """Periodically checks and unblocks IPs whose TTL has expired."""
        while True:
            time.sleep(5)
            now = time.time()
            to_unblock: List[str] = []

            with self.lock:
                for ip, timestamp in list(self.block_timestamps.items()):
                    if now - timestamp >= self.block_duration:
                        to_unblock.append(ip)

            for ip in to_unblock:
                logger.info(f"[*] Block duration expired for IP: {ip}. Unblocking...")
                try:
                    self.unblock_ip(ip)
                except Exception as e:
                    logger.error(f"[!] Error during TTL expiration unblock for {ip}: {e}")

    def cleanup_all(self) -> None:
        """Cleans up all temporary firewall rules created during session."""
        logger.info("[*] Cleaning up all active IPS firewall rules...")
        with self.lock:
            ips = list(self.blocked_ips)
        for ip in ips:
            try:
                self.unblock_ip(ip)
            except Exception as e:
                logger.error(f"[!] Error during cleanup for {ip}: {e}")
