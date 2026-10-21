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
      { name: 'SQL & PostgreSQL', category: 'Database Querying', color: '#5B5FED', glyph: 'SQL' },
      { name: 'Microsoft Power BI', category: 'BI & Dashboards', color: '#FFC107', glyph: 'PBI' },
      { name: 'Advanced Excel', category: 'Financial Modeling', color: '#10B981', glyph: 'XLS' },
      { name: 'Python for Analytics', category: 'Data Wrangling', color: '#6B3FB8', glyph: 'PY' },
      { name: 'DAX & Power Query', category: 'Data Modeling', color: '#FF8A65', glyph: 'DAX' },
      { name: 'Tableau Desktop', category: 'Visual Analytics', color: '#0F1535', glyph: 'TAB' },
      { name: 'Jupyter & Pandas', category: 'Exploratory Analysis', color: '#9030F8', glyph: 'PD' },
      { name: 'Git & GitHub', category: 'Version Control', color: '#334155', glyph: 'GIT' },
    ];
  }

  if (slug === 'full-stack-vibe-coding') {
    return [
      { name: 'Cursor AI', category: 'AI Code Editor', color: '#5B5FED', glyph: 'CUR' },
      { name: 'Claude 3.7 Sonnet', category: 'Reasoning Engine', color: '#FF8A65', glyph: 'CLD' },
      { name: 'v0 by Vercel', category: 'Generative UI', color: '#0F1535', glyph: 'V0' },
      { name: 'Bolt.new', category: 'Instant Full-Stack', color: '#FFC107', glyph: 'BLT' },
      { name: 'Tailwind CSS v4', category: 'Modern Styling', color: '#06B6D4', glyph: 'CSS' },
      { name: 'React 19 & TypeScript', category: 'Frontend Architecture', color: '#6B3FB8', glyph: 'TS' },
      { name: 'Supabase & PostgreSQL', category: 'Backend & Auth', color: '#10B981', glyph: 'SUP' },
      { name: 'Vercel Deployment', category: 'Cloud Edge Hosting', color: '#000000', glyph: 'VCL' },
    ];
  }

  if (slug === 'ai-automation-digital-skills') {
    return [
      { name: 'ChatGPT Plus', category: 'Prompt Engineering', color: '#10B981', glyph: 'GPT' },
      { name: 'Claude 3.7', category: 'Long-Form Reasoning', color: '#FF8A65', glyph: 'CLD' },
      { name: 'Midjourney v6', category: 'Commercial Visuals', color: '#6B3FB8', glyph: 'MJ' },
      { name: 'Make.com', category: 'Workflow Automation', color: '#5B5FED', glyph: 'MAK' },
      { name: 'Notion AI', category: 'Knowledge Systems', color: '#0F1535', glyph: 'NTN' },
      { name: 'Perplexity Pro', category: 'Deep Web Research', color: '#0284C7', glyph: 'PRP' },
      { name: 'Canva Magic Studio', category: 'Branded Design', color: '#9030F8', glyph: 'CNV' },
      { name: 'ElevenLabs', category: 'AI Voice & Speech', color: '#FFC107', glyph: 'ELV' },
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      { name: 'Make.com & Zapier', category: 'Workflow Pipelines', color: '#5B5FED', glyph: 'MAK' },
      { name: 'n8n Workflow Hub', category: 'Self-Hosted Automation', color: '#EA580C', glyph: 'N8N' },
      { name: 'GoHighLevel (GHL)', category: 'CRM & Funnel Automation', color: '#2563EB', glyph: 'GHL' },
      { name: 'Vapi AI Voice Agents', category: 'Conversational Telephony', color: '#9030F8', glyph: 'VOX' },
      { name: 'Notion Systems', category: 'Operational Control Centers', color: '#0F1535', glyph: 'NTN' },
      { name: 'TypeScript & Vite', category: 'Full-Stack Vibe Coding', color: '#3178C6', glyph: 'TS' },
      { name: 'Paystack Gateway', category: 'Checkout & Webhooks', color: '#00C3F7', glyph: 'PAY' },
      { name: 'Generative Media AI', category: 'UGC Video & Visual Ads', color: '#FFC107', glyph: 'GEN' },
    ];
  }

  if (slug === 'machine-learning-data-science') {
    return [
      { name: 'Python for ML', category: 'Core Programming', color: '#6B3FB8', glyph: 'PY' },
      { name: 'Pandas & NumPy', category: 'Data Vectorization', color: '#5B5FED', glyph: 'NUM' },
      { name: 'Scikit-Learn', category: 'Supervised & Unsupervised', color: '#F97316', glyph: 'SKL' },
      { name: 'XGBoost & LightGBM', category: 'Gradient Boosted Trees', color: '#10B981', glyph: 'XGB' },
      { name: 'Matplotlib & Seaborn', category: 'Statistical Viz', color: '#0284C7', glyph: 'PLT' },
      { name: 'Jupyter & Colab', category: 'Notebook Environment', color: '#EA580C', glyph: 'NB' },
      { name: 'Streamlit Deployment', category: 'Interactive Web Apps', color: '#FF4B4B', glyph: 'STR' },
      { name: 'Git & Version Control', category: 'Model Tracking', color: '#334155', glyph: 'GIT' },
    ];
  }

  return [
    { name: 'Industry Tooling', category: 'Core Stack', color: '#5B5FED', glyph: 'DEV' },
    { name: 'Production Frameworks', category: 'Applied Systems', color: '#6B3FB8', glyph: 'SYS' },
    { name: 'Real-World Datasets', category: 'Case Studies', color: '#10B981', glyph: 'DAT' },
    { name: 'Git & Version Control', category: 'Workflow', color: '#0F1535', glyph: 'GIT' },
  ];
}
