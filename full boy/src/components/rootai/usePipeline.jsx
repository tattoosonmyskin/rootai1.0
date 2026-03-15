import { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

export const PIPELINE_STEPS = [
  { id: 'prompt_analyzer',   label: 'Prompt Analyzer',              description: 'Semantic decomposition & intent analysis',          icon: 'Brain' },
  { id: 'kg_navigator',      label: 'Knowledge Graph Navigator',     description: 'Etymological graph traversal & concept linking',    icon: 'Network' },
  { id: 'rag_engine',        label: 'RAG Engine',                    description: 'Context retrieval & core concept mapping',          icon: 'Search' },
  { id: 'reasoning_engine',  label: 'Reasoning Engine',              description: 'Logical inference & chain-of-thought',              icon: 'Cpu' },
  { id: 'constraint_checker',label: 'Causal & Constraint Checker',   description: 'Logic validation & execution plan verification',    icon: 'ShieldCheck' },
  { id: 'standard_llm',      label: 'Standard LLM Synthesis',        description: 'Final structured answer (GPT / Claude / etc.)',     icon: 'Sparkles' },
];

const blank = () => PIPELINE_STEPS.map(s => ({ ...s, status: 'idle', result: null }));

export function usePipeline() {
  const [steps, setSteps] = useState(blank());
  const [isRunning, setIsRunning] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [sessionId, setSessionId] = useState(null);

  const upd = (id, patch) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));

  const reset = useCallback(() => {
    setSteps(blank());
    setFinalResult(null);
    setSessionId(null);
  }, []);

  const runPipeline = useCallback(async (query) => {
    setSteps(blank());
    setFinalResult(null);
    setSessionId(null);
    setIsRunning(true);
    const R = {};

    try {
      // ── 1. Prompt Analyzer ──────────────────────────────────────────
      upd('prompt_analyzer', { status: 'running' });
      R.prompt = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Prompt Analyzer in the RootAI semantic reasoning pipeline.
Analyze this query: "${query}"
Decompose it thoroughly for downstream AI components.`,
        response_json_schema: {
          type: 'object',
          properties: {
            intent:              { type: 'string' },
            complexity:          { type: 'string' },
            domain:              { type: 'string' },
            key_concepts:        { type: 'array', items: { type: 'string' } },
            semantic_components: { type: 'array', items: { type: 'string' } },
            suggested_approach:  { type: 'string' }
          }
        }
      });
      upd('prompt_analyzer', { status: 'completed', result: R.prompt });

      // ── 2. Knowledge Graph Navigator ────────────────────────────────
      upd('kg_navigator', { status: 'running' });
      R.kg = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Knowledge Graph Navigator in RootAI.
Query: "${query}"
Key concepts to graph: ${R.prompt.key_concepts?.join(', ')}
Domain: ${R.prompt.domain}

Build an etymological knowledge graph: trace word origins, define nodes, map semantic connections.`,
        response_json_schema: {
          type: 'object',
          properties: {
            nodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  term:          { type: 'string' },
                  etymology:     { type: 'string' },
                  definition:    { type: 'string' },
                  related_terms: { type: 'array', items: { type: 'string' } }
                }
              }
            },
            connections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  from:         { type: 'string' },
                  to:           { type: 'string' },
                  relationship: { type: 'string' }
                }
              }
            },
            root_concepts: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      upd('kg_navigator', { status: 'completed', result: R.kg });
      if (R.kg.nodes?.length > 0) {
        base44.entities.KnowledgeNode.bulkCreate(
          R.kg.nodes.map(n => ({ ...n, query_context: query }))
        ).catch(() => {});
      }

      // ── 3. RAG Engine ───────────────────────────────────────────────
      upd('rag_engine', { status: 'running' });
      R.rag = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the RAG Engine in RootAI.
Query: "${query}"
Key concepts: ${R.prompt.key_concepts?.join(', ')}
Graph root concepts: ${R.kg.root_concepts?.join(', ')}

Retrieve and synthesize relevant factual knowledge. Build a core concept map and list supporting facts with real source references.`,
        response_json_schema: {
          type: 'object',
          properties: {
            core_concept_map: {
              type: 'object',
              properties: {
                central_concept:   { type: 'string' },
                sub_concepts:      { type: 'array', items: { type: 'string' } },
                key_relationships: { type: 'array', items: { type: 'string' } }
              }
            },
            supporting_facts: { type: 'array', items: { type: 'string' } },
            grounding_documents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title:             { type: 'string' },
                  source:            { type: 'string' },
                  relevance_summary: { type: 'string' }
                }
              }
            }
          }
        }
      });
      upd('rag_engine', { status: 'completed', result: R.rag });
      if (R.rag.grounding_documents?.length > 0) {
        base44.entities.DocumentEntry.bulkCreate(
          R.rag.grounding_documents.map(d => ({
            title:         d.title,
            source:        d.source,
            content:       d.relevance_summary,
            query_context: query,
            concepts:      R.prompt.key_concepts || []
          }))
        ).catch(() => {});
      }

      // ── 4. Reasoning Engine ─────────────────────────────────────────
      upd('reasoning_engine', { status: 'running' });
      R.reasoning = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Reasoning Engine in RootAI.
Query: "${query}"
Core concept: ${R.rag.core_concept_map?.central_concept}
Sub-concepts: ${R.rag.core_concept_map?.sub_concepts?.join(', ')}
Supporting facts: ${R.rag.supporting_facts?.slice(0, 5).join(' | ')}
KG root concepts: ${R.kg.root_concepts?.join(', ')}

Build a rigorous step-by-step reasoning chain. Derive inferences and reach intermediate conclusions.`,
        response_json_schema: {
          type: 'object',
          properties: {
            reasoning_chain:         { type: 'array', items: { type: 'string' } },
            inferences:              { type: 'array', items: { type: 'string' } },
            intermediate_conclusions:{ type: 'array', items: { type: 'string' } },
            confidence:              { type: 'number' },
            reasoning_type:          { type: 'string' }
          }
        }
      });
      upd('reasoning_engine', { status: 'completed', result: R.reasoning });

      // ── 5. Causal & Constraint Checker ──────────────────────────────
      upd('constraint_checker', { status: 'running' });
      R.constraint = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Causal & Constraint Checker in RootAI.
Query: "${query}"
Reasoning chain: ${R.reasoning.reasoning_chain?.join(' → ')}
Inferences: ${R.reasoning.inferences?.join('; ')}

Check for logical fallacies, unsupported causal claims, and factual inconsistencies.
Flag issues, verify solid components, and produce a clean verified execution plan.`,
        response_json_schema: {
          type: 'object',
          properties: {
            is_valid:            { type: 'boolean' },
            logical_issues:      { type: 'array', items: { type: 'string' } },
            verified_components: { type: 'array', items: { type: 'string' } },
            execution_plan: {
              type: 'object',
              properties: {
                steps:            { type: 'array', items: { type: 'string' } },
                confidence_score: { type: 'number' },
                reliability:      { type: 'string' }
              }
            }
          }
        }
      });
      upd('constraint_checker', { status: 'completed', result: R.constraint });

      // ── 6. Standard LLM Final Synthesis ─────────────────────────────
      upd('standard_llm', { status: 'running' });
      R.final = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the final synthesis layer of RootAI. Produce a comprehensive, accurate answer.

QUERY: "${query}"
DOMAIN: ${R.prompt.domain} | COMPLEXITY: ${R.prompt.complexity}
KEY CONCEPTS: ${R.prompt.key_concepts?.join(', ')}
SUPPORTING FACTS: ${R.rag.supporting_facts?.slice(0, 6).join(' | ')}
REASONING: ${R.reasoning.reasoning_chain?.slice(0, 5).join(' → ')}
VERIFIED RELIABILITY: ${R.constraint.execution_plan?.reliability}
AVOID: ${R.constraint.logical_issues?.join(', ') || 'none identified'}

Write a thorough, well-structured answer with key points, honest confidence level, caveats, and useful follow-up questions.`,
        response_json_schema: {
          type: 'object',
          properties: {
            answer:              { type: 'string' },
            key_points:          { type: 'array', items: { type: 'string' } },
            confidence_level:    { type: 'number' },
            caveats:             { type: 'array', items: { type: 'string' } },
            follow_up_questions: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      upd('standard_llm', { status: 'completed', result: R.final });
      setFinalResult(R.final);

      // ── Persist session ─────────────────────────────────────────────
      const session = await base44.entities.QuerySession.create({
        query,
        status: 'completed',
        steps_results: R,
        final_answer: R.final.answer,
        confidence_level: R.final.confidence_level,
        human_review: { rating: 'pending', notes: '' }
      });
      setSessionId(session.id);

    } catch (err) {
      setSteps(prev =>
        prev.map(s => s.status === 'running' ? { ...s, status: 'failed' } : s)
      );
    }

    setIsRunning(false);
  }, []);

  return { steps, isRunning, finalResult, sessionId, runPipeline, reset };
}