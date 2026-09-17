import {siteFetch} from './site-fetch.mjs';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
const knownBranches=new Set(['25274','29269','25351','37615','31165','16789','6386','9607','24897','23618','25066']);
export function localMinute(date,time){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))throw Error('Invalid report time');
 const target=`${date}T${time}:00`,wall=Date.parse(target+'Z');
 const fmt=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
 const matches=[];
 for(const offset of [120,180]){const t=wall-offset*60000;if(fmt.format(new Date(t)).replace(' ','T')===target)matches.push(new Date(t).toISOString());}
 if(matches.length!==1)throw Error('Ambiguous or invalid local time; needs provider timestamp');
 return matches[0];
}
const minor=v=>{if(typeof v!=='number'||!Number.isFinite(v))throw Error('Invalid amount');return Math.round(v*100)};
export function normalizeReport(report,historical=true){
 const rows=Array.isArray(report)?report:Object.values(report).flat();
 return rows.map(s=>{
  const branchId=String(s.shopId);if(!knownBranches.has(branchId)||!s.pos||!s.invoiceId||!s.cashier||!Array.isArray(s.products)||!Array.isArray(s.payments))throw Error('Incomplete transaction');
  const kinds={CASH:'نقدي',CREDIT:'بطاقة',CHECK:'شيك',VOUCHER:'قسيمة'};
  return {id:String(s.invoiceId),branchId,registerId:String(s.pos),cashier:String(s.cashier),occurredAt:localMinute(s.date,s.time),timePrecision:'minute',historical,amountMinor:minor(s.total),currency:'ILS',payment:s.payments.map(p=>`${kinds[p.type]||p.type} ${(minor(p.total)/100).toFixed(2)} ₪`).join(' + '),products:s.products.map(p=>({name:p.name,quantity:p.quantity,amountMinor:minor(p.total)}))};
 });
}
export async function ingestSales(sales){
 const origin=process.env.MAD_SITE_ORIGIN;
 if(!origin||new URL(origin).protocol!=='https:'||!process.env.MAD_INGEST_TOKEN)throw Error('Missing secure gateway configuration');
 let inserted=0,existing=0;
 let cursor=0;
 const worker=async()=>{while(cursor<sales.length){const sale=sales[cursor++];const r=await siteFetch(new URL('/api/ingest',origin),{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.MAD_INGEST_TOKEN}`,'OAI-Sites-Authorization':`Bearer ${process.env.MAD_SITES_ACCESS_TOKEN}`},body:JSON.stringify(sale),redirect:'error',signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Ingestion rejected (${r.status}); safely rerun to resume`);const result=await r.json();if(result.inserted)inserted++;else existing++;}};
 await Promise.all(Array.from({length:Math.min(4,sales.length)},worker));
 return {inserted,existing};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const sales=normalizeReport(JSON.parse(await readFile(process.argv[2],'utf8')));
 if(process.argv.includes('--check'))console.log(JSON.stringify({valid:sales.length,branches:new Set(sales.map(s=>s.branchId)).size,timePrecision:'minute',historical:true}));
 else console.log(JSON.stringify(await ingestSales(sales)));
}
