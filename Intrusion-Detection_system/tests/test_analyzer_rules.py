"""
Unit tests for IntrusionAnalyzer detection logic:
- Port scan threshold & time window
- SYN flood detection
- ICMP flood detection
- Blacklist enforcement & Whitelist bypass
- Sensitive port probing
"""
from __future__ import annotations

import unittest
from unittest.mock import MagicMock

from analyzer import IntrusionAnalyzer


class TestAnalyzerDetectionRules(unittest.TestCase):

    def setUp(self):
        self.mock_blocker = MagicMock()
        self.rules = {
            "general": {
                "whitelist": ["127.0.0.1", "10.0.0.1"]
            },
            "rate_limits": {
                "port_scan": {"threshold_ports": 5, "time_window_seconds": 3},
                "syn_flood": {"threshold_packets": 10, "time_window_seconds": 2},
                "icmp_flood": {"threshold_packets": 8, "time_window_seconds": 2}
            },
            "blacklisted_ips": ["198.51.100.99"],
            "sensitive_ports": [22, 3389],
            "payload_signatures": [
                {"name": "XSS Test", "pattern": r"<script>"}
            ]
        }
        self.analyzer = IntrusionAnalyzer(rules=self.rules, blocker=self.mock_blocker)

    def test_whitelist_bypasses_all_inspections(self):
        # Even if whitelisted IP sends an exploit or probes sensitive ports, no block
        self.analyzer.inspect_packet(
            src_ip="10.0.0.1",
            dst_ip="10.0.0.5",
            protocol="TCP",
            dst_port=22,
            payload_bytes=b"<script>alert(1)</script>"
        )
        self.mock_blocker.block_ip.assert_not_called()

    def test_blacklisted_ip_triggers_immediate_block(self):
        self.analyzer.inspect_packet(
            src_ip="198.51.100.99",
            dst_ip="10.0.0.5",
            protocol="TCP",
            dst_port=80
        )
        self.mock_blocker.block_ip.assert_called_once()
        args, kwargs = self.mock_blocker.block_ip.call_args
        self.assertEqual(args[0], "198.51.100.99")
        self.assertEqual(kwargs.get("severity"), "CRITICAL")

    def test_port_scan_detection_threshold(self):
        scanner_ip = "203.0.113.15"

        # 4 distinct ports -> below threshold (5)
        for port in [80, 443, 8080, 8443]:
            self.analyzer.inspect_packet(
                src_ip=scanner_ip,
                dst_ip="10.0.0.5",
                protocol="TCP",
                dst_port=port
            )
        self.mock_blocker.block_ip.assert_not_called()

        # 5th distinct port -> reaches threshold
        self.analyzer.inspect_packet(
            src_ip=scanner_ip,
            dst_ip="10.0.0.5",
            protocol="TCP",
            dst_port=9000
        )
        self.mock_blocker.block_ip.assert_called_once()
        args, _ = self.mock_blocker.block_ip.call_args
        self.assertEqual(args[0], scanner_ip)
        self.assertIn("Port scanning detected", args[1])

    def test_syn_flood_detection(self):
        flooder_ip = "203.0.113.88"

        # Send 9 SYN packets -> below threshold (10)
        for _ in range(9):
            self.analyzer.inspect_packet(
                src_ip=flooder_ip,
                dst_ip="10.0.0.5",
                protocol="TCP",
                tcp_flags="S"
            )
        self.mock_blocker.block_ip.assert_not_called()

        # 10th SYN packet -> triggers block
        self.analyzer.inspect_packet(
            src_ip=flooder_ip,
            dst_ip="10.0.0.5",
            protocol="TCP",
            tcp_flags="S"
        )
        self.mock_blocker.block_ip.assert_called_once()
        args, _ = self.mock_blocker.block_ip.call_args
        self.assertEqual(args[0], flooder_ip)
        self.assertIn("SYN flood detected", args[1])

    def test_icmp_flood_detection(self):
        pinger_ip = "198.51.100.77"

        # Send 7 ICMP packets -> below threshold (8)
        for _ in range(7):
            self.analyzer.inspect_packet(
                src_ip=pinger_ip,
                dst_ip="10.0.0.5",
                protocol="ICMP"
            )
        self.mock_blocker.block_ip.assert_not_called()

        # 8th ICMP packet -> triggers block
        self.analyzer.inspect_packet(
            src_ip=pinger_ip,
            dst_ip="10.0.0.5",
            protocol="ICMP"
        )
        self.mock_blocker.block_ip.assert_called_once()
        args, _ = self.mock_blocker.block_ip.call_args
        self.assertEqual(args[0], pinger_ip)
        self.assertIn("ICMP Ping flood detected", args[1])


if __name__ == "__main__":
    unittest.main()
