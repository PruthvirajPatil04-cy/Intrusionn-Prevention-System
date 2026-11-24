"""
Firewall abstraction layer supporting cross-platform active intrusion blocking:
- Windows Defender Firewall (via netsh)
- Linux nftables / iptables
- Simulation / Mock backend
"""
from __future__ import annotations

import os
import subprocess
import sys
from abc import ABC, abstractmethod
from typing import List, Optional

from logger import logger

SUBPROCESS_TIMEOUT = 10.0


class FirewallBackend(ABC):
    """Abstract base class for platform-specific firewall enforcement engines."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the firewall backend."""
        pass

    @abstractmethod
    def is_supported(self) -> bool:
        """Returns True if the backend is executable on the current host system."""
        pass

    @abstractmethod
    def add_block(self, ip: str, rule_name: str) -> bool:
        """Adds an active blocking rule for the specified remote IP."""
        pass

    @abstractmethod
    def remove_block(self, ip: str, rule_name: str) -> bool:
        """Removes the active blocking rule for the specified remote IP."""
        pass

    @abstractmethod
    def list_blocks(self) -> List[str]:
        """Lists active blocked remote IPs managed by this firewall backend."""
        pass


class WindowsNetshBackend(FirewallBackend):
    """Windows Defender Firewall backend using netsh advfirewall."""

    @property
    def name(self) -> str:
        return "WindowsNetshBackend"

    def is_supported(self) -> bool:
        return os.name == "nt"

    def add_block(self, ip: str, rule_name: str) -> bool:
        cmd = [
            "netsh", "advfirewall", "firewall", "add", "rule",
            f"name={rule_name}",
            "dir=in",
            "action=block",
            f"remoteip={ip}"
        ]
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=SUBPROCESS_TIMEOUT, shell=False)
            logger.info(f"[+] [WindowsNetsh] Added firewall block: {rule_name} -> {ip}")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"[!] [WindowsNetsh] Error adding rule for {ip}: {e.stderr.strip()}")
            return False
        except Exception as e:
            logger.error(f"[!] [WindowsNetsh] Unexpected failure: {e}")
            return False

    def remove_block(self, ip: str, rule_name: str) -> bool:
        cmd = [
            "netsh", "advfirewall", "firewall", "delete", "rule",
            f"name={rule_name}"
        ]
        try:
            subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=SUBPROCESS_TIMEOUT, shell=False)
            logger.info(f"[+] [WindowsNetsh] Removed firewall block: {rule_name}")
            return True
        except Exception as e:
            logger.error(f"[!] [WindowsNetsh] Error removing rule {rule_name}: {e}")
            return False

    def list_blocks(self) -> List[str]:
        cmd = ["netsh", "advfirewall", "firewall", "show", "rule", "name=all"]
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=SUBPROCESS_TIMEOUT, check=False)
            # Find rules with IPS_BLOCK_
            blocks = []
            for line in res.stdout.splitlines():
                if "IPS_BLOCK_" in line:
                    parts = line.split(":")
                    if len(parts) > 1:
                        blocks.append(parts[1].strip())
            return blocks
        except Exception:
            return []


class LinuxNftablesBackend(FirewallBackend):
    """
    Linux firewall backend utilizing nftables (or fallback to iptables).
    Requires CAP_NET_ADMIN privileges on Linux host or container.
    """

    def __init__(self, use_iptables_fallback: bool = False):
        self.use_iptables_fallback = use_iptables_fallback
        self.table_name = "inet ips_filter"
        self.chain_name = "ips_input"

    @property
    def name(self) -> str:
        return "LinuxNftablesBackend" if not self.use_iptables_fallback else "LinuxIptablesBackend"

    def is_supported(self) -> bool:
        return sys.platform.startswith("linux")

    def add_block(self, ip: str, rule_name: str) -> bool:
        if self.use_iptables_fallback:
            cmd = ["iptables", "-I", "INPUT", "-s", ip, "-j", "DROP", "-m", "comment", "--comment", rule_name]
        else:
            # nftables command
            cmd = ["nft", "add", "rule", "inet", "filter", "input", "ip", "saddr", ip, "drop", "comment", rule_name]

        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=SUBPROCESS_TIMEOUT, shell=False)
            logger.info(f"[+] [LinuxFirewall] Blocked IP {ip} via {self.name} ({rule_name})")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"[!] [LinuxFirewall] Error blocking {ip}: {e.stderr.strip()}")
            return False
        except Exception as e:
            logger.error(f"[!] [LinuxFirewall] Unexpected failure: {e}")
            return False

    def remove_block(self, ip: str, rule_name: str) -> bool:
        if self.use_iptables_fallback:
            cmd = ["iptables", "-D", "INPUT", "-s", ip, "-j", "DROP"]
        else:
            # nftables deletion
            cmd = ["nft", "delete", "rule", "inet", "filter", "input", "ip", "saddr", ip, "drop"]

        try:
            subprocess.run(cmd, check=False, capture_output=True, text=True, timeout=SUBPROCESS_TIMEOUT, shell=False)
            logger.info(f"[+] [LinuxFirewall] Unblocked IP {ip} ({rule_name})")
            return True
        except Exception as e:
            logger.error(f"[!] [LinuxFirewall] Error unblocking {ip}: {e}")
            return False

    def list_blocks(self) -> List[str]:
        return []


class SimulationBackend(FirewallBackend):
    """Safe simulation mock backend for tests and non-elevated user execution."""

    def __init__(self):
        self.simulated_blocks: set[str] = set()

    @property
    def name(self) -> str:
        return "SimulationBackend"

    def is_supported(self) -> bool:
        return True

    def add_block(self, ip: str, rule_name: str) -> bool:
        self.simulated_blocks.add(ip)
        logger.info(f"[*] [SimulationBackend] Simulated block added: {rule_name} -> {ip}")
        return True

    def remove_block(self, ip: str, rule_name: str) -> bool:
        self.simulated_blocks.discard(ip)
        logger.info(f"[*] [SimulationBackend] Simulated block removed: {rule_name} -> {ip}")
        return True

    def list_blocks(self) -> List[str]:
        return sorted(list(self.simulated_blocks))


def get_firewall_backend(force_backend: Optional[str] = None) -> FirewallBackend:
    """
    Selects and instantiates the appropriate firewall backend based on environment or OS.
    """
    backend_choice = (force_backend or os.environ.get("FIREWALL_BACKEND", "")).lower()

    if backend_choice == "simulation":
        return SimulationBackend()
    if backend_choice == "netsh":
        return WindowsNetshBackend()
    if backend_choice in ("nftables", "iptables", "linux"):
        return LinuxNftablesBackend(use_iptables_fallback=(backend_choice == "iptables"))

    # Auto-detect OS
    if os.name == "nt":
        return WindowsNetshBackend()
    if sys.platform.startswith("linux"):
        return LinuxNftablesBackend()

    # Fallback to simulation
    logger.warning(f"[*] Platform '{sys.platform}' firewall not natively managed. Using SimulationBackend.")
    return SimulationBackend()
