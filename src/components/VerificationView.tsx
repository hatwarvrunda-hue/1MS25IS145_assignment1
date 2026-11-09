import React from 'react';
import type { ResearchPaperResult } from '../types.ts';
import { AlertCircle, AlertTriangle, ShieldCheck, CheckSquare2, FileCheck, Scale } from 'lucide-react';

interface VerificationViewProps {
  paper: ResearchPaperResult;
}

export const VerificationView: React.FC<VerificationViewProps> = ({ paper }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-900 tracking-tight font-serif flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span>Academic Verification & Claim Audit</span>
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Stage 6 audits all claims against grounded sources to highlight assertions that warrant primary document verification.
        </p>
      </div>

      {/* Claims to verify */}
      <div>
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Claims Requiring Primary Source Verification ({paper.claims_to_verify.length})</span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Before citing these statistics, specific cohort findings, or empirical effect sizes in a formal submission, inspect the original papers directly via the provided URLs:
        </p>

        <div className="space-y-3">
          {paper.claims_to_verify.map((claim, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex items-start space-x-3 text-xs sm:text-sm text-amber-950"
            >
              <div className="w-6 h-6 rounded-md bg-amber-200/80 text-amber-900 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <div className="space-y-1">
                <p className="leading-relaxed font-medium">{claim}</p>
                <p className="text-[11px] text-amber-800/80 italic">
                  Recommendation: Cross-check sample size, confidence interval, and test conditions in primary source publication.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800 uppercase tracking-wider mb-3">
          <Scale className="w-4 h-4 text-slate-600" />
          <span>Methodology & Synthesis Limitations ({paper.limitations.length})</span>
        </div>

        <div className="space-y-3">
          {paper.limitations.map((lim, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start space-x-3 text-xs sm:text-sm text-slate-700"
            >
              <span className="text-indigo-600 font-bold">•</span>
              <p className="leading-relaxed">{lim}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Integrity Safeguard summary */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-600">
        <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Academic Integrity Checklist for Students</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="flex items-start space-x-2">
            <CheckSquare2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Never treat correlation as direct causation unless established by controlled experiments.</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckSquare2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Cite only sources whose original text you have accessed and corroborated.</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckSquare2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Consult your course syllabus or teacher regarding guidelines on generative AI brainstorming.</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckSquare2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>This draft outlines a literature review approach, not experimental primary lab work.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
