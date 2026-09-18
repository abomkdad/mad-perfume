'use client';
import {useEffect,useRef,useState} from 'react';
import {Volume2,VolumeX} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {toast} from 'sonner';
export default function ClipAlerts(){
 const [active,setActive]=useState(false),[problem,setProblem]=useState('');
 const audio=useRef<AudioContext|null>(null),cursor=useRef<number|null>(null);
 function chime(){const c=audio.current;if(!c)return;void c.resume().then(()=>{const o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.setValueAtTime(660,c.currentTime);o.frequency.setValueAtTime(880,c.currentTime+.14);g.gain.setValueAtTime(.12,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.4);o.start();o.stop(c.currentTime+.4)}).catch(()=>setProblem('اضغط تجربة الصوت لإعادة تفعيله.'))}
 function speak(message:string){
  chime();
  if(!('speechSynthesis'in window)){setProblem('النطق غير متاح في هذا المتصفح؛ ستسمع نغمة ويظهر اسم الفرع.');return}
  const utterance=new SpeechSynthesisUtterance(message);utterance.lang='ar-SA';utterance.rate=.95;
  const voices=speechSynthesis.getVoices();const voice=voices.find(v=>v.lang.startsWith('ar')&&v.localService)||voices.find(v=>v.lang.startsWith('ar'));if(voice)utterance.voice=voice;
  utterance.onerror=e=>{if(e.error!=='canceled'&&e.error!=='interrupted')setProblem('تعذر النطق؛ التنبيه بالنغمة واسم الفرع ما زال يعمل.')};
  speechSynthesis.speak(utterance);
 }
 function toggle(){if(active){setActive(false);cursor.current=null;if('speechSynthesis'in window)speechSynthesis.cancel();return}try{audio.current??=new AudioContext();void audio.current.resume();setProblem('');cursor.current=null;setActive(true);speak('تم تفعيل التنبيهات الصوتية للمقاطع الجديدة')}catch{setProblem('تعذر تفعيل الصوت في هذا المتصفح.')}}
 useEffect(()=>{if(!active)return;let canceled=false,timer:ReturnType<typeof setTimeout>;
  async function poll(){try{
   const response=await fetch('/api/clip-events'+(cursor.current===null?'':'?after='+cursor.current),{cache:'no-store'});
   if(!response.ok)throw Error('notifications');
   const data=await response.json() as {cursor:number;events:{seq:number;branchId:string;branchName:string}[]};if(canceled)return;
   for(const event of data.events){const title='تم تسجيل مقطع جديد في فرع '+(event.branchName||event.branchId);toast.success(title);speak(title)}
   cursor.current=data.cursor;
  }catch{if(!canceled)setProblem('تعذر تحديث تنبيهات المقاطع؛ ستُعاد المحاولة تلقائيًا.')}
  finally{if(!canceled)timer=setTimeout(poll,10000)}}
  void poll();return()=>{canceled=true;clearTimeout(timer)};
 },[active]);
 useEffect(()=>()=>{void audio.current?.close();if('speechSynthesis'in window)speechSynthesis.cancel()},[]);
 return <div className="clip-alerts"><div><Button onClick={toggle} variant={active?'default':'outline'} aria-pressed={active}>{active?<Volume2 size={17}/>:<VolumeX size={17}/>} {active?'الصوت مفعّل — إيقاف':'تفعيل تنبيه المقاطع بالصوت'}</Button>{active&&<Button variant="outline" onClick={()=>speak('تم تسجيل مقطع جديد في فرع يركا')}>تجربة الصوت</Button>}</div><small>{problem||'ينطق اسم الفرع عند اكتمال حفظ المقطع، بما يشمل المقاطع السابقة. يعمل أثناء فتح الصفحة.'}</small></div>
}
