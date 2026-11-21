#!/usr/bin/env python3
"""
Intrusion Prevention System (IPS)
Main Entry Point and CLI Orchestrator.
"""
import sys
import argparse
import signal
import time
from pathlib import Path

from config import load_rules, CONFIG_FILE
from blocker import Blocker, is_admin
from analyzer import IntrusionAnalyzer
from sniffer import PacketSniffer
from logger import logger

BANNER = r"""
========================================================================
       ___ _   _ _____ ____  _   _ ____ ___ ___  _   _ 
      |_ _| \ | |_   _|  _ \| | | / ___|_ _/ _ \| \ | |
       | ||  \| | | | | |_) | | | \___ \| | | | |  \| |
       | || |\  | | | |  _ <| |_| |___) | | |_| | |\  |
      |___|_| \_| |_| |_| \_\\___/|____/___\___/|_| \_|
             PREVENTION SYSTEM (IPS) - REAL-TIME DEFENDER
========================================================================
"""


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Autonomous Intrusion Prevention System (IPS)"
    )
    parser.add_argument(
        "-i", "--interface",
        type=str,
        default=None,
        help="Network interface to sniff on (default: default route interface)"
    )
    parser.add_argument(
        "-s", "--simulate",
        action="store_true",
        help="Run in simulation mode (detect and log, but do not alter firewall rules)"
    )
    parser.add_argument(
        "-c", "--config",
        type=Path,
        default=CONFIG_FILE,
        help=f"Path to rules configuration file (default: {CONFIG_FILE})"
    )
    parser.add_argument(
        "--unblock",
        type=str,
        metavar="IP",
        help="Unblock a specific IP address and exit"
    )
    parser.add_argument(
        "--ttl",
        type=int,
        default=None,
        help="Override quarantine block duration in seconds (e.g. 300)"
    )
    return parser.parse_args()


def main():
    print(BANNER)
    args = parse_arguments()

    # Load configuration
    rules = load_rules(args.config)
    sim_mode = args.simulate or rules.get("general", {}).get("simulation_mode", False)
    ttl = args.ttl or rules.get("general", {}).get("block_duration_seconds", 300)

    # Initialize Blocker
    blocker = Blocker(simulation_mode=sim_mode, block_duration=ttl)

    # Handle single unblock command
    if args.unblock:
        logger.info(f"[*] Removing block for IP: {args.unblock}")
        blocker.unblock_ip(args.unblock)
        sys.exit(0)

    # Privilege warning
    if not is_admin() and not sim_mode:
        print("[!] NOTICE: Running without administrator privileges.")
        print("[!] Active firewall blocking requires admin rights.")
        print("[!] Switching automatically to SIMULATION MODE.\n")
        blocker.simulation_mode = True

    print(f"[*] Operational Mode: {'[SIMULATION / DRY-RUN]' if blocker.simulation_mode else '[ACTIVE BLOCKING]'}")
    print(f"[*] Quarantine Duration: {blocker.block_duration} seconds")
    print(f"[*] Loaded rules from: {args.config}\n")

    # Initialize Analyzer and Sniffer
    analyzer = IntrusionAnalyzer(rules=rules, blocker=blocker)
    sniffer = PacketSniffer(analyzer=analyzer, interface=args.interface)

    # Graceful shutdown handler
    def shutdown_handler(sig, frame):
        print("\n[*] Stopping Intrusion Prevention System...")
        sniffer.stop()
        blocker.cleanup_all()
        print(f"[*] Session ended. Total packets analyzed: {sniffer.packet_count}")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_handler)
    if hasattr(signal, "SIGBREAK"):
        signal.signal(signal.SIGBREAK, shutdown_handler)

    try:
        sniffer.start()
    except KeyboardInterrupt:
        shutdown_handler(None, None)
    except Exception as e:
        logger.error(f"[!] Fatal error in sniffer: {e}")
        blocker.cleanup_all()
        sys.exit(1)


if __name__ == "__main__":
    main()
