import React, { useState } from 'react';
import type { ResearchPaperResult } from '../types.ts';
import { ExternalLink, BookOpen, Quote, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

interface FullPaperViewProps {
  paper: ResearchPaperResult;
  onNavigateToSource?: (url: string) => void;
}

export const FullPaperView: React.FC<FullPaperViewProps> = ({ paper, onNavigateToSource }) => {
  const [highlightedRefId, setHighlightedRefId] = useState<string | null>(null);

  // Jump to reference smoothly
  const handleCitationClick = (refId: string) => {
    setHighlightedRefId(refId);
    const el = document.getElementById(refId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Paper Header / Title Page styling */}
      <div className="bg-gradient-to-b from-slate-50/80 to-white px-8 py-10 border-b border-slate-200/80 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/50 mb-4">
          <span>{paper.academic_level} Academic Inquiry</span>
          <span>•</span>
          <span>{paper.citation_style}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight font-serif leading-tight">
          {paper.title}
        </h1>

        <p className="mt-3 text-sm text-slate-600 font-sans italic max-w-2xl mx-auto">
          Central Inquiry: &ldquo;{paper.research_question}&rdquo;
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-mono">
          <span>Date: {new Date(paper.generated_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>ScholarFlow Literature Review Agent</span>
          <span>•</span>
          <span>{paper.sections.length} Structural Sections</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-10 py-8">
        {/* Abstract Box */}
        <div className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-6 my-6 shadow-xs">
          <div className="flex items-center space-x-2 text-indigo-900 font-serif font-bold text-base mb-2">
            <Quote className="w-4 h-4 text-indigo-600" />
            <span>Abstract</span>
          </div>
          <p className="text-slate-800 text-sm leading-relaxed text-justify font-sans">
            {paper.abstract}
          </p>
          {paper.keywords && paper.keywords.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-700 font-sans">Keywords:</span>
              {paper.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 font-mono text-[11px]"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Paper Sections */}
        <div className="divide-y divide-slate-100 space-y-8 pt-4">
          {paper.sections.map((section, idx) => {
            // Format paragraphs and in-text citation highlights
            const paragraphs = section.body.split(/\n\n+/).filter(Boolean);

            return (
              <section key={idx} className={idx > 0 ? 'pt-8' : ''}>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif mb-4 flex items-baseline space-x-3">
                  <span className="text-indigo-600 font-mono text-sm">{idx + 1}.</span>
                  <span>{section.heading}</span>
                </h2>

                <div className="space-y-4 text-slate-800 text-sm sm:text-base leading-relaxed font-sans text-justify">
                  {paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="leading-7">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Study Limitations Section */}
        {paper.limitations && paper.limitations.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif mb-4 flex items-center space-x-2 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Synthesis & Study Limitations</span>
            </h2>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
              {paper.limitations.map((lim, i) => (
                <li key={i} className="flex items-start space-x-2.5 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* References Section */}
        <div className="mt-12 pt-8 border-t border-slate-200" id="references-section">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight font-serif flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>References ({paper.citation_style})</span>
            </h2>
            <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Search Grounding</span>
            </span>
          </div>

          <div className="space-y-4">
            {paper.references.map((ref, i) => {
              const isHighlighted = highlightedRefId === ref.id;
              return (
                <div
                  key={ref.id || i}
                  id={ref.id}
                  className={`p-4 rounded-xl border text-xs sm:text-sm transition-all ${
                    isHighlighted
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <p className="font-serif text-slate-900 leading-snug">
                        {ref.citation}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                        {ref.year && ref.year !== 'Not verified' && (
                          <span className="text-slate-600">Year: {ref.year}</span>
                        )}
                        {ref.authors && ref.authors !== 'Not available' && (
                          <span className="text-slate-600">Authors: {ref.authors}</span>
                        )}
                      </div>
                    </div>

                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 border border-indigo-200/80 transition-colors"
                      title="Open verified source in new tab"
                    >
                      <span>Open Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Claims to verify callout */}
        {paper.claims_to_verify && paper.claims_to_verify.length > 0 && (
          <div className="mt-10 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <h3 className="font-semibold text-slate-800 text-sm mb-2 flex items-center space-x-1.5">
              <span>Claims to Verify & Source Audit Checklist</span>
            </h3>
            <p className="text-slate-600 mb-3">
              As part of academic rigor, verify these specific empirical data points or contextual claims directly with original source documents before citing in formal submissions:
            </p>
            <ul className="space-y-1.5">
              {paper.claims_to_verify.map((claim, idx) => (
                <li key={idx} className="flex items-start space-x-2 text-slate-700">
                  <span className="text-amber-500 font-mono shrink-0">[{idx + 1}]</span>
                  <span>{claim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
