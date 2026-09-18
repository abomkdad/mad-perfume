CREATE TABLE IF NOT EXISTS clip_events (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id TEXT NOT NULL,
  branch_id TEXT NOT NULL,
  clip_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);
CREATE TRIGGER IF NOT EXISTS clip_ready_event
AFTER UPDATE OF status,clip_key ON sales
WHEN NEW.status='ready' AND NEW.clip_key IS NOT NULL
AND (OLD.clip_key IS NOT NEW.clip_key OR OLD.status!='ready')
BEGIN
  INSERT OR IGNORE INTO clip_events(sale_id,branch_id,clip_key,created_at)
  VALUES(NEW.id,NEW.branch_id,NEW.clip_key,CAST((julianday('now')-2440587.5)*86400000 AS INTEGER));
END;
