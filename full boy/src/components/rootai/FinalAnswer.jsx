import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { ThumbsUp, Flag, Sparkles, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function FinalAnswer({ result, sessionId, onFollowUp }) {
  const [review, setReview] = useState('pending');
  const [flagNote, setFlagNote] = useState('');
  const [showFlag, setShowFlag] = useState(false);

  const submitReview = async (rating) => {
    setReview(rating);
    if (sessionId) {
      await base44.entities.QuerySession.update(sessionId, {
        human_review: { rating, notes: flagNote }
      }).catch(() => {});
    }
  };

  const confidence = result.confidence_level <= 1
    ? Math.round(result.confidence_level * 100)
    : result.confidence_level;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-violet-500/30 bg-slate-900/80 backdrop-blur-sm overflow-hidden"
    >
      {/* header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-violet-500/20 bg-violet-500/5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-violet-300">Final Answer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-20 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-400 rounded-full"
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="text-[11px] text-violet-400 font-mono">{confidence}% confidence</span>
          </div>
        </div>
      </div>

      {/* answer */}
      <div className="px-5 py-4">
        <div className="prose prose-sm prose-invert max-w-none text-slate-200 text-sm leading-relaxed">
          <ReactMarkdown>{result.answer}</ReactMarkdown>
        </div>
      </div>

      {/* key points */}
      {result.key_points?.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Key Points</p>
          <ul className="space-y-1.5">
            {result.key_points.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                {pt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* caveats */}
      {result.caveats?.length > 0 && (
        <div className="mx-5 mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2.5">
          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-500/70 mb-1.5">Caveats</p>
          <ul className="space-y-1">
            {result.caveats.map((c, i) => (
              <li key={i} className="text-xs text-amber-200/70">⚠ {c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* follow-up questions */}
      {result.follow_up_questions?.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2">Suggested Follow-ups</p>
          <div className="flex flex-wrap gap-2">
            {result.follow_up_questions.map((q, i) => (
              <button
                key={i}
                onClick={() => onFollowUp && onFollowUp(q)}
                className="flex items-center gap-1 text-xs text-slate-300 border border-slate-700 rounded-full px-3 py-1 hover:border-slate-500 hover:text-slate-100 transition-colors"
              >
                {q}
                <ChevronRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* human review */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-900/50">
        <span className="text-[11px] text-slate-500">Human-Fact Review</span>
        <div className="flex items-center gap-2">
          {review === 'pending' ? (
            <>
              <button
                onClick={() => submitReview('approved')}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors border border-slate-700 hover:border-emerald-500/40 rounded-lg px-2.5 py-1"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Approve
              </button>
              <button
                onClick={() => setShowFlag(true)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors border border-slate-700 hover:border-amber-500/40 rounded-lg px-2.5 py-1"
              >
                <Flag className="w-3.5 h-3.5" /> Flag
              </button>
            </>
          ) : (
            <span className={`text-xs font-medium ${review === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {review === 'approved' ? '✓ Approved' : '⚑ Flagged'}
            </span>
          )}
        </div>
      </div>

      {/* flag note */}
      {showFlag && review === 'pending' && (
        <div className="px-5 pb-4 pt-1">
          <textarea
            value={flagNote}
            onChange={e => setFlagNote(e.target.value)}
            placeholder="Describe the issue…"
            className="w-full bg-slate-800 border border-amber-500/30 rounded-lg text-xs text-slate-300 p-2.5 resize-none h-16 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
          />
          <button
            onClick={() => submitReview('flagged')}
            className="mt-2 text-xs text-amber-400 border border-amber-500/30 rounded-lg px-3 py-1 hover:bg-amber-500/10 transition-colors"
          >
            Submit Flag
          </button>
        </div>
      )}
    </motion.div>
  );
}