"""Private Dahua transport on Linux using the vendor Windows DLL under Wine.

Run as a dedicated, unprivileged rootless-Podman user. Vendor output is consumed
in memory: it must never be forwarded to application logs.
"""
import json
import os
import pathlib
import queue
import re
import shutil
import subprocess
import threading
import time
import urllib.request
import uuid

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONFIG = pathlib.Path(os.environ.get('MAD_DAHUA_CONFIG', '/etc/mad-video'))


def credential(alias):
    if not re.fullmatch(r'[a-z0-9_-]{1,80}', alias):
        raise ValueError('device alias')
    records = json.loads((CONFIG / 'devices.json').read_text())
    return next(d for d in records if re.sub(r'[^a-z0-9_-]', '_', d['name'].lower()) == alias)


class Transport:
    def __init__(self, device):
        self.name = 'mad-p2p-' + uuid.uuid4().hex
        self.process = None
        self.events = queue.Queue(maxsize=16)
        self.folder = pathlib.Path.home() / 'runtime' / self.name
        self.folder.mkdir(parents=True, mode=0o700)
        try:
            shutil.copytree('/opt/mad-dahua-windows/wine', self.folder / 'wine', symlinks=True)
            cloud = json.loads((CONFIG / 'cloud.json').read_text())
            values = ['www.easy4ipcloud.com', cloud['guess'], cloud['username'],
                      device['serial'], device['username'], device['password']]
            if any('\n' in value or '\r' in value or len(value.encode()) > limit
                   for value, limit in zip(values, [240, 240, 240, 120, 120, 240])):
                raise ValueError('credential format')
            self.process = subprocess.Popen([
                'podman', 'run', '--rm', '--name', self.name, '--network', 'host',
                '--cap-drop=all', '--security-opt=no-new-privileges', '--timeout=500', '-i',
                '-v', '/opt/mad-dahua-windows/extracted:/sdk:ro',
                '-v', str(self.folder / 'wine') + ':/wine',
                'localhost/mad-dahua-wine:latest', 'mad-p2p.exe',
            ], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
                text=True, encoding='utf-8', errors='replace', bufsize=1)
            threading.Thread(target=self._read, daemon=True).start()
            self.process.stdin.write('\n'.join(values) + '\n')
            self.process.stdin.flush()
            self.info = json.loads(self._wait('MAD_READY ', 45))
        except Exception:
            self.close()
            raise

    def _read(self):
        for line in self.process.stdout:
            if line.startswith(('MAD_READY ', 'MAD_PORT ', 'MAD_ERROR ')):
                try:
                    self.events.put_nowait(line.strip())
                except queue.Full:
                    pass
        try:
            self.events.put_nowait('MAD_ERROR stopped')
        except queue.Full:
            pass

    def _wait(self, prefix, timeout):
        try:
            value = self.events.get(timeout=timeout)
        except queue.Empty:
            raise TimeoutError('Dahua transport timeout') from None
        if not value.startswith(prefix):
            raise RuntimeError('Dahua transport unavailable')
        return value[len(prefix):]

    def port(self, remote):
        remote = int(remote)
        if not 1 <= remote <= 65535:
            raise ValueError('port')
        self.process.stdin.write(str(remote) + '\n')
        self.process.stdin.flush()
        port = int(self._wait('MAD_PORT ', 30))
        if not 1 <= port <= 65535:
            raise ValueError('local port')
        time.sleep(3)
        return port

    def close(self):
        if self.process:
            try:
                self.process.stdin.write('stop\n')
                self.process.stdin.flush()
                self.process.wait(timeout=10)
            except (OSError, subprocess.TimeoutExpired):
                subprocess.run(['podman', 'rm', '-f', self.name],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=20)
                self.process.kill()
                self.process.wait()
        shutil.rmtree(self.folder, ignore_errors=True)

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()


def http_client(device, port):
    base = f'http://127.0.0.1:{port}'
    manager = urllib.request.HTTPPasswordMgrWithDefaultRealm()
    manager.add_password(None, base, device['username'], device['password'])
    return base, urllib.request.build_opener(urllib.request.HTTPDigestAuthHandler(manager))
