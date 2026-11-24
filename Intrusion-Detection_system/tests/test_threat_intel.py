"""
Unit tests for Threat Intelligence feeds (MISP, AlienVault OTX) and ThreatIntelManager caching.
"""
from __future__ import annotations

import json
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

from threat_intel import AlienVaultOtxFeed, MispFeed, ThreatIntelManager


class TestThreatIntel(unittest.TestCase):

    def test_misp_feed_fetch_with_mock_http(self):
        mock_response_data = {
            "response": {
                "Attribute": [
                    {"value": "198.51.100.123", "comment": "Cobalt Strike C2 Node"},
                    {"value": "malicious-phish.xyz", "comment": "Credential Harvesting Domain"}
                ]
            }
        }
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps(mock_response_data).encode("utf-8")
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            feed = MispFeed(base_url="https://misp.example.com", auth_key="secret-key")
            iocs = feed.fetch_iocs()

            self.assertEqual(len(iocs), 2)
            self.assertIn("198.51.100.123", iocs)
            self.assertEqual(iocs["198.51.100.123"], "Cobalt Strike C2 Node")
            self.assertIn("malicious-phish.xyz", iocs)

    def test_alienvault_otx_feed_with_mock_http(self):
        mock_response_data = {
            "results": [
                {"indicator": "203.0.113.77", "description": "Known Scanner IP"}
            ]
        }
        mock_resp = MagicMock()
        mock_resp.read.return_value = json.dumps(mock_response_data).encode("utf-8")
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            feed = AlienVaultOtxFeed(api_key="mock-otx-key")
            iocs = feed.fetch_iocs()

            self.assertEqual(len(iocs), 1)
            self.assertIn("203.0.113.77", iocs)

    def test_threat_intel_manager_caching_and_resilience(self, tmp_path=Path(".")):
        test_cache_file = tmp_path / "test_ti_cache.json"

        # Prepopulate cache file
        seed_data = {"198.51.100.1": "Seeded Threat"}
        with open(test_cache_file, "w", encoding="utf-8") as f:
            json.dump(seed_data, f)

        # Mock feed that fails with network error
        failing_feed = MagicMock()
        failing_feed.fetch_iocs.side_effect = Exception("Connection Timeout")
        failing_feed.name = "FailingFeed"

        mgr = ThreatIntelManager(feeds=[failing_feed], cache_path=test_cache_file)

        # Verify seeded cache was loaded
        is_mal, desc = mgr.check_indicator("198.51.100.1")
        self.assertTrue(is_mal)
        self.assertEqual(desc, "Seeded Threat")

        # Refresh feed with failure: should NOT raise, retains cached IOCs
        total = mgr.refresh_feeds()
        self.assertEqual(total, 1)

        # Benign check
        is_mal_clean, _ = mgr.check_indicator("8.8.8.8")
        self.assertFalse(is_mal_clean)

        # Cleanup test file
        if test_cache_file.exists():
            test_cache_file.unlink()


if __name__ == "__main__":
    unittest.main()
