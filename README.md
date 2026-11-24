# Intrusion Prevention System (IPS) & Enterprise IPP Blueprint

[![Continuous Integration](https://github.com/PruthvirajPatil04-cy/Intrusionn-Prevention-System/actions/workflows/ci.yml/badge.svg)](https://github.com/PruthvirajPatil04-cy/Intrusionn-Prevention-System/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-green.svg)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An enterprise-grade, full-stack cybersecurity platform combining an **Asynchronous Cross-Platform Intrusion Prevention Engine** with an **Interactive Governance & Operations Web Portal**.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------------+
|                               INTRUSION PREVENTION SYSTEM                               |
+-----------------------------------------------------------------------------------------+
                                             |
             +-------------------------------+-------------------------------+
             |                                                               |
             v                                                               v
+-----------------------------------------+     +-----------------------------------------+
|    PYTHON INTRUSION DETECTION ENGINE    |     |      ENTERPRISE NEXT.JS WEB PORTAL      |
|     (Intrusion-Detection_system/)       |     |             (ipp-blueprint/)            |
+-----------------------------------------+     +-----------------------------------------+
| - Capture Backend:                      |     | - 11 Cyber Program Routes:              |
|   * Scapy (User-Space Queue)            |     |   * / (Dashboard & Live Telemetry)      |
|   * eBPF / XDP Scaffold (docs/PERF.md)  |     |   * /program (Governance & Policies)    |
| - Stateful Threat Detection:            |     |   * /architecture (5-Tier Interactive)  |
|   * Port Scanning & Rate Windows        |     |   * /lifecycle (5-Stage Stepper)        |
|   * TCP SYN & ICMP Ping Floods          |     |   * /soc (Playbooks & Purple Team)      |
|   * ReDoS-Guarded Regex DPI             |     |   * /zero-trust (Microsegmentation)     |
|   * TLS ClientHello JA3/JA4 & SNI       |     |   * /metrics (Recharts Visualizer)      |
| - Cross-Platform Firewall Enforcement:  |     |   * /frameworks (NIST & MITRE Matrix)   |
|   * Windows Defender Firewall (netsh)   |     |   * /emerging (Encrypted / AI Tech)     |
|   * Linux nftables / iptables           |     |   * /checklist (Zustand LocalStorage)   |
|   * Simulation Mode (Safe dry-run)      |     |   * /about (Operating Boundaries)       |
| - Threat Intelligence:                  |     |                                         |
|   * MISP & AlienVault OTX Connectors    |     | - Security & API Bridge:                |
|   * Resilient Local Cache & Enrichment  |     |   * Authenticated /api/ips (Bearer)     |
| - Telemetry & SIEM Export:              |     |   * Real-Time SSE Stream (/stream)      |
|   * JSONL, Syslog RFC 5424, CEF, LEEF  |     |   * Audited SOC Containment API         |
|   * Prometheus Metrics (/metrics)       |     |   * In-Memory Token Bucket Rate Limiter |
+-----------------------------------------+     +-----------------------------------------+
                     \                                       /
                      \                                     /
                       v                                   v
             +---------------------------------------------------+
             |               SHARED TELEMETRY & LOGS             |
             |       ips_alerts.jsonl | soc_containment_audit    |
             +---------------------------------------------------+
```

---

## Quick Start Guide

### 1. Run Everything Together (Docker Compose)

The easiest way to launch both the Python engine and the web portal on Linux or container hosts:

```bash
docker compose up -d --build
```
* Web Portal: [http://localhost:3000](http://localhost:3000)
* Engine Prometheus Metrics: [http://localhost:9100/metrics](http://localhost:9100/metrics)

To view service logs:
```bash
docker compose logs -f
```

---

### 2. Run on Windows (Bare-Metal)

#### Step 1: Launch the Web Portal
```powershell
cd ipp-blueprint
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

#### Step 2: Launch the Python Engine
Open an elevated **PowerShell as Administrator**:
```powershell
cd Intrusion-Detection_system
pip install -r requirements.txt
python main.py
```
*(To run without modifying Windows Firewall rules, pass the `--simulate` flag).*

#### Step 3: Run Attack Simulation Tests
```powershell
python Intrusion-Detection_system/test_ips.py
```
Simulated SQLi attacks, port scans, and ICMP floods will be detected, logged, and streamed live to the dashboard!

---

## Testing & Quality Gates

### Run All Tests
```bash
# Run Python Unit & Integration Tests (39 tests)
cd Intrusion-Detection_system && python -m pytest -v

# Run Python Linter
cd Intrusion-Detection_system && python -m ruff check .

# Run Frontend Unit & Security Tests (21 tests)
cd ipp-blueprint && npm run test

# Run Playwright End-to-End Suite
cd ipp-blueprint && npm run test:e2e

# Run Frontend Production Build
cd ipp-blueprint && npm run build
```

---

## Environment Variables Reference

| Variable Name | Default | Purpose |
| :--- | :--- | :--- |
| `IPS_API_SECRET` | `ips-dev-secret-token` | Shared secret for `/api/ips` and `/api/ips/containment` Bearer token authentication. |
| `FIREWALL_BACKEND` | `netsh` (Windows) / `nftables` (Linux) | Firewall enforcement driver (`netsh`, `nftables`, `iptables`, `simulation`). |
| `LOG_SINKS` | `jsonl,cef,syslog,leef` | Comma-separated list of active SIEM export formats. |
| `NEMOTRON_API_KEY` | None | NVIDIA NIM cloud API key for Nemotron 3.5 AI threat reasoning. |
| `GEMMA_API_KEY` | None | NVIDIA NIM API key for Google Gemma 4 31B AI logic analysis. |

---

## Security Architecture & Guarantees

* **Zero Shell Execution:** All firewall interactions and subprocess calls build explicit argument arrays with `shell=False` and bounded 10s timeouts.
* **Strict Parameter Allowlisting:** IP addresses are validated with `ipaddress.ip_address` / CIDR parsers; rule names must conform to `^[A-Za-z0-9_.\- ]{1,64}$`.
* **ReDoS Protection:** Deep packet inspection regexes use bounded per-match timeouts (`timeout=0.05s`), preventing catastrophic backtracking Denial-of-Service attacks.
* **API Guards & Strict Validation:** All API endpoints enforce Zod schemas with `.strict()`, token-bucket rate limiting (429), and Bearer authentication (401).
* **Hardened Headers:** Enforces Content Security Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.

---

## Documentation Index

* **[AUDIT.md](docs/AUDIT.md):** Initial baseline security audit and vulnerability assessment.
* **[LOG_SCHEMA.md](docs/LOG_SCHEMA.md):** Structured JSONL log record specification for SIEM ingest.
* **[PERF.md](docs/PERF.md):** Scapy performance limits and eBPF/XDP zero-copy line-rate roadmap.
* **[RELEASE.md](docs/RELEASE.md):** Deployment checklist, container setup, and rollback playbooks.
* **[SECURITY.md](SECURITY.md):** Vulnerability disclosure policy and supported versions.
* **[CHANGELOG.md](CHANGELOG.md):** Complete version history and upgrade details.

---

## Known Limitations & Production Notes

1. **User-Space Scapy Throughput:** Pure Python packet capture is capped at approximately 12,000 packets per second. For 10Gbps+ edge links, deploy an eBPF/XDP capture hook as documented in [docs/PERF.md](docs/PERF.md).
2. **Promiscuous Mode Privileges:** Live packet capture and active firewall rule insertion require Administrator rights on Windows and `CAP_NET_ADMIN` / `CAP_NET_RAW` capabilities on Linux/Docker.
