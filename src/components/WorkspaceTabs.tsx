import React, { useState } from 'react';
import type { ResearchPaperResult } from '../types.ts';
import {
  FileText,
  TableProperties,
  Compass,
  ListTree,
  BookOpen,
  AlertCircle,
  Copy,
  Download,
  Check,
  Share2,
} from 'lucide-react';
import {
  formatPaperAsMarkdown,
  downloadMarkdown,
  downloadPlainText,
  downloadJson,
  calculateWordCount,
} from '../utils/exportUtils.ts';
import { FullPaperView } from './FullPaperView.tsx';
import { EvidenceMatrixView } from './EvidenceMatrixView.tsx';
import { ResearchPlanView } from './ResearchPlanView.tsx';
import { OutlineView } from './OutlineView.tsx';
import { ReferencesView } from './ReferencesView.tsx';
import { VerificationView } from './VerificationView.tsx';

interface WorkspaceTabsProps {
  paper: ResearchPaperResult;
  initialTopic: string;
  initialQuestion: string;
}

export type TabKey = 'draft' | 'matrix' | 'plan' | 'outline' | 'references' | 'verification';

export const WorkspaceTabs: React.FC<WorkspaceTabsProps> = ({
  paper,
  initialTopic,
  initialQuestion,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('draft');
  const [copied, setCopied] = useState(false);

  const wordCount = calculateWordCount(paper);

  const handleCopyPaper = () => {
    const md = formatPaperAsMarkdown(paper);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: { key: TabKey; label: string; count?: number; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'draft', label: 'Full Paper Draft', icon: FileText },
    { key: 'matrix', label: 'Evidence Matrix', count: paper.evidence_matrix.length, icon: TableProperties },
    { key: 'plan', label: 'Research Plan', icon: Compass },
    { key: 'outline', label: 'Outline', count: paper.outline.length, icon: ListTree },
    { key: 'references', label: 'References', count: paper.references.length, icon: BookOpen },
    { key: 'verification', label: 'Claims & Limitations', count: paper.claims_to_verify.length, icon: AlertCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Workspace Top Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title and stats */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {paper.academic_level}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {paper.citation_style}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              ~{wordCount} words
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
              {paper.references.length} Grounded References
            </span>
          </div>

          <h2 className="text-lg font-bold text-slate-900 font-serif truncate max-w-xl">
            {paper.title}
          </h2>
        </div>

        {/* Action buttons: Copy, Download MD, TXT, JSON */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyPaper}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors"
            title="Copy entire paper formatted as Markdown"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied Paper</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Paper</span>
              </>
            )}
          </button>

          {/* Download Markdown */}
          <button
            type="button"
            onClick={() => downloadMarkdown(paper)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors"
            title="Download research_paper.md"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>.MD</span>
          </button>

          {/* Download Plain Text */}
          <button
            type="button"
            onClick={() => downloadPlainText(paper)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors"
            title="Download research_paper.txt"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>.TXT</span>
          </button>

          {/* Download JSON (validated schema) */}
          <button
            type="button"
            onClick={() => downloadJson(paper)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-colors font-mono"
            title="Download research_paper.json validated against paper_output_schema.json"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>.JSON</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'draft' && <FullPaperView paper={paper} />}
        {activeTab === 'matrix' && <EvidenceMatrixView evidenceMatrix={paper.evidence_matrix} />}
        {activeTab === 'plan' && (
          <ResearchPlanView
            paper={paper}
            initialTopic={initialTopic}
            initialQuestion={initialQuestion}
          />
        )}
        {activeTab === 'outline' && <OutlineView outline={paper.outline} title={paper.title} />}
        {activeTab === 'references' && (
          <ReferencesView references={paper.references} citationStyle={paper.citation_style} />
        )}
        {activeTab === 'verification' && <VerificationView paper={paper} />}
      </div>
    </div>
  );
};
