import React, { useState } from 'react';
import type { ReferenceItem } from '../types.ts';
import { BookOpen, ExternalLink, Copy, Check, ShieldCheck } from 'lucide-react';

interface ReferencesViewProps {
  references: ReferenceItem[];
  citationStyle: string;
}

export const ReferencesView: React.FC<ReferencesViewProps> = ({ references, citationStyle }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCitation = (ref: ReferenceItem) => {
    navigator.clipboard.writeText(`${ref.citation} ${ref.url ? `Available at: ${ref.url}` : ''}`);
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight font-serif flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>References & Bibliography ({citationStyle})</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Every reference below is linked to a verified URL returned through Google Search grounding.
          </p>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{references.length} Grounded References</span>
        </div>
      </div>

      {/* Reference items list */}
      <div className="space-y-4">
        {references.map((ref, idx) => (
          <div
            key={ref.id || idx}
            className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-slate-50/40 hover:bg-white hover:border-indigo-200 transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded shrink-0 mt-0.5">
                  [{idx + 1}]
                </span>
                <div>
                  <p className="font-serif text-sm sm:text-base text-slate-900 leading-relaxed">
                    {ref.citation}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
                    {ref.authors && ref.authors !== 'Not available' && (
                      <span>Authors: {ref.authors}</span>
                    )}
                    {ref.year && ref.year !== 'Not verified' && (
                      <span>Year: {ref.year}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyCitation(ref)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                  title="Copy formatted citation"
                >
                  {copiedId === ref.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                >
                  <span>Open URL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* URL Display */}
            <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 text-[11px] text-slate-400 font-mono truncate">
              <span className="text-slate-500">Source:</span>
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-indigo-600 truncate"
              >
                {ref.url}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
