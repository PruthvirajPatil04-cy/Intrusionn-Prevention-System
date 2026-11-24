"""
Unit tests for AlertEnricher offline GeoIP, ASN, and reputation scoring.
"""
from __future__ import annotations

import unittest

from enrichment import AlertEnricher


class TestAlertEnricher(unittest.TestCase):

    def setUp(self):
        self.enricher = AlertEnricher()

    def test_private_network_classification(self):
        country, asn = self.enricher.lookup_ip("192.168.1.50")
        self.assertEqual(country, "PRIVATE")
        self.assertEqual(asn, "RFC1918 Private Network")

        country_lb, _ = self.enricher.lookup_ip("127.0.0.1")
        self.assertEqual(country_lb, "PRIVATE")

    def test_known_public_asn_lookup(self):
        country, asn = self.enricher.lookup_ip("8.8.8.8")
        self.assertEqual(country, "US")
        self.assertIn("Google", asn)

        country_cf, asn_cf = self.enricher.lookup_ip("1.1.1.1")
        self.assertEqual(country_cf, "AU")
        self.assertIn("Cloudflare", asn_cf)

    def test_reputation_scoring(self):
        score_crit = self.enricher.calculate_reputation_score("CRITICAL", "FIREWALL_BLOCKED")
        self.assertEqual(score_crit, 100)

        score_low = self.enricher.calculate_reputation_score("LOW", "MONITORED")
        self.assertEqual(score_low, 25)

    def test_enrich_full_alert_record(self):
        raw_alert = {
            "src_ip": "198.51.100.42",
            "severity": "HIGH",
            "action": "SIMULATED_BLOCK",
        }
        enriched = self.enricher.enrich(raw_alert)
        self.assertIn("geo_country", enriched)
        self.assertIn("geo_asn", enriched)
        self.assertIn("reputation_score", enriched)
        self.assertEqual(enriched["reputation_score"], 80)


if __name__ == "__main__":
    unittest.main()
