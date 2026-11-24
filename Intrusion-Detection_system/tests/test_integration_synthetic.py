"""
Integration test: Feeds synthetic Scapy packets through the capture pipeline
and asserts expected threat detection and firewall blocking decisions.
Uses dependency injection so tests run without live network adapters.
"""
from __future__ import annotations

import unittest
from unittest.mock import MagicMock

from scapy.all import ICMP, IP, TCP, Raw

from analyzer import IntrusionAnalyzer
from sniffer import PacketSniffer


class TestSyntheticPacketIntegration(unittest.TestCase):

    def setUp(self):
        self.mock_blocker = MagicMock()
        self.rules = {
            "general": {"whitelist": ["127.0.0.1"]},
            "rate_limits": {
                "port_scan": {"threshold_ports": 3, "time_window_seconds": 5},
                "syn_flood": {"threshold_packets": 5, "time_window_seconds": 3},
                "icmp_flood": {"threshold_packets": 4, "time_window_seconds": 2}
            },
            "blacklisted_ips": [],
            "sensitive_ports": [22],
            "payload_signatures": [
                {"name": "Remote Code Execution", "pattern": r"(?i)/bin/(bash|sh)"}
            ]
        }
        self.analyzer = IntrusionAnalyzer(rules=self.rules, blocker=self.mock_blocker)
        self.sniffer = PacketSniffer(analyzer=self.analyzer, queue_size=100, worker_threads=1)

    def test_synthetic_rce_payload_detection(self):
        # Construct synthetic IP/TCP packet with payload
        packet = (
            IP(src="198.51.100.22", dst="10.0.0.8") /
            TCP(sport=50000, dport=80, flags="PA") /
            Raw(load=b"POST /api/cmd HTTP/1.1\r\n\r\ncmd=/bin/bash -c id")
        )

        # Feed directly through sniffer packet processor
        self.sniffer._process_single_packet(packet)

        # Assert blocker was invoked
        self.mock_blocker.block_ip.assert_called_once()
        args, kwargs = self.mock_blocker.block_ip.call_args
        self.assertEqual(args[0], "198.51.100.22")
        self.assertIn("Remote Code Execution", args[1])
        self.assertEqual(kwargs.get("severity"), "CRITICAL")

    def test_synthetic_port_scan_detection(self):
        attacker_ip = "198.51.100.33"

        for port in [21, 22, 23]:
            pkt = (
                IP(src=attacker_ip, dst="10.0.0.8") /
                TCP(sport=40000, dport=port, flags="S")
            )
            self.sniffer._process_single_packet(pkt)

        self.mock_blocker.block_ip.assert_called_once()
        args, _ = self.mock_blocker.block_ip.call_args
        self.assertEqual(args[0], attacker_ip)
        self.assertIn("Port scanning detected", args[1])

    def test_synthetic_icmp_flood(self):
        flooder_ip = "198.51.100.44"

        for _ in range(4):
            pkt = IP(src=flooder_ip, dst="10.0.0.8") / ICMP()
            self.sniffer._process_single_packet(pkt)

        self.mock_blocker.block_ip.assert_called_once()
        args, _ = self.mock_blocker.block_ip.call_args
        self.assertEqual(args[0], flooder_ip)
        self.assertIn("ICMP Ping flood detected", args[1])


if __name__ == "__main__":
    unittest.main()
