"""
LLM Client — calls any OpenAI-compatible API.

Supported providers out of the box:
  • OpenAI          https://api.openai.com/v1
  • Ollama (local)  http://localhost:11434/v1
  • LM Studio       http://localhost:1234/v1
  • Any other OpenAI-compatible endpoint

Config is read from environment variables (set in .env):
  LLM_API_KEY   — API key (use 'ollama' for local Ollama)
  LLM_BASE_URL  — Base URL of the API
  LLM_MODEL     — Model name
"""

import json
import os
import re

import httpx

LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://api.openai.com/v1").rstrip("/")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")


async def invoke_llm(
    prompt: str,
    response_json_schema: dict | None = None,
    api_key: str | None = None,
    base_url: str | None = None,
    model: str | None = None,
) -> dict | str:
    """
    Invoke an LLM with a prompt.  Optionally pass overrides for api_key /
    base_url / model so callers can use per-request settings.
    """
    key = api_key or LLM_API_KEY
    url = (base_url or LLM_BASE_URL).rstrip("/")
    mdl = model or LLM_MODEL

    if not key:
        raise ValueError(
            "No LLM API key configured.\n"
            "Copy .env.example to .env and set LLM_API_KEY.\n"
            "For Ollama use: LLM_API_KEY=ollama"
        )

    system_prompt = (
        "You are a helpful AI assistant. Respond ONLY with valid JSON that matches "
        "the requested schema. No markdown, no explanation, just JSON."
        if response_json_schema
        else "You are a helpful AI assistant."
    )

    body: dict = {
        "model": mdl,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
    }
    if response_json_schema:
        body["response_format"] = {"type": "json_object"}

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            f"{url}/chat/completions",
            headers=headers,
            json=body,
        )

    if resp.status_code != 200:
        try:
            err = resp.json().get("error", {}).get("message", f"HTTP {resp.status_code}")
        except Exception:
            err = f"HTTP {resp.status_code}"
        raise RuntimeError(f"LLM API error: {err}")

    data = resp.json()
    content: str = (
        data.get("choices", [{}])[0].get("message", {}).get("content", "")
    )

    if response_json_schema:
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r"```(?:json)?\s*([\s\S]*?)```", content) or re.search(
                r"(\{[\s\S]*\})", content
            )
            if match:
                try:
                    return json.loads(match.group(1))
                except json.JSONDecodeError:
                    pass
            return {"answer": content}

    return content
