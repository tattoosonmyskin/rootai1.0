import React from 'react';

const legendItems = [
  { tier: 'input',    color: 'bg-sky-500/30 border-sky-500/50',     label: 'Input' },
  { tier: 'core',     color: 'bg-violet-500/30 border-violet-500/50', label: 'Core Knowledge' },
  { tier: 'process',  color: 'bg-emerald-500/30 border-emerald-500/50', label: 'Processing' },
  { tier: 'resource', color: 'bg-amber-500/30 border-amber-500/50',  label: 'Resource' },
  { tier: 'check',    color: 'bg-orange-500/30 border-orange-500/50',label: 'Validation' },
  { tier: 'output',   color: 'bg-rose-500/30 border-rose-500/50',    label: 'Output' },
  { tier: 'external', color: 'bg-slate-500/30 border-slate-500/50',  label: 'External' },
];

export default function DiagramLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {legendItems.map(({ tier, color, label }) => (
        <div key={tier} className="flex items-center gap-1.5">
          <div className={`w-3 h-3 rounded border ${color}`} />
          <span className="text-[11px] text-slate-500">{label}</span>
        </div>
      ))}
    </div>
  );
}
