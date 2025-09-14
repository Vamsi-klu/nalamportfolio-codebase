import json
import os
from types import SimpleNamespace

import pytest

from api import gemini_client as gc


class DummyResp:
    def __init__(self, ok=True, status=200, data=None, text=""):
        self.ok = ok
        self.status_code = status
        self._data = data
        self.text = text

    def json(self):
        if isinstance(self._data, Exception):
            raise self._data
        return self._data


def test_generate_response_valid(monkeypatch):
    # Arrange
    os.environ['GEMINI_API_KEY'] = 'test-key'

    def fake_post(url, data=None, headers=None, timeout=None):
        payload = json.loads(data)
        assert 'contents' in payload
        return DummyResp(
            ok=True,
            status=200,
            data={
                'candidates': [{
                    'content': {'parts': [{'text': 'Hello from Gemini'}]}
                }]
            }
        )

    monkeypatch.setattr(gc.requests, 'post', fake_post)

    out = gc.generate_response('Who is Ram?', context_text='Ram is a data engineer.')
    assert out == 'Hello from Gemini'


def test_generate_response_error_status(monkeypatch):
    os.environ['GEMINI_API_KEY'] = 'test-key'

    def fake_post(url, data=None, headers=None, timeout=None):
        return DummyResp(
            ok=False,
            status=400,
            data={'error': {'message': 'Bad request'}}
        )

    monkeypatch.setattr(gc.requests, 'post', fake_post)

    with pytest.raises(gc.GeminiError) as e:
        gc.generate_response('Q', 'ctx')
    assert '400' in str(e.value)
    assert 'Bad request' in str(e.value)


def test_generate_response_invalid_json(monkeypatch):
    os.environ['GEMINI_API_KEY'] = 'test-key'

    def fake_post(url, data=None, headers=None, timeout=None):
        return DummyResp(ok=True, status=200, data=ValueError('boom'))

    monkeypatch.setattr(gc.requests, 'post', fake_post)

    with pytest.raises(gc.GeminiError) as e:
        gc.generate_response('Q', 'ctx')
    assert 'Invalid JSON' in str(e.value)


def test_generate_response_parse_failure(monkeypatch):
    os.environ['GEMINI_API_KEY'] = 'test-key'

    def fake_post(url, data=None, headers=None, timeout=None):
        return DummyResp(
            ok=True, status=200, data={'candidates': []}
        )

    monkeypatch.setattr(gc.requests, 'post', fake_post)

    with pytest.raises(gc.GeminiError):
        gc.generate_response('Q', 'ctx')


def test_parse_failure_no_parts(monkeypatch):
    os.environ['GEMINI_API_KEY'] = 'test-key'

    def fake_post(url, data=None, headers=None, timeout=None):
        return DummyResp(ok=True, status=200, data={'candidates': [{'content': {'parts': []}}]})

    monkeypatch.setattr(gc.requests, 'post', fake_post)
    with pytest.raises(gc.GeminiError):
        gc.generate_response('Q', 'ctx')


def test_parse_failure_empty_text(monkeypatch):
    os.environ['GEMINI_API_KEY'] = 'test-key'

    def fake_post(url, data=None, headers=None, timeout=None):
        return DummyResp(ok=True, status=200, data={'candidates': [{'content': {'parts': [{'text': ''}]}}]})

    monkeypatch.setattr(gc.requests, 'post', fake_post)
    with pytest.raises(gc.GeminiError):
        gc.generate_response('Q', 'ctx')


def test_generate_response_network_error(monkeypatch):
    os.environ['GEMINI_API_KEY'] = 'test-key'

    class NetErr(Exception):
        pass

    def fake_post(url, data=None, headers=None, timeout=None):
        raise gc.requests.RequestException('network down')

    monkeypatch.setattr(gc.requests, 'post', fake_post)

    with pytest.raises(gc.GeminiError):
        gc.generate_response('Q', 'ctx')


def test_invalid_inputs():
    os.environ.pop('GEMINI_API_KEY', None)
    with pytest.raises(ValueError):
        gc.generate_response('', 'ctx', api_key='a')
    with pytest.raises(ValueError):
        gc.generate_response('Q', 123, api_key='a')
    with pytest.raises(ValueError):
        gc.generate_response('Q', 'ctx')  # no key set


def test_error_status_non_json_body(monkeypatch):
    os.environ['GEMINI_API_KEY'] = 'k'
    def fake_post(url, data=None, headers=None, timeout=None):
        return DummyResp(ok=False, status=500, data=ValueError('no json'), text='Internal Error')
    monkeypatch.setattr(gc.requests, 'post', fake_post)
    with pytest.raises(gc.GeminiError) as e:
        gc.generate_response('Q', 'ctx')
    assert '500' in str(e.value)
    assert 'Internal Error' in str(e.value)


def test_truncates_long_output(monkeypatch):
    os.environ['GEMINI_API_KEY'] = 'k'
    long = 'x' * 10000
    def fake_post(url, data=None, headers=None, timeout=None):
        return DummyResp(
            ok=True,
            status=200,
            data={'candidates': [{'content': {'parts': [{'text': long}]}}]}
        )
    monkeypatch.setattr(gc.requests, 'post', fake_post)
    out = gc.generate_response('Q', 'ctx')
    assert len(out) == 4000


def test_payload_includes_context(monkeypatch):
    os.environ['GEMINI_API_KEY'] = 'k'
    captured = {}
    def fake_post(url, data=None, headers=None, timeout=None):
        captured['payload'] = json.loads(data)
        return DummyResp(
            ok=True,
            status=200,
            data={'candidates': [{'content': {'parts': [{'text': 'ok'}]}}]}
        )
    monkeypatch.setattr(gc.requests, 'post', fake_post)
    _ = gc.generate_response('Who?', 'Context text here', api_key='z')
    payload = captured['payload']
    text = payload['contents'][0]['parts'][0]['text']
    assert 'Context:' in text and 'Context text here' in text and 'Question:' in text
