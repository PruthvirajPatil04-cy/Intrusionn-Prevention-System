"""
Unit tests for pluggable cross-platform FirewallBackend implementations.
"""
from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

from firewall_backends import (
    LinuxNftablesBackend,
    SimulationBackend,
    WindowsNetshBackend,
    get_firewall_backend,
)


class TestFirewallBackends(unittest.TestCase):

    @patch("subprocess.run")
    def test_windows_netsh_backend_add_and_remove(self, mock_run):
        mock_run.return_value = MagicMock(returncode=0)
        backend = WindowsNetshBackend()
        self.assertEqual(backend.name, "WindowsNetshBackend")

        # Add block
        res_add = backend.add_block("198.51.100.22", "IPS_BLOCK_198_51_100_22")
        self.assertTrue(res_add)
        mock_run.assert_called_once()
        args, kwargs = mock_run.call_args
        cmd = args[0]
        self.assertEqual(cmd[0], "netsh")
        self.assertEqual(cmd[1], "advfirewall")
        self.assertEqual(cmd[2], "firewall")
        self.assertEqual(cmd[3], "add")
        self.assertEqual(cmd[4], "rule")
        self.assertEqual(cmd[5], "name=IPS_BLOCK_198_51_100_22")
        self.assertEqual(cmd[8], "remoteip=198.51.100.22")
        self.assertFalse(kwargs.get("shell", False))

        # Remove block
        mock_run.reset_mock()
        res_del = backend.remove_block("198.51.100.22", "IPS_BLOCK_198_51_100_22")
        self.assertTrue(res_del)
        args_del, kwargs_del = mock_run.call_args
        self.assertEqual(args_del[0][3], "delete")
        self.assertFalse(kwargs_del.get("shell", False))

    @patch("subprocess.run")
    def test_linux_nftables_backend(self, mock_run):
        mock_run.return_value = MagicMock(returncode=0)
        backend = LinuxNftablesBackend(use_iptables_fallback=False)
        self.assertEqual(backend.name, "LinuxNftablesBackend")

        # Add block with nftables
        res = backend.add_block("203.0.113.88", "IPS_BLOCK_203_0_113_88")
        self.assertTrue(res)
        cmd = mock_run.call_args[0][0]
        self.assertEqual(cmd[0], "nft")
        self.assertIn("203.0.113.88", cmd)
        self.assertFalse(mock_run.call_args[1].get("shell", False))

    @patch("subprocess.run")
    def test_linux_iptables_fallback_backend(self, mock_run):
        mock_run.return_value = MagicMock(returncode=0)
        backend = LinuxNftablesBackend(use_iptables_fallback=True)
        self.assertEqual(backend.name, "LinuxIptablesBackend")

        # Add block with iptables
        res = backend.add_block("203.0.113.99", "IPS_BLOCK_203_0_113_99")
        self.assertTrue(res)
        cmd = mock_run.call_args[0][0]
        self.assertEqual(cmd[0], "iptables")
        self.assertEqual(cmd[1], "-I")
        self.assertEqual(cmd[2], "INPUT")
        self.assertEqual(cmd[4], "203.0.113.99")
        self.assertEqual(cmd[6], "DROP")

    def test_simulation_backend(self):
        backend = SimulationBackend()
        self.assertEqual(backend.name, "SimulationBackend")
        self.assertTrue(backend.is_supported())

        backend.add_block("10.0.0.99", "IPS_RULE_1")
        self.assertIn("10.0.0.99", backend.list_blocks())

        backend.remove_block("10.0.0.99", "IPS_RULE_1")
        self.assertNotIn("10.0.0.99", backend.list_blocks())

    def test_factory_backend_selection(self):
        sim = get_firewall_backend("simulation")
        self.assertIsInstance(sim, SimulationBackend)

        netsh = get_firewall_backend("netsh")
        self.assertIsInstance(netsh, WindowsNetshBackend)

        nft = get_firewall_backend("nftables")
        self.assertIsInstance(nft, LinuxNftablesBackend)


if __name__ == "__main__":
    unittest.main()
