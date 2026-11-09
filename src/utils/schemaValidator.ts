import type { ResearchPaperResult } from '../types.ts';

export interface ValidationReport {
  isValid: boolean;
  errors: string[];
  sanitized: ResearchPaperResult;
}

export function validateAndSanitizePaperOutput(data: any): ValidationReport {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: ['Data must be an object'],
      sanitized: createEmptyPaperResult(),
    };
  }

  // Required string fields
  const title = typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Untitled Research Paper';
  const research_question = typeof data.research_question === 'string' ? data.research_question.trim() : '';
  const academic_level = typeof data.academic_level === 'string' ? data.academic_level : 'Undergraduate';
  const citation_style = typeof data.citation_style === 'string' ? data.citation_style : 'APA 7';
  const abstract = typeof data.abstract === 'string' ? data.abstract.trim() : '';
  const academic_integrity_note = typeof data.academic_integrity_note === 'string'
    ? data.academic_integrity_note.trim()
    : 'Synthesized via ScholarFlow. Not peer reviewed. Verify primary sources.';
  const generated_at = typeof data.generated_at === 'string' ? data.generated_at : new Date().toISOString();

  // Arrays
  const keywords = Array.isArray(data.keywords) ? data.keywords.map((k: any) => String(k).trim()).filter(Boolean) : [];
  const research_plan = Array.isArray(data.research_plan) ? data.research_plan.map((p: any) => String(p).trim()).filter(Boolean) : [];
  const limitations = Array.isArray(data.limitations) ? data.limitations.map((l: any) => String(l).trim()).filter(Boolean) : [];
  const claims_to_verify = Array.isArray(data.claims_to_verify) ? data.claims_to_verify.map((c: any) => String(c).trim()).filter(Boolean) : [];

  // Outline
  const outline = Array.isArray(data.outline)
    ? data.outline.map((item: any, i: number) => ({
        heading: typeof item?.heading === 'string' ? item.heading : `Section ${i + 1}`,
        description: typeof item?.description === 'string' ? item.description : '',
      }))
    : [];

  // Evidence matrix
  const evidence_matrix = Array.isArray(data.evidence_matrix)
    ? data.evidence_matrix.map((item: any, i: number) => ({
        title: typeof item?.title === 'string' ? item.title : `Source ${i + 1}`,
        authors: typeof item?.authors === 'string' ? item.authors : 'Not available',
        year: typeof item?.year === 'string' ? item.year : 'Not verified',
        sourceType: typeof item?.sourceType === 'string' ? item.sourceType : 'Web Source',
        keyFindings: typeof item?.keyFindings === 'string' ? item.keyFindings : '',
        studyDesign: typeof item?.studyDesign === 'string' ? item.studyDesign : 'Literature synthesis',
        limitations: typeof item?.limitations === 'string' ? item.limitations : '',
        url: typeof item?.url === 'string' && item.url.startsWith('http') ? item.url : 'https://scholar.google.com',
        relevance: typeof item?.relevance === 'string' ? item.relevance : '',
      }))
    : [];

  // Sections
  const sections = Array.isArray(data.sections)
    ? data.sections.map((sec: any, i: number) => ({
        heading: typeof sec?.heading === 'string' ? sec.heading : `Section ${i + 1}`,
        body: typeof sec?.body === 'string' ? sec.body : '',
      }))
    : [];

  // References
  const references = Array.isArray(data.references)
    ? data.references.map((ref: any, i: number) => ({
        id: typeof ref?.id === 'string' ? ref.id : `ref-${i + 1}`,
        citation: typeof ref?.citation === 'string' ? ref.citation : `[${i + 1}] Reference source`,
        url: typeof ref?.url === 'string' ? ref.url : '',
        title: typeof ref?.title === 'string' ? ref.title : '',
        year: typeof ref?.year === 'string' ? ref.year : 'Not verified',
        authors: typeof ref?.authors === 'string' ? ref.authors : 'Not available',
      }))
    : [];

  if (!research_question) errors.push('Missing research question');
  if (!abstract) errors.push('Missing abstract');
  if (sections.length === 0) errors.push('Missing paper sections');

  const sanitized: ResearchPaperResult = {
    title,
    research_question,
    academic_level,
    citation_style,
    abstract,
    keywords,
    research_plan,
    outline,
    evidence_matrix,
    sections,
    references,
    limitations,
    claims_to_verify,
    academic_integrity_note,
    generated_at,
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
}

function createEmptyPaperResult(): ResearchPaperResult {
  return {
    title: '',
    research_question: '',
    academic_level: 'Undergraduate',
    citation_style: 'APA 7',
    abstract: '',
    keywords: [],
    research_plan: [],
    outline: [],
    evidence_matrix: [],
    sections: [],
    references: [],
    limitations: [],
    claims_to_verify: [],
    academic_integrity_note: '',
    generated_at: new Date().toISOString(),
  };
}
