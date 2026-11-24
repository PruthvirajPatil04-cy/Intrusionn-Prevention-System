"""
Google Gemma 4 31B AI analysis client for high-accuracy coding and security logic.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Optional

from config import settings


def get_gemma_api_key() -> str:
    return settings.gemma_api_key or ""


def ask_gemma(
    prompt: str,
    system_prompt: Optional[str] = None,
    model: str = "google/gemma-4-31b-it"
) -> str:
    api_key = get_gemma_api_key()
    if not api_key:
        return "Error: GEMMA_API_KEY not configured in environment or .env."

    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model,
        "max_tokens": 1024,
        "temperature": 0.5,
        "messages": messages
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
            return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return f"Gemma API error: {e}"


if __name__ == "__main__":
    print("Testing Gemma 4 31B...")
    print(ask_gemma("Verify the security of firewall port blocking logic."))
