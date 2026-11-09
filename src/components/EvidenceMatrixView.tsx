import React, { useState } from 'react';
import type { SourceItem } from '../types.ts';
import { ExternalLink, Search, Filter, ShieldCheck, AlertCircle, Bookmark, CheckCircle2 } from 'lucide-react';

interface EvidenceMatrixViewProps {
  evidenceMatrix: SourceItem[];
}

export const EvidenceMatrixView: React.FC<EvidenceMatrixViewProps> = ({ evidenceMatrix }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const sourceTypes = Array.from(new Set(evidenceMatrix.map((s) => s.sourceType).filter(Boolean)));

  const filteredSources = evidenceMatrix.filter((source) => {
    const matchesSearch =
      source.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.keyFindings.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      source.relevance.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || source.sourceType === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight font-serif flex items-center gap-2">
            <span>Evidence Matrix & Grounded Source Ledger</span>
            <span className="text-xs font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {evidenceMatrix.length} Verified Sources
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real sources discovered via Google Search grounding. Unverified metadata is explicitly labeled as &ldquo;not verified&rdquo; or &ldquo;not available&rdquo; to protect factual integrity.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search within findings, authors, or titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {sourceTypes.length > 0 && (
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Type:
            </span>
            <button
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({evidenceMatrix.length})
            </button>
            {sourceTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedType === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Cards */}
      <div className="space-y-4">
        {filteredSources.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-500">No sources matched your current search filters.</p>
          </div>
        ) : (
          filteredSources.map((source, idx) => {
            const hasAuthor = source.authors && source.authors !== 'Not available';
            const hasYear = source.year && source.year !== 'Not verified';

            return (
              <div
                key={idx}
                className="p-5 rounded-xl border border-slate-200/90 hover:border-indigo-200 bg-slate-50/30 hover:bg-white transition-all space-y-3"
              >
                {/* Top Row: Title & Link */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                        S{idx + 1}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                        {source.sourceType}
                      </span>
                      {source.studyDesign && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {source.studyDesign}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 font-serif leading-snug">
                      {source.title}
                    </h3>
                  </div>

                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                  >
                    <span>Visit Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Metadata Pills */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 pt-1">
                  <div>
                    <span className="text-slate-400">Author / Org: </span>
                    <strong className={hasAuthor ? 'text-slate-800' : 'text-slate-400 italic'}>
                      {source.authors}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Publication Year: </span>
                    <strong className={hasYear ? 'text-slate-800' : 'text-slate-400 italic'}>
                      {source.year}
                    </strong>
                  </div>
                  <div className="truncate max-w-md">
                    <span className="text-slate-400">URL: </span>
                    <span className="font-mono text-[11px] text-slate-600 truncate">{source.url}</span>
                  </div>
                </div>

                {/* Findings & Relevance Matrix Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                  {/* Key Findings */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200/70 md:col-span-2">
                    <span className="font-semibold text-slate-700 block mb-1">Key Empirical / Analytical Findings</span>
                    <p className="text-slate-600 leading-relaxed">{source.keyFindings}</p>
                  </div>

                  {/* Relevance & Study Limitations */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200/70 space-y-2">
                    <div>
                      <span className="font-semibold text-indigo-900 block mb-0.5">Relevance to Question</span>
                      <p className="text-slate-600 leading-snug">{source.relevance}</p>
                    </div>
                    {source.limitations && (
                      <div className="pt-1 border-t border-slate-100">
                        <span className="font-semibold text-amber-800 block mb-0.5">Noted Limitations</span>
                        <p className="text-slate-500 text-[11px] leading-snug">{source.limitations}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
