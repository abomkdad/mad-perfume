# MAD cashier monitor — Namecheap VPS edition

Arabic RTL sales and cashier-recording dashboard. This directory is independent of the main MAD website in the repository root.

## Runtime

Node.js 24+, Next.js, SQLite in WAL mode, private MP4 files outside the web root. No Sites, Cloudflare D1/R2 or ChatGPT sign-in is required. Never trust client identity headers. Sessions are opaque, hashed in SQLite and served in secure HttpOnly cookies. Browser writes check the configured origin.

The Dahua exporter still runs on the owner's Mac using its installed SmartPSSLite native transport. That library and device credentials are not distributed. The Linux VPS hosts the dashboard, database, authenticated media and job queue.

## Setup

1. Install dependencies with `npm ci` and build with `npm run build`.
2. Configure private server environment outside the repository: `MAD_DATA_DIR`, `MAD_SITE_ORIGIN`, `MAD_ADMIN_PASSWORD_HASH`, `MAD_BRIDGE_TOKEN`, `MAD_INGEST_TOKEN`. The password hash is `salt:scrypt(password,salt,64).hex`. Use random machine tokens of at least 32 characters.
3. Run `npm run storage:init` with the configured data directory before serving requests. Migrations run once in transactions.
4. Run the generated standalone server on loopback behind an HTTPS reverse proxy. Copy `.next/static`, `public`, migrations and operational scripts into the standalone app directory. Preserve its emitted directory structure.
5. Run `scripts/retention-run.mjs` with the server environment regularly. It uses the authenticated cleanup action and does not mark the camera bridge online.

## Data migration

Export all rows and MP4s privately. Validate file checksums, then run `node scripts/import-snapshot.mjs /private/path/snapshot.json`. It refuses missing recordings and imports in one transaction. Preserve the source service until verification and DNS cutover are complete. Runtime data, credentials and backups must never be committed to this public repository.

## Retention and backup

Recordings expire 30 days after the transaction time. Invoices and products remain. Durable deletion intent allows retries after storage or database errors. Back up SQLite using its online backup API; copying an active SQLite file without WAL is not a reliable backup. Private files must be included in a separate backup policy. Monitor available disk space; this system does not silently shorten retention to free space.

## Tests

- `node scripts/test-node-storage.mjs`: transactions, rollback, protected paths, byte ranges and idempotent removal.
- `node scripts/test-retention.mjs`: exact age boundary, invoice preservation and interrupted deletion recovery.
- `python3 scripts/test-storage.py`: import deduplication, job leases, stale acknowledgements and retries.

Keep the main domain's existing GitHub Pages records unchanged when routing only `monitor` to the VPS.
