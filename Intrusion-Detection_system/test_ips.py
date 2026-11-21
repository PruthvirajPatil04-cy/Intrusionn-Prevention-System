"""
Test and Demonstration script for Intrusion Prevention System (IPS).
Simulates various attack patterns (Port scan, SQL injection payload, ICMP flood)
to verify that the IPS analyzer detects and triggers prevention.
"""
import sys
import time
from config import load_rules
from blocker import Blocker
from analyzer import IntrusionAnalyzer


def run_unit_tests():
    print("[*] Initializing IPS components in SIMULATION mode...")
    rules = load_rules()
    blocker = Blocker(simulation_mode=True, block_duration=10)
    analyzer = IntrusionAnalyzer(rules=rules, blocker=blocker)

    test_attacker_ip = "198.51.100.42"

    print("\n--- TEST 1: Simulating SQL Injection Payload Inspection ---")
    analyzer.inspect_packet(
        src_ip=test_attacker_ip,
        dst_ip="192.168.1.10",
        protocol="TCP",
        src_port=44231,
        dst_port=80,
        payload_bytes=b"GET /login?user=admin' UNION SELECT 1,2,password FROM users-- HTTP/1.1\r\n"
    )
    assert test_attacker_ip in blocker.blocked_ips, "Test 1 Failed: SQL Injection not blocked"
    print("[PASS] SQL injection pattern successfully caught and IP blocked!")
    blocker.unblock_ip(test_attacker_ip)

    print("\n--- TEST 2: Simulating Rapid Port Scan ---")
    scan_attacker_ip = "203.0.113.88"
    for port in range(20, 40):
        analyzer.inspect_packet(
            src_ip=scan_attacker_ip,
            dst_ip="192.168.1.10",
            protocol="TCP",
            src_port=50000 + port,
            dst_port=port,
            tcp_flags="S"
        )
    assert scan_attacker_ip in blocker.blocked_ips, "Test 2 Failed: Port scan not blocked"
    print("[PASS] Port scan successfully caught and IP blocked!")
    blocker.unblock_ip(scan_attacker_ip)

    print("\n--- TEST 3: Simulating ICMP Ping Flood ---")
    ping_attacker_ip = "198.51.100.99"
    for _ in range(30):
        analyzer.inspect_packet(
            src_ip=ping_attacker_ip,
            dst_ip="192.168.1.10",
            protocol="ICMP"
        )
    assert ping_attacker_ip in blocker.blocked_ips, "Test 3 Failed: Ping flood not blocked"
    print("[PASS] ICMP flood successfully caught and IP blocked!")
    blocker.unblock_ip(ping_attacker_ip)

    print("\n=======================================================")
    print("ALL IPS VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=======================================================\n")


if __name__ == "__main__":
    run_unit_tests()
