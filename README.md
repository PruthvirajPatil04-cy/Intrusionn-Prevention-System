# Intrusion Prevention System & IPP Blueprint

A production-grade, full-stack cybersecurity platform bringing the **Intrusion-Detection_system** (Python engine) and **ipp-blueprint** (Enterprise Next.js 14 Web Portal) together in one place.

---

## Workspace Structure

```
d:\Projects\Intrusion-Prevention-System/
│
├── Intrusion-Detection_system/       # Python Real-Time Intrusion Detection & Prevention Engine
│   ├── main.py                       # CLI entry point (Active blocking or simulation)
│   ├── analyzer.py                   # Port scan, SYN flood, ICMP flood & DPI regex inspection
│   ├── blocker.py                    # Windows Defender Firewall netsh automation & quarantine TTL
│   ├── sniffer.py                    # Scapy packet capture wrapper
│   ├── rules.json                    # Active thresholds, blacklists & payload signatures
│   ├── config.py                     # Configuration loader
│   ├── logger.py                     # Event logger & structured JSONL alert exporter
│   ├── nemotron_analyzer.py          # NVIDIA Nemotron 3.5 AI threat explainer
│   ├── gemma_client.py               # Google Gemma 4 31B AI analysis client
│   ├── test_ips.py                   # Threat simulation & automated unit tests
│   ├── requirements.txt              # Python dependencies (scapy, requests)
│   └── logs/                         # Real-time ips_activity.log & ips_alerts.jsonl
│
├── ipp-blueprint/                    # Enterprise Next.js 14 Cybersecurity Web Portal
│   ├── app/                          # Next.js 14 App Router routes:
│   │   ├── page.tsx                  # / Executive Dashboard with live engine telemetry
│   │   ├── program/                  # /program Strategic Objectives & Governance
│   │   ├── architecture/             # /architecture Interactive 5-tier concentric diagram
│   │   ├── lifecycle/                # /lifecycle 5-stage stepper (Scope → Maintain)
│   │   ├── soc/                      # /soc SIEM/SOAR Pipelines & Correlation Playbooks
│   │   ├── zero-trust/               # /zero-trust Identity Enforcement & Microsegmentation
│   │   ├── metrics/                  # /metrics Recharts KPI Visualizer
│   │   ├── frameworks/               # /frameworks NIST SP 800-94 / CSF 2.0 / CIS v8 / ATT&CK
│   │   ├── emerging/                 # /emerging TLS 1.3, AI/ML Detection, API Gateways, IaC
│   │   ├── checklist/                # /checklist 25+ Controls with LocalStorage persistence
│   │   ├── about/                    # /about Scope, Operating Boundaries & Legal Disclaimers
│   │   └── api/ips/route.ts          # Live bridge reading rules & logs and executing tests
│   ├── components/                   # Cyber UI design system & LiveEngineStatus widget
│   ├── data/                         # Typed program models & controls source of truth
│   └── package.json                  # Web dependencies
│
├── package.json                      # Unified root scripts
├── run_all.py                        # Unified launcher running both engine & portal concurrently
├── start_all.bat                     # Windows one-click launcher
└── README.md
```

---

## How They Work Together

1. **Telemetry & Log Synchronization**:
   * The Python engine writes real-time threat detections, IP quarantine blocks, and traffic evaluations into `Intrusion-Detection_system/logs/ips_alerts.jsonl`.
   * The web application's API (`ipp-blueprint/app/api/ips/route.ts`) reads these logs and `Intrusion-Detection_system/rules.json` dynamically.
   * The Executive Dashboard (`/`) displays live detection telemetry, quarantine TTL, port scan thresholds, and active alert streams.

2. **Interactive Threat Simulation From Web UI**:
   * Clicking the **"Simulate Attack Traffic"** button directly on the web dashboard calls `POST /api/ips`, which triggers `Intrusion-Detection_system/test_ips.py`.
   * The engine detects SQL injections, port scans, and ICMP floods in real time and automatically updates the dashboard alert stream!

3. **Unified Execution**:
   * Run both services concurrently with a single command:
     ```powershell
     python run_all.py
     ```
     or
     ```powershell
     npm run run:all
     ```

---

## Quick Start Commands

### 1. Run Everything Together
```powershell
python run_all.py
```
*(Starts the Next.js portal on http://localhost:3000 and the Python engine in simulation mode).*

### 2. Run Individual Components

#### Web Portal (`ipp-blueprint`):
```powershell
cd ipp-blueprint
npm run dev      # http://localhost:3000
npm run build    # Production build
npm run lint     # Lint check
```

#### Intrusion Detection Engine (`Intrusion-Detection_system`):
```powershell
cd Intrusion-Detection_system

# Run safe simulation / monitoring mode:
python main.py --simulate

# Run active Windows Firewall blocking (Run PowerShell as Administrator):
python main.py

# Run attack simulation tests:
python test_ips.py
```

#### AI Threat Analysis:
```powershell
# NVIDIA Nemotron 3.5 deep threat inspection:
python Intrusion-Detection_system/nemotron_analyzer.py

# Google Gemma 4 31B reasoning:
python Intrusion-Detection_system/gemma_client.py
```
