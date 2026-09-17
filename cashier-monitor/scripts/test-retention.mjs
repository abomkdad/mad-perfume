import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {mkdtempSync,readFileSync,readdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {cleanupRecordings,RETENTION_MS} from '../lib/retention.ts';
const folder=mkdtempSync(join(tmpdir(),'mad-retention-test-'));
let sql=new DatabaseSync(join(folder,'test.sqlite'));
try {
 for(const f of readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sql.exec(readFileSync(join('drizzle',f),'utf8'));
 let failFinalize=false;
 const database={prepare(query){let args=[];return {bind(...values){args=values;return this},async run(){if(failFinalize&&query.startsWith("UPDATE sales SET status='expired',clip_key=NULL")){failFinalize=false;throw Error('DB interrupted')}const result=sql.prepare(query).run(...args);return {meta:{changes:result.changes}}},async all(){return {results:sql.prepare(query).all(...args)}}}}};
 const now=Date.UTC(2026,8,17),cutoff=now-RETENTION_MS;
 const objects=new Set(['old.mp4','recent.mp4','boundary.mp4','retry.mp4','finalize.mp4']);
 const bucket={async delete(key){objects.delete(key)}};
 function seed(id,when,status='ready',key=id+'.mp4') {sql.prepare("INSERT INTO sales(id,branch_id,register_id,cashier,occurred_at,amount_minor,currency,payment,products,status,created_at,next_attempt,clip_key) VALUES(?,'25351','pos','cashier',?,34900,'ILS','cash','[]',?,?,?,?)").run(id,when,status,now,now,key)}
 const row=id=>sql.prepare('SELECT * FROM sales WHERE id=?').get(id);
 seed('old',cutoff-1);seed('boundary',cutoff);seed('recent',cutoff+1);seed('pending',cutoff-1,'processing',null);
 assert.deepEqual(await cleanupRecordings(database,bucket,now),{removed:2,failed:0});
 assert.equal(row('old').status,'expired');assert.equal(row('boundary').clip_key,null);
 assert.equal(row('pending').status,'expired');assert.equal(row('recent').status,'ready');assert(objects.has('recent.mp4'));
 assert.equal(row('old').amount_minor,34900);assert.equal(row('old').products,'[]');
 assert.deepEqual(await cleanupRecordings(database,bucket,now),{removed:0,failed:0});
 seed('retry',cutoff-1);
 assert.deepEqual(await cleanupRecordings(database,{async delete(){throw Error('R2 unavailable')}},now),{removed:0,failed:1});
 assert.equal(row('retry').status,'expiring');assert(objects.has('retry.mp4'));
 sql.close();sql=new DatabaseSync(join(folder,'test.sqlite'));
 await cleanupRecordings(database,bucket,now);assert.equal(row('retry').status,'expired');assert(!objects.has('retry.mp4'));
 seed('finalize',cutoff-1);failFinalize=true;
 assert.deepEqual(await cleanupRecordings(database,bucket,now),{removed:0,failed:1});
 assert(!objects.has('finalize.mp4'));assert.equal(row('finalize').status,'expiring');
 await cleanupRecordings(database,bucket,now);assert.equal(row('finalize').status,'expired');
 assert.equal(sql.prepare('SELECT count(*) AS n FROM sales').get().n,6);
 assert.equal(sql.prepare("SELECT status FROM integrations WHERE id='retention'").get().status,'ok');
 console.log('PASS: 30-day boundary, recent clip protection, invoices preserved, restart recovery, R2 and database failures, idempotent deletion');
} finally {sql.close();rmSync(folder,{recursive:true,force:true})}
