(function(){
var VERSION="20260706f";
var holder=document.getElementById("mad-product-route");
var path=location.pathname.replace(/^\/+|\/+$/g,"");
var m=path.match(/^(ar|he|iw)\/(?:product|p)\/(\d+)$/i);
var m2=path.match(/^(?:product|p)\/(\d+)$/i)||path.match(/^(\d+)$/);
var lang=(holder&&holder.dataset.lang)||"";
var id=(holder&&holder.dataset.id)||"";
if(m){lang=m[1].toLowerCase()==="iw"?"he":m[1].toLowerCase();id=m[2];}else if(!id&&m2){id=m2[1];}
if(!lang)lang=detectLang();
document.documentElement.lang=lang;document.documentElement.dir="rtl";
function detectLang(){var l=(navigator.languages||[navigator.language||""]).join(" ").toLowerCase();return /\b(he|iw)\b/.test(l)?"he":"ar";}
function fallback(text,href){document.body.innerHTML='<main style="max-width:360px;margin:40px auto;padding:20px;text-align:center;line-height:1.7;font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;color:#fff"><p>'+text+'</p><a style="color:#25d366;font-weight:800" href="'+href+'">'+(lang==="he"?"פתיחה":"فتح الصفحة")+'</a></main>';document.body.style.background="#121a2b";}
function extractCatalog(s){var marker="const FALLBACK_CATALOG = ";var start=s.indexOf(marker);if(start<0)throw new Error("catalog missing");var i=start+marker.length,depth=0,inString=false,escaped=false;for(;i<s.length;i++){var ch=s[i];if(inString){if(escaped)escaped=false;else if(ch==="\\")escaped=true;else if(ch==='"')inString=false;continue;}if(ch==='"')inString=true;else if(ch==="{"||ch==="[")depth++;else if(ch==="}"||ch==="]")depth--;else if(ch===";"&&depth===0)break;}return JSON.parse(s.slice(start+marker.length,i));}
function storeId(p){var text=String((p&&p.link)||"")+" "+String((p&&p.id)||"");var mm=text.match(/product\.show\.(\d+)/i);return mm?mm[1]:"";}
function resolve(catalog,wantedId,wantedLang){function find(locale){return(catalog[locale]||[]).find(function(p){return storeId(p)===wantedId;});}var product=find(wantedLang),locale=wantedLang;if(!product&&wantedLang!=="he"){product=find("he");locale="he";}if(!product&&wantedLang!=="ar"){product=find("ar");locale="ar";}return{product:product,locale:locale};}
function forcedQuery(code,locale){var p=new URLSearchParams(location.search);p.set("lang",locale||lang);p.set("p",code||id);if(!p.has("v"))p.set("v",VERSION);return"?"+p.toString();}
async function main(){if(!id){fallback(lang==="he"?"המוצר לא נמצא.":"لم نجد المنتج.","/customer.html");return;}if(holder)holder.textContent=lang==="he"?"פותחים את עמוד המוצר...":"يتم فتح صفحة المنتج...";var r=await fetch("/customer.html?v="+VERSION,{cache:"force-cache"});var customerHtml=await r.text();var catalog=extractCatalog(customerHtml);var found=resolve(catalog,id,lang);if(!found.product||!found.product.code){fallback(lang==="he"?"המוצר לא נמצא.":"لم نجد المنتج.","/customer.html");return;}var q=forcedQuery(found.product.code,found.locale);var patched=customerHtml.replace("const qs = new URLSearchParams(location.search);","const qs = new URLSearchParams("+JSON.stringify(q)+");");document.open();document.write(patched);document.close();}
main().catch(function(){var href="/p.html?lang="+encodeURIComponent(lang)+"&id="+encodeURIComponent(id)+"&v="+VERSION;fallback(lang==="he"?"פותחים את עמוד המוצר.":"سيتم فتح صفحة المنتج خلال لحظات.",href);});
}());
