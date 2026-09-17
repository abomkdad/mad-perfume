import {sameOrigin,json} from '@/lib/server';import {revokeSession} from '@/lib/auth';
export async function POST(r:Request){if(!sameOrigin(r))return json({error:'Origin rejected'},403);await revokeSession();return new Response(null,{status:204,headers:{'Set-Cookie':'__Host-mad_session=; Path=/; Secure; HttpOnly; SameSite=Strict; Max-Age=0','Cache-Control':'no-store'}})}
