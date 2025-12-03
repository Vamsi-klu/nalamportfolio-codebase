import os
import threading
import time
from contextlib import contextmanager

import pytest
import requests

import server as srv


@contextmanager
def run_server_in_thread(handler_cls, host='127.0.0.1', port=0):
    httpd = srv.ReuseAddrTCPServer((host, port), handler_cls)
    sa = httpd.socket.getsockname()
    base = f"http://{sa[0]}:{sa[1]}"
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    try:
        # small delay to ensure server is ready
        time.sleep(0.05)
        yield base
    finally:
        httpd.shutdown()
        httpd.server_close()
        t.join(timeout=1)


def test_chat_missing_content_type():
    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        r = requests.post(base + '/api/chat', data='{}')
        assert r.status_code == 415
        # Should be JSON error payload
        assert r.headers.get('Content-Type', '').startswith('application/json')
        assert 'error' in r.json()


def test_chat_missing_question(monkeypatch):
    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        r = requests.post(base + '/api/chat', json={'foo': 'bar'})
        assert r.status_code == 400
        assert r.json()['error']


def test_chat_success(monkeypatch):
    # Monkeypatch the generate_response to avoid network
    def fake_generate_response(q, context_text):
        assert 'Ramachandra' in context_text or 'Ramachandra' in q
        return 'Hello! I am a test reply.'

    monkeypatch.setattr(srv, 'generate_response', fake_generate_response)

    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        r = requests.post(base + '/api/chat', json={'question': 'Who is Ramachandra?'})
        assert r.status_code == 200
        data = r.json()
        assert data['reply'].startswith('Hello!')


def test_chat_upstream_error(monkeypatch):
    class FakeErr(Exception):
        pass

    def fake_generate_response(q, context_text):
        raise srv.GeminiError('upstream failed')

    monkeypatch.setattr(srv, 'generate_response', fake_generate_response)

    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        r = requests.post(base + '/api/chat', json={'question': 'Q'})
        assert r.status_code == 502
        assert 'upstream failed' in r.json()['error']


def test_chat_config_error(monkeypatch):
    def fake_generate_response(q, context_text):
        raise ValueError('Gemini API key not configured')

    monkeypatch.setattr(srv, 'generate_response', fake_generate_response)

    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        r = requests.post(base + '/api/chat', json={'question': 'Q'})
        assert r.status_code == 500
        assert 'key' in r.json()['error']


def test_get_index_served():
    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        r = requests.get(base + '/')
        assert r.status_code == 200
        assert 'text/html' in r.headers.get('Content-Type', '')


def test_get_classic_branch():
    # Even if file not present, this exercises the classic branch mapping
    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        r = requests.get(base + '/classic')
        assert r.status_code in (200, 404)  # depends on file presence


def test_post_other_path_calls_default():
    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        r = requests.post(base + '/api/other', json={})
        # Our handler returns 404 JSON for unknown POST endpoints
        assert r.status_code == 404


def test_chat_invalid_json_body():
    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        headers = {'Content-Type': 'application/json'}
        r = requests.post(base + '/api/chat', data='{not json}', headers=headers)
        assert r.status_code == 400
        assert 'error' in r.json()


def test_chat_when_dependency_missing(monkeypatch):
    # Ensure branch when generate_response is None
    monkeypatch.setattr(srv, 'generate_response', None)
    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        r = requests.post(base + '/api/chat', json={'question': 'Q'})
        assert r.status_code == 500
        assert 'missing dependencies' in r.json()['error']


def test_chat_context_load_failure(monkeypatch):
    # Force context loader to return '' by patching open to raise
    import builtins
    def boom(*a, **k):
        raise OSError('nope')
    monkeypatch.setattr(builtins, 'open', boom)
    monkeypatch.setattr(srv, 'generate_response', lambda q, context_text: 'ok')
    with run_server_in_thread(srv.PortfolioHTTPRequestHandler) as base:
        r = requests.post(base + '/api/chat', json={'question': 'Q'})
        assert r.status_code == 200
        assert r.json()['reply'] == 'ok'
