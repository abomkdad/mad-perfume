/** The owner selected 30 days, measured from the sale/recording time (UTC).
 * Invoice rows and their products remain after the private recording is removed.
 */
export const RETENTION_DAYS = 30;
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;
export function retentionCutoff(now = Date.now()) { return now - RETENTION_MS; }

// Persist the deletion intent first. R2 deletion is idempotent; a failed delete or
// final DB write is retried by the next heartbeat, including after a restart.
export async function cleanupRecordings(database: D1Database, bucket: R2Bucket, now = Date.now()) {
  const cutoff = retentionCutoff(now);
  await database.prepare("UPDATE sales SET status='expired',lease=NULL,lease_until=NULL WHERE occurred_at<=? AND clip_key IS NULL AND status IN ('queued','unmapped','processing','failed')").bind(cutoff).run();
  await database.prepare("UPDATE sales SET status='expiring',lease=NULL,lease_until=NULL WHERE id IN (SELECT id FROM sales WHERE status='ready' AND clip_key IS NOT NULL AND occurred_at<=? ORDER BY occurred_at LIMIT 5)").bind(cutoff).run();
  const pending = await database.prepare("SELECT id,clip_key FROM sales WHERE status='expiring' AND clip_key IS NOT NULL AND occurred_at<=? ORDER BY occurred_at LIMIT 5").bind(cutoff).all<{id:string;clip_key:string}>();
  let removed = 0, failed = 0;
  for (const row of pending.results) {
    try {
      await bucket.delete(row.clip_key);
      await database.prepare("UPDATE sales SET status='expired',clip_key=NULL,error=NULL WHERE id=? AND clip_key=? AND status='expiring'").bind(row.id,row.clip_key).run();
      removed++;
    } catch { failed++; }
  }
  await database.prepare("INSERT INTO integrations(id,status,updated_at,last_success) VALUES('retention',?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,updated_at=excluded.updated_at,last_success=CASE WHEN excluded.status='ok' THEN excluded.last_success ELSE integrations.last_success END").bind(failed?'error':'ok',now,failed?0:now).run();
  return {removed,failed};
}
