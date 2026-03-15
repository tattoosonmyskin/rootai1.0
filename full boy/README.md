# RootAI — Local Setup

RootAI is a 6-layer semantic reasoning pipeline that runs entirely on your machine. It connects to any OpenAI-compatible LLM API and stores session history in your browser's localStorage — no cloud lock-in, no authentication required.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- An API key for an OpenAI-compatible LLM (OpenAI, a local [Ollama](https://ollama.com/) instance, etc.)

## Quick Start

1. **Clone the repository**
2. **Navigate to the project directory** (`full boy/`)
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Configure your LLM:**
   ```bash
   cp .env.example .env
   # Edit .env and set your VITE_LLM_API_KEY (and optionally VITE_LLM_BASE_URL / VITE_LLM_MODEL)
   ```
5. **Start the dev server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Configuration (`.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_LLM_API_KEY` | *(required)* | Your LLM API key |
| `VITE_LLM_BASE_URL` | `https://api.openai.com/v1` | OpenAI-compatible API base URL |
| `VITE_LLM_MODEL` | `gpt-4o-mini` | Model to use |

### Using Ollama (fully local, no API key needed)

```env
VITE_LLM_API_KEY=ollama
VITE_LLM_BASE_URL=http://localhost:11434/v1
VITE_LLM_MODEL=llama3
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Architecture

Queries run through a 6-step pipeline:

1. **Prompt Analyzer** — Semantic decomposition & intent analysis
2. **Knowledge Graph Navigator** — Etymological graph traversal & concept linking
3. **RAG Engine** — Context retrieval & core concept mapping
4. **Reasoning Engine** — Logical inference & chain-of-thought
5. **Causal & Constraint Checker** — Logic validation & execution plan verification
6. **Standard LLM Synthesis** — Final structured answer

Session history is stored in browser localStorage under the `rootai_` key prefix.

