# MAD cashier monitor

Source of the existing Arabic sales and cashier-video dashboard, including the tested 30-day recording retention update.

## Migration status

Source has been transferred to this repository. The running deployment is still on Sites. This snapshot requires Sites/Cloudflare D1, R2 and trusted authentication headers; it is **not yet a standalone Namecheap VPS deployment**. Do not expose this server directly with client-supplied authentication headers.

Before switching DNS: replace platform storage and authentication, export/import existing invoices, mappings and recordings, configure secrets privately on the VPS, test authenticated playback and ingestion, and verify rollback. Keep the existing main website intact.

The Dahua exporter currently runs on the owner's Mac using the installed SmartPSSLite transport. Its native library is not included and cannot run unchanged on Linux.

## Security

No credentials, sessions, customer records or recordings belong in this public repository. Configure MAD_ALLOWED_EMAILS explicitly for the current Sites build. Local .env files and work directories are excluded.

## Verification

Node 24: `node scripts/test-retention.mjs`
Python 3: `python3 scripts/test-storage.py`
`npm ci` then `npm run build` for the current platform-specific source.

Recordings expire 30 days after the sale time; invoice rows remain. Cleanup runs on bridge heartbeats and retries interrupted deletions.
