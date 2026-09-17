# Linux video exporter

The exporter can run on the user's Linux VPS without an always-on Mac. It uses
the official Dahua Windows P2P library in a rootless Podman/Wine container and
PyAV on the host. The vendor binaries and credentials are not included in Git.

Validated on AlmaLinux 9, x86-64, with Podman, Ubuntu 24.04 Wine 9, Python 3.11,
PyAV 18.1.0 and the P2PDll shipped in Dahua SmartPSSLite
`V1.003.0000006.0.R.240517`. The official download source is
<https://dahuawiki.com/images/Files/Software/SmartPSS_Lite/SmartPSSLite_V1.003.0000006.0.R.240517.zip>.

## Runtime layout

- `/opt/mad-dahua-windows/extracted`: vendor application files, read-only to the
  exporter. Compile `bridge/linux/p2p-helper.c` with x86-64 MinGW into
  `mad-p2p.exe` in this directory.
- `/opt/mad-dahua-windows/wine`: initialized Wine64 prefix, private to `madvideo`.
  A temporary copy is used per job and removed when it finishes.
- `/opt/mad-video-env`: Python 3.11 virtual environment with `av==18.1.0`.
- `/opt/mad-monitor/bridge`: `run.mjs`, `site-fetch.mjs`, `export-dahua.py` and
  `dahua_transport_linux.py`.
- `/etc/mad-video/devices.json`: private array of `{name,serial,username,password}`.
- `/etc/mad-video/cloud.json`: private vendor transport `{guess,username}`.
- `/etc/mad-video/worker.env`: HTTPS `MAD_SITE_ORIGIN`, secret `MAD_BRIDGE_TOKEN`,
  absolute `MAD_EXPORTER`, and the user's `XDG_RUNTIME_DIR` and
  `DBUS_SESSION_BUS_ADDRESS`. Files are 0600, owned by `madvideo`; directory 0750.

Create a dedicated non-login `madvideo` account with home `/var/lib/mad-video`,
unique subordinate UID/GID ranges and an enabled lingering user manager. Build
the supplied Containerfile and load/tag the image in **this user's** rootless
Podman store as `localhost/mad-dahua-wine:latest`. No Docker socket or privileged
container is used. Container processes map to the dedicated host UID, drop all
capabilities, and expire after 500 seconds. Native SDK logs are discarded, since
they can contain authentication material.

Install `export-dahua-linux.sh` and `mad-video-firewall.sh` under
`/opt/mad-monitor`. The latter allows outbound dynamic UDP relay ports and TCP
9116 only for `madvideo`; it does not open inbound ports. On CSF hosts call it
from the existing `/etc/csf/csfpost.sh` without replacing unrelated content.
Existing DNS, HTTPS and established-connection firewall allowances are required.

Install `mad-video@.service`, set the environment paths for the actual user UID,
and enable one or two instances. Each instance has a 650 MB memory limit and
uses the existing exclusive job leases. Stop old video workers before the final
end-to-end verification. A known existing sale must be exported, uploaded and
served as authenticated MP4 before declaring the migration complete.

Each export verifies the recorder serial, measures its clock offset, requests
the corresponding recording window and validates H.264 MP4 duration and size.
Minute-resolution invoices use a wider window to cover the full transaction
minute. Offline devices and missing recordings remain explicit failures.

The service pauses new job claims below a 2 GiB disk reserve and resumes when
space is available, preserving pending jobs without exhausting their retries.
The 30-day retention job still applies. Storage sizing depends on real invoice
volume and camera bitrate; monitor free space rather than assuming a fixed disk
can hold every possible 30-day workload. Netapoz credentials are configured
separately through `/integrations`; camera connectivity does not authenticate
the sales feed.
