"""
Typed exceptions for Intrusion Prevention System security validation and engine operations.
"""

class IPSException(Exception):
    """Base exception for all IPS-related errors."""
    pass


class IPSValidationError(IPSException, ValueError):
    """Raised when an input fails security or format validation."""
    pass


class InvalidIPAddressError(IPSValidationError):
    """Raised when an invalid IPv4/IPv6 address or CIDR range is supplied."""
    pass


class InvalidRuleNameError(IPSValidationError):
    """Raised when a firewall rule name violates the allowlist pattern."""
    pass


class ReDoSTimeoutError(IPSException):
    """Raised when regular expression matching exceeds safe execution timeout."""
    pass


class InsufficientPrivilegesError(IPSException, PermissionError):
    """Raised when attempting to execute firewall operations without required administrative privileges."""
    pass
