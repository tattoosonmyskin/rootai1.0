# RootAI 🌿

A plug-and-play **semantic reasoning pipeline** that runs **100 % locally** and
speaks to **any LLM** — OpenAI, Ollama, LM Studio, or any OpenAI-compatible
endpoint including local browser-accessible models.

Your query is automatically routed through 6 specialised layers before a final
answer is synthesised:

```
Prompt Analyzer → Knowledge Graph → RAG Engine →
Reasoning Engine → Constraint Checker → LLM Synthesis
```

---

## ⚡ Quick start (1 click)

### Prerequisites
* **Python 3.10 or newer** — https://www.python.org/downloads/  
  _(No Node.js, no Docker, no other tools needed.)_

### Steps

```bash
# 1. Clone the repo (or download the ZIP and unzip it)
git clone https://github.com/tattoosonmyskin/rootai1.0.git
cd rootai1.0

# 2. Run — this installs everything automatically
python run.py        # macOS / Linux / Windows
# or on macOS/Linux: bash run.sh
# or on Windows:     double-click run.bat
```

The launcher will:
1. Create a local Python virtual environment (`.venv/`)
2. Install dependencies from `requirements.txt`
3. Copy `.env.example` → `.env` if no `.env` exists
4. Start the server on `http://localhost:8000`
5. Open your browser automatically

On first launch, a **Settings panel** will pop up so you can enter your LLM API key.

---

## ⚙️ LLM Configuration

Edit `.env` (created automatically on first run) or use the **⚙ Settings** button
inside the app.

| Provider | API Key | Base URL | Model |
|---|---|---|---|
| **OpenAI** | your OpenAI key | `https://api.openai.com/v1` | `gpt-4o-mini` |
| **Ollama** (local) | `ollama` | `http://localhost:11434/v1` | `llama3` / `mistral` / … |
| **LM Studio** (local) | `lmstudio` | `http://localhost:1234/v1` | your loaded model |
| **Any OpenAI-compatible** | your key | your endpoint | your model |

### Local models (no API key required)

**Ollama** is the easiest way to run models locally:
```bash
# Install Ollama from https://ollama.com, then:
ollama pull llama3       # or mistral, phi3, gemma, etc.
ollama serve             # starts on http://localhost:11434
```
Then in RootAI settings: key = `ollama`, base URL = `http://localhost:11434/v1`.

---

## 📁 Project structure

```
rootai1.0/
├── app.py              ← FastAPI server (API + static file serving)
├── run.py              ← 1-click launcher (auto-installs, opens browser)
├── run.sh              ← Shell launcher for macOS/Linux
├── run.bat             ← Batch launcher for Windows
├── requirements.txt    ← Python dependencies
├── .env.example        ← Config template (copy to .env)
├── core/
│   ├── llm_client.py   ← Async LLM invocation (any OpenAI-compatible API)
│   ├── pipeline.py     ← 6-layer reasoning pipeline with SSE streaming
│   └── store.py        ← JSON-file session/entity storage (no database needed)
├── static/
│   └── index.html      ← Full SPA frontend (Tailwind CDN, vanilla JS, no build)
└── data/               ← Auto-created; stores session history as JSON files
```

---

## 🛠 Manual / developer setup

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # then edit .env
uvicorn app:app --reload    # hot-reload during development
```

API docs available at `http://localhost:8000/api/docs`.

---

## 🔌 API

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/run` | Stream pipeline (SSE) |
| `GET`  | `/api/sessions` | List past sessions |
| `GET`  | `/api/sessions/{id}` | Get session |
| `POST` | `/api/sessions/{id}/review` | Approve / flag answer |
| `DELETE` | `/api/sessions/{id}` | Delete session |
| `GET`  | `/api/settings` | Read LLM settings |
| `POST` | `/api/settings` | Save LLM settings to `.env` |

---

## 📜 Legacy React source

The original React/Vite code is preserved in the `full boy/` folder for reference.
