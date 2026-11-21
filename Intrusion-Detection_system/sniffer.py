"""
Packet Sniffer engine using Scapy.
"""
import sys
import threading
from typing import Optional, Callable
from scapy.all import sniff, IP, IPv6, TCP, UDP, ICMP, Raw
from analyzer import IntrusionAnalyzer
from logger import logger


class PacketSniffer:
    """
    Captures live network packets and feeds them to the IntrusionAnalyzer.
    """

    def __init__(self, analyzer: IntrusionAnalyzer, interface: Optional[str] = None):
        self.analyzer = analyzer
        self.interface = interface
        self.stop_event = threading.Event()
        self.packet_count = 0

    def packet_callback(self, packet) -> None:
        """Invoked by Scapy for every captured packet."""
        try:
            self.packet_count += 1

            # Extract IP layer
            src_ip = None
            dst_ip = None
            if packet.haslayer(IP):
                src_ip = packet[IP].src
                dst_ip = packet[IP].dst
            elif packet.haslayer(IPv6):
                src_ip = packet[IPv6].src
                dst_ip = packet[IPv6].dst
            else:
                return  # Skip non-IP packets

            # Determine protocol and ports
            protocol = "OTHER"
            src_port = None
            dst_port = None
            tcp_flags = None

            if packet.haslayer(TCP):
                protocol = "TCP"
                src_port = packet[TCP].sport
                dst_port = packet[TCP].dport
                tcp_flags = str(packet[TCP].flags)
            elif packet.haslayer(UDP):
                protocol = "UDP"
                src_port = packet[UDP].sport
                dst_port = packet[UDP].dport
            elif packet.haslayer(ICMP):
                protocol = "ICMP"

            # Extract Raw payload if present
            payload = None
            if packet.haslayer(Raw):
                payload = bytes(packet[Raw].load)

            # Pass parsed packet to analyzer
            self.analyzer.inspect_packet(
                src_ip=src_ip,
                dst_ip=dst_ip,
                protocol=protocol,
                src_port=src_port,
                dst_port=dst_port,
                tcp_flags=tcp_flags,
                payload_bytes=payload
            )

        except Exception as e:
            # Avoid crashing the sniffer loop on malformed packets
            pass

    def start(self) -> None:
        """Starts sniffing loop."""
        logger.info(f"[*] Sniffer started on interface: {self.interface or 'All available'}")
        logger.info("[*] Listening for traffic... Press Ctrl+C to stop.")

        sniff(
            iface=self.interface,
            prn=self.packet_callback,
            store=False,
            stop_filter=lambda p: self.stop_event.is_set()
        )

    def stop(self) -> None:
        """Signals sniffer to stop."""
        self.stop_event.set()
