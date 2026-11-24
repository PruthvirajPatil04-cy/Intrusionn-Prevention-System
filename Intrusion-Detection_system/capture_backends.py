"""
Pluggable Packet Capture Backend abstraction layer:
- ScapyCaptureBackend (Default cross-platform Python implementation)
- EbpfCaptureBackendStub (Kernel-space eBPF XDP roadmap scaffold)
"""
from __future__ import annotations

import sys
from abc import ABC, abstractmethod
from typing import Any, Callable, Optional

from scapy.all import sniff  # type: ignore[import-untyped]

from logger import logger


class CaptureBackend(ABC):
    """Abstract base class for packet capture engines."""

    @property
    @abstractmethod
    def name(self) -> str:
        pass

    @abstractmethod
    def is_supported(self) -> bool:
        pass

    @abstractmethod
    def start_capture(self, callback: Callable[[Any], None], interface: Optional[str] = None) -> None:
        """Starts asynchronous capture, dispatching parsed or raw packets to callback."""
        pass

    @abstractmethod
    def stop_capture(self) -> None:
        pass


class ScapyCaptureBackend(CaptureBackend):
    """Default cross-platform user-space packet capture backend using Scapy."""

    def __init__(self):
        self._running = False

    @property
    def name(self) -> str:
        return "ScapyCaptureBackend (User-Space)"

    def is_supported(self) -> bool:
        return True

    def start_capture(self, callback: Callable[[Any], None], interface: Optional[str] = None) -> None:
        self._running = True
        kwargs: dict[str, Any] = {
            "prn": callback,
            "store": 0,
        }
        if interface:
            kwargs["iface"] = interface

        logger.info(f"[*] Starting {self.name} on interface: {interface or 'default'}")
        try:
            sniff(**kwargs)
        except Exception as e:
            if self._running:
                logger.error(f"[!] Scapy capture loop encountered error: {e}")

    def stop_capture(self) -> None:
        self._running = False


class EbpfCaptureBackendStub(CaptureBackend):
    """
    Scaffolded architecture stub for high-performance eBPF / XDP kernel packet capture.
    In a production Linux deployment, an eBPF program is compiled (via clang/LLVM) and attached
    to the network interface XDP hook (XDP_FLAGS_DRV_MODE or XDP_FLAGS_SKB_MODE).
    Packets are filtered in kernel space before allocating socket sk_buff structures,
    delivering >1,500,000 pps with zero user-space copy overhead.
    """

    def __init__(self):
        self._attached = False

    @property
    def name(self) -> str:
        return "EbpfCaptureBackend (XDP Kernel Bypass - Scaffold)"

    def is_supported(self) -> bool:
        # eBPF XDP requires Linux kernel 4.18+ with CAP_BPF / CAP_NET_ADMIN
        return sys.platform.startswith("linux")

    def start_capture(self, callback: Callable[[Any], None], interface: Optional[str] = None) -> None:
        """
        Scaffolded execution path:
        1. Load compiled eBPF bytecode: b = BPF(src_file="xdp_filter.c")
        2. Attach function to interface: b.attach_xdp(interface, fn=b.load_func("filter_prog", BPF.XDP))
        3. Poll BPF ring buffer: b["events"].open_ring_buffer(callback)
        """
        logger.warning(
            f"[*] {self.name} is a high-performance scaffold. "
            "Please refer to docs/PERF.md for kernel compilation and deployment instructions."
        )
        self._attached = True

    def stop_capture(self) -> None:
        self._attached = False
        logger.info(f"[*] Detached {self.name} from interface.")
