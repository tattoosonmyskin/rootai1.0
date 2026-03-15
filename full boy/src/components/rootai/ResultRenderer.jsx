import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

function CollapsibleObject({ label, data }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {label}
      </button>
      {open && (
        <div className="ml-4 mt-1">
          <ResultRenderer data={data} />
        </div>
      )}
    </div>
  );
}

export default function ResultRenderer({ data, depth = 0 }) {
  if (data === null || data === undefined) return null;

  if (typeof data === 'boolean') {
    return (
      <span className={`text-xs font-mono ${data ? 'text-emerald-400' : 'text-red-400'}`}>
        {String(data)}
      </span>
    );
  }

  if (typeof data === 'number') {
    const pct = data <= 1 ? Math.round(data * 100) : data;
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-700 rounded-full max-w-[120px]">
          <div
            className="h-full bg-emerald-400 rounded-full"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="text-xs text-emerald-400 font-mono">{pct}{data <= 1 ? '%' : ''}</span>
      </div>
    );
  }

  if (typeof data === 'string') {
    return <p className="text-xs text-slate-300 leading-relaxed">{data}</p>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return <span className="text-xs text-slate-600 italic">empty</span>;
    if (typeof data[0] === 'object') {
      return (
        <div className="space-y-1">
          {data.map((item, i) => (
            <CollapsibleObject key={i} label={item.term || item.title || item.from || `Item ${i + 1}`} data={item} />
          ))}
        </div>
      );
    }
    return (
      <ul className="space-y-1">
        {data.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
            <span className="text-slate-600 font-mono mt-0.5 flex-shrink-0">{i + 1}.</span>
            <span>{String(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (typeof data === 'object') {
    return (
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]) => {
          const label = key.replace(/_/g, ' ');
          if (typeof value === 'object' && value !== null && depth < 2) {
            return (
              <div key={key}>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-1">{label}</p>
                <div className="ml-2">
                  <ResultRenderer data={value} depth={depth + 1} />
                </div>
              </div>
            );
          }
          return (
            <div key={key} className="flex gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex-shrink-0 w-28 truncate pt-0.5">{label}</span>
              <div className="flex-1 min-w-0">
                <ResultRenderer data={value} depth={depth + 1} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return <span className="text-xs text-slate-400">{String(data)}</span>;
}