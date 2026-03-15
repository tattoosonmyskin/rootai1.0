import React from 'react';

/**
 * Dashed boundary that visually groups the "core" tier nodes
 * (Etymological KG + Document Store).
 */
export default function CoreTierBoundary() {
  return (
    <div
      className="absolute border border-dashed border-violet-500/20 rounded-2xl bg-violet-500/[0.02]"
      style={{
        left: '14%',
        top: '43%',
        width: '42%',
        height: '18%',
      }}
    >
      <span className="absolute -top-2.5 left-3 text-[9px] font-mono uppercase tracking-widest text-violet-500/40 bg-slate-950 px-1">
        Core Knowledge Layer
      </span>
    </div>
  );
}
