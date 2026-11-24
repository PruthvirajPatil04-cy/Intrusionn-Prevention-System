"""
TLS Inspection and JA3/JA4 Fingerprinting Engine.
Parses TLS ClientHello handshakes to extract:
- Server Name Indication (SNI)
- JA3 String & MD5 Fingerprint
- JA4 Fingerprint Representation
- High-Risk SNI & Malicious C2 JA3 Anomaly Detections
"""
from __future__ import annotations

import hashlib
import struct
from typing import List, Optional, Tuple

# GREASE (Generate Random Extensions And Sustain Extensibility) values defined in RFC 8701
GREASE_VALUES = {
    0x0A0A, 0x1A1A, 0x2A2A, 0x3A3A, 0x4A4A, 0x5A5A, 0x6A6A, 0x7A7A,
    0x8A8A, 0x9A9A, 0xAAAA, 0xBABA, 0xCACA, 0xDADA, 0xEAEA, 0xFAFA
}

# Known C2 framework default JA3 signatures (Cobalt Strike, Metasploit, TrickBot, AsyncRAT)
KNOWN_MALICIOUS_JA3_HASHES = {
    "a0e9f5d64349fb13191bc781f81f42e1": "Cobalt Strike HTTPS Beacon Default",
    "72a589da586844d7f0818ce684948eea": "Metasploit Meterpreter Reverse HTTPS",
    "b384666a4f9441ef5e63445e9979b4a9": "AsyncRAT ClientHello",
    "51c64c77e60f3980eea90869b68c58a8": "Qakbot Banking Trojan TLS",
}

SUSPICIOUS_SNI_TLDS = {".top", ".xyz", ".onion", ".su", ".click", ".buzz"}


class TLSClientHelloInfo:
    def __init__(
        self,
        sni: Optional[str] = None,
        ja3_string: str = "",
        ja3_hash: str = "",
        ja4_fingerprint: str = "",
        version: int = 0,
        ciphers: Optional[List[int]] = None,
        extensions: Optional[List[int]] = None
    ):
        self.sni = sni
        self.ja3_string = ja3_string
        self.ja3_hash = ja3_hash
        self.ja4_fingerprint = ja4_fingerprint
        self.version = version
        self.ciphers = ciphers or []
        self.extensions = extensions or []

    def is_malicious_ja3(self) -> Tuple[bool, Optional[str]]:
        if self.ja3_hash in KNOWN_MALICIOUS_JA3_HASHES:
            return True, KNOWN_MALICIOUS_JA3_HASHES[self.ja3_hash]
        return False, None

    def has_suspicious_sni(self) -> bool:
        if not self.sni:
            return False
        lower_sni = self.sni.lower()
        return any(lower_sni.endswith(tld) for tld in SUSPICIOUS_SNI_TLDS)


def parse_tls_client_hello(payload: bytes) -> Optional[TLSClientHelloInfo]:
    """
    Parses a raw packet payload attempting to decode a TLS 1.0 - 1.3 ClientHello.
    Returns TLSClientHelloInfo or None if payload is not a TLS ClientHello.
    """
    if len(payload) < 43:
        return None

    # TLS Record Layer: 0x16 = Handshake
    content_type = payload[0]
    if content_type != 0x16:
        return None

    _record_version = struct.unpack("!H", payload[1:3])[0]
    record_length = struct.unpack("!H", payload[3:5])[0]

    if len(payload) < 5 + record_length:
        # Truncated or fragmented packet
        pass

    # Handshake Layer: 0x01 = ClientHello
    handshake_type = payload[5]
    if handshake_type != 0x01:
        return None

    offset = 9  # Skip handshake type (1) + length (3)
    if len(payload) < offset + 34:
        return None

    client_version = struct.unpack("!H", payload[offset:offset+2])[0]
    offset += 2
    offset += 32  # Skip 32-byte Random

    if len(payload) <= offset:
        return None

    # Session ID
    session_id_len = payload[offset]
    offset += 1 + session_id_len

    if len(payload) < offset + 2:
        return None

    # Cipher Suites
    cipher_len = struct.unpack("!H", payload[offset:offset+2])[0]
    offset += 2

    ciphers: List[int] = []
    for i in range(0, cipher_len, 2):
        if len(payload) < offset + i + 2:
            break
        c = struct.unpack("!H", payload[offset+i:offset+i+2])[0]
        if c not in GREASE_VALUES:
            ciphers.append(c)

    offset += cipher_len

    if len(payload) < offset + 1:
        return None

    # Compression Methods
    comp_len = payload[offset]
    offset += 1 + comp_len

    if len(payload) < offset + 2:
        return None

    # Extensions
    ext_len = struct.unpack("!H", payload[offset:offset+2])[0]
    offset += 2

    extensions: List[int] = []
    supported_groups: List[int] = []
    ec_point_formats: List[int] = []
    sni: Optional[str] = None

    end_ext = offset + ext_len
    while offset + 4 <= min(end_ext, len(payload)):
        ext_type, ext_data_len = struct.unpack("!HH", payload[offset:offset+4])
        offset += 4

        if ext_type not in GREASE_VALUES:
            extensions.append(ext_type)

        ext_data = payload[offset:offset+ext_data_len]

        # SNI (Extension 0x0000)
        if ext_type == 0 and len(ext_data) > 5:
            _name_list_len = struct.unpack("!H", ext_data[0:2])[0]
            name_type = ext_data[2]
            if name_type == 0:  # host_name
                name_len = struct.unpack("!H", ext_data[3:5])[0]
                sni = ext_data[5:5+name_len].decode("utf-8", errors="ignore")

        # Supported Groups / Elliptic Curves (Extension 0x000a)
        elif ext_type == 10 and len(ext_data) >= 2:
            groups_len = struct.unpack("!H", ext_data[0:2])[0]
            for g_idx in range(2, min(len(ext_data), 2 + groups_len), 2):
                grp = struct.unpack("!H", ext_data[g_idx:g_idx+2])[0]
                if grp not in GREASE_VALUES:
                    supported_groups.append(grp)

        # EC Point Formats (Extension 0x000b)
        elif ext_type == 11 and len(ext_data) >= 1:
            ec_len = ext_data[0]
            for p_idx in range(1, min(len(ext_data), 1 + ec_len)):
                ec_point_formats.append(ext_data[p_idx])

        offset += ext_data_len

    # Build JA3 Raw String: SSLVersion,Cipher,SSLExtension,EllipticCurve,EllipticCurvePointFormat
    ciphers_str = "-".join(str(c) for c in ciphers)
    extensions_str = "-".join(str(e) for e in extensions)
    groups_str = "-".join(str(g) for g in supported_groups)
    ec_str = "-".join(str(p) for p in ec_point_formats)

    ja3_string = f"{client_version},{ciphers_str},{extensions_str},{groups_str},{ec_str}"
    ja3_hash = hashlib.md5(ja3_string.encode("ascii")).hexdigest()

    # Build JA4-style compact summary string (e.g., t13d1508_hash)
    proto_ver = "t13" if client_version == 0x0304 else ("t12" if client_version == 0x0303 else "t10")
    has_sni_char = "d" if sni else "i"
    ja4_fp = f"{proto_ver}{has_sni_char}{len(ciphers):02d}{len(extensions):02d}_{ja3_hash[:12]}"

    return TLSClientHelloInfo(
        sni=sni,
        ja3_string=ja3_string,
        ja3_hash=ja3_hash,
        ja4_fingerprint=ja4_fp,
        version=client_version,
        ciphers=ciphers,
        extensions=extensions
    )
