"""
Nemotron AI Integration module for Intrusion Prevention System.
Uses NVIDIA Nemotron (via NIM API) for zero-day threat analysis,
deep packet anomaly explanation, and detection rule hardening.
"""
import os
import json
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional

ENV_FILE = Path(__file__).resolve().parent / ".env"


def get_api_key() -> str:
    key = os.environ.get("NVIDIA_API_KEY")
    if key:
        return key
    if ENV_FILE.exists():
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("NVIDIA_API_KEY="):
                    return line.strip().split("=", 1)[1].strip("\"'")
    return ""


def ask_nemotron(prompt: str, system_prompt: Optional[str] = None, model: str = "nvidia/nemotron-3.5-lightning-30b-a3b") -> str:
    api_key = get_api_key()
    if not api_key:
        return "Error: NVIDIA_API_KEY not found."

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
    test_log = "Packet from 198.51.100.42 to Port 80 payload: 'UNION SELECT 1,2,password FROM users--'"
    print("[*] Asking Nemotron to analyze suspicious packet...")
    result = ask_nemotron(
        prompt=f"Analyze this suspicious payload and explain the threat:\n{test_log}",
        system_prompt="You are a cyber security expert. Give a 2-sentence threat diagnosis."
    )
    print("\n[Nemotron Diagnosis]:\n", result)
