import React from 'react';
import type { StageId, WorkflowProgress } from '../types.ts';
import { Compass, Search, TableProperties, PenTool, CheckCircle2 } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: WorkflowProgress;
}

const STAGES: { id: StageId; title: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'planning', title: '1. Planning', icon: Compass },
  { id: 'searching', title: '2. Searching sources', icon: Search },
  { id: 'evaluating', title: '3. Evaluating evidence', icon: TableProperties },
  { id: 'drafting', title: '4. Drafting paper', icon: PenTool },
  { id: 'complete', title: '5. Complete', icon: CheckCircle2 },
];

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress }) => {
  const currentStageIndex = STAGES.findIndex((s) => s.id === progress.stage);

  return (
    <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm my-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider font-mono">
            Orchestrating Research Agent
          </span>
          <h3 className="text-base font-semibold text-slate-900 mt-0.5">{progress.label}</h3>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-medium text-slate-500">{progress.percent}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-6">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress.percent}%` }}
        />
      </div>

      {/* Step nodes */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STAGES.map((s, idx) => {
          const Icon = s.icon;
          const isDone = idx < currentStageIndex || (progress.stage === 'complete' && idx === currentStageIndex);
          const isCurrent = idx === currentStageIndex && progress.stage !== 'complete';
          const isPending = idx > currentStageIndex;

          return (
            <div
              key={s.id}
              className={`p-3 rounded-xl border transition-all flex flex-col items-center text-center ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
                  : isCurrent
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/10'
                  : 'bg-slate-50/70 border-slate-200/80 text-slate-400 opacity-70'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-1.5 ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-indigo-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className="text-xs font-medium leading-tight">{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* Detail description */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-start space-x-2 text-xs text-slate-600">
        <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mt-1 shrink-0 animate-ping" />
        <p className="leading-relaxed">{progress.detail}</p>
      </div>
    </div>
  );
};
