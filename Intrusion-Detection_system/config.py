"""
Configuration loader for the Intrusion Prevention System (IPS).
"""
import os
import json
from pathlib import Path
from typing import Dict, Any, List

BASE_DIR = Path(__file__).resolve().parent
CONFIG_FILE = BASE_DIR / "rules.json"
LOG_DIR = BASE_DIR / "logs"

# Ensure logs directory exists
LOG_DIR.mkdir(parents=True, exist_ok=True)


def load_rules(file_path: Path = CONFIG_FILE) -> Dict[str, Any]:
    """Loads rule definitions from JSON file with defaults."""
    default_rules = {
        "general": {
            "simulation_mode": False,
            "block_duration_seconds": 300,
            "whitelist": ["127.0.0.1", "::1"]
        },
        "rate_limits": {
            "port_scan": {"threshold_ports": 15, "time_window_seconds": 5},
            "syn_flood": {"threshold_packets": 30, "time_window_seconds": 3},
            "icmp_flood": {"threshold_packets": 25, "time_window_seconds": 2}
        },
        "blacklisted_ips": [],
        "sensitive_ports": [21, 22, 23, 445, 1433, 3306, 3389],
        "payload_signatures": []
    }

    if not file_path.exists():
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(default_rules, f, indent=2)
        return default_rules

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[!] Error loading config {file_path}: {e}. Falling back to default rules.")
        return default_rules
