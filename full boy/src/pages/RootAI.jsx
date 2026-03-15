import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RotateCcw, History, Zap } from 'lucide-react';
import { usePipeline, PIPELINE_STEPS } from '../components/rootai/usePipeline';
import PipelineStep from '../components/rootai/PipelineStep';
import FinalAnswer from '../components/rootai/FinalAnswer';
import SessionHistory from '../components/rootai/SessionHistory';

export default function RootAI() {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const { steps, isRunning, finalResult, sessionId, runPipeline, reset } = usePipeline();
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const hasStarted = steps.some(s => s.status !== 'idle');

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!query.trim() || isRunning) return;
    runPipeline(query.trim());
  };

  const handleFollowUp = (q) => {
    setQuery(q);
    reset();
    setTimeout(() => runPipeline(q), 100);
  };

  const handleHistorySelect = (session) => {
    setQuery(session.query);
    reset();
  };

  // Auto-scroll to bottom as pipeline runs
  useEffect(() => {
    if (isRunning) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [steps, isRunning]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight">
                <span className="text-emerald-400">Root</span>
                <span className="text-slate-200">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 ml-2 hidden sm:inline">Semantic Reasoning Pipeline</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasStarted && (
              <button
                onClick={() => { reset(); setQuery(''); }}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors border border-slate-800 hover:border-slate-600 rounded-lg px-3 py-1.5"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors border border-slate-800 hover:border-slate-600 rounded-lg px-3 py-1.5"
            >
              <History className="w-3 h-3" /> History
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Query Input */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Query</p>
          </div>
          <form onSubmit={handleSubmit} className="flex items-end gap-2 px-4 pb-3">
            <textarea
              ref={textareaRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything — RootAI will reason through it step by step…"
              rows={2}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none leading-relaxed"
              disabled={isRunning}
            />
            <button
              type="submit"
              disabled={!query.trim() || isRunning}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-medium rounded-xl px-4 py-2 transition-colors flex-shrink-0"
            >
              {isRunning ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isRunning ? 'Running…' : 'Run'}</span>
            </button>
          </form>
          <div className="px-4 pb-2">
            <p className="text-[10px] text-slate-600">Press ⌘↵ to run</p>
          </div>
        </div>

        {/* Pipeline Steps */}
        <AnimatePresence>
          {hasStarted && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-1">Pipeline</p>
              {steps.map((step, i) => (
                <PipelineStep key={step.id} step={step} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final Answer */}
        <AnimatePresence>
          {finalResult && (
            <FinalAnswer
              result={finalResult}
              sessionId={sessionId}
              onFollowUp={handleFollowUp}
            />
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-16 gap-4 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-200">6-Layer Reasoning Pipeline</h2>
              <p className="text-sm text-slate-500 mt-1 max-w-sm">
                Your query runs through Prompt Analysis → Knowledge Graph → RAG → Reasoning → Constraint Checking → LLM Synthesis
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {['What is the etymology of "serendipity"?', 'How does photosynthesis work?', 'Explain the trolley problem'].map(ex => (
                <button
                  key={ex}
                  onClick={() => { setQuery(ex); setTimeout(() => textareaRef.current?.focus(), 50); }}
                  className="text-xs text-slate-400 border border-slate-800 rounded-full px-3 py-1 hover:border-slate-600 hover:text-slate-200 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <SessionHistory
              onSelect={handleHistorySelect}
              onClose={() => setShowHistory(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}