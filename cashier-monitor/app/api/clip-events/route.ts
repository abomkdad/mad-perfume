import {viewer,json,db} from '@/lib/server';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!await viewer())return json({error:'Unauthorized'},401);
 const raw=new URL(request.url).searchParams.get('after');
 if(raw!==null&&(!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw))))return json({error:'Invalid cursor'},400);
 try{
  if(raw===null){const max=await db().prepare('SELECT COALESCE(MAX(seq),0) AS cursor FROM clip_events').first();return json({cursor:Number(max?.cursor||0),events:[]})}
  const rows=await db().prepare('SELECT e.seq,e.sale_id AS saleId,e.branch_id AS branchId,b.name AS branchName FROM clip_events e LEFT JOIN branches b ON b.id=e.branch_id WHERE e.seq>? ORDER BY e.seq LIMIT 100').bind(Number(raw)).all();
  return json({events:rows.results,cursor:rows.results.length?Number(rows.results[rows.results.length-1].seq):Number(raw)});
 }catch{return json({error:'Clip notifications unavailable'},503)}
}
