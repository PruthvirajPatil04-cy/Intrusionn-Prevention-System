"""
Active Prevention Engine for Windows and cross-platform intrusion blocking.
"""
import os
import sys
import ctypes
import subprocess
import threading
import time
from typing import Set, Dict
from logger import logger, log_alert


def is_admin() -> bool:
    """Checks if the script is running with administrative privileges (Windows)."""
    try:
        if os.name == "nt":
            return ctypes.windll.shell32.IsUserAnAdmin() != 0
        return os.getuid() == 0  # type: ignore
    except Exception:
        return False


class Blocker:
    """
    Manages IP blocking through system firewall rules (e.g., Windows Defender Firewall).
    """

    def __init__(self, simulation_mode: bool = False, block_duration: int = 300):
        self.simulation_mode = simulation_mode
        self.block_duration = block_duration
        self.blocked_ips: Set[str] = set()
        self.block_timestamps: Dict[str, float] = {}
        self.lock = threading.Lock()
        self.is_windows = (os.name == "nt")
        self.has_admin = is_admin()

        if not self.has_admin and not self.simulation_mode:
            logger.warning(
                "[!] Not running with Administrator privileges. "
                "Firewall modifications will fail. Automatically falling back to SIMULATION mode."
            )
            self.simulation_mode = True

        # Background thread to unblock expired IPs
        self.cleanup_thread = threading.Thread(target=self._expiration_worker, daemon=True)
        self.cleanup_thread.start()

    def block_ip(self, ip: str, reason: str, severity: str = "HIGH") -> bool:
        """
        Blocks an incoming IP via Windows Firewall or simulates the block.
        """
        with self.lock:
            if ip in self.blocked_ips:
                return False  # Already blocked

            self.blocked_ips.add(ip)
            self.block_timestamps[ip] = time.time()

        action = "SIMULATED_BLOCK" if self.simulation_mode else "FIREWALL_BLOCKED"

        if not self.simulation_mode and self.is_windows:
            success = self._add_windows_firewall_rule(ip)
            if not success:
                action = "BLOCK_FAILED"

        log_alert(
            alert_type="ACTIVE_PREVENTION",
            source_ip=ip,
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
        with self.lock:
            if ip not in self.blocked_ips:
                return False
            self.blocked_ips.remove(ip)
            self.block_timestamps.pop(ip, None)

        if not self.simulation_mode and self.is_windows:
            self._remove_windows_firewall_rule(ip)

        logger.info(f"[+] Unblocked IP: {ip}")
        return True

    def _add_windows_firewall_rule(self, ip: str) -> bool:
        rule_name = f"IPS_BLOCK_{ip}"
        cmd = [
            "netsh", "advfirewall", "firewall", "add", "rule",
            f"name={rule_name}",
            "dir=in",
            "action=block",
            f"remoteip={ip}"
        ]
        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, check=True
            )
            logger.info(f"[+] Windows Firewall rule added: {rule_name}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"[!] Failed to add Windows Firewall rule for {ip}: {e.stderr.strip()}")
            return False

    def _remove_windows_firewall_rule(self, ip: str) -> bool:
        rule_name = f"IPS_BLOCK_{ip}"
        cmd = [
            "netsh", "advfirewall", "firewall", "delete", "rule",
            f"name={rule_name}"
        ]
        try:
            subprocess.run(cmd, capture_output=True, text=True, check=False)
            return True
        except Exception as e:
            logger.error(f"[!] Error deleting firewall rule {rule_name}: {e}")
            return False

    def _expiration_worker(self) -> None:
        """Periodically checks and unblocks IPs whose TTL has expired."""
        while True:
            time.sleep(5)
            now = time.time()
            to_unblock = []

            with self.lock:
                for ip, timestamp in list(self.block_timestamps.items()):
                    if now - timestamp >= self.block_duration:
                        to_unblock.append(ip)

            for ip in to_unblock:
                logger.info(f"[*] Block duration expired for IP: {ip}. Unblocking...")
                self.unblock_ip(ip)

    def cleanup_all(self) -> None:
        """Cleans up all temporary firewall rules created during session."""
        logger.info("[*] Cleaning up all active IPS firewall rules...")
        with self.lock:
            ips = list(self.blocked_ips)
        for ip in ips:
            self.unblock_ip(ip)
