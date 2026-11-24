"""
Pluggable Threat Intelligence Connectors:
- MISP (Malware Information Sharing Platform) HTTP API
- AlienVault OTX (Open Threat Exchange) HTTP API
- In-memory IOC store with local file caching and safe failure handling
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from config import LOG_DIR
from logger import logger

DEFAULT_CACHE_FILE = LOG_DIR / "threat_intel_cache.json"


class ThreatFeed(ABC):
    """Abstract interface for external threat intelligence feeds."""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def fetch_iocs(self) -> Dict[str, str]:
        """Fetches indicators of compromise, returning a mapping of {indicator: description}."""
        pass


class MispFeed(ThreatFeed):
    """MISP REST API threat intelligence feed."""

    def __init__(self, base_url: str = "https://misp.local", auth_key: str = "mock-key", timeout: int = 5):
        self.base_url = base_url.rstrip("/")
        self.auth_key = auth_key
        self.timeout = timeout

    @property
    def name(self) -> str:
        return "MISP Threat Feed"

    def fetch_iocs(self) -> Dict[str, str]:
        url = f"{self.base_url}/attributes/restSearch"
        req = urllib.request.Request(
            url,
            headers={
                "Authorization": self.auth_key,
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            data=json.dumps({"type": ["ip-src", "ip-dst", "domain"], "limit": 100}).encode("utf-8")
        )

        iocs: Dict[str, str] = {}
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                attributes = data.get("response", {}).get("Attribute", [])
                for attr in attributes:
                    val = attr.get("value")
                    comment = attr.get("comment") or "MISP Malicious IOC"
                    if val:
                        iocs[val] = comment
            logger.info(f"[+] [MISP] Successfully fetched {len(iocs)} indicators.")
        except Exception as e:
            logger.warning(f"[!] [MISP] Feed update failed: {e}. Using cached threat intel.")
        return iocs


class AlienVaultOtxFeed(ThreatFeed):
    """AlienVault Open Threat Exchange (OTX) API connector."""

    def __init__(self, api_key: str = "mock-key", timeout: int = 5):
        self.api_key = api_key
        self.timeout = timeout

    @property
    def name(self) -> str:
        return "AlienVault OTX Feed"

    def fetch_iocs(self) -> Dict[str, str]:
        url = "https://otx.alienvault.com/api/v1/indicators/export"
        req = urllib.request.Request(
            url,
            headers={
                "X-OTX-API-KEY": self.api_key,
                "Accept": "application/json"
            }
        )

        iocs: Dict[str, str] = {}
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                indicators = data.get("results", [])
                for item in indicators:
                    val = item.get("indicator")
                    desc = item.get("description") or "AlienVault OTX Malicious Pulse"
                    if val:
                        iocs[val] = desc
            logger.info(f"[+] [AlienVault OTX] Successfully fetched {len(iocs)} indicators.")
        except Exception as e:
            logger.warning(f"[!] [AlienVault OTX] Feed update failed: {e}. Using cached threat intel.")
        return iocs


class ThreatIntelManager:
    """
    Coordinates threat intelligence feeds, maintains fast in-memory IOC lookup,
    and caches indicators locally so network disruptions never impair IPS detection.
    """

    def __init__(self, feeds: Optional[List[ThreatFeed]] = None, cache_path: Path = DEFAULT_CACHE_FILE):
        self.feeds = feeds or []
        self.cache_path = cache_path
        self.iocs: Dict[str, str] = {}

        # Load cached indicators on startup
        self._load_cache()

    def _load_cache(self) -> None:
        if self.cache_path.exists():
            try:
                with open(self.cache_path, "r", encoding="utf-8") as f:
                    self.iocs = json.load(f)
                logger.info(f"[*] Loaded {len(self.iocs)} cached Threat Intelligence indicators.")
            except Exception as e:
                logger.error(f"[!] Failed to load threat intel cache: {e}")

    def _save_cache(self) -> None:
        try:
            with open(self.cache_path, "w", encoding="utf-8") as f:
                json.dump(self.iocs, f, indent=2)
        except Exception as e:
            logger.error(f"[!] Failed to write threat intel cache: {e}")

    def refresh_feeds(self) -> int:
        """Pulls from all configured feeds and updates cache. Resilient against timeouts."""
        new_count = 0
        for feed in self.feeds:
            try:
                fetched = feed.fetch_iocs()
                for ioc, desc in fetched.items():
                    if ioc not in self.iocs:
                        new_count += 1
                    self.iocs[ioc] = desc
            except Exception as e:
                logger.warning(f"[!] Error refreshing {feed.name}: {e}")

        if new_count > 0:
            self._save_cache()
            logger.info(f"[*] Threat Intelligence refreshed: {new_count} new indicators added.")
        return len(self.iocs)

    def check_indicator(self, indicator: str) -> Tuple[bool, Optional[str]]:
        """Checks if an IP or domain is present in the threat intel store."""
        if not indicator:
            return False, None
        cleaned = indicator.strip().lower()
        if cleaned in self.iocs:
            return True, self.iocs[cleaned]
        return False, None
