import https from 'node:https';
import {resolve4} from 'node:dns';
import {Readable} from 'node:stream';
// Resolve the current A record for the gateway, avoiding stale OS DNS entries
// during a hosting move. HTTPS still validates the original hostname.
export function siteFetch(url,options={}){
 const target=new URL(url);if(target.protocol!=='https:')throw Error('HTTPS required');
 return new Promise((resolve,reject)=>{
  const request=https.request(target,{method:options.method||'GET',headers:options.headers,signal:options.signal,lookup:(hostname,settings,done)=>resolve4(hostname,(error,addresses)=>{if(error||!addresses?.length)return done(error||Error('No gateway address'));if(settings.all)done(null,addresses.map(address=>({address,family:4})));else done(null,addresses[0],4);})},response=>{
   if(response.statusCode>=300&&response.statusCode<400){response.resume();reject(Error('Gateway redirect rejected'));return;}
   const headers=new Headers();for(const [key,value] of Object.entries(response.headers)){if(Array.isArray(value))for(const v of value)headers.append(key,v);else if(value!==undefined)headers.set(key,value);}
   resolve(new Response([204,304].includes(response.statusCode)?null:Readable.toWeb(response),{status:response.statusCode,headers}));
  });request.on('error',reject);
  if(options.body?.pipe){options.body.on('error',error=>request.destroy(error));options.body.pipe(request);}else request.end(options.body);
 });
}
