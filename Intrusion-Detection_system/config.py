"""
Configuration loader and typed settings for the Intrusion Prevention System (IPS).
Uses pydantic-settings for robust environment variable management.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent
CONFIG_FILE = BASE_DIR / "rules.json"
LOG_DIR = BASE_DIR / "logs"

# Ensure logs directory exists
LOG_DIR.mkdir(parents=True, exist_ok=True)


class GeneralSettings(BaseModel):
    simulation_mode: bool = False
    block_duration_seconds: int = 300
    whitelist: List[str] = Field(default_factory=lambda: ["127.0.0.1", "::1"])


class RateLimitConfig(BaseModel):
    threshold_ports: Optional[int] = 15
    threshold_packets: Optional[int] = 30
    time_window_seconds: int = 5


class RateLimits(BaseModel):
    port_scan: RateLimitConfig = Field(default_factory=lambda: RateLimitConfig(threshold_ports=15, time_window_seconds=5))
    syn_flood: RateLimitConfig = Field(default_factory=lambda: RateLimitConfig(threshold_packets=30, time_window_seconds=3))
    icmp_flood: RateLimitConfig = Field(default_factory=lambda: RateLimitConfig(threshold_packets=25, time_window_seconds=2))


class PayloadSignature(BaseModel):
    name: str
    pattern: str


class IPSRuleSet(BaseModel):
    general: GeneralSettings = Field(default_factory=GeneralSettings)
    rate_limits: RateLimits = Field(default_factory=RateLimits)
    blacklisted_ips: List[str] = Field(default_factory=list)
    sensitive_ports: List[int] = Field(default_factory=lambda: [21, 22, 23, 445, 1433, 3306, 3389])
    payload_signatures: List[PayloadSignature] = Field(default_factory=list)


class AppSettings(BaseSettings):
    """Application-wide settings read from environment and .env."""
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    ips_api_secret: str = Field(default="ips-dev-secret-token", description="Shared secret for /api/ips authentication")
    nemotron_api_key: Optional[str] = Field(default=None, alias="NEMOTRON_API_KEY")
    gemma_api_key: Optional[str] = Field(default=None, alias="GEMMA_API_KEY")
    nvidia_api_key: Optional[str] = Field(default=None, alias="NVIDIA_API_KEY")

    def get_nemotron_key(self) -> Optional[str]:
        return self.nemotron_api_key or self.nvidia_api_key


# Global settings singleton
settings = AppSettings()


def load_rules(file_path: Path = CONFIG_FILE) -> Dict[str, Any]:
    """Loads and validates rule definitions from JSON file with defaults."""
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
            raw_data = json.load(f)
            # Validate through pydantic
            validated = IPSRuleSet.model_validate(raw_data)
            return validated.model_dump()
    except Exception as e:
        print(f"[!] Error loading/validating config {file_path}: {e}. Falling back to default rules.")
        return default_rules
