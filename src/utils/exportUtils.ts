import type { ResearchPaperResult } from '../types.ts';
import { validateAndSanitizePaperOutput } from './schemaValidator.ts';

export function formatPaperAsMarkdown(paper: ResearchPaperResult): string {
  const parts: string[] = [];

  parts.push(`# ${paper.title}`);
  parts.push(`\n**Research Question:** ${paper.research_question}`);
  parts.push(`**Academic Level:** ${paper.academic_level} | **Citation Style:** ${paper.citation_style}`);
  parts.push(`*Generated via ScholarFlow Research Agent on ${new Date(paper.generated_at).toLocaleDateString()}*\n`);

  parts.push(`## Abstract\n${paper.abstract}\n`);

  if (paper.keywords && paper.keywords.length > 0) {
    parts.push(`**Keywords:** ${paper.keywords.join(', ')}\n`);
  }

  parts.push(`---\n`);

  // Sections
  for (const section of paper.sections) {
    parts.push(`## ${section.heading}\n`);
    parts.push(`${section.body}\n`);
  }

  // Limitations
  if (paper.limitations && paper.limitations.length > 0) {
    parts.push(`## Study Limitations\n`);
    for (const lim of paper.limitations) {
      parts.push(`- ${lim}`);
    }
    parts.push('');
  }

  // References
  if (paper.references && paper.references.length > 0) {
    parts.push(`## References\n`);
    for (const ref of paper.references) {
      parts.push(`- **${ref.citation}**\n  [Verified Source URL](${ref.url})`);
    }
    parts.push('');
  }

  // Claims to Verify
  if (paper.claims_to_verify && paper.claims_to_verify.length > 0) {
    parts.push(`## Claims to Verify & Source Audit\n`);
    for (const claim of paper.claims_to_verify) {
      parts.push(`- ⚠️ ${claim}`);
    }
    parts.push('');
  }

  // Academic Integrity Note
  parts.push(`---\n`);
  parts.push(`### Academic Integrity & Research Transparency\n`);
  parts.push(`${paper.academic_integrity_note}\n`);

  return parts.join('\n');
}

export function formatPaperAsPlainText(paper: ResearchPaperResult): string {
  const parts: string[] = [];

  parts.push(paper.title.toUpperCase());
  parts.push('='.repeat(paper.title.length));
  parts.push(`Research Question: ${paper.research_question}`);
  parts.push(`Academic Level: ${paper.academic_level} | Citation Style: ${paper.citation_style}`);
  parts.push(`Date: ${new Date(paper.generated_at).toLocaleDateString()}`);
  parts.push('\nABSTRACT:\n' + paper.abstract);
  parts.push(`Keywords: ${paper.keywords.join(', ')}\n`);
  parts.push('-'.repeat(60));

  for (const section of paper.sections) {
    parts.push(`\n${section.heading.toUpperCase()}`);
    parts.push('-'.repeat(section.heading.length));
    parts.push(section.body);
  }

  if (paper.references && paper.references.length > 0) {
    parts.push('\nREFERENCES\n----------');
    paper.references.forEach((r, i) => {
      parts.push(`[${i + 1}] ${r.citation} — URL: ${r.url}`);
    });
  }

  if (paper.claims_to_verify && paper.claims_to_verify.length > 0) {
    parts.push('\nCLAIMS TO VERIFY\n----------------');
    paper.claims_to_verify.forEach((c) => {
      parts.push(`* ${c}`);
    });
  }

  parts.push('\nACADEMIC INTEGRITY NOTE:\n' + paper.academic_integrity_note);

  return parts.join('\n');
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(paper: ResearchPaperResult) {
  const content = formatPaperAsMarkdown(paper);
  const safeTitle = paper.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
  downloadFile(`${safeTitle || 'research_paper'}.md`, content, 'text/markdown;charset=utf-8');
}

export function downloadPlainText(paper: ResearchPaperResult) {
  const content = formatPaperAsPlainText(paper);
  const safeTitle = paper.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
  downloadFile(`${safeTitle || 'research_paper'}.txt`, content, 'text/plain;charset=utf-8');
}

export function downloadJson(paper: ResearchPaperResult) {
  const { sanitized, isValid, errors } = validateAndSanitizePaperOutput(paper);
  if (!isValid) {
    console.warn('Paper data had schema warnings during JSON export:', errors);
  }
  const content = JSON.stringify(sanitized, null, 2);
  const safeTitle = paper.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30);
  downloadFile(`${safeTitle || 'research_paper'}.json`, content, 'application/json;charset=utf-8');
}

export function calculateWordCount(paper: ResearchPaperResult): number {
  let count = 0;
  if (paper.abstract) {
    count += paper.abstract.split(/\s+/).filter(Boolean).length;
  }
  for (const s of paper.sections) {
    if (s.body) {
      count += s.body.split(/\s+/).filter(Boolean).length;
    }
  }
  return count;
}
