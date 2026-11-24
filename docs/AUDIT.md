# Intrusion Prevention System (IPS) — Baseline Security & Architecture Audit

**Date:** 2026-11-21  
**Auditor:** Antigravity (Senior Security Engineer & Full-Stack Architect)  
**Target Repository:** `Intrusion-Prevention-System` (`https://github.com/PruthvirajPatil04-cy/Intrusionn-Prevention-System`)  
**Scope:** Python Intrusion Detection/Prevention Engine (`Intrusion-Detection_system/`) & Next.js Cybersecurity Portal (`ipp-blueprint/`)

---

## 1. Repository Inventory

### 1.1 Python Detection & Prevention Engine (`Intrusion-Detection_system/`)
* **Entry Points:**
  * `main.py`: Command-line interface for starting packet sniffer in active inline blocking or simulation mode, or performing manual IP unblocking (`--unblock <ip>`).
  * `test_ips.py`: Synthetic test generator simulating SQLi payloads, rapid port scans, and ICMP floods.
  * `nemotron_analyzer.py`: NVIDIA Nemotron 3.5 NIM threat analysis utility.
  * `gemma_client.py`: Google Gemma 4 31B reasoning client.
* **Core Modules:**
  * `analyzer.py`: Detection engine with stateful tracking for port scans, SYN floods, ICMP floods, sensitive port probes, and regex payload inspection.
  * `blocker.py`: Firewall modification engine invoking Windows `netsh advfirewall` and maintaining in-memory TTL quarantine tracking.
  * `sniffer.py`: Scapy packet sniffer wrapper invoking `scapy.all.sniff`.
  * `config.py`: File loader reading `rules.json` with fallback defaults.
  * `logger.py`: Standard logging and JSONL alert writer appending to `logs/ips_alerts.jsonl`.
* **Configuration & Storage:**
  * `rules.json`: Port definitions, rate limit windows/thresholds, IP blacklists, and payload regexes.
  * `.env` / `.env.example`: API keys (`NEMOTRON_API_KEY`, `GEMMA_API_KEY`).
  * `logs/ips_activity.log`: Text event log.
  * `logs/ips_alerts.jsonl`: Structured intrusion alert log.

### 1.2 Web Portal & Telemetry Dashboard (`ipp-blueprint/`)
* **Entry Point:** Next.js 14 App Router server (`http://localhost:3000`).
* **Routes (11 Pages + 1 API):**
  * `/`: Executive Dashboard with live engine status and alert stream.
  * `/program`: Strategic objectives, RACI, and governance policies.
  * `/architecture`: Interactive 5-tier concentric defense-in-depth visualizer.
  * `/lifecycle`: 5-stage lifecycle stepper (*Scope → Maintain*).
  * `/soc`: SIEM/SOAR correlation use cases and purple-team playbooks.
  * `/zero-trust`: Identity enforcement and microsegmentation guidance.
  * `/metrics`: Recharts telemetry dashboard for dwell time and sensor health.
  * `/frameworks`: Mapping matrix for NIST SP 800-94, NIST CSF 2.0, CIS v8, and MITRE ATT&CK.
  * `/emerging`: TLS 1.3 inspection, AI heuristics, and API gateway controls.
  * `/checklist`: 25+ controls with LocalStorage state persistence.
  * `/about`: Operating assumptions, disclaimer, and architecture scope.
  * `/api/ips`: HTTP GET/POST bridge reading engine rules/logs and triggering test simulations.
* **Component Library:** `components/` (LiveEngineStatus, ArchitectureDiagram, MetricsCharts, ChecklistManager, GlobalSearchModal, ThemeToggle, etc.).
* **Data Sources:** Static typed JSON/TS models in `data/programData.ts` and `data/types.ts`.

---

## 2. Concrete Security & Architectural Risks Identified

### Vulnerability 1: Subprocess Command Execution in Web Bridge (`/api/ips`)
* **Location:** `ipp-blueprint/app/api/ips/route.ts` line 66:
  ```ts
  const { stdout, stderr } = await execAsync(`python "${testScript}"`, { cwd: idsDir });
  ```
* **Risk:** Shell execution using template literal interpolation. While `testScript` is currently internal, calling shell-based `exec` poses command injection hazards if arguments become dynamic.
* **Remediation:** Refactor to `child_process.execFile` or `spawn` using explicit argument arrays (`["python", testScript]`), `shell: false`, strict execution timeouts, and path sanitization.

### Vulnerability 2: Unauthenticated State-Changing API Endpoints
* **Location:** `ipp-blueprint/app/api/ips/route.ts` (GET and POST).
* **Risk:** Any network client with access to port 3000 can invoke `GET /api/ips` to dump internal firewall rules, monitored ports, and IP logs, or execute `POST /api/ips` to spawn Python processes on the host.
* **Remediation:** Introduce token-based session authentication guard (Bearer auth / session cookie). Disallow unauthenticated requests with HTTP 401 Unauthorized.

### Vulnerability 3: Lack of Input Validation & Rate Limiting on API Bridge
* **Location:** `ipp-blueprint/app/api/ips/route.ts`.
* **Risk:** No schema validation on request payload; no rate limiting. An attacker can flood `POST /api/ips`, spawning uncontrolled Python processes and exhausting system memory and CPU (Denial of Service).
* **Remediation:** Enforce Zod schemas validating action allowlists (`action: "simulate"`), reject unknown properties with HTTP 400, and enforce token-bucket rate limiting via `lru-cache` returning HTTP 429.

### Vulnerability 4: Absence of Strict IP & Rule Name Validation in Firewall Blocking
* **Location:** `Intrusion-Detection_system/blocker.py`.
* **Risk:** `rule_name = f"IPS_BLOCK_{ip}"` concatenates raw IP strings directly into CLI parameters without validating if `ip` is a legitimate IPv4/IPv6 address.
* **Remediation:** Validate every target using Python's standard `ipaddress.ip_address` / `ip_network`. Validate rule names against allowlist regex `^[A-Za-z0-9_\- ]{1,64}$`. Reject invalid values with typed exceptions before subprocess execution.

### Vulnerability 5: Regular Expression Denial of Service (ReDoS) in Payload DPI
* **Location:** `Intrusion-Detection_system/analyzer.py` line 30 & line 137.
* **Risk:** Rules loaded from `rules.json` are compiled with standard `re.compile(sig["pattern"])`. If a rule contains catastrophic backtracking patterns (e.g. `(a+)+$`), matching against untrusted packet bytes can freeze the entire inspection thread indefinitely.
* **Remediation:** Use the `regex` engine with match timeouts (`timeout=0.05s`) or bounded worker execution. Reject unsafe regexes during engine startup with explicit validation errors.

### Vulnerability 6: Windows-Only Hardcoding & Platform Rigidity
* **Location:** `blocker.py` and `main.py`.
* **Risk:** Relies directly on `ctypes.windll.shell32.IsUserAnAdmin()` and Windows `netsh advfirewall`. Cannot run on Linux hosts, containerized workloads, or Kubernetes pods.
* **Remediation:** Design a pluggable `FirewallBackend` interface with `WindowsNetshBackend` and `LinuxNftablesBackend` (or `iptables`), selectable via OS detection or environment variable.

### Vulnerability 7: Synchronous Capture & Packet Processing Pipeline
* **Location:** `sniffer.py` invoking `sniff(prn=callback)`.
* **Risk:** If payload analysis or firewall execution encounters delay, the Scapy packet capture thread blocks, causing incoming network packets to drop at the socket buffer.
* **Remediation:** Decouple capture from inspection via a bounded `queue.Queue` with a worker pool and `sniff(store=0)`. Track and expose dropped packet metrics.

### Vulnerability 8: TLS Inspection Blind Spot
* **Location:** `analyzer.py`.
* **Risk:** Deep packet inspection only decodes UTF-8 strings in plaintext. Modern enterprise traffic is >90% TLS-encrypted; attacks passing through HTTPS bypass DPI without JA3/JA4 fingerprinting or SNI anomaly rules.
* **Remediation:** Implement TLS ClientHello parsing in Scapy to extract JA3/JA4 fingerprints and SNI hostnames, evaluating anomalies against known threat intelligence.

---

## 3. Baseline Status Verification

| Component | Check | Baseline Status | Notes |
| :--- | :--- | :--- | :--- |
| **Python Engine** | `python test_ips.py` | **PASSED** (3/3 tests) | Simulated SQLi, port scan, ICMP flood caught |
| **Web Portal** | `npm run lint` | **PASSED** (0 errors) | ESLint clean across app, components, data, lib |
| **Web Portal** | `npm run build` | **PASSED** (16/16 routes) | Next.js 14 App Router static & dynamic build |
| **Code Hygiene** | Secrets in Repo | **SECURED** | `.env` ignored; `.env.example` provides templates |

---

## 4. Upgrade Roadmap

* **Phase 1 (P0):** Security hardening — Firewall command injection prevention, IP/CIDR typing, ReDoS defense, auth-guarded `/api/ips`, Zod validation, in-memory rate limiting, security headers.
* **Phase 2 (P1):** Robustness — Async worker queue, structured JSONL schema, pytest coverage for analyzer/blocker, SSE real-time log streaming, Zustand store.
* **Phase 3 (P2):** Cross-platform — Linux `nftables`/`iptables` backend, Docker containerization with `docker-compose.yml`, JA3/JA4 TLS fingerprinting, performance plan.
* **Phase 4 (P3):** Enterprise observability — Prometheus `/metrics`, Syslog/CEF sinks, AlienVault/MISP threat feeds, authenticated containment API.
* **Phase 5:** CI/CD & release hygiene — GitHub Actions workflows, `SECURITY.md`, `CHANGELOG.md`, `RELEASE.md`.
