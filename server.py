#!/usr/bin/env python3
import json
import os
import re
import unicodedata
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlparse

HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", "3000"))
ROOT = Path(__file__).resolve().parent
CATALOG_FILE = ROOT / "catalog.json"

I18N = {
    "AR": {
        "tryHint": "جرّب: ?q=alien أو ?q=אלינ או ?q=الين أو ?q=87 أو ?q=XF%20A.112",
    },
    "HE": {
        "tryHint": "נסה: ?q=alien או ?q=אלינ או ?q=الين או ?q=87 או ?q=XF%20A.112",
    },
}


MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".css": "text/css; charset=utf-8",
}


def safe(value):
    return "" if value is None else str(value)


def normalize_query(text):
    s = safe(text).strip()
    try:
        s = unquote(s)
    except Exception:
        pass

    s = s.lower()

    try:
        s = unicodedata.normalize("NFKD", s)
        s = "".join(ch for ch in s if unicodedata.category(ch) != "Mn")
    except Exception:
        pass

    s = re.sub(r"[\u064B-\u065F\u0670\u06D6-\u06ED]", "", s)
    s = s.replace("أ", "ا").replace("إ", "ا").replace("آ", "ا")
    s = s.replace("ى", "ي").replace("ة", "ه")

    s = re.sub(r"[\s\-_.,/\\|()\[\]{}'\"“”‘’`~!@#$%^&*+=?:;<>\u200f\u200e]", "", s)
    return s


def get_id_from_app(value):
    m = re.search(r"product\.show\.(\d+)", safe(value), flags=re.IGNORECASE)
    return m.group(1) if m else ""


def pick_lang_text(product, lang):
    name_en = safe(product.get("ORIGINAL_EN") or product.get("DESCRIPTION") or "")
    name_ar = safe(product.get("ORIGINAL_AR") or product.get("DESCRIPTION") or "")
    name_he = safe(product.get("ORIGINAL_HE") or product.get("DESCRIPTION") or "")

    desc_ar = safe(product.get("DESC_AR") or "")
    desc_he = safe(product.get("DESC_HE") or "")
    desc_en = safe(product.get("DESCRIPTION") or "")

    pyr_ar = safe(product.get("PYRAMID_AR") or "")
    pyr_he = safe(product.get("PYRAMID_HE") or "")
    best_ar = safe(product.get("BEST_TIME_AR") or "")
    best_he = safe(product.get("BEST_TIME_HE") or "")

    if lang == "AR":
        return {
            "name": name_ar or name_en,
            "desc": desc_ar or desc_en,
            "pyramid": pyr_ar,
            "best_time": best_ar,
        }
    if lang == "HE":
        return {
            "name": name_he or name_en,
            "desc": desc_he or desc_en,
            "pyramid": pyr_he,
            "best_time": best_he,
        }

    return {
        "name": name_en or name_ar or name_he,
        "desc": desc_en or desc_ar or desc_he,
        "pyramid": "",
        "best_time": "",
    }


def load_catalog():
    raw = CATALOG_FILE.read_text(encoding="utf-8")
    parsed = json.loads(raw)
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict) and isinstance(parsed.get("products"), list):
        return parsed["products"]
    return []


def build_catalog_response(query):
    lang = safe(query.get("lang", ["AR"])[0]).upper()
    labels = I18N.get(lang, I18N["AR"])

    products = load_catalog()

    q_param = safe(query.get("q", [""])[0])
    id_param = safe(query.get("id", [""])[0])
    key_param = safe(query.get("key", [""])[0])
    code_param = safe(query.get("code", [""])[0])
    app_param = safe(query.get("app", [""])[0])

    query_raw = q_param or key_param or code_param or id_param or get_id_from_app(app_param)
    query_norm = normalize_query(query_raw)

    is_numeric = bool(re.fullmatch(r"\d+", safe(query_raw).strip()))
    id_to_use = safe(query_raw).strip() if is_numeric else (id_param or get_id_from_app(app_param))

    product = None
    for p in products:
        link = safe(p.get("LINK") or "")

        if id_to_use and f"product.show.{id_to_use}" in link:
            product = p
            break

        if not query_norm:
            continue

        fields = [
            safe(p.get("SEARCH_KEY") or p.get("orig_norm") or p.get("orig_can") or ""),
            safe(p.get("PRODUCT CODE") or ""),
            safe(p.get("ORIGINAL_EN") or ""),
            safe(p.get("ORIGINAL_AR") or ""),
            safe(p.get("ORIGINAL_HE") or ""),
        ]
        fields_norm = [normalize_query(f) for f in fields]

        if query_norm in fields_norm:
            product = p
            break

        if any(f and (query_norm in f or f in query_norm) for f in fields_norm):
            product = p
            break

    if not product:
        return {
            "ok": False,
            "error": "NOT_FOUND",
            "hint": labels["tryHint"],
            "q": query_raw,
        }

    t = pick_lang_text(product, lang)
    m = re.search(r"product\.show\.(\d+)", safe(product.get("LINK") or ""), flags=re.IGNORECASE)

    return {
        "ok": True,
        "id": m.group(1) if m else (safe(query_raw).strip() if is_numeric else None),
        "q": query_raw,
        "search_key": safe(product.get("SEARCH_KEY") or product.get("orig_norm") or ""),
        "product_code": safe(product.get("PRODUCT CODE") or ""),
        "description": t["desc"],
        "pyramid": t["pyramid"],
        "best_time": t["best_time"],
        "name": t["name"],
        "short": safe(product.get("DESCRIPTION") or ""),
        "price": product.get("PRICE"),
        "currency": "ILS",
        "image": safe(product.get("IMAGE_LINK") or ""),
        "link": safe(product.get("LINK") or ""),
        "gender": safe(product.get("GENDER") or ""),
        "size": safe(product.get("SIZE") or ""),
        "product_type": safe(product.get("PRODUCT TYPE") or ""),
    }


class Handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path_in):
        target = ROOT / ("index.html" if path_in == "/" else path_in.lstrip("/"))
        try:
            target.resolve().relative_to(ROOT)
        except Exception:
            self.send_error(403, "Forbidden")
            return

        if not target.exists() or not target.is_file():
            self.send_error(404, "Not Found")
            return

        data = target.read_bytes()
        mime = MIME_TYPES.get(target.suffix.lower(), "application/octet-stream")

        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        parsed = urlparse(self.path)
        query = parse_qs(parsed.query)

        if parsed.path == "/api/catalog":
            try:
                result = build_catalog_response(query)
                self._send_json(200, result)
            except Exception as err:
                self._send_json(500, {
                    "ok": False,
                    "error": "INTERNAL_ERROR",
                    "message": safe(err),
                })
            return

        if parsed.path == "/api/catalog/list":
            try:
                self._send_json(200, load_catalog())
            except Exception as err:
                self._send_json(500, {
                    "ok": False,
                    "error": "INTERNAL_ERROR",
                    "message": safe(err),
                })
            return

        if parsed.path == "/health":
            self._send_json(200, {"ok": True, "status": "up"})
            return

        self._send_file(parsed.path)


def run():
    server = HTTPServer((HOST, PORT), Handler)
    print(f"MAD catalog API running at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    run()
