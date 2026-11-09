import React from 'react';
import { ShieldAlert, ExternalLink, Scale, CheckSquare } from 'lucide-react';

interface AcademicIntegrityBannerProps {
  note?: string;
}

export const AcademicIntegrityBanner: React.FC<AcademicIntegrityBannerProps> = ({ note }) => {
  return (
    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 mb-8 text-amber-950">
      <div className="flex items-start space-x-3.5">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-800 shrink-0 mt-0.5">
          <Scale className="w-5 h-5" />
        </div>
        <div className="space-y-2 text-xs leading-relaxed">
          <div className="flex items-center space-x-2">
            <h4 className="font-semibold text-sm text-amber-900 tracking-tight">
              Academic Integrity, Authorship & Verification Safeguards
            </h4>
            <span className="bg-amber-200/70 text-amber-900 text-[10px] font-mono font-medium px-2 py-0.5 rounded">
              Scholar Guidelines
            </span>
          </div>

          <p className="text-amber-900/90">
            {note ||
              'This paper draft was generated as an exploratory academic literature review by ScholarFlow using Google Search grounding. It is not peer-reviewed or ready for direct institutional submission.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-2 text-[11px] text-amber-900/80 font-medium border-t border-amber-200/60">
            <div className="flex items-start space-x-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Read original sources:</strong> Click through cited URLs to verify author context and methodology before citing.
              </span>
            </div>
            <div className="flex items-start space-x-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Literature review scope:</strong> Methodology reflects a structured literature synthesis, not a lab/clinical experiment.
              </span>
            </div>
            <div className="flex items-start space-x-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Institutional policy:</strong> Adhere to your university, school, or publisher guidelines regarding AI-assisted writing.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
