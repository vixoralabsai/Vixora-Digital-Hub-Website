import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/analyze-requirements', async (req, res) => {
  try {
    const { files, customInstructions } = req.body;

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided for analysis.' });
    }

    const ai = getGemini();

    // Prepare context from Drive documents
    const documentsContext = files
      .map((f: any, idx: number) => {
        return `=== DOCUMENT ${idx + 1}: ${f.name} (Type: ${f.mimeType || 'unknown'}) ===\n${f.extractedContent || f.snippet || 'No text extracted.'}\n`;
      })
      .join('\n\n');

    const prompt = `You are an expert Principal Software Architect and Technical Product Manager.
Analyze the following Google Drive files gathered for "Vixora Web Development" and compile an exhaustive, professional, and structured Project Requirements Document (PRD).

SOURCE DOCUMENTS CONTEXT:
${documentsContext}

${customInstructions ? `USER INSTRUCTIONS / FOCUS:\n${customInstructions}\n` : ''}

CRITICAL TASK:
Synthesize all the details from the documents into a structured JSON object with the following schema:
{
  "projectName": "Vixora Web Platform",
  "summary": "Executive summary of the Vixora web development project",
  "primaryObjective": "Core business and technical objective",
  "targetAudience": ["List of target user groups/personas"],
  "keyFeatures": ["List of primary features"],
  "functionalRequirements": [
    {
      "id": "REQ-1",
      "title": "Feature / Module Title",
      "description": "Detailed functional behavior description",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "module": "Authentication" | "Workspace" | "Analytics" | "API" | "UI/UX" | "Integrations" | "Database",
      "acceptanceCriteria": ["Given X when Y then Z", "Requirement detail 2"]
    }
  ],
  "techStack": [
    {
      "category": "Frontend" | "Backend" | "Database" | "Authentication" | "DevOps & Hosting" | "AI & Integrations",
      "technology": "React 19 / Express / PostgreSQL etc.",
      "versionOrDetail": "Version or library details",
      "rationale": "Why this technology is chosen for Vixora"
    }
  ],
  "designAndUXGuidelines": [
    "Design principles, responsiveness, theme, accessibility standards"
  ],
  "milestones": [
    {
      "phase": "Sprint 1 / Phase 1",
      "title": "Milestone Title",
      "targetTimeline": "Week 1-2",
      "keyDeliverables": ["Deliverable item 1", "Deliverable item 2"]
    }
  ],
  "securityAndNonFunctional": [
    "Performance latency SLA, encryption, RBAC rules, WCAG AA compliance"
  ],
  "openQuestionsAndRisks": [
    "Identified dependencies, ambiguities, or technical risks"
  ],
  "rawMarkdownReport": "# Full Markdown version of the PRD with tables and rich formatting",
  "sourceFilesSummary": [
    {
      "name": "Filename",
      "relevance": "How this file contributed to the requirements"
    }
  ]
}

Return ONLY valid JSON matching this exact structure. Ensure the rawMarkdownReport is well-formatted and includes complete headers, bullet points, and code/architecture blocks.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', responseText);
      // Fallback extraction if enclosed in code block
      const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      parsedData = JSON.parse(cleanJson);
    }

    parsedData.analyzedAt = new Date().toISOString();
    parsedData.sourceFilesCount = files.length;

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error analyzing requirements with Gemini:', error);
    res.status(500).json({
      error: error.message || 'Failed to synthesize project requirements.',
    });
  }
});

app.post('/api/ask-requirements', async (req, res) => {
  try {
    const { question, prdContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const ai = getGemini();
    const prompt = `You are the lead AI Technical Architect for the Vixora Web Development project.
Answer the following developer/stakeholder question accurately based on the compiled Vixora Project Requirements:

PROJECT REQUIREMENTS CONTEXT:
${JSON.stringify(prdContext, null, 2)}

QUESTION:
${question}

Provide a direct, helpful, and concise answer with actionable technical clarity. Use bullet points or code snippets where helpful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({ success: true, answer: response.text });
  } catch (error: any) {
    console.error('Error in ask-requirements:', error);
    res.status(500).json({ error: error.message || 'Failed to answer query.' });
  }
});

// Vite Middleware for Development & Static fallback for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vixora Analyzer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
