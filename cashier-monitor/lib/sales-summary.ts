import type {Sale} from './branches';
type Summary={branchId:string;name:string;currency:string;count:number;total:number;cash:number;card:number;other:number};
export function paymentSplit(value:string,total:number){
 const p=value.trim().toLowerCase();
 if(['cash','نقدي','نقد','מזומן'].includes(p))return {cash:total,card:0,other:0};
 if(['card','credit','credit card','بطاقة','بطاقات','אשראי','כרטיס אשראי'].includes(p))return {cash:0,card:total,other:0};
 let cash=0,card=0;
 for(const part of p.split(' + ')){
  const m=/^(نقدي|بطاقة)\s+(-?\d+(?:\.\d{1,2})?)\s*₪$/.exec(part);
  if(!m)return {cash:0,card:0,other:total};
  const amount=Math.round(Number(m[2])*100);if(m[1]==='نقدي')cash+=amount;else card+=amount;
 }
 return cash+card===total?{cash,card,other:0}:{cash:0,card:0,other:total};
}
export function summarizeSales(sales:Sale[],branches:{id:string;name:string}[]):Summary[]{
 const map=new Map<string,Summary>();
 for(const b of branches)map.set(b.id+'ILS',{branchId:b.id,name:b.name,currency:'ILS',count:0,total:0,cash:0,card:0,other:0});
 for(const s of sales){const key=s.branchId+s.currency;let row=map.get(key);if(!row){row={branchId:s.branchId,name:branches.find(b=>b.id===s.branchId)?.name||s.branchId,currency:s.currency,count:0,total:0,cash:0,card:0,other:0};map.set(key,row)}row.count++;row.total+=s.amountMinor;const payment=paymentSplit(s.payment,s.amountMinor);row.cash+=payment.cash;row.card+=payment.card;row.other+=payment.other;}
 return [...map.values()];
}
export function csvSummary(rows:Summary[],day:string){
 const cell=(v:string|number)=>'"'+String(v).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
 return [['التاريخ','الفرع','العملة','عدد الفواتير','الإجمالي','نقدي','بطاقات','مختلط / أخرى'],...rows.map(r=>[day,r.name,r.currency,r.count,(r.total/100).toFixed(2),(r.cash/100).toFixed(2),(r.card/100).toFixed(2),(r.other/100).toFixed(2)])].map(r=>r.map(cell).join(',')).join('\r\n');
}
