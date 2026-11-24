"""
Unit tests for Blocker security validation and subprocess command safety.
"""
from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

from blocker import (
    Blocker,
    validate_ip_address,
    validate_rule_name,
)
from exceptions import InvalidIPAddressError, InvalidRuleNameError


class TestBlockerValidation(unittest.TestCase):

    def test_valid_ipv4_addresses(self):
        valid_ips = ["192.168.1.1", "10.0.0.1", "172.16.254.1", "8.8.8.8"]
        for ip in valid_ips:
            self.assertEqual(validate_ip_address(ip), ip)

    def test_valid_ipv6_addresses(self):
        valid_ipv6 = ["2001:db8::1", "::1", "fe80::1"]
        for ip in valid_ipv6:
            self.assertTrue(":" in validate_ip_address(ip))

    def test_valid_cidr_networks(self):
        valid_cidrs = ["192.168.1.0/24", "10.0.0.0/8"]
        for cidr in valid_cidrs:
            self.assertEqual(validate_ip_address(cidr), cidr)

    def test_invalid_ip_formats_rejected(self):
        invalid_ips = [
            "192.168.1.300",
            "not-an-ip",
            "192.168.1.1; calc.exe",
            "192.168.1.1 && whoami",
            "192.168.1.1|netsh",
            "192.168.1.1\ncat /etc/passwd",
            "",
            None,  # type: ignore
        ]
        for bad_ip in invalid_ips:
            with self.assertRaises(InvalidIPAddressError):
                validate_ip_address(bad_ip)

    def test_valid_rule_names(self):
        valid_names = ["IPS_BLOCK_192_168_1_1", "Rule-1", "Rule_2", "Safe Rule Name"]
        for name in valid_names:
            self.assertEqual(validate_rule_name(name), name)

    def test_invalid_rule_names_rejected(self):
        invalid_names = [
            "Rule&whoami",
            "Rule;calc.exe",
            "Rule|dir",
            "Rule`echo test`",
            "A" * 100,  # exceeds 64 chars
            "",
            None  # type: ignore
        ]
        for bad_name in invalid_names:
            with self.assertRaises(InvalidRuleNameError):
                validate_rule_name(bad_name)

    @patch("subprocess.run")
    def test_windows_argv_construction_exact(self, mock_run):
        mock_run.return_value = MagicMock(returncode=0)
        from firewall_backends import WindowsNetshBackend
        backend = WindowsNetshBackend()
        blocker = Blocker(simulation_mode=False, block_duration=60, backend=backend)

        test_ip = "203.0.113.50"
        success = blocker.backend.add_block(test_ip, f"IPS_BLOCK_{test_ip}")

        self.assertTrue(success)
        mock_run.assert_called_once()
        called_args, called_kwargs = mock_run.call_args

        # Verify command argument list structure (NO shell=True)
        argv = called_args[0]
        self.assertEqual(argv[0], "netsh")
        self.assertEqual(argv[1], "advfirewall")
        self.assertEqual(argv[2], "firewall")
        self.assertEqual(argv[3], "add")
        self.assertEqual(argv[4], "rule")
        self.assertEqual(argv[5], f"name=IPS_BLOCK_{test_ip}")
        self.assertEqual(argv[6], "dir=in")
        self.assertEqual(argv[7], "action=block")
        self.assertEqual(argv[8], f"remoteip={test_ip}")

        self.assertFalse(called_kwargs.get("shell", False))
        self.assertEqual(called_kwargs.get("timeout"), 10.0)


if __name__ == "__main__":
    unittest.main()
