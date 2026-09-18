import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {cleanupRecordings,LOW_FREE_BYTES,TARGET_FREE_BYTES} from '../lib/retention.ts';
const folder=mkdtempSync(join(tmpdir(),'mad-retention-test-'));
let sql=new DatabaseSync(join(folder,'test.sqlite'));
try {
 for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(join('drizzle',f),'utf8'));
 let failFinalize=false;
 const database={prepare(query){let args=[];return {bind(...values){args=values;return this},async run(){if(failFinalize&&query.startsWith("UPDATE sales SET status='expired',clip_key=NULL")){failFinalize=false;throw Error('DB interrupted')}const result=sql.prepare(query).run(...args);return {meta:{changes:result.changes}}},async first(){return sql.prepare(query).get(...args)},async all(){return {results:sql.prepare(query).all(...args)}}}}};
 const now=Date.UTC(2026,8,17),cutoff=now-30*86400000;
 let free=TARGET_FREE_BYTES; const disk=async()=>free;
 const objects=new Set(['old.mp4','recent.mp4','boundary.mp4','retry.mp4','finalize.mp4']);
 const bucket={async delete(key){objects.delete(key)}};
 function seed(id,when,status='ready',key=id+'.mp4') {sql.prepare("INSERT INTO sales(id,branch_id,register_id,cashier,occurred_at,amount_minor,currency,payment,products,status,created_at,next_attempt,clip_key) VALUES(?,'25351','pos','cashier',?,34900,'ILS','cash','[]',?,?,?,?)").run(id,when,status,now,now,key)}
 const row=id=>sql.prepare('SELECT * FROM sales WHERE id=?').get(id);
 seed('old',1);seed('boundary',2);seed('recent',3);seed('pending',4,'queued',null);
 assert.deepEqual(await cleanupRecordings(database,bucket,now,disk),{removed:0,failed:0});
 free=LOW_FREE_BYTES-1;const removed=[];
 const capacityBucket={async delete(key){objects.delete(key);removed.push(key);free+=600*1024**2}};
 assert.deepEqual(await cleanupRecordings(database,capacityBucket,now,disk),{removed:2,failed:0});
 assert.deepEqual(removed,['old.mp4','boundary.mp4']);assert.equal(row('recent').status,'ready');assert.equal(row('pending').status,'queued');assert.equal(row('old').amount_minor,34900);
 free=LOW_FREE_BYTES-1;
 assert.deepEqual(await cleanupRecordings(database,{async delete(){throw Error('Unavailable')}},now,disk),{removed:0,failed:1});
 assert.equal(row('recent').status,'expiring');
 sql.close();sql=new DatabaseSync(join(folder,'test.sqlite'));free=TARGET_FREE_BYTES;failFinalize=true;
 assert.deepEqual(await cleanupRecordings(database,bucket,now,disk),{removed:0,failed:1});
 assert.equal(row('recent').status,'expiring');
 await cleanupRecordings(database,bucket,now,disk);assert.equal(row('recent').status,'expired');assert.equal(row('recent').clip_key,null);
 assert.equal(sql.prepare('SELECT count(*) AS n FROM sales').get().n,4);
 console.log('PASS: unlimited age, oldest-first capacity eviction, invoice preservation, restart and interrupted deletion recovery');

} finally {sql.close();rmSync(folder,{recursive:true,force:true})}
