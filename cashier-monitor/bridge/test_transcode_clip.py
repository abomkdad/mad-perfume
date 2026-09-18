import tempfile,pathlib,unittest,time,math,struct
from fractions import Fraction
import av
from transcode_clip import transcode

class ClipTests(unittest.TestCase):
 def test_audio_and_silent(self):
  with tempfile.TemporaryDirectory() as folder:
   for with_audio in [True,False]:
    src=pathlib.Path(folder)/('source-'+str(with_audio)+'.mp4');out=src.with_name('out-'+src.name)
    with av.open(str(src),'w') as c:
     v=c.add_stream('libx264',rate=10);v.width=160;v.height=180;v.pix_fmt='yuv420p'
     a=c.add_stream('aac',rate=48000) if with_audio else None
     if a:a.layout='mono'
     for i in range(80):
      f=av.VideoFrame(160,180,'yuv420p')
      for p in f.planes:p.update(bytes([100])*p.buffer_size)
      f.pts=i;f.time_base=Fraction(1,10)
      for pkt in v.encode(f):c.mux(pkt)
      if a:
       f=av.AudioFrame(format='fltp',layout='mono',samples=4800);f.sample_rate=48000;f.pts=i*4800;f.time_base=Fraction(1,48000)
       f.planes[0].update(struct.pack('<4800f',*[.15*math.sin(2*math.pi*440*(i*4800+j)/48000) for j in range(4800)]))
       for pkt in a.encode(f):c.mux(pkt)
     for pkt in v.encode():c.mux(pkt)
     if a:
      for pkt in a.encode():c.mux(pkt)
    with av.open(str(src)) as c:result=transcode(c,out,2,time.monotonic()+30)
    self.assertEqual(result['audioIncluded'],with_audio)
    with av.open(str(out)) as c:
     self.assertEqual(c.streams.video[0].codec_context.name,'h264')
     self.assertAlmostEqual(c.streams.video[0].width/c.streams.video[0].height,16/9,places=2)
     self.assertEqual(len(c.streams.audio),int(with_audio))
     if with_audio:
      a=c.streams.audio[0];self.assertEqual(a.codec_context.name,'aac')
      self.assertLess(abs(float(a.duration*a.time_base)-result['seconds']),.3)
      self.assertGreater(sum(1 for _ in c.decode(audio=0)),0)
if __name__=='__main__':unittest.main()
