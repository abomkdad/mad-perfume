import assert from 'node:assert/strict';
import {saleDay,dayWindow} from '../lib/sale-day.ts';
import {summarizeSales,csvSummary,paymentSplit} from '../lib/sales-summary.ts';
for(const [day,hours] of [['2026-09-18',24],['2026-03-27',23],['2026-10-25',25]]){
 const {start,end}=dayWindow(day);assert.equal((end-start)/3600000,hours);assert.equal(saleDay(start),day);assert.equal(saleDay(end-1),day);assert.notEqual(saleDay(end),day);
}
assert.throws(()=>dayWindow('2026-02-30'));assert.throws(()=>dayWindow('bad'));
const branches=[{id:'a',name:'A'},{id:'b',name:'B'}];
assert.deepEqual(paymentSplit('نقدي 200.00 ₪ + بطاقة 120.00 ₪',32000),{cash:20000,card:12000,other:0});
assert.deepEqual(paymentSplit('بطاقة 150.00 ₪ + بطاقة 150.00 ₪',30000),{cash:0,card:30000,other:0});
assert.deepEqual(paymentSplit('نقدي 200.00 ₪',30000),{cash:0,card:0,other:30000});
const sales=[{branchId:'a',currency:'ILS',payment:'cash',amountMinor:10000},{branchId:'a',currency:'ILS',payment:'card',amountMinor:-1000},{branchId:'b',currency:'ILS',payment:'mixed',amountMinor:5000}];
const rows=summarizeSales(sales,branches);assert.equal(rows[0].total,9000);assert.equal(rows[0].count,2);assert.equal(rows[0].cash,10000);assert.equal(rows[0].card,-1000);assert.equal(rows[1].other,5000);assert(csvSummary(rows,'2026-09-18').includes('"90.00"'));
console.log('PASS: Jerusalem midnight, DST short/long days, invalid dates, branch totals, refunds and unknown payment classification');
