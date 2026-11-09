import React, { useState } from 'react';
import type { ResearchInput, ResearchPaperResult, WorkflowProgress } from './types.ts';
import { Header } from './components/Header.tsx';
import { ResearchForm } from './components/ResearchForm.tsx';
import { ProgressIndicator } from './components/ProgressIndicator.tsx';
import { AcademicIntegrityBanner } from './components/AcademicIntegrityBanner.tsx';
import { WorkspaceTabs } from './components/WorkspaceTabs.tsx';
import {
  Compass,
  Search,
  TableProperties,
  PenTool,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Scale,
} from 'lucide-react';

const SAMPLE_INPUT: ResearchInput = {
  topic: 'Spaced repetition and student learning',
  question: 'How does spaced repetition influence long-term retention among undergraduate students?',
  academicLevel: 'Undergraduate',
  paperLength: 'Short',
  citationStyle: 'APA 7',
  additionalInstructions:
    'Focus on cognitive retrieval practice, spacing intervals (e.g. expanding vs uniform), and undergraduate exam performance.',
};

export default function App() {
  const [input, setInput] = useState<ResearchInput>({
    topic: '',
    question: '',
    academicLevel: 'Undergraduate',
    paperLength: 'Short',
    citationStyle: 'APA 7',
    additionalInstructions: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<WorkflowProgress | null>(null);
  const [result, setResult] = useState<ResearchPaperResult | null>(null);

  // Stored inputs at generation time for comparison
  const [activeInquiry, setActiveInquiry] = useState<{ topic: string; question: string }>({
    topic: '',
    question: '',
  });

  const handleLoadSample = () => {
    setInput(SAMPLE_INPUT);
    setError(null);
  };

  const handleReset = () => {
    setResult(null);
    setProgress(null);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!input.topic.trim() || !input.question.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setActiveInquiry({ topic: input.topic, question: input.question });

    setProgress({
      stage: 'planning',
      label: 'Stage 1: Formulating Research Plan',
      detail: 'Refining research question, analyzing sub-inquiries, and designing academic search strategy...',
      percent: 15,
    });

    // Attempt Server-Sent Events stream for real-time stage updates
    try {
      const queryParams = new URLSearchParams({
        topic: input.topic.trim(),
        question: input.question.trim(),
        academicLevel: input.academicLevel,
        paperLength: input.paperLength,
        citationStyle: input.citationStyle,
        additionalInstructions: input.additionalInstructions || '',
      });

      const eventSource = new EventSource(`/api/research/stream?${queryParams.toString()}`);

      eventSource.addEventListener('progress', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          setProgress({
            stage: data.stage,
            label: data.label,
            detail: data.detail,
            percent: data.percent,
          });
        } catch {
          // ignore parsing error
        }
      });

      eventSource.addEventListener('complete', (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          setResult(data.result);
          setProgress({
            stage: 'complete',
            label: 'Research Synthesis Complete',
            detail: 'Paper draft, grounded sources, and evidence matrix successfully compiled.',
            percent: 100,
          });
          setIsLoading(false);
          eventSource.close();
        } catch (err: any) {
          setError('Failed to process completed paper output.');
          setIsLoading(false);
          eventSource.close();
        }
      });

      eventSource.addEventListener('error', (e: any) => {
        // Fallback to standard POST if SSE fails or connection closes prematurely
        eventSource.close();
        fallbackGenerateViaPost();
      });
    } catch {
      fallbackGenerateViaPost();
    }
  };

  // Robust fallback via POST /api/research/generate
  const fallbackGenerateViaPost = async () => {
    try {
      setProgress({
        stage: 'searching',
        label: 'Searching and Evaluating Evidence',
        detail: 'Grounding search in academic publications via Google Search...',
        percent: 50,
      });

      const response = await fetch('/api/research/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success && resData.data) {
        setResult(resData.data);
        setProgress({
          stage: 'complete',
          label: 'Research Synthesis Complete',
          detail: 'Paper draft, verified references, and evidence matrix successfully compiled.',
          percent: 100,
        });
      } else {
        throw new Error(resData.error || 'Failed to generate paper result.');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Header
        onLoadSample={handleLoadSample}
        onReset={handleReset}
        hasResult={result !== null}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Research Input Form */}
        <section>
          <ResearchForm
            input={input}
            onChange={setInput}
            onSubmit={handleGenerate}
            isLoading={isLoading}
            onLoadSample={handleLoadSample}
          />
        </section>

        {/* Live Multi-Stage Progress Bar */}
        {isLoading && progress && (
          <section>
            <ProgressIndicator progress={progress} />
          </section>
        )}

        {/* Error notification */}
        {error && (
          <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3 text-sm text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-rose-900">Research Pipeline Error</h4>
                <p className="mt-1 text-xs text-rose-700">{error}</p>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-100 hover:bg-rose-200 text-rose-900 transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Results Workspace */}
        {result && (
          <section className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <AcademicIntegrityBanner note={result.academic_integrity_note} />
            <WorkspaceTabs
              paper={result}
              initialTopic={activeInquiry.topic}
              initialQuestion={activeInquiry.question}
            />
          </section>
        )}

        {/* Empty State / Welcome Guide when no paper generated yet */}
        {!result && !isLoading && (
          <section className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-10 shadow-xs">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 tracking-tight">
                Academic Rigor with Grounded Real-World Evidence
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
                ScholarFlow helps students explore academic literature through an orchestrated 6-stage research workflow. Every citation links directly to genuine web-grounded sources.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs shadow-indigo-600/20 transition-all active:scale-[0.99]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Load Sample: Spaced Repetition & Learning</span>
                </button>
              </div>
            </div>

            {/* Workflow steps showcase */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 pt-10 border-t border-slate-100">
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono">
                  1
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Plan & Refine Question</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Converts broad student interests into a focused research question, creates 4–6 sub-questions, and scopes boundaries.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono">
                  2
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Search with Google Grounding</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Discovers real academic repositories and digital libraries. Captures verifiable URLs and prevents hallucinated citations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono">
                  3
                </div>
                <h4 className="font-semibold text-sm text-slate-900">Evaluate Evidence & Draft</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Constructs an evidence matrix, distinguishes empirical designs, audits claims to verify, and exports in Markdown, TXT, or JSON.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-semibold text-slate-700">ScholarFlow</span>
            <span>—</span>
            <span>Research Paper Agent for Higher Education & Students</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1 text-slate-600">
              <Scale className="w-3.5 h-3.5 text-indigo-600" />
              <span>Grounded Academic Synthesis</span>
            </span>
            <span>•</span>
            <span>Export to Markdown, Plain Text & JSON</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
