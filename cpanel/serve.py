"""Local staging server. No personal data or destinations are written to logs."""
import collections
import http.cookies
import ipaddress
import json
import os
from pathlib import Path
import re
import secrets
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = Path(__file__).parent / 'website'
SESSIONS = {}
ATTEMPTS = collections.defaultdict(list)
LOCK = threading.Lock()

def endpoint(kind):
    value = os.getenv(kind.upper() + '_FORM_DESTINATION', '')
    parsed = urllib.parse.urlsplit(value)
    if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password or parsed.fragment:
        return ''
    if parsed.hostname == 'localhost':
        return ''
    try:
        if not ipaddress.ip_address(parsed.hostname).is_global:
            return ''
    except ValueError:
        pass
    return value

def ready(kind):
    return bool(endpoint('patient') and endpoint('physician') and endpoint('patient') != endpoint('physician') and calendar() and os.getenv('PRIVACY_POLICY_APPROVED') == 'true')

def calendar():
    value = os.getenv('CALENDAR_URL', '')
    parsed = urllib.parse.urlsplit(value)
    return value if parsed.scheme == 'https' and parsed.hostname in {'calendar.google.com', 'calendar.app.google'} and not parsed.username and not parsed.password else ''

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, *args):
        pass

    def end_headers(self):
        self.send_header('X-Robots-Tag', 'noindex, nofollow, noarchive')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'same-origin')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'")
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def reply(self, status, payload, cookie=None):
        data = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        if cookie:
            self.send_header('Set-Cookie', cookie)
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if urllib.parse.urlsplit(self.path).path == '/api/form-session':
            sid, token = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
            now = time.monotonic()
            with LOCK:
                for key in list(SESSIONS):
                    if now - SESSIONS[key][1] > 1800:
                        del SESSIONS[key]
                if len(SESSIONS) >= 10000:
                    return self.reply(429, {'message': 'Please try again later.'})
                SESSIONS[sid] = (token, now)
            return self.reply(200, {'token': token, 'calendar_url': calendar(), 'ready': {k: ready(k) for k in ['patient', 'physician']}}, f'bh_session={sid}; HttpOnly; SameSite=Strict; Path=/; Max-Age=1800')
        return super().do_GET()

    def do_POST(self):
        kind = {'/api/forms/patient': 'patient', '/api/forms/physician': 'physician'}.get(self.path)
        if not kind:
            return self.reply(404, {'message': 'Unknown form.'})
        if self.headers.get('Origin') != 'http://' + self.headers.get('Host', ''):
            return self.reply(403, {'message': 'Please use the form on this staging website.'})
        cookie = http.cookies.SimpleCookie()
        try:
            cookie.load(self.headers.get('Cookie', ''))
            sid = cookie['bh_session'].value
        except (KeyError, http.cookies.CookieError):
            return self.reply(403, {'message': 'Reload the page before submitting.'})
        now = time.monotonic()
        with LOCK:
            session = SESSIONS.get(sid)
            if not session or now - session[1] > 1800 or not secrets.compare_digest(session[0], self.headers.get('X-CSRF-Token', '')):
                return self.reply(403, {'message': 'Your form session expired. Reload the page.'})
            if now - session[1] < 2:
                return self.reply(429, {'message': 'Please review your details before submitting.'})
            address = self.client_address[0]
            ATTEMPTS[address] = [t for t in ATTEMPTS[address] if now - t < 600]
            if len(ATTEMPTS[address]) >= 5:
                return self.reply(429, {'message': 'Too many attempts. Please try again in ten minutes.'})
            ATTEMPTS[address].append(now)
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 8192 or self.headers.get('Content-Type') != 'application/json':
                raise ValueError()
            payload = json.loads(self.rfile.read(length))
            fields = ['full_name', 'email', 'phone', 'privacy_acknowledgment'] if kind == 'patient' else ['physician_name', 'clinic', 'email', 'phone']
            if not isinstance(payload, dict) or set(payload) != set(fields):
                raise ValueError()
            if any(not isinstance(v, str) or not v.strip() or len(v) > 200 or re.search(r'[\x00-\x1f\x7f]', v) for v in payload.values()):
                raise ValueError()
            if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', payload['email']):
                raise ValueError()
            if not re.fullmatch(r'[+()\d .-]{7,40}', payload['phone']) or len(re.sub(r'\D', '', payload['phone'])) < 7:
                raise ValueError()
            if kind == 'patient' and payload['privacy_acknowledgment'] != 'acknowledged':
                raise ValueError()
        except (ValueError, TypeError, json.JSONDecodeError):
            return self.reply(422, {'message': 'Check all required contact details, including email and phone.'})
        if not ready(kind):
            return self.reply(503, {'message': 'Staging: delivery is not configured or the privacy policy is not approved. Nothing was sent.'})
        request = urllib.request.Request(endpoint(kind), data=json.dumps({'kind': kind, 'contact': payload}).encode(), headers={'Content-Type': 'application/json'}, method='POST')
        try:
            with urllib.request.build_opener(NoRedirect()).open(request, timeout=15) as response:
                accepted = 200 <= response.status < 300
        except (urllib.error.URLError, TimeoutError, OSError):
            accepted = False
        if not accepted:
            return self.reply(502, {'message': 'Delivery could not be confirmed. Please try again later.'})
        with LOCK:
            SESSIONS.pop(sid, None)
        return self.reply(200, {'message': 'The receiving service accepted your contact request. This does not confirm recipient delivery or a booking.'})

if __name__ == '__main__':
    ThreadingHTTPServer(('127.0.0.1', int(os.getenv('PORT', '8001'))), Handler).serve_forever()
