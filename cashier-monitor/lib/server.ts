import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
export const runtime=env as unknown as {DB:D1Database;BUCKET:R2Bucket;MAD_BRIDGE_TOKEN?:string;MAD_INGEST_TOKEN?:string;MAD_ALLOWED_EMAILS?:string;MAD_CREDENTIALS_KEY?:string};
export function db(){if(!runtime.DB)throw Error('Storage unavailable');return runtime.DB}
export async function viewer(){const u=await getChatGPTUser();if(!u)return false;const allowed=(runtime.MAD_ALLOWED_EMAILS||'').toLowerCase().split(',').map(s=>s.trim());return allowed.includes(u.email.toLowerCase());}
export function sameOrigin(r:Request){return r.headers.get('origin')===new URL(r.url).origin;}
export async function token(r:Request,secret?:string){if(!secret||secret.length<32)return false;const supplied=r.headers.get('authorization')?.replace(/^Bearer /,'')||'';const enc=new TextEncoder();const [a,b]=await Promise.all([crypto.subtle.digest('SHA-256',enc.encode(supplied)),crypto.subtle.digest('SHA-256',enc.encode(secret))]);const x=new Uint8Array(a),y=new Uint8Array(b);let n=0;for(let i=0;i<x.length;i++)n|=x[i]^y[i];return n===0;}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export function saleRow(r:Record<string,unknown>){return {id:r.id,branchId:r.branch_id,registerId:r.register_id,cashier:r.cashier,occurredAt:r.occurred_at,timePrecision:r.time_precision,historical:!!r.historical,amountMinor:r.amount_minor,currency:r.currency,payment:r.payment,products:JSON.parse(String(r.products)),status:r.status,createdAt:r.created_at};}
