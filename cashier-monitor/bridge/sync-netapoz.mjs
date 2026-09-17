import {configured,renewSession} from './netapoz-auth.mjs';
import {siteFetch} from './site-fetch.mjs';
import {readFile,writeFile,rename} from 'node:fs/promises';
import {normalizeReport,ingestSales} from './import-netapoz.mjs';
const statePath='work/netapoz-sync-state.json';
const dateFmt=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Jerusalem',year:'numeric',month:'2-digit',day:'2-digit'});
async function heartbeat(status){const r=await siteFetch(new URL('/api/sync-status',process.env.MAD_SITE_ORIGIN),{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.MAD_INGEST_TOKEN}`},body:JSON.stringify({status}),redirect:'error',signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error('Status update failed')}
let stopping=false;process.on('SIGTERM',()=>{stopping=true});process.on('SIGINT',()=>{stopping=true});
while(!stopping){try{
 let cookie;try{({cookie}=JSON.parse(await readFile('.env.netapoz-session','utf8')))}catch(e){if(e.code!=='ENOENT')throw e;cookie=await renewSession()};if(!cookie?.startsWith('SESSION='))throw Error('Session unavailable');
 let state={initialized:false,seen:{}};try{state=JSON.parse(await readFile(statePath,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}
 let inserted=0,existing=0;
 const days=[dateFmt.format(Date.now()-86400000),dateFmt.format(Date.now())];
 for(const day of days){
  const requestReport=()=>fetch('https://www.netapoz.com/v2/reports/generator/transactions/detailed',{method:'POST',headers:{cookie,'Content-Type':'application/json'},body:JSON.stringify({startDate:day,endDate:day,startMinutes:0,endMinutes:1439}),redirect:'error',signal:AbortSignal.timeout(30000)});
  let r=await requestReport();if(r.status===401&&await configured()){cookie=await renewSession();r=await requestReport()}if(!r.ok)throw Error(`Netapoz status ${r.status}`);
  const sales=normalizeReport(await r.json());
  const pending=[];for(const sale of sales){const key=JSON.stringify([sale.branchId,sale.registerId,sale.id]);if(state.seen[key])continue;
   sale.historical=!state.initialized||Date.parse(sale.occurredAt)<Date.now()-300000;
   pending.push(sale);
  }
  const result=await ingestSales(pending);inserted+=result.inserted;existing+=result.existing;for(const sale of pending)state.seen[JSON.stringify([sale.branchId,sale.registerId,sale.id])]=Date.parse(sale.occurredAt);
 }
 state.initialized=true;state.lastSuccess=new Date().toISOString();for(const [k,t]of Object.entries(state.seen))if(t<Date.now()-7*86400000)delete state.seen[k];
 await writeFile(statePath+'.tmp',JSON.stringify(state),{mode:0o600});await rename(statePath+'.tmp',statePath);await heartbeat('ok');console.log(JSON.stringify({at:state.lastSuccess,status:'ok',inserted,existing}));
}catch(e){console.error(JSON.stringify({at:new Date().toISOString(),status:'error',message:e.message?.startsWith('Netapoz status')?e.message:'Synchronization failed; retrying without advancing state'}));await heartbeat('error').catch(()=>{});}
 if(process.argv.includes('--once'))break;
 for(let i=0;i<60&&!stopping;i++)await new Promise(r=>setTimeout(r,1000));
}
