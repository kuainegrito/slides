#!/usr/bin/env python3
"""Single-password login with expiring HMAC cookies; no third-party packages."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, quote
from pathlib import Path
import hashlib
import hmac
import html
import os
import secrets
import threading
import time

PORT = 3097
COURSE_PATH = "/slides/其他课件/教学创新大赛讲座总结/"
COOKIE_NAME = "slides_teaching_auth"
COOKIE_PATH = quote(COURSE_PATH, safe="/")
MAX_AGE = 7 * 86400
PASSWORD_HASH = os.environ["COURSE_PASSWORD_SHA256"].strip().lower()
COOKIE_SECRET = bytes.fromhex(os.environ["COURSE_COOKIE_SECRET"].strip())
ATTEMPTS = {}
ATTEMPTS_LOCK = threading.Lock()
MAX_FAILURES = 5
WINDOW_SECONDS = 600


def signature(expiry):
    return hmac.new(COOKIE_SECRET, f"slides-course:{expiry}".encode(), hashlib.sha256).hexdigest()


def valid_cookie(header):
    try:
        parts = dict(part.strip().split("=", 1) for part in header.split(";") if "=" in part)
        expiry_text, supplied = parts[COOKIE_NAME].split(".", 1)
        expiry = int(expiry_text)
        now = int(time.time())
        return now < expiry <= now + MAX_AGE + 60 and hmac.compare_digest(signature(expiry), supplied)
    except (KeyError, ValueError, TypeError):
        return False


def clean_next(value):
    value = value.split("?", 1)[0].split("#", 1)[0]
    return value if value.startswith(COURSE_PATH) and "//" not in value and "\\" not in value else COURSE_PATH


def limited(ip):
    now = time.time()
    with ATTEMPTS_LOCK:
        recent = [t for t in ATTEMPTS.get(ip, []) if now - t < WINDOW_SECONDS]
        ATTEMPTS[ip] = recent
        if len(ATTEMPTS) > 1000:
            ATTEMPTS.clear()
        return len(recent) >= MAX_FAILURES


def record_failure(ip):
    with ATTEMPTS_LOCK:
        ATTEMPTS.setdefault(ip, []).append(time.time())


def clear_failures(ip):
    with ATTEMPTS_LOCK:
        ATTEMPTS.pop(ip, None)


def login_page(next_path, message="", status=200):
    notice = f'<p class="error">{html.escape(message)}</p>' if message else ""
    body = f'''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>输入密码 · 教学创新大赛专家讲座总结</title><style>
body{{margin:0;min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 80% 10%,#dcebef,#f3f6f8 65%);color:#17394d;font-family:"Microsoft YaHei","PingFang SC",sans-serif}}main{{width:min(540px,88vw);background:#fff;border:1px solid #d7e2e8;border-radius:18px;padding:32px;box-shadow:0 14px 42px #17394d12}}h1{{font-size:26px;line-height:1.45;margin:0 0 12px}}p{{line-height:1.85;color:#526b79}}label{{display:block;font-size:14px;font-weight:700;margin:22px 0 8px}}input{{width:100%;box-sizing:border-box;border:1px solid #a9bdc8;border-radius:9px;padding:12px 14px;font-size:18px;background:#fff;color:#17394d}}input:focus{{outline:3px solid #7ec4cf55;border-color:#26786f}}button{{margin-top:16px;width:100%;border:0;border-radius:9px;background:#176e7b;color:#fff;padding:12px 16px;font-size:16px;font-weight:700;cursor:pointer}}a{{color:#176e7b}}.hint{{font-size:13px;color:#758792}}.error{{padding:10px 12px;border-radius:8px;background:#fff0ec;color:#9a4939}}.back{{display:inline-block;margin-top:18px;font-size:13px}}</style></head><body><main><h1>输入密码，阅读课件</h1><p>如需阅读此课件，请发邮件至 <a href="mailto:yukuai@gmc.edu.cn">yukuai@gmc.edu.cn</a> 索取密码。</p>{notice}<form method="post" action="/slides-course-login/"><input type="hidden" name="next" value="{html.escape(next_path, quote=True)}"><label for="course-password">访问密码</label><input id="course-password" name="password" type="password" autocomplete="current-password" required autofocus maxlength="256"><button type="submit">进入课件</button></form><p class="hint">只需密码，无需用户名。密码仅在服务端校验；验证通过后，本浏览器在限定时间内可继续访问。</p><a class="back" href="/slides/其他课件/">返回其他课件</a></main></body></html>'''
    return status, body.encode("utf-8")


class Handler(BaseHTTPRequestHandler):
    server_version = "SlidesCourseAuth/1.0"

    def log_message(self, *_):
        pass

    def send_bytes(self, status, body=b"", content_type="text/plain; charset=utf-8", extra=None):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        for key, value in (extra or {}).items():
            self.send_header(key, value)
        self.end_headers()
        if body:
            self.wfile.write(body)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/health":
            self.send_bytes(200, b"ok")
        elif path == "/check":
            self.send_bytes(200 if valid_cookie(self.headers.get("Cookie", "")) else 401)
        elif path == "/login":
            from urllib.parse import urlsplit
            next_path = clean_next(parse_qs(urlsplit(self.path).query).get("next", [COURSE_PATH])[0])
            status, body = login_page(next_path)
            self.send_bytes(status, body, "text/html; charset=utf-8")
        else:
            self.send_bytes(404)

    def do_POST(self):
        if self.path.split("?", 1)[0] != "/login":
            self.send_bytes(404)
            return
        ip = self.headers.get("X-Real-IP", self.client_address[0])
        next_path = COURSE_PATH
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 4096:
                raise ValueError("invalid request size")
            content_type = self.headers.get("Content-Type", "").split(";", 1)[0]
            if content_type != "application/x-www-form-urlencoded":
                raise ValueError("invalid content type")
            form = parse_qs(self.rfile.read(length).decode("utf-8"), max_num_fields=8)
            next_path = clean_next(form.get("next", [COURSE_PATH])[0])
            candidate = form.get("password", [""])[0]
        except (ValueError, UnicodeDecodeError):
            status, body = login_page(next_path, "提交内容无效，请重新输入。", 400)
            self.send_bytes(status, body, "text/html; charset=utf-8")
            return
        if limited(ip):
            status, body = login_page(next_path, "尝试次数较多，请稍后再试。", 429)
            self.send_bytes(status, body, "text/html; charset=utf-8")
            return
        supplied_hash = hashlib.sha256(candidate.encode("utf-8")).hexdigest()
        if not hmac.compare_digest(supplied_hash, PASSWORD_HASH):
            record_failure(ip)
            status, body = login_page(next_path, "密码不正确，请重试。", 401)
            self.send_bytes(status, body, "text/html; charset=utf-8")
            return
        clear_failures(ip)
        expiry = int(time.time()) + MAX_AGE
        cookie = f"{COOKIE_NAME}={expiry}.{signature(expiry)}; Path={COOKIE_PATH}; Max-Age={MAX_AGE}; HttpOnly; Secure; SameSite=Strict"
        self.send_bytes(303, extra={"Location": quote(next_path, safe="/"), "Set-Cookie": cookie})


if __name__ == "__main__":
    assert len(PASSWORD_HASH) == 64
    assert len(COOKIE_SECRET) >= 32
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
