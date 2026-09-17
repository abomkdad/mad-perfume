export function registerBranchFilter(onFilter:(id:string)=>void,ids:string[]){
 const ctx=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:{signal:AbortSignal})=>unknown}}).modelContext;
 if(!ctx)return()=>{};const controller=new AbortController();
 Promise.resolve(ctx.registerTool({name:'filter_mad_sales',title:'عرض مبيعات فرع',description:'Change the visible sales filter. Does not import or modify sales.',inputSchema:{type:'object',properties:{branchId:{type:'string',enum:['all',...ids]}},required:['branchId'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async(input:unknown)=>{const id=(input as {branchId?:unknown})?.branchId;if(typeof id!=='string'||!['all',...ids].includes(id))throw Error('Unknown branch');onFilter(id);return {branchId:id,filterApplied:true}}},{signal:controller.signal})).catch(()=>{});
 return()=>controller.abort();
}
