"""
Unit tests for safe regex compilation and ReDoS timeout protections in IntrusionAnalyzer.
"""
from __future__ import annotations

import time
import unittest
from unittest.mock import MagicMock

from analyzer import IntrusionAnalyzer


class TestRegexSecurity(unittest.TestCase):

    def setUp(self):
        self.mock_blocker = MagicMock()

    def test_safe_signatures_compile_and_match(self):
        rules = {
            "general": {"whitelist": []},
            "blacklisted_ips": [],
            "sensitive_ports": [],
            "payload_signatures": [
                {"name": "SQL Injection Pattern", "pattern": r"(?i)(UNION\s+SELECT|SELECT\s+.*\s+FROM)"}
            ]
        }
        analyzer = IntrusionAnalyzer(rules=rules, blocker=self.mock_blocker)
        self.assertEqual(len(analyzer.payload_signatures), 1)

        # Trigger match with attack payload
        analyzer.inspect_packet(
            src_ip="198.51.100.20",
            dst_ip="10.0.0.5",
            protocol="TCP",
            src_port=4444,
            dst_port=80,
            payload_bytes=b"GET /search?q=1 UNION SELECT username, password FROM users HTTP/1.1"
        )
        self.mock_blocker.block_ip.assert_called_once()
        args, kwargs = self.mock_blocker.block_ip.call_args
        self.assertEqual(args[0], "198.51.100.20")
        self.assertIn("SQL Injection Pattern", args[1])

    def test_invalid_regex_rejected_at_startup(self):
        rules = {
            "payload_signatures": [
                {"name": "Broken Regex", "pattern": r"[unclosed-bracket"}
            ]
        }
        with self.assertRaises(ValueError):
            IntrusionAnalyzer(rules=rules, blocker=self.mock_blocker)

    def test_catastrophic_redos_pattern_bounded(self):
        """
        Tests that an evil regex like (a+)+$ evaluated against a non-matching string
        like 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaa!' does not hang the process indefinitely.
        """
        evil_pattern = r"(a+)+$"
        rules = {
            "general": {"whitelist": []},
            "blacklisted_ips": [],
            "sensitive_ports": [],
            "payload_signatures": [
                {"name": "Evil ReDoS Pattern", "pattern": evil_pattern}
            ]
        }
        analyzer = IntrusionAnalyzer(rules=rules, blocker=self.mock_blocker)

        # Generate attack string causing exponential backtracking on unshielded regex
        evil_payload = (b"a" * 28) + b"!"

        start_time = time.time()
        analyzer.inspect_packet(
            src_ip="198.51.100.99",
            dst_ip="10.0.0.5",
            protocol="TCP",
            src_port=5555,
            dst_port=80,
            payload_bytes=evil_payload
        )
        elapsed = time.time() - start_time

        # Match must complete or time out in well under 1.5 seconds (budget is 0.05s)
        self.assertLess(elapsed, 1.5, f"ReDoS check took {elapsed:.2f}s, exceeding safety budget!")


if __name__ == "__main__":
    unittest.main()
