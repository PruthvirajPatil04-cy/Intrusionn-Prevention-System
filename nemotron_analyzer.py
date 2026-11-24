"""
Nemotron AI Integration module for Intrusion Prevention System.
Uses NVIDIA Nemotron (via NIM API) for zero-day threat analysis,
deep packet anomaly explanation, and detection rule hardening.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Optional

from config import settings


def get_api_key() -> str:
    return settings.get_nemotron_key() or ""


def ask_nemotron(
    prompt: str,
    system_prompt: Optional[str] = None,
    model: str = "nvidia/nemotron-3.5-lightning-30b-a3b"
) -> str:
    api_key = get_api_key()
    if not api_key:
        return "Error: NEMOTRON_API_KEY / NVIDIA_API_KEY not configured in environment or .env."

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": 1024,
        "temperature": 0.5
    }

    req = urllib.request.Request(
        "https://integrate.api.nvidia.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            msg = data["choices"][0]["message"]
            return (msg.get("content") or msg.get("reasoning_content") or "").strip()
    except Exception as e:
        return f"Nemotron API error: {e}"


if __name__ == "__main__":
    test_prompt = "Explain why rapid SYN packets without ACK constitute a denial-of-service attack vector."
    print("Querying Nemotron...")
    print(ask_nemotron(test_prompt))
