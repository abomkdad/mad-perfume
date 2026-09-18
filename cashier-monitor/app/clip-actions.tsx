'use client';
import {useState} from 'react';
import {Download,Share2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
export default function ClipActions({id}:{id:string}){
 const [busy,setBusy]=useState(false),[file,setFile]=useState<File|null>(null);
 const url='/api/clip?id='+encodeURIComponent(id);
 async function prepare(){
  if(file){try{await navigator.share({files:[file],title:'مقطع عملية MAD'})}catch(e){if((e as Error).name!=='AbortError')toast.error('تعذرت المشاركة. يمكنك تنزيل المقطع وإرساله.')}return}
  setBusy(true);
  try{
   const r=await fetch(url);if(!r.ok)throw Error('تعذر تحميل المقطع. حدّث الصفحة وحاول مجددًا.');
   const blob=await r.blob();const clip=new File([blob],'MAD-clip.mp4',{type:'video/mp4'});
   if(navigator.canShare?.({files:[clip]})){setFile(clip);toast.success('المقطع جاهز. اضغط مشاركة الآن لاختيار التطبيق.')}else{const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='MAD-clip.mp4';a.click();setTimeout(()=>URL.revokeObjectURL(href),60000);toast('هذا المتصفح لا يدعم مشاركة الملفات؛ تم طلب تنزيل المقطع لتتمكن من إرساله.')}
  }catch(e){toast.error((e as Error).message)}finally{setBusy(false)}
 }
 return <><div className="clip-actions"><Button asChild variant="outline"><a href={url+'&download=1'} download><Download size={17}/> تنزيل المقطع</a></Button><Button disabled={busy} onClick={prepare}><Share2 size={17}/>{busy?'جارٍ تجهيز المقطع…':file?'مشاركة الآن':'تجهيز للمشاركة'}</Button></div><p className="sub">الصوت متاح إذا كان مسجّلًا بالكاميرا. المشاركة ترسل نسخة من المقطع إلى التطبيق الذي تختاره.</p></>
}
