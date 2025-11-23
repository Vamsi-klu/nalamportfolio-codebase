import os
import json
from typing import Optional, Dict, Any

import requests


GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GEMINI_BASE_URL = os.getenv(
    "GEMINI_BASE_URL",
    "https://generativelanguage.googleapis.com/v1beta",
)


class GeminiError(RuntimeError):
    pass


def _build_system_prompt(context_text: str) -> str:
    context_intro = (
        "You are an assistant for Ramachandra Nalam's portfolio website. "
        "Answer only questions about Ramachandra using the provided context. "
        "If the answer is not in the context, say you don't know. "
        "Be concise (2-5 sentences)."
    )
    context = context_text.strip()
    return f"{context_intro}\n\nContext:\n{context}\n\n"


def _extract_text_from_response(data: Dict[str, Any]) -> str:
    # Expected: data['candidates'][0]['content']['parts'][0]['text']
    try:
        candidates = data.get("candidates") or []
        if not candidates:
            raise KeyError("No candidates in response")
        content = candidates[0].get("content") or {}
        parts = content.get("parts") or []
        if not parts:
            raise KeyError("No parts in candidate content")
        text = parts[0].get("text")
        if not isinstance(text, str) or not text.strip():
            raise KeyError("Empty text in response part")
        return text.strip()
    except Exception as e:
        raise GeminiError(f"Failed to parse Gemini response: {e}")


def generate_response(
    question: str,
    context_text: str,
    api_key: Optional[str] = None,
    timeout: float = 15.0,
) -> str:
    """
    Call Gemini generateContent with a question and site context.

    Raises:
        ValueError: if inputs are invalid or api key missing.
        GeminiError: if the API call fails or response cannot be parsed.
    """
    if not isinstance(question, str) or not question.strip():
        raise ValueError("question must be a non-empty string")
    if not isinstance(context_text, str):
        raise ValueError("context_text must be a string")

    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key or not isinstance(key, str):
        raise ValueError("Gemini API key not configured")

    system_prompt = _build_system_prompt(context_text)
    user_prompt = question.strip()

    url = f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent?key={key}"
    payload: Dict[str, Any] = {
        "contents": [
            {
                # role is optional; the API infers it for simple cases
                "parts": [
                    {"text": system_prompt + f"Question: {user_prompt}"}
                ]
            }
        ],
        # Add some reasonable safety & generation config defaults
        "generationConfig": {
            "temperature": 0.3,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 512,
        },
    }

    try:
        resp = requests.post(
            url,
            data=json.dumps(payload),
            headers={"Content-Type": "application/json"},
            timeout=timeout,
        )
    except requests.RequestException as e:
        raise GeminiError(f"Request to Gemini failed: {e}")

    if not resp.ok:
        # Try to include error detail from body
        detail = ""
        try:
            detail_json = resp.json()
            detail = detail_json.get("error", {}).get("message") or json.dumps(detail_json)[:300]
        except Exception:
            detail = (resp.text or "").strip()[:300]
        raise GeminiError(f"Gemini API error {resp.status_code}: {detail}")

    try:
        data = resp.json()
    except Exception as e:
        raise GeminiError(f"Invalid JSON from Gemini: {e}")

    text = _extract_text_from_response(data)
    # Basic sanitization: cap length to avoid flooding UI
    return text[:4000]

