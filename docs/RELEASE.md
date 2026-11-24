# Intrusion Prevention System — Release & Deployment Guide

This document defines the release checklist, configuration parameters, deployment steps, and rollback procedures for deploying the **Intrusion Prevention System (IPS)** and **IPP Blueprint Web Portal**.

---

## 1. Pre-Deployment Verification Checklist

Before releasing a new build to staging or production, execute the following verification steps:

- [ ] **Python Engine Linter:** Run `ruff check .` in `Intrusion-Detection_system` (must be 0 errors).
- [ ] **Python Test Suite:** Run `pytest -v` in `Intrusion-Detection_system` (all 39 tests must pass).
- [ ] **Frontend Linter:** Run `npm run lint` in `ipp-blueprint` (0 ESLint warnings/errors).
- [ ] **Frontend Unit Tests:** Run `npm run test` in `ipp-blueprint` (all 21 unit tests must pass).
- [ ] **E2E Browser Tests:** Run `npx playwright test` in `ipp-blueprint` (all 3 E2E tests must pass).
- [ ] **Production Web Build:** Run `npm run build` in `ipp-blueprint` (all 16 routes must compile cleanly).
- [ ] **Secrets Verification:** Ensure no `.env` files or API keys are committed in Git.

---

## 2. Environment Variables Reference

| Variable Name | Component | Default | Description |
| :--- | :--- | :--- | :--- |
| `IPS_API_SECRET` | Web & Engine | `ips-dev-secret-token` | Shared secret key for Bearer token authentication on `/api/ips` and `/api/ips/containment`. |
| `FIREWALL_BACKEND` | Engine | Auto-detected | Firewall driver: `netsh` (Windows), `nftables` (Linux), `iptables` (Linux fallback), or `simulation`. |
| `LOG_SINKS` | Engine | `jsonl,cef,syslog,leef` | Comma-separated list of active SIEM export formats. |
| `NEMOTRON_API_KEY` | Engine | None (Optional) | NVIDIA NIM cloud API key for Nemotron 3.5 AI threat explanations. |
| `GEMMA_API_KEY` | Engine | None (Optional) | NVIDIA NIM API key for Google Gemma 4 31B AI reasoning. |
| `NODE_ENV` | Web | `production` | Node.js runtime environment. |

---

## 3. Deployment Instructions

### Option A: Docker Compose Deployment (Recommended for Linux/Cloud)
1. Configure `.env` file with your `IPS_API_SECRET` and optional AI keys.
2. Build and launch services in background mode:
   ```bash
   docker compose up -d --build
   ```
3. Inspect running service logs:
   ```bash
   docker compose logs -f
   ```

### Option B: Bare-Metal Windows Deployment
1. **Engine Deployment (Administrator PowerShell):**
   ```powershell
   cd Intrusion-Detection_system
   pip install -r requirements.txt
   python main.py
   ```
2. **Web Portal Deployment:**
   ```powershell
   cd ipp-blueprint
   npm ci
   npm run build
   npm run start
   ```

---

## 4. Post-Deployment Verification & Smoke Test

1. **Verify Web Portal Access:** Navigate to `http://localhost:3000` and confirm the Executive Dashboard loads with the "Engine Connected" and "Auth Secured" badges.
2. **Verify Prometheus Metrics:**
   ```bash
   curl -s http://localhost:9100/metrics | grep ips_packets_processed_total
   ```
3. **Verify API Authentication Guard:**
   ```bash
   # Unauthenticated call must return HTTP 401
   curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/ips
   # Expected output: 401
   ```
4. **Trigger Synthetic Test Alert:** Click **"Simulate Attack Traffic"** on the dashboard, or run:
   ```powershell
   python Intrusion-Detection_system/test_ips.py
   ```
   Confirm that the alert appears in real-time in the dashboard table and is written to `logs/ips_alerts.jsonl`.

---

## 5. Rollback Procedure

In the event of an unrecoverable failure during deployment:

1. **Flush Firewall Rules:**
   * **Windows:** Remove any lingering rules starting with `IPS_BLOCK_`:
     ```powershell
     netsh advfirewall firewall show rule name=all | Select-String "IPS_BLOCK_"
     ```
   * **Linux:** Flush the dedicated nftables chain:
     ```bash
     nft flush chain inet ips_filter ips_input
     ```
2. **Revert Docker Containers:**
   ```bash
   docker compose down
   git checkout <PREVIOUS_STABLE_COMMIT_HASH>
   docker compose up -d --build
   ```
