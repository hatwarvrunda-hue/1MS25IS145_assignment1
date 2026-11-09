import React from 'react';
import { BookOpen, Sparkles, GraduationCap, ShieldCheck, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onLoadSample: () => void;
  onReset: () => void;
  hasResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onLoadSample, onReset, hasResult }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-sm ring-1 ring-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-lg tracking-tight text-slate-900 font-serif">ScholarFlow</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                AI research workspace
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Student research agent with Google Search grounding & verified citations
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors border border-slate-200"
            title="Load sample topic: Spaced repetition and student learning"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Try sample topic</span>
          </button>

          {hasResult && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>New research</span>
            </button>
          )}

          <div className="hidden md:flex items-center pl-3 border-l border-slate-200 text-xs text-slate-400">
            <span className="flex items-center space-x-1 text-slate-500 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grounded sources</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
