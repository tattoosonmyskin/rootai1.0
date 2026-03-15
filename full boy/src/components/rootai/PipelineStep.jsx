import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Network, Search, Cpu, ShieldCheck, Sparkles,
         CheckCircle2, Loader2, Circle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ResultRenderer from './ResultRenderer';

const ICONS = { Brain, Network, Search, Cpu, ShieldCheck, Sparkles };

const tierColor = {
  Brain:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  Network:    'text-sky-400 bg-sky-500/10 border-sky-500/30',
  Search:     'text-sky-400 bg-sky-500/10 border-sky-500/30',
  Cpu:        'text-sky-400 bg-sky-500/10 border-sky-500/30',
  ShieldCheck:'text-amber-400 bg-amber-500/10 border-amber-500/30',
  Sparkles:   'text-violet-400 bg-violet-500/10 border-violet-500/30',
};

const statusIcon = {
  idle:      <Circle className="w-4 h-4 text-slate-600" />,
  running:   <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />,
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  failed:    <XCircle className="w-4 h-4 text-red-400" />,
};

const statusLabel = {
  idle:      'Pending',
  running:   'Running…',
  completed: 'Done',
  failed:    'Failed',
};

export default function PipelineStep({ step, index }) {
  const [open, setOpen] = useState(false);
  const Icon = ICONS[step.icon];
  const colors = tierColor[step.icon];

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={`rounded-xl border bg-slate-900/60 backdrop-blur-sm overflow-hidden
        ${step.status === 'running' ? 'border-sky-500/40 shadow-sky-500/10 shadow-lg' : 'border-slate-800'}`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 ${step.status === 'completed' ? 'cursor-pointer' : ''}`}
        onClick={() => step.status === 'completed' && setOpen(o => !o)}
      >
        {/* step number + icon */}
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${colors}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">{String(index + 1).padStart(2, '0')}</span>
            <span className="text-sm font-semibold text-slate-100 truncate">{step.label}</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">{step.description}</p>
        </div>

        {/* status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[11px] font-medium hidden sm:block
            ${step.status === 'completed' ? 'text-emerald-400' :
              step.status === 'running'   ? 'text-sky-400'     :
              step.status === 'failed'    ? 'text-red-400'     : 'text-slate-600'}`}>
            {statusLabel[step.status]}
          </span>
          {statusIcon[step.status]}
          {step.status === 'completed' && (
            open ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                 : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>
      </div>

      {/* running pulse bar */}
      {step.status === 'running' && (
        <div className="h-0.5 w-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full bg-sky-400"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* result panel */}
      <AnimatePresence>
        {open && step.result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-slate-800 overflow-hidden"
          >
            <div className="p-4 max-h-80 overflow-y-auto">
              <ResultRenderer data={step.result} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}