"""Private MP4 export, keeping recorded audio on the video's timestamp timeline."""
import time
from fractions import Fraction
import av


def transcode(source, output, seconds, deadline):
    video=source.streams.video[0]
    audio=next(iter(source.streams.audio),None)
    width=min(960,video.width);width-=width%2
    height=round(video.height*width/video.width/2)*2
    frames=0;first=None;last=0;last_tick=-1;audio_frames=0;audio_next=None
    with av.open(str(output),'w',options={'movflags':'+faststart'}) as target:
        out=target.add_stream('libx264',rate=10)
        out.width=width;out.height=height;out.pix_fmt='yuv420p'
        out.time_base=Fraction(1,10);out.codec_context.time_base=Fraction(1,10)
        out.options={'preset':'veryfast','crf':'25'}
        sound=target.add_stream('aac',rate=48000) if audio else None
        if sound:
            sound.layout='mono';sound.bit_rate=64000
            resampler=av.AudioResampler(format='fltp',layout='mono',rate=48000)
        done=False
        for packet in source.demux([video,audio] if audio else [video]):
            for frame in packet.decode():
                if time.monotonic()>deadline:raise TimeoutError('export limit')
                if frame.pts is None:continue
                stamp=float(frame.pts*frame.time_base)
                if isinstance(frame,av.VideoFrame):
                    if first is None:first=stamp
                    elapsed=stamp-first
                    if elapsed<0:continue
                    if elapsed>seconds+12:done=True;break
                    tick=round(elapsed*10)
                    if tick<=last_tick:continue
                    last_tick=tick
                    converted=frame.reformat(width=width,height=height,format='yuv420p')
                    converted.pts=tick;converted.time_base=Fraction(1,10)
                    for encoded in out.encode(converted):target.mux(encoded)
                    frames+=1;last=elapsed
                    if elapsed>=seconds+5:done=True;break
                elif sound and first is not None:
                    elapsed=stamp-first
                    if elapsed<0 or elapsed>seconds+5:continue
                    position=round(elapsed*frame.sample_rate)
                    if audio_next is not None:position=max(position,audio_next)
                    frame.pts=position
                    audio_next=position+frame.samples
                    frame.time_base=Fraction(1,frame.sample_rate)
                    for converted in resampler.resample(frame):
                        for encoded in sound.encode(converted):target.mux(encoded)
                        audio_frames+=1
            if done:break
        for encoded in out.encode():target.mux(encoded)
        if sound:
            for converted in resampler.resample(None):
                for encoded in sound.encode(converted):target.mux(encoded)
            for encoded in sound.encode():target.mux(encoded)
    return {'frames':frames,'seconds':round(last,2),'audioFrames':audio_frames,'audioIncluded':audio_frames>0}
