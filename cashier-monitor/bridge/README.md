# MAD local integration boundary

Netapoz's actual authenticated dashboard endpoint was observed and verified: POST /v2/reports/generator/transactions/detailed. This is first-party dashboard traffic, not a published integration contract. The local synchronizer uses an existing session stored in ignored, owner-only .env.netapoz-session; it stops reporting healthy when authentication expires. No password is in source code. bridge/sync-netapoz.mjs overlaps today and yesterday every minute, keeps a durable seen set and uses server deduplication. Initial historical imports do not emit sale notifications. The local Dahua exporter now opens an authenticated P2P connection through the installed SmartPSSLite library, verifies the recorder serial, measures its clock, requests RTSP playback, and encodes a browser-compatible H.264 MP4. Credentials and vendor transport configuration are held only in ignored owner-only local secret files.

The hosted dashboard accepts normalized transactions at POST /api/ingest using MAD_INGEST_TOKEN. Schema: lib/sale-validation.ts. Currency amounts are integer agorot; occurredAt must include an explicit UTC offset. The verified Netapoz account time zone is Asia/Jerusalem. Transaction uniqueness is scoped by branch, register, and provider transaction ID. Do not feed historical imports with live notification semantics until the provider adapter distinguishes historical backfill.

The exporter runner below claims jobs at POST /api/jobs, waits until 90 seconds after the sale (one minute of post-roll plus 30 seconds recording flush allowance), applies each camera's measured clock offset, and uploads MP4 at PUT /api/clip. A 10 minute lease prevents overlapping workers; a failed job is retried after five minutes, at most five attempts. Video storage is private and playback requires the explicitly allowed account. No recording is deleted automatically: retention must be agreed and configured before production ingestion.

## Required provider work before production

1. Replace session authentication with a vendor-supported long-lived integration credential when available. Session-based synchronization requires this Mac to remain awake and online, and the Netapoz session to remain valid. Register keys currently use the report’s exact POS name scoped by branch, not inferred numeric IDs. Minute-resolution timestamps have a 180-second conservative recording window.
2. The Dahua P2P and RTSP exporter is implemented for this Mac with SmartPSSLite installed. Complete unavailable recorder repairs and verify any new camera mapping before enabling it. Credentials are read from owner-only secret files; none are passed as process arguments.
3. Use MAD_SITE_ORIGIN, MAD_SITES_ACCESS_TOKEN, MAD_BRIDGE_TOKEN and MAD_INGEST_TOKEN from secret storage. The Sites token is sent only as OAI-Sites-Authorization; the application independently validates its own bearer key. A local ignored .env.bridge file with owner-only permissions is provisioned for this installation; never commit or package it. Run node --env-file=.env.bridge bridge/check.mjs to verify both authentication layers without inserting data. This installation has owner-only device credentials and a local exporter launcher configured. The launcher must be supplied as MAD_EXPORTER.
4. Set MAD_EXPORTER to the absolute executable path. It receives one JSON request on stdin and must produce one MP4 at outputPath. Its request contains device alias, channel, UTC start and end in milliseconds. Device-local conversion belongs in the exporter and must be tested across daylight-saving changes. No shell invocation is used.
5. Test one real sale against the correct register camera, check the full 120 seconds, clock alignment, interrupted upload, retries, and access denial. Then enable continuous operation on an always-on branch/gateway machine. Do not run the gateway as an agent heartbeat.

## Current notifications

The page polls every 10 seconds and supports browser notifications while open. Background Web Push while the page is closed is not implemented. It requires a push subscription backend and delivery worker with retry/deduplication; do not describe the current notification button as background push.

## Domain

mad-parfumeur.com currently serves the existing branch website. Use monitor.mad-parfumeur.com for this private service, keeping root and www DNS unchanged. DNS access and returned verification records must be configured before claiming the custom address works.

Never paste credentials into chat, commit .env files, or log request authorization headers.

## Verified camera mappings

Wadi Nsor channel 2; Afula channel 2; Kfar Qara channel 1; Umm al-Fahm city channel 2; Yarka channel 2; Nazareth Tawfiq Ziad channel 4. The owner confirmed the misleading Netapoz POS label Harish belongs to Yarka and SmartPSS nasr belongs to Tawfiq Ziad. Hertzelia displays no disk; it is not enabled for recording jobs.

Dahua timestamps are measured per export, including approximately minus one hour on several recorders. Keep mapping offsetSeconds at zero unless an additional independently measured correction is needed. The exporter adds three seconds of transport/keyframe margin on each side of the requested interval, caps a job at four minutes, rejects partial recordings and verifies H.264 output. All native library output is discarded in the worker because vendor logs may contain secrets.

Job selection prioritizes live sales before historical backfill, newest first. A separate heartbeat reports whether the local video worker is running; it does not claim every recorder is healthy. In-page new-sale notifications work without browser permission; system notifications require permission and an open page.
