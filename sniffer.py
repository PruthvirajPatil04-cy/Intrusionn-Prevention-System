"""
Packet Capture Engine for the Intrusion Prevention System.
Decouples high-throughput network capture from analysis via a bounded queue and worker pool.
"""
from __future__ import annotations

import queue
import threading
from typing import TYPE_CHECKING, Any, Optional

from scapy.all import ICMP, IP, TCP, UDP, IPv6, Raw, sniff  # type: ignore[import-untyped]

from logger import logger

if TYPE_CHECKING:
    from analyzer import IntrusionAnalyzer


class PacketSniffer:
    """
    Captures live packets using Scapy and buffers them into a bounded queue.
    Worker threads drain the queue and pass parsed metadata to IntrusionAnalyzer.
    """

    def __init__(
        self,
        analyzer: IntrusionAnalyzer,
        interface: Optional[str] = None,
        queue_size: int = 10000,
        worker_threads: int = 4
    ):
        self.analyzer = analyzer
        self.interface = interface
        self.queue_size = queue_size
        self.worker_threads = worker_threads

        self.packet_queue: queue.Queue[Any] = queue.Queue(maxsize=queue_size)
        self.dropped_packets: int = 0
        self.processed_packets: int = 0
        self.running: bool = False
        self.lock = threading.Lock()

        self.capture_thread: Optional[threading.Thread] = None
        self.workers: list[threading.Thread] = []

    def _packet_callback(self, packet: Any) -> None:
        """Enqueues raw packet. Non-blocking: drops and logs on buffer congestion."""
        if not self.running:
            return

        try:
            self.packet_queue.put_nowait(packet)
        except queue.Full:
            with self.lock:
                self.dropped_packets += 1
                if self.dropped_packets % 100 == 1:
                    logger.warning(
                        f"[!] PACKET BUFFER CONGESTION: Dropped {self.dropped_packets} packets "
                        f"(queue capacity: {self.queue_size})"
                    )

    def _worker_loop(self) -> None:
        """Worker thread loop parsing packets from queue and invoking analyzer."""
        while self.running:
            try:
                packet = self.packet_queue.get(timeout=0.5)
            except queue.Empty:
                continue

            try:
                self._process_single_packet(packet)
                with self.lock:
                    self.processed_packets += 1
            except Exception as e:
                logger.debug(f"Packet parsing error: {e}")
            finally:
                self.packet_queue.task_done()

    def _process_single_packet(self, packet: Any) -> None:
        """Parses packet layers and passes structured fields to analyzer."""
        src_ip: Optional[str] = None
        dst_ip: Optional[str] = None

        if IP in packet:
            src_ip = packet[IP].src
            dst_ip = packet[IP].dst
        elif IPv6 in packet:
            src_ip = packet[IPv6].src
            dst_ip = packet[IPv6].dst

        if not src_ip or not dst_ip:
            return

        protocol = "OTHER"
        src_port: Optional[int] = None
        dst_port: Optional[int] = None
        tcp_flags: Optional[str] = None
        payload_bytes: Optional[bytes] = None

        if TCP in packet:
            protocol = "TCP"
            src_port = packet[TCP].sport
            dst_port = packet[TCP].dport
            tcp_flags = str(packet[TCP].flags)
        elif UDP in packet:
            protocol = "UDP"
            src_port = packet[UDP].sport
            dst_port = packet[UDP].dport
        elif ICMP in packet:
            protocol = "ICMP"

        if Raw in packet:
            payload_bytes = bytes(packet[Raw].load)

        self.analyzer.inspect_packet(
            src_ip=src_ip,
            dst_ip=dst_ip,
            protocol=protocol,
            src_port=src_port,
            dst_port=dst_port,
            tcp_flags=tcp_flags,
            payload_bytes=payload_bytes
        )

    def start(self) -> None:
        """Starts worker threads and begins Scapy capture in a background thread."""
        self.running = True

        # Spawn worker threads
        self.workers = []
        for i in range(self.worker_threads):
            t = threading.Thread(target=self._worker_loop, name=f"IPS-Worker-{i+1}", daemon=True)
            t.start()
            self.workers.append(t)

        def sniff_target() -> None:
            kwargs: dict[str, Any] = {
                "prn": self._packet_callback,
                "store": 0,  # Store 0 packets in memory to prevent leak
            }
            if self.interface:
                kwargs["iface"] = self.interface

            logger.info(
                f"[*] Starting Scapy packet sniffer on {self.interface or 'default adapter'} "
                f"with {self.worker_threads} async workers (buffer: {self.queue_size})..."
            )
            try:
                sniff(**kwargs)
            except Exception as e:
                logger.error(f"[!] Scapy capture error: {e}")

        self.capture_thread = threading.Thread(target=sniff_target, daemon=True)
        self.capture_thread.start()

    def stop(self) -> None:
        """Stops capture and halts worker pool."""
        self.running = False
        logger.info(
            f"[*] Sniffer stopped. Total Processed: {self.processed_packets}, "
            f"Total Dropped: {self.dropped_packets}"
        )

    def get_stats(self) -> dict[str, int]:
        with self.lock:
            return {
                "processed": self.processed_packets,
                "dropped": self.dropped_packets,
                "queue_current": self.packet_queue.qsize(),
                "queue_capacity": self.queue_size,
            }
