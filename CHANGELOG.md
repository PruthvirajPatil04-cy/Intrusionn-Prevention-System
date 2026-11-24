# Changelog

All notable changes to the **Intrusion Prevention System (IPS) & Enterprise IPP Blueprint** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-11-21

### Security (P0)
- **Eliminated Command Injection:** Refactored `blocker.py` and API bridges from shell execution to strict argument arrays with `shell=False` and explicit 10s subprocess timeouts.
- **Strict IP/CIDR Typing:** Enforced standard library `ipaddress.ip_address` and `ipaddress.ip_network` parsing across all blocking functions.
- **Rule Name Allowlisting:** Enforced strict regex `^[A-Za-z0-9_.\- ]{1,64}$` for firewall rule names.
- **ReDoS Mitigation:** Replaced standard regex engine with `regex` module enforcing 50ms per-match timeout budgets (`REDOS_TIMEOUT_SECONDS = 0.05`) to prevent catastrophic backtracking.
- **API Authentication:** Added Bearer token and `X-IPS-Auth-Token` authentication guards to `/api/ips` and containment endpoints, rejecting unauthenticated calls with HTTP 401.
- **Input Validation:** Enforced Zod schemas with `.strict()` rejection of unexpected fields across all API endpoints, returning HTTP 400.
- **Rate Limiting:** Introduced in-memory token-bucket rate limiter via `lru-cache`, returning HTTP 429 with `Retry-After`.
- **Security Headers & CSP:** Implemented Content Security Policy, X-Frame-Options (`DENY`), X-Content-Type-Options (`nosniff`), Referrer-Policy, and HSTS.

### Robustness & Performance (P1)
- **Asynchronous Pipeline:** Decoupled packet capture from inspection in `sniffer.py` using a bounded `queue.Queue(10000)` and worker thread pool with `sniff(store=0)`.
- **Structured JSONL Logging:** Emitted modern enterprise schema (`event_id`, `ts`, `severity`, `src_ip`, `dst_ip`, `rule_id`, `action`, `latency_ms`, `correlation_id`) documented in `docs/LOG_SCHEMA.md`.
- **Real-Time SSE Alert Stream:** Added `/api/ips/stream` Server-Sent Events endpoint pushing live threat events with 15s heartbeats and automatic browser polling fallback.
- **Unified State Management:** Introduced Zustand persistent store in `lib/store.ts` for checklist progress, active filters, and theme preferences.
- **Comprehensive Testing:** Added 39 pytest tests (rules, synthetic packets, backends) and 21 Node/Playwright tests.

### Cross-Platform & Extensibility (P2)
- **Pluggable Firewall Abstraction:** Implemented `FirewallBackend` with `WindowsNetshBackend`, `LinuxNftablesBackend` (with iptables fallback), and `SimulationBackend`.
- **Docker Support:** Created `Dockerfile` for engine and web portal, along with `docker-compose.yml` configured for host networking and `NET_ADMIN`/`NET_RAW` capabilities.
- **TLS Inspection & JA3/JA4:** Implemented RFC 5246 TLS ClientHello dissector in `tls_inspector.py`, extracting SNI, calculating JA3 MD5 hashes and JA4 fingerprints, and blocking known C2 signatures.
- **Performance Plan:** Published `docs/PERF.md` detailing user-space Scapy limitations and eBPF/XDP zero-copy roadmap.

### Enterprise Observability & Containment (P3)
- **Prometheus Metrics:** Added `/metrics` exporter tracking packet rates, buffer drops, alert distributions, and analysis latency.
- **SIEM Export Sinks:** Added ArcSight CEF, Syslog RFC 5424, and IBM QRadar LEEF formatters in `log_sinks.py`.
- **Threat Intelligence Feeds:** Added MISP and AlienVault OTX connector interfaces with resilient offline file caching.
- **GeoIP & Reputation:** Added offline GeoIP, ASN lookup, and 0-100 reputation scoring in `enrichment.py`.
- **SOC Containment API:** Added `/api/ips/containment` enabling audited, authenticated emergency IP/domain blocking with operator identities.

---

## [1.0.0] - 2026-11-20
- Initial prototype release of Python detection engine and Next.js IPP Blueprint web portal.
