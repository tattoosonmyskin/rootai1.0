"""
RootAI — local reasoning-engine server.

Run with:
    python run.py          ← recommended (auto-installs deps, opens browser)
    uvicorn app:app --reload
"""

import os
import re
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="RootAI", version="1.0.0", docs_url="/api/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request / Response models ─────────────────────────────────────────────────


class RunRequest(BaseModel):
    query: str
    # Optional per-request LLM overrides (if the user configures via the UI)
    api_key: str | None = None
    base_url: str | None = None
    model: str | None = None


class ReviewRequest(BaseModel):
    rating: str  # "approved" | "flagged"
    notes: str = ""


class SettingsRequest(BaseModel):
    api_key: str | None = None
    base_url: str | None = None
    model: str | None = None


# ── API routes ────────────────────────────────────────────────────────────────


@app.post("/api/run")
async def run_pipeline(req: RunRequest):
    """Stream the 6-step reasoning pipeline as Server-Sent Events."""
    from core.pipeline import run_pipeline as _run

    return StreamingResponse(
        _run(
            query=req.query,
            api_key=req.api_key,
            base_url=req.base_url,
            model=req.model,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/sessions")
async def list_sessions():
    from core.store import query_sessions

    return query_sessions.list("-created_date", 50)


@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str):
    from core.store import query_sessions

    session = query_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.post("/api/sessions/{session_id}/review")
async def review_session(session_id: str, req: ReviewRequest):
    from core.store import query_sessions

    updated = query_sessions.update(
        session_id, {"human_review": {"rating": req.rating, "notes": req.notes}}
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Session not found")
    return updated


@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str):
    from core.store import query_sessions

    deleted = query_sessions.delete(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"ok": True}


@app.get("/api/settings")
async def get_settings():
    """Return current LLM settings (masks the API key)."""
    key = os.getenv("LLM_API_KEY", "")
    return {
        "api_key_set": bool(key),
        "api_key_preview": (key[:4] + "…" + key[-4:]) if len(key) > 8 else ("set" if key else ""),
        "base_url": os.getenv("LLM_BASE_URL", "https://api.openai.com/v1"),
        "model": os.getenv("LLM_MODEL", "gpt-4o-mini"),
    }


@app.post("/api/settings")
async def save_settings(req: SettingsRequest):
    """Persist LLM settings to .env and reload environment."""
    env_path = Path(".env")
    if not env_path.exists() and Path(".env.example").exists():
        import shutil
        shutil.copy(".env.example", ".env")

    lines: list[str] = []
    if env_path.exists():
        lines = env_path.read_text(encoding="utf-8").splitlines()

    def _set(lines: list[str], key: str, value: str) -> list[str]:
        pattern = re.compile(rf"^{re.escape(key)}\s*=")
        replaced = False
        result = []
        for line in lines:
            if pattern.match(line):
                result.append(f"{key}={value}")
                replaced = True
            else:
                result.append(line)
        if not replaced:
            result.append(f"{key}={value}")
        return result

    if req.api_key is not None:
        lines = _set(lines, "LLM_API_KEY", req.api_key)
        os.environ["LLM_API_KEY"] = req.api_key
    if req.base_url is not None:
        lines = _set(lines, "LLM_BASE_URL", req.base_url)
        os.environ["LLM_BASE_URL"] = req.base_url
    if req.model is not None:
        lines = _set(lines, "LLM_MODEL", req.model)
        os.environ["LLM_MODEL"] = req.model

    env_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return {"ok": True}


# ── Serve frontend ────────────────────────────────────────────────────────────

_static_dir = Path(__file__).parent / "static"

if _static_dir.exists():
    app.mount("/", StaticFiles(directory=str(_static_dir), html=True), name="static")
