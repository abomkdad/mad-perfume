#!/bin/sh
set -eu
/usr/local/cpanel/bin/whmapi1 --output=json installssl domain=monitor.mad-parfumeur.com crt=@/etc/letsencrypt/live/monitor.mad-parfumeur.com/cert.pem key=@/etc/letsencrypt/live/monitor.mad-parfumeur.com/privkey.pem cabundle=@/etc/letsencrypt/live/monitor.mad-parfumeur.com/chain.pem | /usr/bin/python3 -c 'import json,sys; d=json.load(sys.stdin)["metadata"]; print({"certificate_installed":bool(d.get("result"))}); sys.exit(0 if d.get("result")==1 else 1)'
