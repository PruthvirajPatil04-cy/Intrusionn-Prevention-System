"""
Unit tests for TLS ClientHello parsing, JA3/JA4 fingerprinting, and SNI anomaly detection.
"""
from __future__ import annotations

import struct
import unittest

from tls_inspector import KNOWN_MALICIOUS_JA3_HASHES, parse_tls_client_hello


def build_synthetic_client_hello(sni_hostname: str = "secure.bank.com") -> bytes:
    """Builds a synthetic RFC 5246 compliant TLS 1.2 ClientHello byte array."""
    handshake_type = 0x01  # ClientHello
    client_version = 0x0303  # TLS 1.2
    random_bytes = b"\x00" * 32
    session_id = b""

    # Cipher suites: 0xc02f (TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256), 0xc030
    ciphers = struct.pack("!H", 4) + struct.pack("!HH", 0xC02F, 0xC030)
    comp_methods = b"\x01\x00"  # 1 compression method: null

    # Extension 0: SNI
    sni_bytes = sni_hostname.encode("utf-8")
    server_name_entry = struct.pack("!BH", 0, len(sni_bytes)) + sni_bytes
    server_name_list = struct.pack("!H", len(server_name_entry)) + server_name_entry
    ext_sni = struct.pack("!HH", 0x0000, len(server_name_list)) + server_name_list

    # Extension 10: Supported Groups (23 = secp256r1, 24 = secp384r1)
    groups = struct.pack("!HHH", 4, 23, 24)
    ext_groups = struct.pack("!HH", 0x000A, len(groups)) + groups

    # Extension 11: EC Point Formats (0 = uncompressed)
    ec_points = struct.pack("!BB", 1, 0)
    ext_ec_points = struct.pack("!HH", 0x000B, len(ec_points)) + ec_points

    extensions = ext_sni + ext_groups + ext_ec_points
    extensions_block = struct.pack("!H", len(extensions)) + extensions

    body = (
        struct.pack("!H", client_version)
        + random_bytes
        + struct.pack("!B", len(session_id))
        + session_id
        + ciphers
        + comp_methods
        + extensions_block
    )

    handshake_header = struct.pack("!B", handshake_type) + struct.pack("!I", len(body))[1:]
    record_header = struct.pack("!BHH", 0x16, 0x0301, len(handshake_header) + len(body))

    return record_header + handshake_header + body


class TestTLSInspector(unittest.TestCase):

    def test_parse_valid_tls_client_hello(self):
        raw = build_synthetic_client_hello(sni_hostname="api.enterprise.corp")
        info = parse_tls_client_hello(raw)

        self.assertIsNotNone(info)
        assert info is not None
        self.assertEqual(info.sni, "api.enterprise.corp")
        self.assertEqual(info.version, 0x0303)
        self.assertIn(0xC02F, info.ciphers)
        self.assertIn(0, info.extensions)  # SNI extension
        self.assertIn(10, info.extensions)  # Supported groups
        self.assertIn(11, info.extensions)  # EC point formats

        # Verify JA3 calculation
        self.assertTrue(len(info.ja3_string) > 0)
        self.assertEqual(len(info.ja3_hash), 32)
        self.assertFalse(info.has_suspicious_sni())

    def test_suspicious_sni_detection(self):
        raw = build_synthetic_client_hello(sni_hostname="dark-exfiltrator-c2.xyz")
        info = parse_tls_client_hello(raw)

        self.assertIsNotNone(info)
        assert info is not None
        self.assertEqual(info.sni, "dark-exfiltrator-c2.xyz")
        self.assertTrue(info.has_suspicious_sni())

    def test_known_c2_ja3_fingerprint_detection(self):
        raw = build_synthetic_client_hello(sni_hostname="legitimate-looking.com")
        info = parse_tls_client_hello(raw)
        self.assertIsNotNone(info)
        assert info is not None

        # Simulate matching a known malicious C2 JA3 hash
        known_cobalt_strike_hash = "a0e9f5d64349fb13191bc781f81f42e1"
        info.ja3_hash = known_cobalt_strike_hash

        is_c2, mal_name = info.is_malicious_ja3()
        self.assertTrue(is_c2)
        self.assertEqual(mal_name, KNOWN_MALICIOUS_JA3_HASHES[known_cobalt_strike_hash])

    def test_non_tls_packet_returns_none(self):
        http_packet = b"GET / HTTP/1.1\r\nHost: example.com\r\n\r\n"
        info = parse_tls_client_hello(http_packet)
        self.assertIsNone(info)


if __name__ == "__main__":
    unittest.main()
