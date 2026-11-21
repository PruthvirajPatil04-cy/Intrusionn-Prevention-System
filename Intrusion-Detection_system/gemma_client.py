"""
Gemma 4 31B (google/gemma-4-31b-it) Client via NVIDIA NIM API.
"""
import os
import requests
from pathlib import Path

ENV_FILE = Path(__file__).resolve().parent / ".env"
INVOKE_URL = "https://integrate.api.nvidia.com/v1/chat/completions"


def get_api_key() -> str:
    key = os.environ.get("NVIDIA_API_KEY")
    if key:
        return key
    if ENV_FILE.exists():
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("NVIDIA_API_KEY="):
                    return line.strip().split("=", 1)[1].strip("\"'")
    return "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"


def ask_gemma(prompt: str, system_message: str = "You are a helpful assistant.", stream: bool = False):
    api_key = get_api_key()
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "text/event-stream" if stream else "application/json",
    }
    payload = {
        "model": "google/gemma-4-31b-it",
        "max_tokens": 1024,
        "stream": stream,
        "temperature": 0.5,
        "top_p": 1,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(INVOKE_URL, headers=headers, json=payload, stream=stream, timeout=90)
    if stream:
        for line in response.iter_lines():
            if line:
                print(line.decode("utf-8"))
    else:
        data = response.json()
        return data["choices"][0]["message"]["content"]


if __name__ == "__main__":
    question = "What is 17 * 23?"
    print(f"[*] Prompting Gemma 4 31B: '{question}'...")
    ans = ask_gemma(question)
    print(f"\n[Gemma Response]:\n{ans}")
