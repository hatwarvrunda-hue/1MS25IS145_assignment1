export type AcademicLevel = 'High school' | 'Undergraduate' | 'Postgraduate';
export type PaperLength = 'Short' | 'Standard' | 'Long';
export type CitationStyle = 'APA 7' | 'IEEE' | 'MLA 9';

export interface ResearchInput {
  topic: string;
  question: string;
  academicLevel: AcademicLevel;
  paperLength: PaperLength;
  citationStyle: CitationStyle;
  additionalInstructions?: string;
}

export interface SourceItem {
  title: string;
  authors: string;
  year: string;
  sourceType: string;
  keyFindings: string;
  studyDesign: string;
  limitations: string;
  url: string;
  relevance: string;
}

export interface OutlineItem {
  heading: string;
  description: string;
}

export interface SectionItem {
  heading: string;
  body: string;
}

export interface ReferenceItem {
  id: string;
  citation: string;
  url: string;
  title: string;
  year: string;
  authors: string;
}

export interface ResearchPaperResult {
  title: string;
  research_question: string;
  academic_level: string;
  citation_style: string;
  abstract: string;
  keywords: string[];
  research_plan: string[];
  outline: OutlineItem[];
  evidence_matrix: SourceItem[];
  sections: SectionItem[];
  references: ReferenceItem[];
  limitations: string[];
  claims_to_verify: string[];
  academic_integrity_note: string;
  generated_at: string;
}

export type StageId = 'planning' | 'searching' | 'evaluating' | 'drafting' | 'complete';

export interface WorkflowProgress {
  stage: StageId;
  label: string;
  detail: string;
  percent: number;
}
