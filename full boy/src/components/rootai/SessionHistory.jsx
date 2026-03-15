import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Clock, CheckCircle2, XCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusIcon = {
  completed: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  failed:    <XCircle className="w-3.5 h-3.5 text-red-400" />,
  running:   <Clock className="w-3.5 h-3.5 text-sky-400" />,
};

export default function SessionHistory({ onSelect, onClose }) {
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['query-sessions'],
    queryFn: () => base44.entities.QuerySession.list('-created_date', 30),
  });

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed top-0 right-0 h-full w-80 bg-slate-950 border-l border-slate-800 z-50 flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <h2 className="text-sm font-semibold text-slate-200">Session History</h2>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {isLoading && (
          <div className="flex items-center justify-center py-10">
            <div className="w-5 h-5 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin" />
          </div>
        )}
        {!isLoading && sessions.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-10">No sessions yet</p>
        )}
        <AnimatePresence>
          {sessions.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => { onSelect(s); onClose(); }}
              className="w-full text-left px-4 py-3 hover:bg-slate-900 transition-colors border-b border-slate-800/50 group"
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">{statusIcon[s.status] || statusIcon.running}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 group-hover:text-white truncate leading-snug">{s.query}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500">
                      {formatDistanceToNow(new Date(s.created_date), { addSuffix: true })}
                    </span>
                    {s.confidence_level != null && (
                      <span className="text-[10px] text-violet-400">
                        {s.confidence_level <= 1
                          ? Math.round(s.confidence_level * 100)
                          : s.confidence_level}% conf
                      </span>
                    )}
                    {s.human_review?.rating !== 'pending' && (
                      <span className={`text-[10px] ${s.human_review?.rating === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {s.human_review?.rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}