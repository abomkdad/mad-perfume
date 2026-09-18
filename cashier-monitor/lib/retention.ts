import {statfs} from 'node:fs/promises';
// Retain recordings for as long as disk capacity permits, with room for workers.
export const RETENTION_DAYS = null;
export function retentionCutoff(_now = Date.now()) { return -1; }
const GiB=1024**3;
export const LOW_FREE_BYTES=3*GiB;
export const TARGET_FREE_BYTES=4*GiB;
async function diskFree(){const s=await statfs(process.env.MAD_DATA_DIR||'./private-data');return s.bavail*s.bsize;}
let running:Promise<{removed:number;failed:number}>|undefined;
export function cleanupRecordings(database:D1Database,bucket:R2Bucket,now=Date.now(),freeBytes:()=>Promise<number>=diskFree){
  if(running)return running;
  running=cleanup(database,bucket,now,freeBytes).finally(()=>{running=undefined});
  return running;
}
async function cleanup(database:D1Database,bucket:R2Bucket,now:number,freeBytes:()=>Promise<number>){
  let removed=0,failed=0;
  const pressure=await freeBytes()<LOW_FREE_BYTES;
  for(let n=0;n<200;n++){
    // Retry durable deletion intents even after disk pressure has subsided.
    let row=await database.prepare("SELECT id,clip_key FROM sales WHERE status='expiring' AND clip_key IS NOT NULL ORDER BY occurred_at,id LIMIT 1").first<{id:string;clip_key:string}>();
    if(!row){
      if(!pressure||await freeBytes()>=TARGET_FREE_BYTES)break;
      await database.prepare("UPDATE sales SET status='expiring',lease=NULL,lease_until=NULL WHERE id=(SELECT id FROM sales WHERE status='ready' AND clip_key IS NOT NULL ORDER BY occurred_at,id LIMIT 1)").run();
      row=await database.prepare("SELECT id,clip_key FROM sales WHERE status='expiring' AND clip_key IS NOT NULL ORDER BY occurred_at,id LIMIT 1").first<{id:string;clip_key:string}>();
      if(!row)break;
    }
    try{
      await bucket.delete(row.clip_key);
      await database.prepare("UPDATE sales SET status='expired',clip_key=NULL,error=NULL WHERE id=? AND clip_key=? AND status='expiring'").bind(row.id,row.clip_key).run();
      removed++;
    }catch{failed++;break;}
  }
  await database.prepare("INSERT INTO integrations(id,status,updated_at,last_success) VALUES('retention',?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,updated_at=excluded.updated_at,last_success=CASE WHEN excluded.status='ok' THEN excluded.last_success ELSE integrations.last_success END").bind(failed?'error':'ok',now,failed?0:now).run();
  return {removed,failed};
}
