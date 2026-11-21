"""
Logging and alerting engine for the Intrusion Prevention System (IPS).
"""
import os
import sys
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

from config import LOG_DIR

LOG_FILE = LOG_DIR / "ips_activity.log"
ALERTS_FILE = LOG_DIR / "ips_alerts.jsonl"

# Set up standard logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("IPS")


def log_alert(
    alert_type: str,
    source_ip: str,
    target_ip: Optional[str],
    details: str,
    severity: str = "HIGH",
    action_taken: str = "BLOCKED"
) -> None:
    """
    Logs an intrusion event to the console, activity log, and JSON lines alert file.
    """
    timestamp = datetime.now().isoformat()
    alert_record: Dict[str, Any] = {
        "timestamp": timestamp,
        "severity": severity,
        "alert_type": alert_type,
        "source_ip": source_ip,
        "target_ip": target_ip,
        "details": details,
        "action_taken": action_taken
    }

    # Console / logfile output
    prefix = f"[{severity}] [{action_taken}]"
    logger.warning(
        f"{prefix} {alert_type} from {source_ip} -> {target_ip or 'N/A'}: {details}"
    )

    # Persist structured JSON record
    try:
        with open(ALERTS_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(alert_record) + "\n")
    except Exception as e:
        logger.error(f"Failed to write structured alert to {ALERTS_FILE}: {e}")
