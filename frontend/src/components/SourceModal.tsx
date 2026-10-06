import React from 'react';
import { X, ExternalLink, BookOpen, ShieldCheck } from 'lucide-react';
import type { Citation } from '../types';

interface SourceModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const SourceModal: React.FC<SourceModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-white/10 shadow-2xl p-6 bg-slate-900/95">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {citation.citation_id}
                </span>
                {citation.section_id && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {citation.section_id}
                  </span>
                )}
                {citation.assessment_year && (
                  <span className="text-xs text-slate-400">
                    {citation.assessment_year}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                {citation.document_title}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div>
            <span className="text-xs text-slate-400 font-medium">Source Authority:</span>
            <p className="text-sm font-semibold text-emerald-300 mt-0.5">
              {citation.organization}
            </p>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium">Statutory Excerpt / Text Passage:</span>
            <div className="mt-1 p-4 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs leading-relaxed text-slate-200 whitespace-pre-wrap">
              {citation.snippet}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Grounded Verification Score: <strong>{(citation.confidence_score * 100).toFixed(0)}%</strong></span>
            </div>
            {citation.source_url && (
              <a
                href={citation.source_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 underline font-medium"
              >
                <span>Official Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium text-white transition-colors"
          >
            Close Source Card
          </button>
        </div>

      </div>
    </div>
  );
};
