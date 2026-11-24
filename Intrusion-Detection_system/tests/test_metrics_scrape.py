"""
Unit tests for Prometheus metrics collection and plaintext scraping.
"""
from __future__ import annotations

import unittest

from metrics_exporter import (
    get_metrics_plaintext,
    record_alert,
    record_block_op,
    record_packet_dropped,
    record_packet_processed,
    set_quarantine_count,
)


class TestMetricsScrape(unittest.TestCase):

    def test_metrics_collection_and_scrape(self):
        # Record sample events
        record_packet_processed()
        record_packet_dropped()
        record_alert(severity="CRITICAL", rule_id="RULE-TEST-01", action="FIREWALL_BLOCKED")
        record_block_op(action="BLOCK", backend="WindowsNetsh")
        set_quarantine_count(5)

        # Scrape metrics text
        metrics_text = get_metrics_plaintext()

        # Assert Prometheus metrics format
        self.assertIn("ips_packets_processed_total", metrics_text)
        self.assertIn("ips_packets_dropped_total", metrics_text)
        self.assertIn("ips_alerts_total", metrics_text)
        self.assertIn("ips_firewall_blocks_total", metrics_text)
        self.assertIn("ips_active_quarantine_ips", metrics_text)
        self.assertIn('severity="CRITICAL"', metrics_text)


if __name__ == "__main__":
    unittest.main()
