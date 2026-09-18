const zone='Asia/Jerusalem';
export function saleDay(epoch=Date.now()){
 const p=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(epoch);
 return ['year','month','day'].map(k=>p.find(x=>x.type===k)!.value).join('-');
}
export function dayWindow(day:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(Date.parse(day))||new Date(day).toISOString().slice(0,10)!==day)throw Error('Invalid day');
 const midnight=(value:string)=>{
  const target=Date.parse(value+'T00:00:00Z');let epoch=target;
  for(let i=0;i<3;i++){
   const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(epoch);
   const n=(key:string)=>Number(parts.find(x=>x.type===key)!.value);
   const wall=Date.UTC(n('year'),n('month')-1,n('day'),n('hour'),n('minute'),n('second'));
   epoch=target-(wall-epoch);
  }
  return epoch;
 };
 const tomorrow=new Date(Date.parse(day+'T00:00:00Z')+86400000).toISOString().slice(0,10);
 return {start:midnight(day),end:midnight(tomorrow)};
}
