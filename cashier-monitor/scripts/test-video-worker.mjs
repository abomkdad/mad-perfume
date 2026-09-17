import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import assert from 'node:assert/strict';
const root=await mkdtemp(join(tmpdir(),'mad-worker-test-'));
let child;
try{
 await writeFile(join(root,'run.mjs'),await readFile(new URL('../bridge/run.mjs',import.meta.url)));
 await writeFile(join(root,'site-fetch.mjs'),`import {appendFileSync} from 'node:fs';
export async function siteFetch(url,options){
 const action=url.pathname==='/api/clip'?'upload':JSON.parse(options.body).action;
 appendFileSync(process.env.TEST_LOG,action+'\\n');
 if(action==='claim')return Response.json({job:process.env.TEST_JOB?{id:'fixture',lease:'test',device:'fixture',channel:1}:null});
 if(action==='upload')for await(const chunk of options.body){}
 return Response.json({ok:true});
}`);
 const exporter=join(root,'exporter');
 await writeFile(exporter,`#!${process.execPath}
const fs=require('node:fs');let input='';process.stdin.on('data',b=>input+=b);process.stdin.on('end',()=>{
 fs.appendFileSync(process.env.TEST_LOG,'export\\n');
 setTimeout(()=>{const b=Buffer.alloc(32);b.write('ftyp',4);fs.writeFileSync(JSON.parse(input).outputPath,b)},350);
});`,{mode:0o700});
 async function run(mode){
  const log=join(root,mode+'.log');await writeFile(log,'');
  child=spawn(process.execPath,[join(root,'run.mjs')],{env:{...process.env,
   MAD_SITE_ORIGIN:'https://fixture.invalid',MAD_BRIDGE_TOKEN:'x'.repeat(40),MAD_EXPORTER:exporter,
   MAD_SPACE_PATH:root,MAD_MIN_FREE_BYTES:mode==='reserve'?String(Number.MAX_SAFE_INTEGER):'0',
   TEST_LOG:log,TEST_JOB:mode==='graceful'?'yes':''},stdio:'ignore'});
  const done=once(child,'exit');
  let content='';const deadline=Date.now()+5000;
  while(Date.now()<deadline){content=await readFile(log,'utf8');if(content.includes(mode==='graceful'?'export':'heartbeat'))break;await new Promise(r=>setTimeout(r,20));}
  assert(content.includes(mode==='graceful'?'export':'heartbeat'));
  // Let the low-space check run; no real network or camera is involved.
  if(mode==='reserve')await new Promise(r=>setTimeout(r,80));
  child.kill('SIGTERM');
  const timeout=setTimeout(()=>child?.kill('SIGKILL'),4000);
  const [code,signal]=await done;clearTimeout(timeout);child=null;
  assert.equal(signal,null);assert.equal(code,0);
  content=await readFile(log,'utf8');
  if(mode==='reserve')assert(!content.includes('claim'));
  else {assert(content.includes('upload'));assert(!content.includes('fail'));}
 }
 await run('reserve');await run('graceful');
 console.log('Video worker: low-disk pause without claiming, prompt shutdown, and in-flight upload on graceful stop passed');
}finally{child?.kill('SIGKILL');await rm(root,{recursive:true,force:true});}
