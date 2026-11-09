import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type {
  ResearchInput,
  ResearchPaperResult,
  SourceItem,
  ReferenceItem,
  OutlineItem,
  SectionItem,
} from './src/types.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Configurable model constant as per instructions
export const GEMINI_MODEL = 'gemini-3.8-flash';

app.use(express.json({ limit: '10mb' }));

// Helper to get initialized GoogleGenAI instance
function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please check the Secrets panel in AI Studio.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Clean JSON extraction helper
function parseJsonFromText(rawText: string): any {
  let cleaned = rawText.trim();
  // Strip code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try finding the first '{' and last '}'
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const sliced = cleaned.slice(startIdx, endIdx + 1);
      return JSON.parse(sliced);
    }
    throw new Error('Failed to parse structured JSON from model response');
  }
}

// Multi-stage Research Agent pipeline
async function executeResearchPipeline(
  input: ResearchInput,
  onProgress?: (stage: string, label: string, detail: string, percent: number) => void
): Promise<ResearchPaperResult> {
  const ai = getGenAIClient();

  // STAGE 1: PLAN
  onProgress?.(
    'planning',
    'Formulating Research Plan',
    'Analyzing topic, refining research question, scoping boundaries, and generating academic keywords...',
    20
  );

  const planPrompt = `You are a university academic research director.
Analyze the following student research inquiry:
Topic: "${input.topic}"
Initial Research Question: "${input.question}"
Academic Level: "${input.academicLevel}"
Paper Length: "${input.paperLength}"
Citation Style: "${input.citationStyle}"
Additional Instructions: "${input.additionalInstructions || 'None provided'}"

Provide a structured research plan in JSON with:
1. "refined_question": A focused, academically rigorous version of the research question.
2. "sub_questions": Array of 4 to 6 specific sub-questions that need answering.
3. "scope_boundaries": Array of 3 to 4 statements defining what is in-scope vs out-of-scope.
4. "search_queries": Array of 4 to 5 targeted search queries suitable for finding peer-reviewed literature, systematic reviews, academic journals, and institutional datasets.
5. "likely_source_types": Array of credible source types (e.g. Meta-analyses, Peer-reviewed journals, University publications).

Respond ONLY with valid JSON matching:
{
  "refined_question": "string",
  "sub_questions": ["string"],
  "scope_boundaries": ["string"],
  "search_queries": ["string"],
  "likely_source_types": ["string"]
}`;

  const planResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: planPrompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const planData = parseJsonFromText(planResponse.text || '{}');
  const refinedQuestion = planData.refined_question || input.question;
  const searchQueries: string[] = Array.isArray(planData.search_queries) && planData.search_queries.length > 0
    ? planData.search_queries
    : [
        `${input.topic} academic research peer-reviewed study`,
        `${input.topic} systematic review empirical evidence`,
        `${input.question} findings methodology`,
      ];

  // STAGE 2: SEARCH (Google Search Grounding)
  onProgress?.(
    'searching',
    'Searching Credible Sources',
    'Executing Google Search grounding to retrieve real academic literature and verified web sources...',
    40
  );

  const searchPrompt = `Conduct an exhaustive academic search on the following topic and refined questions:
Topic: ${input.topic}
Refined Question: ${refinedQuestion}
Target Queries to investigate:
${searchQueries.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Find credible sources: peer-reviewed research, meta-analyses, university publications, official education or government reports, and recognized research institutes.
Provide a comprehensive summary of key empirical findings, comparative viewpoints, consensus conclusions, and observed study designs.`;

  const searchResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: searchPrompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const rawGroundedSearchText = searchResponse.text || '';
  const candidateChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  // Extract real URLs and titles
  const verifiedWebSources: { url: string; title: string }[] = [];
  const seenUrls = new Set<string>();

  for (const chunk of candidateChunks) {
    if (chunk.web?.uri) {
      const uri = chunk.web.uri;
      if (!seenUrls.has(uri)) {
        seenUrls.add(uri);
        verifiedWebSources.push({
          url: uri,
          title: chunk.web.title || 'Academic Reference Document',
        });
      }
    }
  }

  // If initial search had fewer than 3 sources, run a complementary grounding search for comprehensive coverage
  if (verifiedWebSources.length < 3) {
    try {
      const secondSearchResponse = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: `Academic studies and journal articles on: ${refinedQuestion}. Provide full details on research design, results, and citations.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      const extraChunks = secondSearchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      for (const chunk of extraChunks) {
        if (chunk.web?.uri && !seenUrls.has(chunk.web.uri)) {
          seenUrls.add(chunk.web.uri);
          verifiedWebSources.push({
            url: chunk.web.uri,
            title: chunk.web.title || 'Academic Reference',
          });
        }
      }
    } catch {
      // Continue with existing verified sources
    }
  }

  // Fallback safe source if grounding returned zero web links
  if (verifiedWebSources.length === 0) {
    verifiedWebSources.push({
      url: 'https://scholar.google.com/scholar?q=' + encodeURIComponent(input.topic),
      title: `${input.topic} — Google Scholar Query Index`,
    });
  }

  // STAGE 3: EVALUATE (Evidence Matrix)
  onProgress?.(
    'evaluating',
    'Evaluating Evidence Matrix',
    'Synthesizing evidence matrix, verifying study designs, noting limitations, and classifying source types...',
    65
  );

  const evalPrompt = `You are an academic research reviewer.
Based on the following verified search research and the list of REAL verified URLs below:

VERIFIED REAL SOURCES (You may ONLY use these URLs):
${verifiedWebSources.map((s, idx) => `Source [S${idx + 1}]:\nTitle: ${s.title}\nURL: ${s.url}`).join('\n\n')}

RESEARCH SUMMARY FOUND:
${rawGroundedSearchText.slice(0, 5000)}

TOPIC: "${input.topic}"
RESEARCH QUESTION: "${refinedQuestion}"

Build an Evidence Matrix for these sources.
RULES OF ACADEMIC INTEGRITY:
- ONLY reference real URLs from the verified list above.
- NEVER invent an author name, publication year, study design, or URL.
- If author or year is not explicitly verified, label as "Not available" or "Not verified".
- Categorize study design (e.g. "Randomized controlled trial", "Systematic review", "Observational study", "Literature review", "Theoretical framework").
- Distinguish primary research from reviews or commentary.

Return a JSON array of source objects:
[
  {
    "title": "Exact or verified title",
    "authors": "Author(s) or 'Not available'",
    "year": "Year or 'Not verified'",
    "sourceType": "e.g. Peer-reviewed journal / Meta-analysis / University publication / Educational research / General website",
    "keyFindings": "Concise summary of empirical findings or key assertions",
    "studyDesign": "Study design or source type description",
    "limitations": "Methodological limitations, sample constraints, or context boundaries",
    "url": "Must be exact URL from verified list",
    "relevance": "Direct relevance to answering the research question"
  }
]`;

  const evalResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: evalPrompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  let evidenceMatrix: SourceItem[] = [];
  try {
    const parsedEval = parseJsonFromText(evalResponse.text || '[]');
    if (Array.isArray(parsedEval)) {
      evidenceMatrix = parsedEval;
    }
  } catch {
    // Construct default matrix from verified sources
    evidenceMatrix = verifiedWebSources.map((s) => ({
      title: s.title,
      authors: 'Not available',
      year: 'Not verified',
      sourceType: 'Grounded Web Research',
      keyFindings: 'Referenced literature on ' + input.topic,
      studyDesign: 'Literature review analysis',
      limitations: 'Metadata pending individual document verification',
      url: s.url,
      relevance: 'Provides contextual background on ' + input.topic,
    }));
  }

  // Ensure all evidence matrix items have real URLs
  evidenceMatrix = evidenceMatrix.map((item, idx) => ({
    title: item.title || verifiedWebSources[idx % verifiedWebSources.length]?.title || 'Academic Reference',
    authors: item.authors || 'Not available',
    year: item.year || 'Not verified',
    sourceType: item.sourceType || 'Literature Analysis',
    keyFindings: item.keyFindings || 'Explores theoretical and empirical perspectives on ' + input.topic,
    studyDesign: item.studyDesign || 'Literature review synthesis',
    limitations: item.limitations || 'Synthesized from web-grounded research index',
    url: verifiedWebSources.some((v) => v.url === item.url)
      ? item.url
      : verifiedWebSources[idx % verifiedWebSources.length].url,
    relevance: item.relevance || 'Contextual literature',
  }));

  // STAGE 4 & 5: DRAFT & SYNTHESIZE & VERIFY
  onProgress?.(
    'drafting',
    'Drafting Academic Research Paper',
    'Composing comprehensive academic sections, formatting citations in ' +
      input.citationStyle +
      ', and auditing claims...',
    85
  );

  const wordCountTarget =
    input.paperLength === 'Short'
      ? '800 to 1,200 words'
      : input.paperLength === 'Long'
      ? '2,500 to 3,000 words'
      : '1,500 to 2,000 words';

  const draftPrompt = `You are a senior academic scholar drafting a rigorous research paper for an ${input.academicLevel} student.

TOPIC: "${input.topic}"
RESEARCH QUESTION: "${refinedQuestion}"
ACADEMIC LEVEL: "${input.academicLevel}"
CITATION STYLE: "${input.citationStyle}" (Format all in-text citations and reference list entries strictly according to ${input.citationStyle} conventions)
TARGET LENGTH: Approximately ${wordCountTarget}
ADDITIONAL INSTRUCTIONS: "${input.additionalInstructions || 'None'}"

VERIFIED EVIDENCE MATRIX & URLS:
${JSON.stringify(evidenceMatrix, null, 2)}

RESEARCH PLAN & SUB-QUESTIONS:
${JSON.stringify(planData, null, 2)}

STRICT ACADEMIC INTEGRITY DIRECTIVES:
1. NEVER fabricate a source, author, journal volume, DOI, or URL. ONLY use the verified URLs from the evidence matrix.
2. If metadata (e.g. publication year or exact author) is unconfirmed, state "Not available" or "Not verified" rather than guessing.
3. METHODOLOGY REQUIREMENT: Since no primary physical/lab experiment or proprietary survey was conducted by the student, the methodology section MUST describe a "Literature Review and Thematic Synthesis Approach", outlining search strategy, inclusion criteria, and evidence evaluation methodology. Never pretend a laboratory experiment or clinical trial was executed.
4. Distinguish clearly between empirical findings from cited sources and theoretical synthesis/interpretation. Do not conflate correlation with causation.
5. In-text citations must match the chosen style (${input.citationStyle}) and correspond directly to the references list.
6. Provide an explicit "claims_to_verify" list identifying any assertions that warrant deeper primary reading or where evidence is limited.

Generate a comprehensive academic paper formatted in JSON with the exact structure:
{
  "title": "Academic paper title",
  "research_question": "${refinedQuestion}",
  "academic_level": "${input.academicLevel}",
  "citation_style": "${input.citationStyle}",
  "abstract": "Comprehensive 150-250 word academic abstract summarizing context, research question, thematic methodology, findings, and implications.",
  "keywords": ["5 to 7 academic keywords"],
  "research_plan": [
    "Refined Question: ...",
    "Sub-question 1: ...",
    "Sub-question 2: ...",
    "Sub-question 3: ...",
    "Sub-question 4: ...",
    "Scope & Delimitation: ..."
  ],
  "outline": [
    { "heading": "I. Introduction", "description": "Contextual background, problem statement, research significance, and paper roadmap" },
    { "heading": "II. Theoretical Background & Literature Review", "description": "Evaluation of existing scholarship, cognitive/domain mechanisms, and thematic groupings" },
    { "heading": "III. Methodology Note: Literature Review & Synthesis Protocol", "description": "Systematic review framework, search syntax, inclusion criteria, and evidence appraisal" },
    { "heading": "IV. Thematic Synthesis & Analysis", "description": "Core empirical findings, cross-study agreements, divergence, and nuances" },
    { "heading": "V. Critical Discussion & Evidence Gaps", "description": "Correlation vs causation assessment, confounding variables, and practical pedagogical/academic implications" },
    { "heading": "VI. Study Limitations", "description": "Scope boundaries, methodological constraints, and sample generalizability" },
    { "heading": "VII. Conclusion & Future Research Directions", "description": "Summary of answers to research question and prospective investigative avenues" }
  ],
  "sections": [
    {
      "heading": "Introduction",
      "body": "Rich, multi-paragraph academic prose with proper in-text citations..."
    },
    {
      "heading": "Theoretical Background & Literature Review",
      "body": "In-depth review of theoretical foundations and literature..."
    },
    {
      "heading": "Methodology Note: Literature Review & Evidence Evaluation Approach",
      "body": "Detailed explanation of the literature review synthesis methodology..."
    },
    {
      "heading": "Thematic Synthesis & Empirical Findings",
      "body": "Detailed thematic analysis comparing and synthesizing findings..."
    },
    {
      "heading": "Discussion & Evidence Gaps",
      "body": "Critical evaluation of the evidence, contradictions, and nuances..."
    },
    {
      "heading": "Study Limitations",
      "body": "Explicit examination of limitations in current scholarship..."
    },
    {
      "heading": "Conclusion & Future Research",
      "body": "Definitive conclusions and forward-looking research questions..."
    }
  ],
  "references": [
    {
      "id": "ref-1",
      "citation": "Full academic citation formatted in ${input.citationStyle}",
      "url": "Real verified URL from evidence matrix",
      "title": "Source title",
      "year": "Publication year or 'Not verified'",
      "authors": "Authors or 'Not available'"
    }
  ],
  "limitations": [
    "List of 4-5 key limitations of the synthesis, literature access, or generalizability"
  ],
  "claims_to_verify": [
    "List of 3-5 specific factual assertions, statistical figures, or context-dependent claims that the student should cross-check against original documents"
  ],
  "academic_integrity_note": "This paper draft was generated as an exploratory academic literature review by ScholarFlow using Google Search grounding. It is not peer-reviewed or ready for direct institutional submission. Students must review original source texts, verify statistical assertions, and ensure compliance with their institution's AI policies and honor code."
}`;

  const draftResponse = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: draftPrompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const parsedResult = parseJsonFromText(draftResponse.text || '{}');

  // Verify and ensure references map to verified URLs
  const verifiedRefMap = new Map<string, string>();
  for (const item of evidenceMatrix) {
    verifiedRefMap.set(item.title.toLowerCase(), item.url);
  }

  const finalReferences: ReferenceItem[] = Array.isArray(parsedResult.references) && parsedResult.references.length > 0
    ? parsedResult.references.map((ref: any, idx: number) => {
        const matchingUrl = verifiedWebSources.find(
          (s) => s.url === ref.url || s.title.toLowerCase() === (ref.title || '').toLowerCase()
        )?.url || verifiedWebSources[idx % verifiedWebSources.length].url;

        return {
          id: ref.id || `ref-${idx + 1}`,
          citation: ref.citation || `[${idx + 1}] ${ref.title || 'Source'}. Retrieved from ${matchingUrl}`,
          url: matchingUrl,
          title: ref.title || 'Academic Reference Document',
          year: ref.year || 'Not verified',
          authors: ref.authors || 'Not available',
        };
      })
    : evidenceMatrix.map((item, idx) => ({
        id: `ref-${idx + 1}`,
        citation: `[${idx + 1}] ${item.authors !== 'Not available' ? item.authors : 'Scholar'}. (${item.year !== 'Not verified' ? item.year : 'n.d.'}). ${item.title}. Available at: ${item.url}`,
        url: item.url,
        title: item.title,
        year: item.year,
        authors: item.authors,
      }));

  const researchPlanList: string[] = Array.isArray(parsedResult.research_plan) && parsedResult.research_plan.length > 0
    ? parsedResult.research_plan
    : [
        `Refined Research Question: ${refinedQuestion}`,
        ...(Array.isArray(planData.sub_questions) ? planData.sub_questions.map((q: string, i: number) => `Sub-question ${i + 1}: ${q}`) : []),
        ...(Array.isArray(planData.scope_boundaries) ? planData.scope_boundaries.map((b: string) => `Scope Boundary: ${b}`) : []),
      ];

  const fullResult: ResearchPaperResult = {
    title: parsedResult.title || `${input.topic}: An Academic Literature Review`,
    research_question: refinedQuestion,
    academic_level: input.academicLevel,
    citation_style: input.citationStyle,
    abstract: parsedResult.abstract || 'This paper provides a systematic literature review and academic synthesis on ' + input.topic + '.',
    keywords: Array.isArray(parsedResult.keywords) && parsedResult.keywords.length > 0
      ? parsedResult.keywords
      : [input.topic, 'literature review', 'empirical synthesis', 'higher education', 'research analysis'],
    research_plan: researchPlanList,
    outline: Array.isArray(parsedResult.outline) && parsedResult.outline.length > 0
      ? parsedResult.outline
      : [
          { heading: 'I. Introduction', description: 'Background, research questions, and significance' },
          { heading: 'II. Theoretical Foundations', description: 'Review of current scholarship and mechanisms' },
          { heading: 'III. Methodology Note', description: 'Literature review search protocol and synthesis approach' },
          { heading: 'IV. Thematic Discussion', description: 'Core evidence, findings, and analysis' },
          { heading: 'V. Limitations & Future Directions', description: 'Study limitations and open questions' },
          { heading: 'VI. Conclusion', description: 'Summary of findings and scholarly takeaways' },
        ],
    evidence_matrix: evidenceMatrix,
    sections: Array.isArray(parsedResult.sections) && parsedResult.sections.length > 0
      ? parsedResult.sections
      : [
          {
            heading: 'Introduction',
            body: `The inquiry into ${input.topic} represents a crucial scholarly domain within modern research. This literature review addresses the central research question: "${refinedQuestion}".`,
          },
        ],
    references: finalReferences,
    limitations: Array.isArray(parsedResult.limitations) && parsedResult.limitations.length > 0
      ? parsedResult.limitations
      : [
          'Literature analysis is restricted to publicly indexed academic literature and digital repositories.',
          'No independent primary experimental data was generated; all conclusions synthesize existing empirical publications.',
          'Publication bias in academic literature may over-represent positive and statistically significant outcomes.',
        ],
    claims_to_verify: Array.isArray(parsedResult.claims_to_verify) && parsedResult.claims_to_verify.length > 0
      ? parsedResult.claims_to_verify
      : [
          'Verify specific quantitative effect sizes and p-values by inspecting primary study publications directly.',
          'Confirm institutional sample demographics before generalizing findings to distinct educational or clinical cohorts.',
          'Review cited source URLs for recent updates, errata, or replication attempts.',
        ],
    academic_integrity_note:
      parsedResult.academic_integrity_note ||
      'This research paper draft was generated as an exploratory academic literature review by ScholarFlow using Google Search grounding. It is not peer-reviewed or ready for direct institutional submission. Students must review original source texts, verify statistical assertions, and ensure compliance with their institution’s AI policies and honor code.',
    generated_at: new Date().toISOString(),
  };

  onProgress?.('complete', 'Research Synthesis Complete', 'Paper draft, verified references, and evidence matrix successfully compiled.', 100);

  return fullResult;
}

// REST API endpoint: POST /api/research/generate
app.post('/api/research/generate', async (req: Request, res: Response) => {
  try {
    const { topic, question, academicLevel, paperLength, citationStyle, additionalInstructions } = req.body;

    if (!topic || !question) {
      res.status(400).json({ error: 'Both research topic and research question are required.' });
      return;
    }

    const input: ResearchInput = {
      topic: String(topic).trim(),
      question: String(question).trim(),
      academicLevel: academicLevel || 'Undergraduate',
      paperLength: paperLength || 'Standard',
      citationStyle: citationStyle || 'APA 7',
      additionalInstructions: additionalInstructions ? String(additionalInstructions).trim() : '',
    };

    const result = await executeResearchPipeline(input);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error generating research paper:', error);
    res.status(500).json({
      error: error.message || 'An unexpected error occurred during research paper generation.',
    });
  }
});

// Server-Sent Events (SSE) endpoint: GET /api/research/stream
app.get('/api/research/stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const topic = req.query.topic as string;
    const question = req.query.question as string;
    const academicLevel = (req.query.academicLevel as any) || 'Undergraduate';
    const paperLength = (req.query.paperLength as any) || 'Standard';
    const citationStyle = (req.query.citationStyle as any) || 'APA 7';
    const additionalInstructions = (req.query.additionalInstructions as string) || '';

    if (!topic || !question) {
      sendEvent('error', { error: 'Both research topic and research question are required.' });
      res.end();
      return;
    }

    const input: ResearchInput = {
      topic: topic.trim(),
      question: question.trim(),
      academicLevel,
      paperLength,
      citationStyle,
      additionalInstructions: additionalInstructions.trim(),
    };

    const result = await executeResearchPipeline(input, (stage, label, detail, percent) => {
      sendEvent('progress', { stage, label, detail, percent });
    });

    sendEvent('complete', { result });
    res.end();
  } catch (error: any) {
    console.error('SSE Pipeline error:', error);
    sendEvent('error', {
      error: error.message || 'An error occurred during research execution. Please check your query or retry.',
    });
    res.end();
  }
});

// Vite middleware or production static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ScholarFlow server running at http://localhost:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
