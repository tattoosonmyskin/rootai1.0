import React from 'react';
import { motion } from 'framer-motion';

const tierStyles = {
  input:    { border: 'border-sky-500/50',    bg: 'bg-sky-500/10',    text: 'text-sky-300' },
  core:     { border: 'border-violet-500/50', bg: 'bg-violet-500/10', text: 'text-violet-300' },
  process:  { border: 'border-emerald-500/50',bg: 'bg-emerald-500/10',text: 'text-emerald-300' },
  resource: { border: 'border-amber-500/50',  bg: 'bg-amber-500/10',  text: 'text-amber-300' },
  check:    { border: 'border-orange-500/50', bg: 'bg-orange-500/10', text: 'text-orange-300' },
  output:   { border: 'border-rose-500/50',   bg: 'bg-rose-500/10',   text: 'text-rose-300' },
  external: { border: 'border-slate-500/50',  bg: 'bg-slate-500/10',  text: 'text-slate-300' },
};

export default function DiagramNode({ id, label, sublabel, tier, rounded, style, delay = 0 }) {
  const ts = tierStyles[tier] || tierStyles.core;

  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: delay * 0.15 }}
      className={`absolute flex flex-col items-center justify-center border ${ts.border} ${ts.bg} backdrop-blur-sm px-2 py-1 text-center shadow-lg ${rounded ? 'rounded-full' : 'rounded-xl'}`}
      style={style}
    >
      <span className={`text-[11px] font-semibold leading-tight whitespace-pre-line ${ts.text}`}>
        {label}
      </span>
      {sublabel && (
        <span className="text-[9px] text-slate-500 mt-0.5 leading-tight whitespace-pre-line">
          {sublabel}
        </span>
      )}
    </motion.div>
  );
}
