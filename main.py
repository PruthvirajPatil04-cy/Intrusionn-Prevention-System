"""
Main Entrypoint for the Intrusion Prevention System (IPS).
Enforces least-privilege checks, startup diagnostics, and clean shutdown handling.
"""
from __future__ import annotations

import argparse
import os
import signal
import sys
import time
from typing import Any

from analyzer import IntrusionAnalyzer
from blocker import Blocker, is_admin
from config import load_rules
from logger import logger
from sniffer import PacketSniffer


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Autonomous Intrusion Prevention System (IPS) Engine"
    )
    parser.add_argument(
        "--simulate",
        action="store_true",
        help="Run in simulation mode (logs alerts and simulated drops, no actual firewall changes)"
    )
    parser.add_argument(
        "--interface",
        type=str,
        default=None,
        help="Network interface to sniff on (default: auto-detected primary interface)"
    )
    parser.add_argument(
        "--unblock",
        type=str,
        default=None,
        help="Manually unblock a specific IP address and exit"
    )
    return parser.parse_args()


def perform_startup_checks(simulation_mode: bool) -> bool:
    """Verifies operating system privileges and network interface capabilities."""
    has_admin = is_admin()
    os_name = "Windows" if os.name == "nt" else sys.platform

    logger.info("=======================================================")
    logger.info(f"   STARTING INTRUSION PREVENTION SYSTEM (OS: {os_name})")
    logger.info("=======================================================")
    logger.info(f"[*] Privilege Check: {'ADMINISTRATOR / ROOT' if has_admin else 'STANDARD USER'}")
    logger.info(f"[*] Engine Mode: {'SIMULATION' if simulation_mode or not has_admin else 'ACTIVE FIREWALL ENFORCEMENT'}")

    if not has_admin and not simulation_mode:
        logger.error(
            "[!] CRITICAL PRIVILEGE ERROR: Running as standard user without elevated privileges. "
            "Active inline packet blocking requires Administrator rights on Windows (or root/NET_ADMIN on Linux). "
            "The engine cannot modify firewall rules in this session."
        )
        return False
    return True


def main() -> None:
    args = parse_arguments()
    rules = load_rules()

    simulation_mode = args.simulate or rules.get("general", {}).get("simulation_mode", False)
    block_duration = rules.get("general", {}).get("block_duration_seconds", 300)

    # Manual unblock mode
    if args.unblock:
        blocker = Blocker(simulation_mode=simulation_mode, block_duration=block_duration)
        try:
            success = blocker.unblock_ip(args.unblock)
            if success:
                print(f"[+] Successfully unblocked IP: {args.unblock}")
                sys.exit(0)
            else:
                print(f"[-] IP {args.unblock} was not found in active blocked list.")
                sys.exit(1)
        except Exception as e:
            print(f"[!] Validation error unblocking {args.unblock}: {e}")
            sys.exit(1)

    # Perform least-privilege checks
    startup_ok = perform_startup_checks(simulation_mode)
    if not startup_ok and not simulation_mode:
        logger.warning("[!] Automatically downgrading session to SIMULATION mode for safety.")
        simulation_mode = True

    blocker = Blocker(simulation_mode=simulation_mode, block_duration=block_duration)
    analyzer = IntrusionAnalyzer(rules=rules, blocker=blocker)
    sniffer = PacketSniffer(analyzer=analyzer, interface=args.interface)

    # Clean shutdown handling
    def signal_handler(sig: int, frame: Any) -> None:
        logger.info("\n[*] Interruption signal received. Shutting down IPS...")
        sniffer.stop()
        blocker.cleanup_all()
        logger.info("[*] IPS Engine terminated safely.")
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        sniffer.start()
        logger.info("[*] IPS packet capture is active. Press Ctrl+C to stop.")
        while True:
            time.sleep(1)
    except Exception as e:
        logger.critical(f"[!] Fatal error in IPS main loop: {e}", exc_info=True)
        blocker.cleanup_all()
        sys.exit(1)


if __name__ == "__main__":
    main()
