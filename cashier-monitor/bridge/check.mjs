// Validate both authentication layers without creating sales or claiming jobs.
const origin=process.env.MAD_SITE_ORIGIN;
if(!origin||new URL(origin).protocol!=='https:')throw Error('Set HTTPS MAD_SITE_ORIGIN');
const site=process.env.MAD_SITES_ACCESS_TOKEN,bridge=process.env.MAD_BRIDGE_TOKEN,ingest=process.env.MAD_INGEST_TOKEN;
if(!site||!bridge||!ingest)throw Error('Load the integration secrets first');
const gate={'OAI-Sites-Authorization':`Bearer ${site}`};
const cases=[
 ['jobs without application key','/api/jobs',gate,401],
 ['jobs with wrong application key','/api/jobs',{...gate,Authorization:'Bearer invalid'},401],
 ['jobs with correct key and invalid action','/api/jobs',{...gate,Authorization:`Bearer ${bridge}`},400],
 ['ingest with correct key and invalid sale','/api/ingest',{...gate,Authorization:`Bearer ${ingest}`},400],
 ['viewer cannot use machine identity','/api/monitor',gate,401],
];
let failed=false;
for(const [label,path,headers,expected] of cases){try{const r=await fetch(new URL(path,origin),{method:path==='/api/monitor'?'GET':'POST',headers:{...headers,'Content-Type':'application/json'},...(path==='/api/monitor'?{}:{body:'{}'}),redirect:'manual',signal:AbortSignal.timeout(20000)});const pass=r.status===expected;console.log(`${pass?'PASS':'FAIL'} ${label}: HTTP ${r.status}`);failed ||= !pass;await r.body?.cancel();}catch{console.log(`FAIL ${label}: connection unavailable`);failed=true;}}
process.exitCode=failed?1:0;
