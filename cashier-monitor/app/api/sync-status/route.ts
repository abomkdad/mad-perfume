import {db,token,json,runtime} from '@/lib/server';
export async function POST(r:Request){
 if(!await token(r,runtime.MAD_INGEST_TOKEN))return json({error:'Unauthorized'},401);
 try{const b=await r.json() as {status?:unknown};if(typeof b.status!=='string'||!['ok','error'].includes(b.status))return json({error:'Invalid status'},400);
 await db().prepare("INSERT INTO integrations(id,status,updated_at,last_success) VALUES('netapoz',?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,updated_at=excluded.updated_at,last_success=CASE WHEN excluded.status='ok' THEN excluded.last_success ELSE integrations.last_success END").bind(b.status,Date.now(),b.status==='ok'?Date.now():0).run();return json({ok:true});}catch{return json({error:'Status unavailable'},503)}
}
