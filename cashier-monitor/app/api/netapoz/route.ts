import {actor} from '@/lib/auth';
import {sameOrigin,json} from '@/lib/server';
import {audit} from '@/lib/management';
import {configured,loginVendor,saveCredentials,saveSession} from '@/bridge/netapoz-auth.mjs';
import {z} from 'zod';
export async function GET(){const a=await actor();if(!a||a.role!=='admin')return json({error:'Forbidden'},403);return json({configured:await configured()})}
export async function POST(r:Request){const a=await actor();if(!a||a.role!=='admin'||!sameOrigin(r))return json({error:'Forbidden'},403);try{const text=await r.text();if(text.length>4096)return json({error:'Too large'},413);const d=z.object({accountName:z.string().trim().min(1).max(150),username:z.string().trim().min(1).max(150),password:z.string().min(1).max(256)}).parse(JSON.parse(text));const cookie=await loginVendor(d);await saveCredentials(d);await saveSession(cookie);audit(a,'configure','integration','netapoz',{credentialsUpdated:true});return json({ok:true});}catch{return json({error:'تعذّر التحقق من حساب Netapoz. تأكد من بيانات الحساب واتصاله.'},400)}}
