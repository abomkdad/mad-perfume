#!/bin/sh
# P2P uses negotiated UDP relay ports. Permit only the dedicated exporter UID.
# Existing inbound policy remains unchanged; broadcasts are not needed.
set -eu
if ! id madvideo >/dev/null 2>&1; then exit 0; fi
iptables -C OUTPUT -m owner --uid-owner madvideo -p udp --dport 1024:65535 ! -d 255.255.255.255/32 -j ACCEPT 2>/dev/null ||
  iptables -I OUTPUT 1 -m owner --uid-owner madvideo -p udp --dport 1024:65535 ! -d 255.255.255.255/32 -j ACCEPT
iptables -C OUTPUT -m owner --uid-owner madvideo -p tcp --dport 9116 -j ACCEPT 2>/dev/null ||
  iptables -I OUTPUT 1 -m owner --uid-owner madvideo -p tcp --dport 9116 -j ACCEPT
