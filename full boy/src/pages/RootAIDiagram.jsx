import React from 'react';
import { motion } from 'framer-motion';
import DiagramNode from '../components/diagram/DiagramNode';
import DiagramConnections from '../components/diagram/DiagramConnections';
import CoreTierBoundary from '../components/diagram/CoreTierBoundary';
import DiagramLegend from '../components/diagram/DiagramLegend';

const nodes = [
  {
    id: 'user-query',
    label: 'User Query',
    tier: 'input',
    rounded: true,
    style: { left: '53%', top: '2%', width: 110, height: 42, transform: 'translateX(-50%)' },
    delay: 0,
  },
  {
    id: 'prompt-analyzer',
    label: 'Prompt Analyzer',
    tier: 'core',
    style: { left: '53%', top: '16%', width: 130, height: 42, transform: 'translateX(-50%)' },
    delay: 1,
  },
  {
    id: 'kg-navigator',
    label: 'Knowledge Graph\nNavigator',
    tier: 'process',
    style: { left: '33%', top: '30%', width: 140, height: 48, transform: 'translateX(-50%)' },
    delay: 2,
  },
  {
    id: 'rag-engine',
    label: 'RAG Engine',
    tier: 'process',
    style: { left: '64%', top: '30%', width: 120, height: 42, transform: 'translateX(-50%)' },
    delay: 2,
  },
  {
    id: 'etym-kg',
    label: 'Etymological\nKnowledge Graph',
    tier: 'core',
    style: { left: '27%', top: '48%', width: 140, height: 48, transform: 'translateX(-50%)' },
    delay: 3,
  },
  {
    id: 'doc-store',
    label: 'Document Store',
    sublabel: 'e.g., Wikipedia, Academic Texts',
    tier: 'core',
    style: { left: '48%', top: '47%', width: 160, height: 54, transform: 'translateX(-50%)' },
    delay: 3,
  },
  {
    id: 'reasoning-engine',
    label: 'Reasoning Engine',
    tier: 'process',
    style: { left: '74%', top: '48%', width: 130, height: 42, transform: 'translateX(-50%)' },
    delay: 3,
  },
  {
    id: 'resource-manager',
    label: 'Resource Manager',
    sublabel: '(API/file)',
    tier: 'resource',
    style: { left: '23%', top: '67%', width: 145, height: 50, transform: 'translateX(-50%)' },
    delay: 4,
  },
  {
    id: 'causal-checker',
    label: 'Causal & Constraint\nChecker',
    tier: 'check',
    style: { left: '70%', top: '67%', width: 150, height: 48, transform: 'translateX(-50%)' },
    delay: 4,
  },
  {
    id: 'central-repo',
    label: 'Central Repository\nManifest v2.1',
    tier: 'output',
    style: { left: '23%', top: '85%', width: 150, height: 48, transform: 'translateX(-50%)' },
    delay: 5,
  },
  {
    id: 'standard-llm',
    label: 'Standard LLM',
    sublabel: '(GPT, Claude, etc.)',
    tier: 'output',
    style: { left: '73%', top: '85%', width: 145, height: 48, transform: 'translateX(-50%)' },
    delay: 5,
  },
  {
    id: 'human-review',
    label: 'Human-Fact\nReview',
    tier: 'external',
    style: { left: '88%', top: '48%', width: 100, height: 42, transform: 'translateX(-50%)' },
    delay: 6,
  },
];

export default function RootAIDiagram() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-8 pb-4 px-4"
      >
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          <span className="text-emerald-400">Root</span>
          <span className="text-slate-300">AI</span>
          <span className="text-slate-500 font-light ml-2 text-lg sm:text-xl">Architecture</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-md mx-auto">
          Semantic reasoning pipeline with etymological grounding and constraint verification
        </p>
      </motion.header>

      {/* Diagram Container */}
      <div className="flex-1 flex items-start justify-center px-4 pb-8">
        <div className="w-full max-w-[900px] relative" style={{ aspectRatio: '900 / 580' }}>
          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgb(148 163 184) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* Core Tier Boundary */}
          <CoreTierBoundary />

          {/* SVG Connections */}
          <DiagramConnections />

          {/* Nodes */}
          {nodes.map((node) => (
            <DiagramNode key={node.id} {...node} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="pb-6 px-4">
        <DiagramLegend />
      </div>
    </div>
  );
}