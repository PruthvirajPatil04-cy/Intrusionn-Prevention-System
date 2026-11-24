"""
Unit tests for pluggable SIEM log sinks (JSONL, Syslog RFC 5424, ArcSight CEF, IBM QRadar LEEF).
"""
from __future__ import annotations

import json
import unittest

from log_sinks import CefLogSink, JsonlLogSink, LeefLogSink, SyslogRfc5424Sink


class TestLogSinks(unittest.TestCase):

    def setUp(self):
        self.sample_event = {
            "event_id": "test-uuid-41123",
            "ts": "2026-11-21T08:30:00Z",
            "severity": "CRITICAL",
            "src_ip": "198.51.100.42",
            "dst_ip": "10.0.0.10",
            "rule_id": "RULE-SQLI-DPI",
            "action": "FIREWALL_BLOCKED",
            "alert_type": "SQL_INJECTION",
            "correlation_id": "corr-uuid-99",
            "details": "Malicious UNION SELECT detected in HTTP body"
        }

    def test_jsonl_log_sink(self):
        sink = JsonlLogSink()
        formatted = sink.format_event(self.sample_event)
        data = json.loads(formatted)
        self.assertEqual(data["event_id"], "test-uuid-41123")
        self.assertEqual(data["src_ip"], "198.51.100.42")
        self.assertEqual(data["severity"], "CRITICAL")

    def test_syslog_rfc5424_sink(self):
        sink = SyslogRfc5424Sink(app_name="IPS-Test")
        formatted = sink.format_event(self.sample_event)
        self.assertTrue(formatted.startswith("<129>1 "))  # Critical severity code
        self.assertIn("IPS-Test", formatted)
        self.assertIn('ruleId="RULE-SQLI-DPI"', formatted)
        self.assertIn('src="198.51.100.42"', formatted)
        self.assertIn("UNION SELECT", formatted)

    def test_cef_log_sink(self):
        sink = CefLogSink()
        formatted = sink.format_event(self.sample_event)
        self.assertTrue(formatted.startswith("CEF:0|Cybersecurity|IPS-Engine|1.0|RULE-SQLI-DPI|SQL_INJECTION|10|"))
        self.assertIn("src=198.51.100.42", formatted)
        self.assertIn("dst=10.0.0.10", formatted)
        self.assertIn("act=FIREWALL_BLOCKED", formatted)
        self.assertIn("externalId=corr-uuid-99", formatted)

    def test_leef_log_sink(self):
        sink = LeefLogSink()
        formatted = sink.format_event(self.sample_event)
        self.assertTrue(formatted.startswith("LEEF:2.0|Cybersecurity|IPS-Engine|1.0|RULE-SQLI-DPI|x09|"))
        self.assertIn("src=198.51.100.42", formatted)
        self.assertIn("action=FIREWALL_BLOCKED", formatted)
        self.assertIn("sev=CRITICAL", formatted)


if __name__ == "__main__":
    unittest.main()
