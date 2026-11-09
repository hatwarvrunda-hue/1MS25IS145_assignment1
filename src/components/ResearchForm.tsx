import React, { useState } from 'react';
import type { AcademicLevel, PaperLength, CitationStyle, ResearchInput } from '../types.ts';
import { Search, Sparkles, BookText, Sliders, ChevronDown, ChevronUp, AlertCircle, FileText } from 'lucide-react';

interface ResearchFormProps {
  input: ResearchInput;
  onChange: (input: ResearchInput) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onLoadSample: () => void;
}

export const ResearchForm: React.FC<ResearchFormProps> = ({
  input,
  onChange,
  onSubmit,
  isLoading,
  onLoadSample,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.topic.trim()) {
      setValidationError('Please enter a research topic to explore.');
      return;
    }
    if (!input.question.trim()) {
      setValidationError('Please provide a central research question.');
      return;
    }
    setValidationError(null);
    onSubmit();
  };

  const handleFieldChange = (field: keyof ResearchInput, value: any) => {
    onChange({
      ...input,
      [field]: value,
    });
    if (validationError) setValidationError(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2 font-serif">
            <BookText className="w-5 h-5 text-indigo-600" />
            Research Project Parameters
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Define your inquiry parameters. ScholarFlow will generate a research plan, retrieve real sources, and draft the paper.
          </p>
        </div>
        <button
          type="button"
          onClick={onLoadSample}
          className="self-start sm:self-auto inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load sample inquiry</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Topic Input */}
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-800 mb-1.5">
            Research Topic <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl shadow-xs">
            <input
              id="topic"
              type="text"
              required
              disabled={isLoading}
              value={input.topic}
              onChange={(e) => handleFieldChange('topic', e.target.value)}
              placeholder="e.g. Spaced repetition and student learning, Microplastics in marine ecosystems, Transformer attention mechanisms"
              className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all disabled:opacity-60"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">
            The overarching domain or conceptual subject for this literature review.
          </p>
        </div>

        {/* Research Question */}
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-slate-800 mb-1.5">
            Main Research Question <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="question"
            rows={2}
            required
            disabled={isLoading}
            value={input.question}
            onChange={(e) => handleFieldChange('question', e.target.value)}
            placeholder="e.g. How does spaced repetition influence long-term retention among undergraduate students?"
            className="block w-full rounded-xl border border-slate-300 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all resize-y disabled:opacity-60"
          />
          <p className="text-xs text-slate-500 mt-1.5">
            The specific, testable or evaluative question guiding the synthesis and evidence matrix.
          </p>
        </div>

        {/* 3-Column Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
          {/* Academic Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Academic Level
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {(['High school', 'Undergraduate', 'Postgraduate'] as AcademicLevel[]).map((level) => {
                const isSelected = input.academicLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleFieldChange('academicLevel', level)}
                    className={`px-2 py-2 text-xs font-medium rounded-lg text-center transition-all ${
                      isSelected
                        ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {level.split(' ')[0]}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Current: <strong className="text-slate-700">{input.academicLevel}</strong>
            </p>
          </div>

          {/* Paper Length */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Paper Length
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {(
                [
                  { key: 'Short', label: 'Short', words: '800–1.2k' },
                  { key: 'Standard', label: 'Standard', words: '1.5–2k' },
                  { key: 'Long', label: 'Long', words: '2.5–3k' },
                ] as const
              ).map((len) => {
                const isSelected = input.paperLength === len.key;
                return (
                  <button
                    key={len.key}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleFieldChange('paperLength', len.key as PaperLength)}
                    className={`px-1.5 py-1.5 text-xs rounded-lg text-center transition-all ${
                      isSelected
                        ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <div className="font-medium">{len.label}</div>
                    <div className="text-[10px] opacity-75">{len.words}</div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Target: <strong className="text-slate-700">{input.paperLength} draft</strong>
            </p>
          </div>

          {/* Citation Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Citation Style
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {(['APA 7', 'IEEE', 'MLA 9'] as CitationStyle[]).map((style) => {
                const isSelected = input.citationStyle === style;
                return (
                  <button
                    key={style}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleFieldChange('citationStyle', style)}
                    className={`px-2 py-2 text-xs font-medium rounded-lg text-center transition-all ${
                      isSelected
                        ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Bibliography style: <strong className="text-slate-700">{input.citationStyle}</strong>
            </p>
          </div>
        </div>

        {/* Collapsible Additional Instructions */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvanced ? 'Hide additional instructions' : 'Add custom focus or instructions (optional)'}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-200">
              <label htmlFor="instructions" className="block text-xs font-medium text-slate-700">
                Methodological, theoretical, or geographic focus
              </label>
              <textarea
                id="instructions"
                rows={2}
                disabled={isLoading}
                value={input.additionalInstructions || ''}
                onChange={(e) => handleFieldChange('additionalInstructions', e.target.value)}
                placeholder="e.g. Focus on STEM curriculum contexts; compare spaced intervals (1 day vs 7 days); prioritize studies published after 2018."
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm flex items-center justify-center space-x-2 transition-all shadow-sm ${
              isLoading
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 hover:shadow-md active:scale-[0.99]'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Synthesizing literature & drafting paper...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate Research Paper</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
