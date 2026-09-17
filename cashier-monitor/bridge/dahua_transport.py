"""Dahua's locally installed transport; secrets are never passed on the command line."""
import ctypes as C
import json
import os
import pathlib
import re
import time
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
FW = '/Applications/SmartPSSLite.app/Contents/Frameworks'

def credential(alias):
    records = json.loads((ROOT / '.env.dahua-devices.json').read_text())
    return next(d for d in records if re.sub(r'[^a-z0-9_-]', '_', d['name'].lower()) == alias)

class Transport:
    def __init__(self, device):
        self.device = device
        self.handle = C.c_void_p()
        cfg = json.loads((ROOT / '.env.dahua-transport.json').read_text())
        self.lib = C.CDLL(FW + '/libP2PDll.dylib', mode=C.RTLD_GLOBAL)
        signatures = {
            'P2P_Init': [C.c_int,C.c_char_p,C.c_int,C.c_char_p,C.c_char_p,C.POINTER(C.c_void_p)],
            'P2P_GetDeviceInfo': [C.c_int,C.c_void_p,C.c_char_p,C.c_int,C.c_char_p],
            'P2P_Connect': [C.c_int,C.c_void_p,C.c_char_p,C.c_int,C.POINTER(C.c_int),C.c_char_p,C.c_char_p,C.c_char_p,C.c_char_p],
            'P2P_UnInit': [C.c_int,C.c_void_p],
        }
        for name,args in signatures.items():
            fn=getattr(self.lib,name);fn.argtypes=args;fn.restype=C.c_int
        result=self.lib.P2P_Init(0,b'www.easy4ipcloud.com',8800,cfg['guess'].encode(),cfg['username'].encode(),C.byref(self.handle))
        if result or not self.handle.value: raise RuntimeError('Dahua transport unavailable')
        try:
            buf=C.create_string_buffer(4096)
            if self.lib.P2P_GetDeviceInfo(0,self.handle,device['serial'].encode(),len(buf),buf):
                raise RuntimeError('Device unavailable')
            self.info=json.loads(buf.value)
        except Exception:
            self.close();raise
    def port(self, remote):
        p=C.c_int()
        r=self.lib.P2P_Connect(0,self.handle,self.device['serial'].encode(),remote,C.byref(p),self.device['username'].encode(),self.device['password'].encode(),self.info.get('randsalt','').encode(),self.info.get('devp2pver','6.6.5').encode())
        if r or not p.value:raise RuntimeError('Device connection failed')
        time.sleep(2)
        return p.value
    def close(self):
        if self.handle.value:
            self.lib.P2P_UnInit(0,self.handle);self.handle=C.c_void_p()
    def __enter__(self):return self
    def __exit__(self,*args):self.close()

def http_client(device,port):
    base=f'http://127.0.0.1:{port}'
    manager=urllib.request.HTTPPasswordMgrWithDefaultRealm()
    manager.add_password(None,base,device['username'],device['password'])
    return base,urllib.request.build_opener(urllib.request.HTTPDigestAuthHandler(manager))
