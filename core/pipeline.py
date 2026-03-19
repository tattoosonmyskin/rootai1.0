"""
6-layer RootAI reasoning pipeline.

Each step calls the LLM and yields Server-Sent Events (SSE) so the
browser can stream real-time step updates.

SSE event shapes:
  {"type": "step_start",    "step_id": "...", "step_label": "..."}
  {"type": "step_complete", "step_id": "...", "result": {...}}
  {"type": "final",         "result": {...}, "session_id": "..."}
  {"type": "error",         "message": "..."}
  data: [DONE]
"""

import json
from collections.abc import AsyncGenerator

from .llm_client import invoke_llm
from .store import document_entries, knowledge_nodes, query_sessions

PIPELINE_STEPS = [
    {
        "id": "prompt_analyzer",
        "label": "Prompt Analyzer",
        "description": "Semantic decomposition & intent analysis",
        "icon": "Brain",
    },
    {
        "id": "kg_navigator",
        "label": "Knowledge Graph Navigator",
        "description": "Etymological graph traversal & concept linking",
        "icon": "Network",
    },
    {
        "id": "rag_engine",
        "label": "RAG Engine",
        "description": "Context retrieval & core concept mapping",
        "icon": "Search",
    },
    {
        "id": "reasoning_engine",
        "label": "Reasoning Engine",
        "description": "Logical inference & chain-of-thought",
        "icon": "Cpu",
    },
    {
        "id": "constraint_checker",
        "label": "Causal & Constraint Checker",
        "description": "Logic validation & execution plan verification",
        "icon": "ShieldCheck",
    },
    {
        "id": "standard_llm",
        "label": "Standard LLM Synthesis",
        "description": "Final structured answer (any LLM)",
        "icon": "Sparkles",
    },
]


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"


def _join(lst: list | None, sep: str = ", ") -> str:
    return sep.join(lst or [])


async def run_pipeline(
    query: str,
    api_key: str | None = None,
    base_url: str | None = None,
    model: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    Async generator that yields SSE text chunks.
    Callers wrap this in a StreamingResponse.
    """
    R: dict = {}
    llm_kwargs = dict(api_key=api_key, base_url=base_url, model=model)

    try:
        # ── 1. Prompt Analyzer ────────────────────────────────────────────────
        yield _sse({"type": "step_start", "step_id": "prompt_analyzer", "step_label": "Prompt Analyzer"})
        R["prompt"] = await invoke_llm(
            prompt=(
                f'You are the Prompt Analyzer in the RootAI semantic reasoning pipeline.\n'
                f'Analyze this query: "{query}"\n'
                f'Decompose it thoroughly for downstream AI components.'
            ),
            response_json_schema={
                "type": "object",
                "properties": {
                    "intent":              {"type": "string"},
                    "complexity":          {"type": "string"},
                    "domain":              {"type": "string"},
                    "key_concepts":        {"type": "array", "items": {"type": "string"}},
                    "semantic_components": {"type": "array", "items": {"type": "string"}},
                    "suggested_approach":  {"type": "string"},
                },
            },
            **llm_kwargs,
        )
        yield _sse({"type": "step_complete", "step_id": "prompt_analyzer", "result": R["prompt"]})

        # ── 2. Knowledge Graph Navigator ──────────────────────────────────────
        yield _sse({"type": "step_start", "step_id": "kg_navigator", "step_label": "Knowledge Graph Navigator"})
        R["kg"] = await invoke_llm(
            prompt=(
                f'You are the Knowledge Graph Navigator in RootAI.\n'
                f'Query: "{query}"\n'
                f'Key concepts to graph: {_join(R["prompt"].get("key_concepts"))}\n'
                f'Domain: {R["prompt"].get("domain", "")}\n\n'
                f'Build an etymological knowledge graph: trace word origins, define nodes, map semantic connections.'
            ),
            response_json_schema={
                "type": "object",
                "properties": {
                    "nodes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "term":          {"type": "string"},
                                "etymology":     {"type": "string"},
                                "definition":    {"type": "string"},
                                "related_terms": {"type": "array", "items": {"type": "string"}},
                            },
                        },
                    },
                    "connections": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "from":         {"type": "string"},
                                "to":           {"type": "string"},
                                "relationship": {"type": "string"},
                            },
                        },
                    },
                    "root_concepts": {"type": "array", "items": {"type": "string"}},
                },
            },
            **llm_kwargs,
        )
        yield _sse({"type": "step_complete", "step_id": "kg_navigator", "result": R["kg"]})
        nodes = R["kg"].get("nodes") or []
        if nodes:
            try:
                knowledge_nodes.bulk_create(
                    [{**n, "query_context": query} for n in nodes]
                )
            except Exception:
                pass

        # ── 3. RAG Engine ─────────────────────────────────────────────────────
        yield _sse({"type": "step_start", "step_id": "rag_engine", "step_label": "RAG Engine"})
        R["rag"] = await invoke_llm(
            prompt=(
                f'You are the RAG Engine in RootAI.\n'
                f'Query: "{query}"\n'
                f'Key concepts: {_join(R["prompt"].get("key_concepts"))}\n'
                f'Graph root concepts: {_join(R["kg"].get("root_concepts"))}\n\n'
                f'Retrieve and synthesize relevant factual knowledge. Build a core concept map '
                f'and list supporting facts with real source references.'
            ),
            response_json_schema={
                "type": "object",
                "properties": {
                    "core_concept_map": {
                        "type": "object",
                        "properties": {
                            "central_concept":   {"type": "string"},
                            "sub_concepts":      {"type": "array", "items": {"type": "string"}},
                            "key_relationships": {"type": "array", "items": {"type": "string"}},
                        },
                    },
                    "supporting_facts": {"type": "array", "items": {"type": "string"}},
                    "grounding_documents": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "title":             {"type": "string"},
                                "source":            {"type": "string"},
                                "relevance_summary": {"type": "string"},
                            },
                        },
                    },
                },
            },
            **llm_kwargs,
        )
        yield _sse({"type": "step_complete", "step_id": "rag_engine", "result": R["rag"]})
        docs = R["rag"].get("grounding_documents") or []
        if docs:
            try:
                document_entries.bulk_create(
                    [
                        {
                            "title":         d.get("title", ""),
                            "source":        d.get("source", ""),
                            "content":       d.get("relevance_summary", ""),
                            "query_context": query,
                            "concepts":      R["prompt"].get("key_concepts") or [],
                        }
                        for d in docs
                    ]
                )
            except Exception:
                pass

        # ── 4. Reasoning Engine ───────────────────────────────────────────────
        yield _sse({"type": "step_start", "step_id": "reasoning_engine", "step_label": "Reasoning Engine"})
        ccm = R["rag"].get("core_concept_map") or {}
        R["reasoning"] = await invoke_llm(
            prompt=(
                f'You are the Reasoning Engine in RootAI.\n'
                f'Query: "{query}"\n'
                f'Core concept: {ccm.get("central_concept", "")}\n'
                f'Sub-concepts: {_join(ccm.get("sub_concepts"))}\n'
                f'Supporting facts: {_join((R["rag"].get("supporting_facts") or [])[:5], " | ")}\n'
                f'KG root concepts: {_join(R["kg"].get("root_concepts"))}\n\n'
                f'Build a rigorous step-by-step reasoning chain. Derive inferences and reach intermediate conclusions.'
            ),
            response_json_schema={
                "type": "object",
                "properties": {
                    "reasoning_chain":          {"type": "array", "items": {"type": "string"}},
                    "inferences":               {"type": "array", "items": {"type": "string"}},
                    "intermediate_conclusions": {"type": "array", "items": {"type": "string"}},
                    "confidence":               {"type": "number"},
                    "reasoning_type":           {"type": "string"},
                },
            },
            **llm_kwargs,
        )
        yield _sse({"type": "step_complete", "step_id": "reasoning_engine", "result": R["reasoning"]})

        # ── 5. Causal & Constraint Checker ────────────────────────────────────
        yield _sse({"type": "step_start", "step_id": "constraint_checker", "step_label": "Causal & Constraint Checker"})
        R["constraint"] = await invoke_llm(
            prompt=(
                f'You are the Causal & Constraint Checker in RootAI.\n'
                f'Query: "{query}"\n'
                f'Reasoning chain: {_join(R["reasoning"].get("reasoning_chain"), " → ")}\n'
                f'Inferences: {_join(R["reasoning"].get("inferences"), "; ")}\n\n'
                f'Check for logical fallacies, unsupported causal claims, and factual inconsistencies.\n'
                f'Flag issues, verify solid components, and produce a clean verified execution plan.'
            ),
            response_json_schema={
                "type": "object",
                "properties": {
                    "is_valid":            {"type": "boolean"},
                    "logical_issues":      {"type": "array", "items": {"type": "string"}},
                    "verified_components": {"type": "array", "items": {"type": "string"}},
                    "execution_plan": {
                        "type": "object",
                        "properties": {
                            "steps":            {"type": "array", "items": {"type": "string"}},
                            "confidence_score": {"type": "number"},
                            "reliability":      {"type": "string"},
                        },
                    },
                },
            },
            **llm_kwargs,
        )
        yield _sse({"type": "step_complete", "step_id": "constraint_checker", "result": R["constraint"]})

        # ── 6. Standard LLM Final Synthesis ──────────────────────────────────
        yield _sse({"type": "step_start", "step_id": "standard_llm", "step_label": "Standard LLM Synthesis"})
        ep = (R["constraint"].get("execution_plan") or {})
        R["final"] = await invoke_llm(
            prompt=(
                f'You are the final synthesis layer of RootAI. Produce a comprehensive, accurate answer.\n\n'
                f'QUERY: "{query}"\n'
                f'DOMAIN: {R["prompt"].get("domain", "")} | COMPLEXITY: {R["prompt"].get("complexity", "")}\n'
                f'KEY CONCEPTS: {_join(R["prompt"].get("key_concepts"))}\n'
                f'SUPPORTING FACTS: {_join((R["rag"].get("supporting_facts") or [])[:6], " | ")}\n'
                f'REASONING: {_join((R["reasoning"].get("reasoning_chain") or [])[:5], " → ")}\n'
                f'VERIFIED RELIABILITY: {ep.get("reliability", "")}\n'
                f'AVOID: {_join(R["constraint"].get("logical_issues")) or "none identified"}\n\n'
                f'Write a thorough, well-structured answer with key points, honest confidence level, '
                f'caveats, and useful follow-up questions.'
            ),
            response_json_schema={
                "type": "object",
                "properties": {
                    "answer":              {"type": "string"},
                    "key_points":          {"type": "array", "items": {"type": "string"}},
                    "confidence_level":    {"type": "number"},
                    "caveats":             {"type": "array", "items": {"type": "string"}},
                    "follow_up_questions": {"type": "array", "items": {"type": "string"}},
                },
            },
            **llm_kwargs,
        )
        yield _sse({"type": "step_complete", "step_id": "standard_llm", "result": R["final"]})

        # ── Persist session ───────────────────────────────────────────────────
        try:
            session = query_sessions.create(
                {
                    "query":            query,
                    "status":           "completed",
                    "steps_results":    R,
                    "final_answer":     R["final"].get("answer", ""),
                    "confidence_level": R["final"].get("confidence_level"),
                    "human_review":     {"rating": "pending", "notes": ""},
                }
            )
            session_id = session["id"]
        except Exception:
            session_id = None

        yield _sse({"type": "final", "result": R["final"], "session_id": session_id})

    except Exception as exc:
        yield _sse({"type": "error", "message": str(exc)})

    yield "data: [DONE]\n\n"
