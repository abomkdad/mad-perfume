"""Export one authorized job from Dahua P2P to browser-compatible private MP4."""
import datetime as dt
import json
import math
import os
import pathlib
import sys
import time
import urllib.parse
from zoneinfo import ZoneInfo
from clock_history import recording_offset
if sys.platform == 'linux':
    from dahua_transport_linux import ROOT, credential, Transport, http_client
else:
    from dahua_transport import ROOT, credential, Transport, http_client

sys.path.insert(0,str(ROOT/'work/media-tools'))
import av
av.logging.set_level(av.logging.PANIC)
from transcode_clip import transcode

def export(job):
    if not isinstance(job.get('channel'),int) or not 1<=job['channel']<=8:raise ValueError('channel')
    start,end=job['start']/1000,job['end']/1000
    if not all(math.isfinite(v) for v in [start,end]) or not 10<=end-start<=240:raise ValueError('window')
    output=pathlib.Path(job['outputPath'])
    if not output.is_absolute() or output.exists():raise ValueError('output')
    d=credential(job['device']);zone=ZoneInfo('Asia/Jerusalem')
    with Transport(d) as transport:
        base,op=http_client(d,transport.port(int(transport.info.get('httpport',80))))
        with op.open(base+'/cgi-bin/magicBox.cgi?action=getSystemInfo',timeout=15) as response:system=response.read().decode()
        if d['serial'].lower() not in system.lower():raise ValueError('identity')
        before=time.time()
        with op.open(base+'/cgi-bin/global.cgi?action=getCurrentTime',timeout=15) as response:clock=response.read().decode().strip().split('=',1)[1]
        after=time.time()
        device_wall=dt.datetime.strptime(clock,'%Y-%m-%d %H:%M:%S')
        # Compare wall clocks, avoiding DST fold interpretation of recorder time.
        reference=dt.datetime.fromtimestamp((before+after)/2,zone).replace(tzinfo=None)
        skew=(device_wall-reference).total_seconds()
        if abs(skew)>86400 or after-before>10:raise ValueError('unreliable device clock')
        skew=recording_offset(job['device'],start-3,end+3,skew)
        def local(epoch):return (dt.datetime.fromtimestamp(epoch,zone).replace(tzinfo=None)+dt.timedelta(seconds=skew)).strftime('%Y_%m_%d_%H_%M_%S')
        port=transport.port(int(transport.info.get('rtspport',554)))
        params=urllib.parse.urlencode({'channel':job['channel'],'subtype':0,'starttime':local(start-3),'endtime':local(end+3)})
        url=f"rtsp://{urllib.parse.quote(d['username'],safe='')}:{urllib.parse.quote(d['password'],safe='')}@127.0.0.1:{port}/cam/playback?{params}"
        deadline=time.monotonic()+400;frames=0;first=None;last=0;last_tick=-1
        try:
            with av.open(url,options={'rtsp_transport':'tcp'},timeout=(20,25)) as source:
                result=transcode(source,output,end-start,deadline)
                frames=result['frames'];last=result['seconds']
            output.chmod(0o600)
            if frames<20 or last<end-start-2:raise ValueError('incomplete recording')
            if not 1000<output.stat().st_size<=100*1024*1024:raise ValueError('clip size')
            with av.open(str(output)) as check:
                if check.streams.video[0].codec_context.name!='h264':raise ValueError('codec')
            return {**result,'clockOffsetSeconds':round(skew),'bytes':output.stat().st_size}
        except Exception:
            output.unlink(missing_ok=True);raise

if __name__=='__main__':
    try:
        os.umask(0o077)
        if sys.platform == 'linux':
            import signal
            def terminate_export(*args):
                raise TimeoutError('export interrupted')
            signal.signal(signal.SIGTERM, terminate_export)
        request=json.loads(sys.stdin.read(8192))
        result=export(request)
        # Native Dahua libraries may log credentials; caller discards both output streams.
        if os.environ.get('MAD_EXPORT_RESULT'):
            pathlib.Path(os.environ['MAD_EXPORT_RESULT']).write_text(json.dumps(result))
    except Exception as error:
        if os.environ.get('MAD_EXPORT_RESULT'):
            import traceback
            pathlib.Path(os.environ['MAD_EXPORT_RESULT']).write_text(json.dumps({'error':type(error).__name__,'lines':[(f.name,f.lineno) for f in traceback.extract_tb(error.__traceback__)]}))
        sys.exit(1)
