import React from 'react';
import type { ResearchPaperResult } from '../types.ts';
import { Compass, HelpCircle, Check, ArrowRight, Layers, Target, Search } from 'lucide-react';

interface ResearchPlanViewProps {
  paper: ResearchPaperResult;
  initialTopic: string;
  initialQuestion: string;
}

export const ResearchPlanView: React.FC<ResearchPlanViewProps> = ({
  paper,
  initialTopic,
  initialQuestion,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight font-serif flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-600" />
          <span>Research Plan & Refined Academic Scope</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Stage 1 converts the student inquiry into a focused, publication-grade academic question with operational sub-inquiries.
        </p>
      </div>

      {/* Refined Question Comparison */}
      <div className="bg-indigo-50/60 rounded-xl border border-indigo-100 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/80 rounded-lg border border-indigo-200/50">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Initial Student Question
            </span>
            <p className="text-sm text-slate-700 italic">
              &ldquo;{initialQuestion || paper.research_question}&rdquo;
            </p>
          </div>

          <div className="p-4 bg-white rounded-lg border border-indigo-300 shadow-xs ring-2 ring-indigo-500/10">
            <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>Refined Academic Research Question</span>
            </span>
            <p className="text-sm font-semibold text-slate-900 font-serif">
              &ldquo;{paper.research_question}&rdquo;
            </p>
          </div>
        </div>
      </div>

      {/* Structured Research Plan items */}
      <div>
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <span>Research Methodology Roadmap & Sub-Inquiries</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {paper.research_plan.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-all flex items-start space-x-3 text-xs sm:text-sm text-slate-800"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Search Methodology & Grounding Strategy */}
      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-500" />
          <span>Search Grounding Framework</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mb-4">
          To prevent synthetic hallucinations, Google Search grounding was deployed to query real academic repositories, digital university libraries, and indexed literature. All references are tied to verifiable URLs.
        </p>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-700 font-medium">
            <Check className="w-4 h-4 text-indigo-600" />
            <span>Targeted academic queries evaluated across peer-reviewed repositories</span>
          </div>
          <div className="flex items-center space-x-2 text-indigo-700 font-medium">
            <Check className="w-4 h-4 text-indigo-600" />
            <span>Exclusion of ungrounded or speculative citations</span>
          </div>
          <div className="flex items-center space-x-2 text-indigo-700 font-medium">
            <Check className="w-4 h-4 text-indigo-600" />
            <span>Separation of empirical study design from subjective commentary</span>
          </div>
        </div>
      </div>
    </div>
  );
};
