import { AcademyCourse } from '../../data/vixoraContent';

export interface CourseTool {
  name: string;
  category: string;
  color: string;
  glyph: string;
}

export function getCourseTools(course: AcademyCourse): CourseTool[] {
  const slug = course.slug;

  if (slug === 'data-analysis-cohort') {
    return [
      { name: 'SQL & PostgreSQL', category: 'Database Querying', color: '#5B5FED', glyph: '🗄️' },
      { name: 'Microsoft Power BI', category: 'BI & Dashboards', color: '#FFC107', glyph: '📊' },
      { name: 'Advanced Excel', category: 'Financial Modeling', color: '#10B981', glyph: '📗' },
      { name: 'Python for Analytics', category: 'Data Wrangling', color: '#6B3FB8', glyph: '🐍' },
      { name: 'DAX & Power Query', category: 'Data Modeling', color: '#FF8A65', glyph: '⚡' },
      { name: 'Tableau Desktop', category: 'Visual Analytics', color: '#0F1535', glyph: '📈' },
      { name: 'Jupyter & Pandas', category: 'Exploratory Analysis', color: '#9030F8', glyph: '🐼' },
      { name: 'Git & GitHub', category: 'Version Control', color: '#334155', glyph: '🐙' },
    ];
  }

  if (slug === 'full-stack-vibe-coding') {
    return [
      { name: 'Cursor AI', category: 'AI Code Editor', color: '#5B5FED', glyph: '💻' },
      { name: 'Claude 3.7 Sonnet', category: 'Reasoning Engine', color: '#FF8A65', glyph: '🧠' },
      { name: 'v0 by Vercel', category: 'Generative UI', color: '#0F1535', glyph: '▲' },
      { name: 'Bolt.new', category: 'Instant Full-Stack', color: '#FFC107', glyph: '⚡' },
      { name: 'Tailwind CSS v4', category: 'Modern Styling', color: '#06B6D4', glyph: '🎨' },
      { name: 'React 19 & TypeScript', category: 'Frontend Architecture', color: '#6B3FB8', glyph: '⚛️' },
      { name: 'Supabase & PostgreSQL', category: 'Backend & Auth', color: '#10B981', glyph: '⚡' },
      { name: 'Vercel Deployment', category: 'Cloud Edge Hosting', color: '#000000', glyph: '🚀' },
    ];
  }

  if (slug === 'ai-automation-digital-skills') {
    return [
      { name: 'ChatGPT Plus', category: 'Prompt Engineering', color: '#10B981', glyph: '🤖' },
      { name: 'Claude 3.7', category: 'Long-Form Reasoning', color: '#FF8A65', glyph: '🧠' },
      { name: 'Midjourney v6', category: 'Commercial Visuals', color: '#6B3FB8', glyph: '🎨' },
      { name: 'Make.com', category: 'Workflow Automation', color: '#5B5FED', glyph: '🔄' },
      { name: 'Notion AI', category: 'Knowledge Systems', color: '#0F1535', glyph: '📝' },
      { name: 'Perplexity Pro', category: 'Deep Web Research', color: '#0284C7', glyph: '🔍' },
      { name: 'Canva Magic Studio', category: 'Branded Design', color: '#9030F8', glyph: '✨' },
      { name: 'ElevenLabs', category: 'AI Voice & Speech', color: '#FFC107', glyph: '🎙️' },
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      { name: 'Make.com', category: 'Multi-App Scenarios', color: '#5B5FED', glyph: '🔄' },
      { name: 'n8n Workflow Hub', category: 'Self-Hosted Automation', color: '#EA580C', glyph: '⚡' },
      { name: 'OpenAI API & Functions', category: 'LLM Orchestration', color: '#10B981', glyph: '🤖' },
      { name: 'Airtable Databases', category: 'Relational Low-Code', color: '#E11D48', glyph: '📊' },
      { name: 'Zapier Central', category: 'Quick Integrations', color: '#FF8A65', glyph: '⚡' },
      { name: 'Supabase Backend', category: 'Auth & DB Storage', color: '#16A34A', glyph: '🗄️' },
      { name: 'Vibe Coding Tools', category: 'Custom Micro-Apps', color: '#6B3FB8', glyph: '💻' },
      { name: 'WhatsApp & CRM APIs', category: 'Customer Pipelines', color: '#25D366', glyph: '📱' },
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      { name: 'LangChain & LangGraph', category: 'Agent State Machines', color: '#6B3FB8', glyph: '🦜' },
      { name: 'LlamaIndex', category: 'RAG & Document Indexing', color: '#5B5FED', glyph: '🦙' },
      { name: 'Pinecone & Qdrant', category: 'Vector Databases', color: '#0F1535', glyph: '📐' },
      { name: 'OpenAI / Claude APIs', category: 'LLM Foundations', color: '#10B981', glyph: '🧠' },
      { name: 'Python & FastAPI', category: 'High-Speed APIs', color: '#059669', glyph: '⚡' },
      { name: 'Next.js & TypeScript', category: 'Streaming Client UI', color: '#000000', glyph: '▲' },
      { name: 'Docker & Microservices', category: 'Containerized Deployment', color: '#0284C7', glyph: '🐳' },
      { name: 'Langfuse Observability', category: 'Evals & Tracing', color: '#FFC107', glyph: '📈' },
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      { name: 'Enterprise AI Governance', category: 'Risk & Compliance', color: '#0F1535', glyph: '🛡️' },
      { name: 'AI Capital ROI Frameworks', category: 'P&L Strategy', color: '#10B981', glyph: '💼' },
      { name: 'Claude Enterprise & ChatGPT', category: 'Internal Knowledge', color: '#FF8A65', glyph: '🧠' },
      { name: 'Vendor Evaluation Scorecards', category: 'Procurement Strategy', color: '#5B5FED', glyph: '📋' },
      { name: 'Enterprise LLM Security', category: 'Data Protection & IP', color: '#6B3FB8', glyph: '🔒' },
      { name: 'Autonomous Workflows', category: 'Operational Scale', color: '#FFC107', glyph: '⚡' },
      { name: 'AI Talent Architecture', category: 'Org Design', color: '#0284C7', glyph: '👥' },
      { name: 'Executive Decision Models', category: 'Strategic Roadmaps', color: '#334155', glyph: '🧭' },
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      { name: 'Self-Hosted n8n', category: 'Core Workflow Engine', color: '#EA580C', glyph: '⚡' },
      { name: 'Python Automation', category: 'Custom Scripting', color: '#6B3FB8', glyph: '🐍' },
      { name: 'Webhooks & REST APIs', category: 'Real-Time Sync', color: '#5B5FED', glyph: '🔗' },
      { name: 'PostgreSQL & Redis', category: 'State & Caching', color: '#0284C7', glyph: '🗄️' },
      { name: 'Docker & Compose', category: 'Self-Hosting Stack', color: '#0284C7', glyph: '🐳' },
      { name: 'OAuth2 & Security', category: 'Enterprise Auth', color: '#10B981', glyph: '🔑' },
      { name: 'Error Handling Queues', category: 'Resilient Retries', color: '#E11D48', glyph: '🛡️' },
      { name: 'HubSpot & Airtable APIs', category: 'CRM Pipelines', color: '#FFC107', glyph: '📊' },
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      { name: 'Figma & Config Tokens', category: 'Design Systems', color: '#F24E1E', glyph: '🎨' },
      { name: 'AI-Native UI Patterns', category: 'Streaming & Multi-modal', color: '#5B5FED', glyph: '✨' },
      { name: 'v0 & Claude Artifacts', category: 'Generative Prototyping', color: '#0F1535', glyph: '▲' },
      { name: 'Framer & Webflow', category: 'Production Interactive', color: '#0055FF', glyph: '⚡' },
      { name: 'Midjourney & Relume', category: 'Visual Direction', color: '#6B3FB8', glyph: '🖼️' },
      { name: 'Spatial & Canvas UX', category: 'Infinite Workspaces', color: '#FF8A65', glyph: '📐' },
      { name: 'Variable Fonts & Tokens', category: 'Modern Typography', color: '#10B981', glyph: '🔤' },
      { name: 'User Testing & Heatmaps', category: 'Product Analytics', color: '#FFC107', glyph: '📊' },
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      { name: 'Midjourney v6.1', category: 'Commercial Visuals', color: '#6B3FB8', glyph: '🎨' },
      { name: 'Runway Gen-3 Alpha', category: 'Cinematic AI Video', color: '#5B5FED', glyph: '🎬' },
      { name: 'ElevenLabs Voice AI', category: 'Photorealistic Audio', color: '#FFC107', glyph: '🎙️' },
      { name: 'Kling & Luma AI', category: 'Motion Synthesis', color: '#FF8A65', glyph: '⚡' },
      { name: 'Meta Ads Manager', category: 'High-ROAS Media Buying', color: '#0081FB', glyph: '📈' },
      { name: 'CapCut AI & Premiere', category: 'UGC Hook Assembly', color: '#0F1535', glyph: '✂️' },
      { name: 'Topaz Video AI', category: 'Upscaling & Clarity', color: '#0284C7', glyph: '💎' },
      { name: 'Creative Testing Matrix', category: 'Ad Optimization', color: '#10B981', glyph: '📊' },
    ];
  }

  if (slug === 'machine-learning-data-science') {
    return [
      { name: 'Python for ML', category: 'Core Programming', color: '#6B3FB8', glyph: '🐍' },
      { name: 'Pandas & NumPy', category: 'Data Vectorization', color: '#5B5FED', glyph: '🐼' },
      { name: 'Scikit-Learn', category: 'Supervised & Unsupervised', color: '#F97316', glyph: '⚙️' },
      { name: 'XGBoost & LightGBM', category: 'Gradient Boosted Trees', color: '#10B981', glyph: '🚀' },
      { name: 'Matplotlib & Seaborn', category: 'Statistical Viz', color: '#0284C7', glyph: '📊' },
      { name: 'Jupyter & Colab', category: 'Notebook Environment', color: '#EA580C', glyph: '📓' },
      { name: 'Streamlit Deployment', category: 'Interactive Web Apps', color: '#FF4B4B', glyph: '🌐' },
      { name: 'Git & Version Control', category: 'Model Tracking', color: '#334155', glyph: '🐙' },
    ];
  }

  return [
    { name: 'Industry Tooling', category: 'Core Stack', color: '#5B5FED', glyph: '🛠️' },
    { name: 'Production Frameworks', category: 'Applied Systems', color: '#6B3FB8', glyph: '⚡' },
    { name: 'Real-World Datasets', category: 'Case Studies', color: '#10B981', glyph: '📊' },
    { name: 'Git & Version Control', category: 'Workflow', color: '#0F1535', glyph: '🐙' },
  ];
}
