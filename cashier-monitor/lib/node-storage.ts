import {DatabaseSync,type SQLInputValue} from 'node:sqlite';
import {mkdirSync,createReadStream} from 'node:fs';
import {stat,rename,unlink} from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {Readable,Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import {join,resolve} from 'node:path';
const dataDir=()=>resolve(process.env.MAD_DATA_DIR||'./private-data');
let connection:DatabaseSync|undefined;
export function sqlite(){if(!connection){mkdirSync(dataDir(),{recursive:true,mode:0o700});connection=new DatabaseSync(join(dataDir(),'mad.sqlite'));connection.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;');}return connection;}
class Statement {
 args:SQLInputValue[]=[];
 query:string;
 constructor(query:string){this.query=query;}
 bind(...args:SQLInputValue[]){const s=new Statement(this.query);s.args=args;return s;}
 async first(){return sqlite().prepare(this.query).get(...this.args)||null;}
 async all(){return {results:sqlite().prepare(this.query).all(...this.args),success:true};}
 async run(){const r=sqlite().prepare(this.query).run(...this.args);return {success:true,meta:{changes:Number(r.changes),last_row_id:Number(r.lastInsertRowid)}};}
}
export const database={prepare:(q:string)=>new Statement(q),async batch(statements:Statement[]){const conn=sqlite();conn.exec('BEGIN IMMEDIATE');try{const results=[];for(const s of statements){const r=conn.prepare(s.query).run(...s.args);results.push({success:true,meta:{changes:Number(r.changes)}})}conn.exec('COMMIT');return results;}catch(e){conn.exec('ROLLBACK');throw e;}}};
function objectPath(key:string){if(!/^clips\/[a-zA-Z0-9-]+\.mp4$/.test(key))throw Error('Invalid object key');return join(dataDir(),'objects',key);}
export const bucket={
 async put(key:string,body:ReadableStream<Uint8Array>){const path=objectPath(key);mkdirSync(join(dataDir(),'objects','clips'),{recursive:true,mode:0o700});const tmp=path+'.'+crypto.randomUUID()+'.tmp';let size=0;const limit=new Transform({transform(chunk,encoding,callback){size+=chunk.length;callback(size>100*1024*1024?Error('Clip too large'):null,chunk)}});try{await pipeline(Readable.fromWeb(body as never),limit,createWriteStream(tmp,{mode:0o600,flags:'wx'}));if(size<16)throw Error('Invalid clip');await rename(tmp,path);return {size};}catch(e){await unlink(tmp).catch(()=>{});throw e;}},
 async delete(key:string){await unlink(objectPath(key)).catch(e=>{if(e.code!=='ENOENT')throw e;});},
 async get(key:string,options?:{range?:Headers}){const path=objectPath(key);const info=await stat(path).catch(e=>{if(e.code==='ENOENT')return null;throw e;});if(!info)return null;const size=info.size;let offset=0,length=size;const raw=options?.range?.get('range');if(raw){const match=/^bytes=(\d*)-(\d*)$/.exec(raw);if(!match||(!match[1]&&!match[2]))throw Error('Invalid range');if(!match[1]){length=Math.min(size,Number(match[2]));offset=size-length;}else{offset=Number(match[1]);const end=match[2]?Math.min(Number(match[2]),size-1):size-1;length=end-offset+1;}if(!Number.isSafeInteger(offset)||offset<0||offset>=size||length<=0)throw Error('Invalid range');}
 return {size,body:Readable.toWeb(createReadStream(path,{start:offset,end:offset+length-1})),range:raw?{offset,length}:undefined,httpEtag:`"${size}-${Math.floor(info.mtimeMs)}"`,writeHttpMetadata(h:Headers){h.set('Content-Type','video/mp4')}};
 }
};
