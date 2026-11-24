# Intrusion Prevention System - Python Detection Engine
FROM python:3.11-slim

# Install system dependencies: libpcap, nftables, iptables for active network prevention
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpcap-dev \
    nftables \
    iptables \
    iproute2 \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    pydantic-settings \
    regex \
    prometheus_client

COPY . .

# Ensure logs directory exists
RUN mkdir -p logs

ENV PYTHONUNBUFFERED=1
ENV FIREWALL_BACKEND=nftables

# Requires NET_ADMIN and NET_RAW capabilities when running in active mode
CMD ["python", "main.py", "--simulate"]
