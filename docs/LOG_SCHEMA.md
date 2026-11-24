# Intrusion Prevention System — Structured Log Schema (JSONL)

This document defines the structured JSON Lines (`.jsonl`) event record format emitted by the IPS engine to `logs/ips_alerts.jsonl`. It is designed for seamless ingestion by SIEM/SOAR platforms (Splunk, Elastic SIEM, Microsoft Sentinel, Wazuh).

---

## 1. Event Record Specification

Each line in `logs/ips_alerts.jsonl` contains a single JSON object with the following fields:

| Field Name | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `event_id` | `string (UUIDv4)` | Yes | Globally unique identifier for this intrusion event | `"550e8400-e29b-41d4-a716-446655440000"` |
| `ts` | `string (ISO 8601)` | Yes | UTC timestamp with millisecond precision | `"2026-11-21T08:15:30.123456+00:00"` |
| `severity` | `enum` | Yes | Threat rating: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` | `"CRITICAL"` |
| `src_ip` | `string` | Yes | Validated IPv4 or IPv6 address of the attacker | `"198.51.100.42"` |
| `dst_ip` | `string \| null` | Yes | Target protected host or subnet (null if network-wide) | `"10.0.0.15"` |
| `rule_id` | `string` | Yes | Standardized identifier of detection rule triggered | `"RULE-SQL-INJECTION-DPI"` |
| `action` | `enum` | Yes | Enforcement action executed | `"FIREWALL_BLOCKED"`, `"SIMULATED_BLOCK"`, `"MONITORED"`, `"BLOCK_FAILED"` |
| `latency_ms` | `float` | Yes | Pipeline latency from packet receipt to decision in ms | `1.42` |
| `correlation_id` | `string (UUIDv4)` | Yes | Trace identifier linking multi-stage attack sessions | `"c8a6e872-3580-496a-a1b7-b05c935d259c"` |
| `details` | `string` | Yes | Human-readable explanation and rule telemetry | `"Malicious payload signature matched: 'SQL Injection Pattern' (TTL: 300s)"` |

---

## 2. Example Log Entries

### A. SQL Injection Payload Detected & Blocked (DPI)
```json
{
  "event_id": "84d59a51-95be-4357-8176-7871b964ee71",
  "ts": "2026-11-21T13:30:15.823901+00:00",
  "severity": "CRITICAL",
  "src_ip": "198.51.100.42",
  "dst_ip": "10.0.0.25",
  "rule_id": "RULE-PAYLOAD-DPI-SQLI",
  "action": "FIREWALL_BLOCKED",
  "latency_ms": 1.15,
  "correlation_id": "f51da039-ec98-4672-8884-2a66fbc4b251",
  "details": "Malicious payload signature matched: 'SQL Injection Pattern' (TTL: 300s)"
}
```

### B. Port Scanning Detected (Threshold Exceeded)
```json
{
  "event_id": "a93e32b4-3294-4742-b062-81736b472e39",
  "ts": "2026-11-21T13:30:20.104231+00:00",
  "severity": "HIGH",
  "src_ip": "203.0.113.88",
  "dst_ip": null,
  "rule_id": "RULE-PORT-SCAN",
  "action": "FIREWALL_BLOCKED",
  "latency_ms": 0.85,
  "correlation_id": "73bb1e19-5431-4a41-b8ef-580796b42b10",
  "details": "Port scanning detected (15 ports targeted in 5s) (TTL: 300s)"
}
```

### C. Sensitive Port Probe Monitored
```json
{
  "event_id": "3b29c91f-5062-4217-ba50-13f8c8574ab9",
  "ts": "2026-11-21T13:30:22.450192+00:00",
  "severity": "MEDIUM",
  "src_ip": "192.168.1.150",
  "dst_ip": "192.168.1.10",
  "rule_id": "RULE-SENSITIVE-PORT-PROBE",
  "action": "MONITORED",
  "latency_ms": 0.40,
  "correlation_id": "e2f07399-5477-4b72-8703-d14cf396ab9e",
  "details": "Targeted sensitive port 22 (SSH)"
}
```
