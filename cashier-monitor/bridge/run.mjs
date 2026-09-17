import {siteFetch} from './site-fetch.mjs';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {mkdtemp,stat,statfs,rm,open} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,isAbsolute} from 'node:path';
import {createReadStream} from 'node:fs';
const origin=process.env.MAD_SITE_ORIGIN,token=process.env.MAD_BRIDGE_TOKEN,exporter=process.env.MAD_EXPORTER,siteToken=process.env.MAD_SITES_ACCESS_TOKEN;
if(!origin||new URL(origin).protocol!=='https:'||!token||token.length<32||!exporter||!isAbsolute(exporter)){throw Error('Configure HTTPS MAD_SITE_ORIGIN, secret MAD_BRIDGE_TOKEN and absolute MAD_EXPORTER before starting');}
const reserve=Number(process.env.MAD_MIN_FREE_BYTES||0),spacePath=process.env.MAD_SPACE_PATH||tmpdir();
if(!Number.isSafeInteger(reserve)||reserve<0)throw Error('Invalid video disk reserve');
let lowSpace=false,stopping=false;
const stopSignal=new AbortController();
process.once('SIGTERM',()=>{stopping=true;stopSignal.abort();});
const pause=ms=>delay(ms,undefined,{signal:stopSignal.signal}).catch(()=>{});
function authHeaders(){return {Authorization:`Bearer ${token}`,...(siteToken?{'OAI-Sites-Authorization':`Bearer ${siteToken}`}:{})};}
async function api(path,body){const r=await siteFetch(new URL(path,origin),{method:'POST',headers:{...authHeaders(),'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(30000),redirect:'error'});if(!r.ok)throw Error('Gateway request rejected');return r.json()}
async function exportClip(job,outputPath){await new Promise((resolve,reject)=>{const child=spawn(exporter,[],{stdio:['pipe','ignore','ignore'],shell:false,timeout:480000});child.on('error',()=>reject(Error('Exporter unavailable')));child.on('exit',code=>code===0?resolve():reject(Error('Exporter failed')));child.stdin.end(JSON.stringify({...job,outputPath}));});const info=await stat(outputPath);if(!info.isFile()||info.size<16||info.size>100*1024*1024)throw Error('Invalid clip size');const file=await open(outputPath);try{const b=Buffer.alloc(12);await file.read(b,0,12,0);if(b.toString('ascii',4,8)!=='ftyp')throw Error('Exporter did not produce MP4')}finally{await file.close()}return info.size;}
await api('/api/jobs',{action:'heartbeat'});
const heartbeat=setInterval(()=>api('/api/jobs',{action:'heartbeat'}).catch(()=>console.error('Video service heartbeat failed')),30000);
while(!stopping){let job,folder;try{if(reserve){const space=await statfs(spacePath);if(space.bavail*space.bsize<reserve){if(!lowSpace)console.error('Video queue paused: disk reserve reached');lowSpace=true;await pause(60000);continue;}if(lowSpace)console.log('Video queue resumed: disk space available');lowSpace=false;}({job}=await api('/api/jobs',{action:'claim'}));if(job){folder=await mkdtemp(join(tmpdir(),'mad-clip-'));const path=join(folder,'clip.mp4'),size=await exportClip(job,path);const r=await siteFetch(new URL('/api/clip?id='+encodeURIComponent(job.id),origin),{method:'PUT',headers:{...authHeaders(),'x-job-lease':job.lease,'Content-Type':'video/mp4','Content-Length':String(size)},body:createReadStream(path),duplex:'half',redirect:'error',signal:AbortSignal.timeout(60000)});if(!r.ok)throw Error('Upload rejected');console.log(JSON.stringify({at:new Date().toISOString(),status:'saved',device:job.device,channel:job.channel,id:job.id}));}}catch{console.error('Integration attempt failed; retrying safely');if(job)await api('/api/jobs',{action:'fail',id:job.id,lease:job.lease}).catch(()=>{});}finally{if(folder)await rm(folder,{recursive:true,force:true});}if(!stopping)await pause(10000);}
clearInterval(heartbeat);
process.exit(0);
