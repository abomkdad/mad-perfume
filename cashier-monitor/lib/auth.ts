import {cookies} from 'next/headers';
import {createHash,scryptSync,timingSafeEqual,randomBytes} from 'node:crypto';
import {sqlite} from './node-storage';
const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
export async function viewer(){const value=(await cookies()).get('__Host-mad_session')?.value;if(!value)return false;return !!sqlite().prepare('SELECT 1 FROM app_sessions WHERE token_hash=? AND expires_at>?').get(hash(value),Date.now());}
export function checkPassword(password:string){const value=process.env.MAD_ADMIN_PASSWORD_HASH;if(!value)return false;const [salt,expected]=value.split(':');if(!salt||!expected)return false;const actual=scryptSync(password,salt,64),target=Buffer.from(expected,'hex');return target.length===actual.length&&timingSafeEqual(target,actual);}
export function createSession(){const value=randomBytes(32).toString('base64url');sqlite().prepare('DELETE FROM app_sessions WHERE expires_at<=?').run(Date.now());sqlite().prepare('INSERT INTO app_sessions VALUES(?,?)').run(hash(value),Date.now()+30*86400000);return value;}
export async function revokeSession(){const value=(await cookies()).get('__Host-mad_session')?.value;if(value)sqlite().prepare('DELETE FROM app_sessions WHERE token_hash=?').run(hash(value));}
export function allowLogin(){const now=Date.now();sqlite().prepare('DELETE FROM login_attempts WHERE at<?').run(now-600000);const row=sqlite().prepare('SELECT count(*) AS n FROM login_attempts').get();if(Number(row?.n)>=15)return false;sqlite().prepare('INSERT INTO login_attempts(at) VALUES(?)').run(now);return true;}
export function clearAttempts(){sqlite().exec('DELETE FROM login_attempts');}
