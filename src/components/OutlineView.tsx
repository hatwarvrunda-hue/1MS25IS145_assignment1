import React from 'react';
import type { OutlineItem } from '../types.ts';
import { ListTree, ArrowRight, BookOpen } from 'lucide-react';

interface OutlineViewProps {
  outline: OutlineItem[];
  title: string;
}

export const OutlineView: React.FC<OutlineViewProps> = ({ outline, title }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight font-serif flex items-center gap-2">
          <ListTree className="w-5 h-5 text-indigo-600" />
          <span>Paper Structural Outline</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Hierarchical thesis structure developed during Stage 4 prior to full-text academic drafting.
        </p>
      </div>

      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Working Title
        </span>
        <h3 className="text-lg font-serif font-bold text-slate-900">{title}</h3>
      </div>

      {/* Outline nodes */}
      <div className="space-y-3">
        {outline.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3"
          >
            <div className="flex items-start space-x-3.5">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-serif mb-1">
                  {item.heading}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
