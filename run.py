#!/usr/bin/env python3
"""
RootAI — 1-click launcher.

Just run:  python run.py

What this script does:
  1. Checks that Python 3.10+ is available
  2. Auto-installs dependencies from requirements.txt (into a local venv)
  3. Creates .env from .env.example if it doesn't exist yet
  4. Starts the FastAPI server on http://localhost:8000
  5. Opens your browser automatically
"""

import os
import shutil
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path

HOST = "127.0.0.1"
PORT = 8000
URL = f"http://{HOST}:{PORT}"


# ── helpers ───────────────────────────────────────────────────────────────────


def _python_version_ok() -> bool:
    return sys.version_info >= (3, 10)


def _venv_python() -> Path:
    """Return the Python executable inside our local venv."""
    venv = Path(__file__).parent / ".venv"
    if sys.platform == "win32":
        return venv / "Scripts" / "python.exe"
    return venv / "bin" / "python"


def _ensure_venv() -> Path:
    """Create a venv if it doesn't exist, return its Python path."""
    venv = Path(__file__).parent / ".venv"
    py = _venv_python()
    if not py.exists():
        print("🔧  Creating virtual environment (.venv)…")
        subprocess.check_call([sys.executable, "-m", "venv", str(venv)])
        print("✅  Virtual environment created.")
    return py


def _install_deps(py: Path) -> None:
    req = Path(__file__).parent / "requirements.txt"
    if not req.exists():
        return
    print("📦  Installing / verifying dependencies…")
    subprocess.check_call(
        [str(py), "-m", "pip", "install", "--quiet", "-r", str(req)]
    )
    print("✅  Dependencies ready.")


def _setup_env() -> None:
    env = Path(__file__).parent / ".env"
    example = Path(__file__).parent / ".env.example"
    if not env.exists() and example.exists():
        shutil.copy(example, env)
        print("📝  Created .env from .env.example")
        print("    ➜  Edit .env with your LLM API key, then refresh the browser.")
        print("    ➜  Or configure everything from the ⚙ Settings panel in the UI.")


def _open_browser() -> None:
    """Wait until the server is reachable, then open the browser."""
    import urllib.request
    import urllib.error

    deadline = time.monotonic() + 30.0          # give the server up to 30 s
    while time.monotonic() < deadline:
        try:
            urllib.request.urlopen(URL + "/api/settings", timeout=1)
            break                               # server responded — proceed
        except (urllib.error.URLError, OSError):
            time.sleep(0.25)

    try:
        webbrowser.open(URL)
    except Exception:
        pass


# ── main ──────────────────────────────────────────────────────────────────────


def main() -> None:
    if not _python_version_ok():
        print(
            f"❌  Python 3.10 or newer is required (you have {sys.version}).\n"
            "    Download it from https://www.python.org/downloads/"
        )
        sys.exit(1)

    print("━" * 50)
    print("  🌿  RootAI  — Semantic Reasoning Pipeline")
    print("━" * 50)

    py = _ensure_venv()
    _install_deps(py)
    _setup_env()

    print(f"\n🚀  Starting server on {URL}")
    print("    Press Ctrl+C to stop.\n")

    threading.Thread(target=_open_browser, daemon=True).start()

    # Re-launch with the venv Python so uvicorn is definitely available.
    # Compare sys.prefix to the venv directory rather than executable paths,
    # because the venv Python may be a symlink to the same underlying binary.
    # Use an absolute path derived from __file__ so this works regardless of
    # the working directory from which run.py is invoked.
    venv_dir = (Path(__file__).parent / ".venv").resolve()
    if Path(sys.prefix).resolve() != venv_dir:
        os.execv(str(py), [str(py), __file__] + sys.argv[1:])

    # Already inside venv — start uvicorn
    import uvicorn  # noqa: PLC0415

    uvicorn.run(
        "app:app",
        host=HOST,
        port=PORT,
        reload=False,
        log_level="warning",
    )


if __name__ == "__main__":
    main()
