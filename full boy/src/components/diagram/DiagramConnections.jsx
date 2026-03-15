import React from 'react';

/**
 * SVG connection lines between diagram nodes.
 * Positions are expressed as percentages of the 900×580 container.
 */
const connections = [
  // user-query → prompt-analyzer
  { x1: '53%', y1: '5.5%',  x2: '53%',  y2: '16%'  },
  // prompt-analyzer → kg-navigator
  { x1: '46%', y1: '20.5%', x2: '33%',  y2: '30%'  },
  // prompt-analyzer → rag-engine
  { x1: '59%', y1: '20.5%', x2: '64%',  y2: '30%'  },
  // kg-navigator → etym-kg
  { x1: '33%', y1: '38%',   x2: '27%',  y2: '48%'  },
  // kg-navigator → doc-store
  { x1: '40%', y1: '38%',   x2: '48%',  y2: '47%'  },
  // rag-engine → doc-store
  { x1: '58%', y1: '38%',   x2: '55%',  y2: '47%'  },
  // rag-engine → reasoning-engine
  { x1: '70%', y1: '38%',   x2: '74%',  y2: '48%'  },
  // etym-kg → resource-manager
  { x1: '27%', y1: '56%',   x2: '23%',  y2: '67%'  },
  // doc-store → resource-manager
  { x1: '38%', y1: '56%',   x2: '30%',  y2: '67%'  },
  // reasoning-engine → causal-checker
  { x1: '74%', y1: '56%',   x2: '70%',  y2: '67%'  },
  // resource-manager → central-repo
  { x1: '23%', y1: '75%',   x2: '23%',  y2: '85%'  },
  // causal-checker → standard-llm
  { x1: '70%', y1: '75%',   x2: '73%',  y2: '85%'  },
  // reasoning-engine → human-review
  { x1: '80%', y1: '52%',   x2: '85%',  y2: '52%'  },
];

export default function DiagramConnections() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="rgba(148,163,184,0.4)" />
        </marker>
      </defs>
      {connections.map((c, i) => (
        <line
          key={i}
          x1={c.x1} y1={c.y1}
          x2={c.x2} y2={c.y2}
          stroke="rgba(148,163,184,0.3)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          markerEnd="url(#arrowhead)"
        />
      ))}
    </svg>
  );
}
