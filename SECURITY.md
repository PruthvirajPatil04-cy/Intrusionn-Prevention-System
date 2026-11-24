# Security Policy & Vulnerability Disclosure

## Supported Versions

| Version | Supported          | Security Maintenance Status |
| :---    | :---               | :---                        |
| 1.1.x   | :white_check_mark: | Active (Current)            |
| 1.0.x   | :x:                | Deprecated                  |

---

## Reporting a Vulnerability

The development team takes security and safe socket operations with the utmost seriousness. If you discover a potential vulnerability in the Intrusion Prevention Engine or Web Portal, please follow the coordinated disclosure policy below:

1. **Do not create public GitHub issues** for suspected zero-day vulnerabilities or security exploits.
2. Email the maintainer directly at: **`prithvirajpatil455@gmail.com`**
3. Include the following details in your report:
   * Description of the vulnerability and attack vector.
   * Proof of Concept (PoC) script or curl/packet command.
   * Component affected (`Intrusion-Detection_system`, `ipp-blueprint`, or API bridge).
   * Remediation suggestions if available.

### Response Timelines
* **Initial Acknowledgment:** Within 48 hours.
* **Triage & Severity Assessment:** Within 5 business days.
* **Coordinated Patch & Advisory Release:** Within 30 days of validation.

---

## Security Hardening Guarantees

* **Zero Shell Execution:** All firewall interactions and subprocess bridges operate with argument arrays and `shell=False`.
* **Strict Input Validation:** All IP addresses are validated with `ipaddress.ip_address` / CIDR parsers; rule names conform to strict allowlists (`^[A-Za-z0-9_.\- ]{1,64}$`).
* **ReDoS Protection:** All deep packet inspection regular expressions are bounded with match timeout budgets (`timeout=0.05s`).
* **Authentication & Rate Limiting:** All `/api/ips` and `/api/ips/containment` endpoints require valid Bearer authentication tokens and are rate-limited per IP.
* **Content Security Policy:** Strict CSP, HSTS, and frame-ancestors headers are enforced across all web views.
