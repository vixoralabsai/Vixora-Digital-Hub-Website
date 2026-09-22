import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Code2,
  Cpu,
  Layers,
  FileText,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  ExternalLink,
  CreditCard,
  Building2,
  MessageSquare,
  Globe,
  Play,
  Flame,
  Zap,
  Briefcase,
  Store,
  Compass,
  X,
  Star,
  Check,
  Smartphone,
  HelpCircle,
  TrendingUp,
  Target,
  UserCheck,
  Binary,
  Database,
  BrainCircuit,
  BarChart3,
  Lightbulb,
  Workflow
} from 'lucide-react';
import { AcademyCourse, CourseSyllabusModule, ACADEMY_COURSES } from '../data/vixoraContent';
import { BRAND_CONFIG, getWhatsAppUrl } from '../data/brandConfig';
import { WhatsAppContactButton } from '../components/WhatsAppContactButton';
import { BankPaymentDetailsCard } from '../components/BankPaymentDetailsCard';

interface CourseLandingPageProps {
  course: AcademyCourse;
  onBackToAcademy: () => void;
  onEnroll: (course: AcademyCourse) => void;
  onSelectCourse?: (course: AcademyCourse) => void;
  onNavigateHome: () => void;
}

// ---------------------------------------------------------------------------
// HELPER: Dynamic Course Pricing Context
// ---------------------------------------------------------------------------
function parseCoursePricing(tuitionStr: string) {
  if (tuitionStr.includes('₦')) {
    const num = parseInt(tuitionStr.replace(/[^0-9]/g, ''), 10) || 60000;
    const standardNum = num <= 35000 ? 35000 : Math.round((num * 1.25) / 5000) * 5000;
    const savings = standardNum - num;
    return {
      early: tuitionStr,
      standard: `₦${standardNum.toLocaleString()}`,
      savings: `Save ₦${savings.toLocaleString()}`,
      currency: '₦'
    };
  } else if (tuitionStr.includes('$')) {
    const num = parseInt(tuitionStr.replace(/[^0-9]/g, ''), 10) || 1200;
    const standardNum = Math.round((num * 1.25) / 50) * 50;
    const savings = standardNum - num;
    return {
      early: tuitionStr,
      standard: `$${standardNum.toLocaleString()}`,
      savings: `Save $${savings.toLocaleString()}`,
      currency: '$'
    };
  }
  return {
    early: tuitionStr,
    standard: tuitionStr,
    savings: 'Special Early Rate',
    currency: ''
  };
}

// ---------------------------------------------------------------------------
// HELPER: Course-Specific Problem / Market Friction
// ---------------------------------------------------------------------------
interface CourseProblemData {
  tag: string;
  headline: string;
  sub: string;
  points: { title: string; desc: string; icon: string }[];
  quote: string;
}

function getCourseProblemData(course: AcademyCourse): CourseProblemData {
  const slug = course.slug;

  if (slug === 'machine-learning-data-science') {
    return {
      tag: 'THE MACHINE LEARNING & PREDICTIVE DATA GAP',
      headline: 'Every Modern Business Collects Data. Almost None Can Predict What Happens Next.',
      sub: 'Organizations are sitting on vast reserves of operational and customer data. Yet they face an acute shortage of practitioners who can clean features, build predictive algorithms, and deploy reliable machine learning models to solve business problems.',
      points: [
        {
          icon: '📈',
          title: 'Beyond Static Reporting',
          desc: 'Descriptive spreadsheets only tell you what already happened. Machine learning equips you to forecast customer churn, model financial risks, and predict demands.'
        },
        {
          icon: '🧠',
          title: 'Practical Code vs. Theoretical Math',
          desc: 'Most tutorials get lost in academic proofs without showing you how to clean messy data, engineer features, evaluate models, and deploy Scikit-Learn pipelines.'
        },
        {
          icon: '🚀',
          title: 'Portfolio-Ready Proof',
          desc: 'Employers and clients hire for demonstrable code. You need real projects—from exploratory data analysis to deployed prediction APIs—to stand out immediately.'
        }
      ],
      quote:
        '"The market does not need more people who simply read about machine learning. It needs practitioners who can take raw, imperfect datasets, engineer predictive features, and deploy algorithms that drive tangible business outcomes."'
    };
  }

  if (slug === 'data-analysis-cohort') {
    return {
      tag: 'THE BUSINESS DATA & ANALYTICS GAP',
      headline: 'Companies Drown in Spreadsheets. High-Earning Analysts Turn Them into Revenue.',
      sub: 'Businesses collect gigabytes of transaction records, lead forms, and operational metrics daily. They desperately need professionals who can extract actionable clarity using SQL, Power BI, and structured analysis.',
      points: [
        {
          icon: '📊',
          title: 'Data Without Direction',
          desc: 'Raw spreadsheets confuse leadership. Organizations need skilled analysts who can connect data sources, identify leaks, and communicate answers visually.'
        },
        {
          icon: '💼',
          title: 'High-Demand Global Skills',
          desc: 'Excel is only step one. Employers pay premium salaries for talent proficient in relational SQL queries, interactive Power BI dashboards, and business acumen.'
        },
        {
          icon: '🎯',
          title: 'Structured, Zero-Fluff Roadmap',
          desc: 'Random internet videos leave knowledge gaps. A structured curriculum ensures you learn the exact tools and commercial workflows hiring managers test.'
        }
      ],
      quote:
        '"The tools are not the hard part—Excel, SQL, and Power BI are completely learnable. What is missing for most aspiring analysts is a guided, project-backed path that takes them from beginner to job-ready."'
    };
  }

  if (slug === 'fullstack-ai-engineering') {
    return {
      tag: 'PRODUCTION AI ARCHITECTURE REALITY',
      headline: 'Anyone Can Call an LLM API. Engineering Production-Ready AI Systems Is Rare.',
      sub: 'Companies are rushing to integrate AI into their products, but traditional software patterns break when handling stochastic outputs, latency bottlenecks, agent loops, and vector database retrieval.',
      points: [
        {
          icon: '🛠️',
          title: 'Beyond Fragile Prompt Wrappers',
          desc: 'Toy wrappers fail in production. Real applications demand robust eval pipelines, semantic caching, fallback loops, and token budgeting.'
        },
        {
          icon: '⚡',
          title: 'Vector Databases, RAG & Agents',
          desc: 'Engineering autonomous agents with tool-calling capabilities and hybrid vector retrieval commands top-tier international compensation.'
        },
        {
          icon: '🌍',
          title: 'High-Demand Remote Engineering',
          desc: 'Global tech startups are aggressively hunting for full-stack developers who can architect and deploy complete AI-native applications.'
        }
      ],
      quote:
        '"The gap between a prototype notebook and a high-availability AI product serving thousands of concurrent users is enormous. That gap is where the most rewarding engineering careers exist."'
    };
  }

  if (slug === 'executive-ai-strategy') {
    return {
      tag: 'THE STRATEGIC LEADERSHIP CHALLENGE',
      headline: "The Biggest Risk Isn't AI Disruption. It's Incompetent AI Capital Allocation.",
      sub: 'Corporate leaders are overwhelmed with vendor pitches, pilot experiments that stall in development, and employee prompt confusion. Sustained competitive advantage requires strategic AI governance.',
      points: [
        {
          icon: '📉',
          title: 'Wasted Pilot Budgets',
          desc: 'Over 70% of enterprise AI trials fail to yield measurable ROI due to poor data readiness and misaligned commercial KPIs.'
        },
        {
          icon: '🛡️',
          title: 'Security & Compliance Blindspots',
          desc: 'Data leaks, IP exposure, and regulatory penalties threaten companies that adopt AI tools without clear enterprise governance policies.'
        },
        {
          icon: '🏆',
          title: 'Disproportionate Operating Leverage',
          desc: 'Organizations that thoughtfully weave autonomous agents into core business operations achieve 3x to 5x operational leverage over peers.'
        }
      ],
      quote:
        '"AI will not replace executives, but executives who leverage AI effectively will swiftly replace those who treat it as an IT novelty."'
    };
  }

  if (slug === 'enterprise-workflow-automation') {
    return {
      tag: 'THE ENTERPRISE INTEGRATION BOTTLENECK',
      headline: 'SaaS Subscriptions Multiply. Disconnected Tools Waste Hundreds of Engineering Hours.',
      sub: 'Modern businesses juggle dozens of specialized software platforms—CRMs, ERPs, accounting systems, and support queues. Relying on costly per-task Zapier plans or manual copy-pasting leads to broken syncs and ballooning software budgets.',
      points: [
        {
          icon: '🔄',
          title: 'Self-Hosted n8n vs. Metered SaaS',
          desc: 'Run millions of workflow executions without per-task fees by deploying unmetered, self-hosted n8n infrastructure with Docker and SSL.'
        },
        {
          icon: '🐍',
          title: 'Custom Python Nodes & Complex Logic',
          desc: 'Surpass low-code limitations by integrating custom Python scripts, SQL database connectors, and resilient error recovery loops.'
        },
        {
          icon: '🔒',
          title: 'Enterprise Security Behind Firewalls',
          desc: 'Keep proprietary company data, webhooks, and customer records securely within your own cloud infrastructure instead of third-party clouds.'
        }
      ],
      quote:
        '"Enterprise automation is not about making simple two-step Zapier connections. It is about architecting self-hosted, unmetered pipelines that reliably sync mission-critical business data 24/7 without recurring per-task costs."'
    };
  }

  if (slug === 'ai-product-design-ui-ux') {
    return {
      tag: 'THE AI-NATIVE INTERFACE DESIGN GAP',
      headline: 'Static UI Patterns Fail for AI. Designers Must Master Nondeterministic UX.',
      sub: 'Traditional form-and-button web design cannot handle streaming text, variable model latency, confidence scores, agent feedback loops, or infinite canvas workspaces. Top tech companies pay top rates for product designers who understand AI interaction design.',
      points: [
        {
          icon: '🎨',
          title: 'Designing for Latency & Streaming',
          desc: 'Design token streaming feedback, loading states, and graceful error handling when models hallucinate or lag.'
        },
        {
          icon: '📐',
          title: 'Scalable Obsidian Design Systems',
          desc: 'Build dark-mode design tokens, modular component libraries, and Figma variables tailored for complex AI dashboards.'
        },
        {
          icon: '⚡',
          title: 'Interactive Canvas & Agent Visualizers',
          desc: 'Prototype multi-turn agent conversations, tool-calling badges, and spatial canvas workflows that delight users.'
        }
      ],
      quote:
        '"Users do not abandon AI products because the underlying model is weak. They abandon them because the interface feels slow, confusing, and unresponsive. Crafting intuitive UX for nondeterministic software is the most sought-after skill in product design today."'
    };
  }

  if (slug === 'generative-media-advertising') {
    return {
      tag: 'THE PERFORMANCE CREATIVE BOTTLENECK',
      headline: 'Ad Creative Fatigue Kills Campaigns. Generative Media Scales Winning Ads in Minutes.',
      sub: 'Paid social algorithms on Meta and TikTok demand dozens of fresh creative hooks every week. Traditional video shoots take weeks and thousands of dollars, suffocating return on ad spend before scaling.',
      points: [
        {
          icon: '🎬',
          title: 'High-Converting UGC Video at Scale',
          desc: 'Produce realistic synthetic avatars, custom voiceovers, and dynamic video edits using Midjourney, Runway, and ElevenLabs.'
        },
        {
          icon: '🎯',
          title: 'Algorithmic Hook Testing',
          desc: 'Test 50+ video hooks and visual angles simultaneously to discover winning customer acquisition creatives.'
        },
        {
          icon: '📈',
          title: 'Media Buying & Scaling Past $50k/mo',
          desc: 'Combine creative volume with structured campaign bidding, audience scaling, and ROAS optimization.'
        }
      ],
      quote:
        '"In modern performance marketing, creative volume is the single largest lever for reducing CPA. Media buyers who master generative video production outpace traditional production agencies by 10x."'
    };
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return {
      tag: 'THE SYSTEMS & MONETIZATION GAP',
      headline: 'Knowing AI Tools Gets You Noticed. Building AI Systems Gets You Paid.',
      sub: 'There is a massive distinction between someone who plays with prompt generators and someone who builds autonomous business infrastructure that saves 15+ hours every single week.',
      points: [
        {
          icon: '📜',
          title: 'Prompting Is a Low Ceiling',
          desc: 'Typing casual ChatGPT prompts is a commodity. Clients do not pay monthly retainers for simple text prompts they can generate themselves.'
        },
        {
          icon: '⚡',
          title: 'Systems Command Recurring Retainers',
          desc: 'Businesses happily pay ₦200,000+ to $2,500/month for automated CRM lead triage, invoice generation, customer routing, and multi-app syncs.'
        },
        {
          icon: '💼',
          title: 'Invoices vs. Resumes',
          desc: 'While average job seekers wait on endless resume queues, system builders package custom automation solutions directly for eager business owners.'
        }
      ],
      quote:
        '"If you already understand basic AI tools, staying at that level is not safe—it is a ceiling. The practitioners earning substantial income right now build, implement, and monetize end-to-end systems."'
    };
  }

  // Default / ai-automation-digital-skills
  return {
    tag: 'THE DIGITAL FLUENCY GAP',
    headline: "Everyone's Talking About AI. In 12 Weeks, You'll Actually Know How to Use It.",
    sub: 'Across every sector, professionals and creators using AI tools are completing tasks in minutes that used to take entire days. Getting started does not require coding—just the right step-by-step guidance.',
    points: [
      {
        icon: '💼',
        title: 'Stand Out on Every Application',
        desc: 'Adding practical AI workflows, automated research, and media production to your CV immediately differentiates you from outdated candidates.'
      },
      {
        icon: '⚡',
        title: 'Fast Freelance Services',
        desc: 'Simple automated lead funnels, custom chatbots, and automated summaries that take 30 minutes to set up can be offered as valuable client services.'
      },
      {
        icon: '🎨',
        title: 'Produce 10x Faster',
        desc: 'Master prompt engineering, generative graphics, and visual automation tools to amplify your individual output without burnout.'
      }
    ],
    quote:
      '"You are not behind because you are not capable. You are behind because nobody gave you a clear, hands-on path from absolute zero to practical execution."'
  };
}

// ---------------------------------------------------------------------------
// HELPER: Dynamic 3-Phase Transformation from Course Syllabus
// ---------------------------------------------------------------------------
function getCourseTransformationPhases(course: AcademyCourse) {
  const slug = course.slug;
  const syllabus = course.weeklySyllabus;

  if (slug === 'machine-learning-data-science') {
    return [
      {
        phase: 'Phase 1: Foundations & Exploratory Data Analysis',
        duration: 'Weeks 1 – 6',
        title: 'Data Analysis Fundamentals & Python Environment',
        description: 'Environment Setup • Python & Jupyter Notebooks • NumPy & Pandas • Data Cleaning & Feature Wrangling • Exploratory Data Analysis • Statistical Distributions'
      },
      {
        phase: 'Phase 2: Predictive Algorithms & Modeling Pipelines',
        duration: 'Weeks 7 – 12',
        title: 'Machine Learning Algorithms & Scikit-Learn Pipelines',
        description: 'Supervised Learning (Regression) • Classification Algorithms • Model Evaluation & Cross-Validation • Feature Engineering & Selection • Unsupervised Learning & Clustering • Scikit-Learn Pipelines'
      },
      {
        phase: 'Phase 3: Model Evaluation, Deployment & Portfolio',
        duration: 'Weeks 13 – 18',
        title: 'Model Evaluation, API Deployment & Capstone Defense',
        description: 'Hyperparameter Tuning & Ensembles • Model Deployment with Flask/FastAPI • Real-World ML Applications • Capstone Project Design & Mentorship • Model Evaluation & Stress Testing • Final Capstone Presentation & Graduation'
      }
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      {
        phase: 'Phase 1: Excel Mastery & Business Data Hygiene',
        duration: 'Weeks 1 – 4',
        title: 'Data Hygiene, Formulas & Pivot Modeling',
        description: 'Excel Fundamentals & Data Cleaning • Advanced Formulas (XLOOKUP, INDEX/MATCH) • Pivot Tables & Dynamic Modeling • Commercial Dashboard Design & KPI Visualization'
      },
      {
        phase: 'Phase 2: Relational SQL Queries & Power BI Modeling',
        duration: 'Weeks 5 – 10',
        title: 'Relational Database Queries & Power BI Dashboards',
        description: 'SQL Basics & Filtering • Aggregations & Multi-Table Joins • Subqueries & Window Functions • Power BI Data Modeling & Star Schema • DAX Formulas & Interactive Visuals'
      },
      {
        phase: 'Phase 3: AI-Assisted Analysis & Capstone Portfolio',
        duration: 'Weeks 11 – 16',
        title: 'AI-Assisted Analysis & Executive Capstone Defense',
        description: 'AI Tools for Analysts (Automating SQL & Insights) • Portfolio Capstone Development • Business Presentation Strategy • Final Capstone Defense & Career Guidance'
      }
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      {
        phase: 'Phase 1: AI Core & Vector Architecture',
        duration: 'Weeks 1 – 4',
        title: 'TypeScript/Python AI Core & Vector Retrieval',
        description: 'LLM APIs & Prompt Engineering • Embeddings & Vector Databases (pgvector) • Hybrid Search & RAG Architecture • Semantic Caching & Latency Optimization'
      },
      {
        phase: 'Phase 2: Autonomous Agents & LangGraph',
        duration: 'Weeks 5 – 8',
        title: 'Autonomous Agent Swarms & LangGraph Orchestration',
        description: 'Multi-Agent State Machines • Tool-Calling & Deterministic Routing • Self-Healing Pipelines • Evaluation Suites & Model Observability'
      },
      {
        phase: 'Phase 3: Production Microservices & Deployment',
        duration: 'Weeks 9 – 12',
        title: 'Production Microservices & Capstone Launch',
        description: 'FastAPI/Node Microservices • Streaming Protocols & WebSocket Integration • Cloud Deployment & Containerization • Capstone Defense & Portfolio Showcase'
      }
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      {
        phase: 'Phase 1: Strategic Opportunity & Economics',
        duration: 'Week 1',
        title: 'Executive AI Economics & Opportunity Audit',
        description: 'The Modern AI Frontier • AI Unit Economics & Vendor Evaluation • Calculating Real ROI • Identifying High-Impact Transformation Levers'
      },
      {
        phase: 'Phase 2: Governance, Security & Workforce',
        duration: 'Weeks 2 – 3',
        title: 'Enterprise Governance, Security & Risk Mitigation',
        description: 'Data Privacy & IP Protection Policies • Compliance & Regulatory Frameworks • AI Workforce Transformation • Selecting Enterprise Technology Stacks'
      },
      {
        phase: 'Phase 3: Strategic Blueprint & Board Defense',
        duration: 'Week 4',
        title: 'Enterprise Transformation Blueprint & Executive Defense',
        description: 'Finalizing 12-Month AI Roadmap • Risk Mitigation Framework • Board-Ready Strategic Presentation • Executive Peer Review & Credential Sign-Off'
      }
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      {
        phase: 'Phase 1: Self-Hosted n8n Infrastructure',
        duration: 'Weeks 1 – 2',
        title: 'Self-Hosted n8n Infrastructure & Docker Setup',
        description: 'Docker Architecture & Deployment • Reverse Proxy, SSL & Webhook Security • Core n8n Nodes & Expression Logic • Eliminating SaaS Metering Fees'
      },
      {
        phase: 'Phase 2: Integrations & Custom Python Logic',
        duration: 'Weeks 3 – 4',
        title: 'Multi-Platform Integrations & Custom Python Logic',
        description: 'CRM & Database Webhook Syncs • Custom Python Nodes for Complex Rules • OpenAI & Local LLM Integration • Structured Data Transformation & Error Handling'
      },
      {
        phase: 'Phase 3: Production Deployments & Capstone',
        duration: 'Weeks 5 – 6',
        title: 'Production Resilience & Enterprise Capstone',
        description: 'Fault-Tolerant Retries & Dead-Letter Queues • Production Health Monitoring • Enterprise Lead/Data Engine Capstone • Verification & Deployment Defense'
      }
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      {
        phase: 'Phase 1: Streaming UI & Obsidian Design Kit',
        duration: 'Weeks 1 – 2',
        title: 'AI Interaction Design & Obsidian Design Kit',
        description: 'Designing for Latency & Nondeterminism • Token Streaming States & Loading Feedbacks • Confidence Scores & Hallucination UX • Dark-Mode Token Architectures in Figma'
      },
      {
        phase: 'Phase 2: Canvas Workspaces & Generative UI',
        duration: 'Weeks 3 – 4',
        title: 'Canvas Workspaces & Generative UI Prototyping',
        description: 'Spatial Canvas Workspaces • Agent Feedback Loops & Tool-Calling Badges • Prototyping with Figma Variables • Generative Interface Patterns'
      },
      {
        phase: 'Phase 3: Design System & Capstone Portfolio',
        duration: 'Weeks 5 – 6',
        title: 'Complete Design System & Capstone Portfolio',
        description: 'Scalable Component Token Libraries • Interactive AI Prototype Defense • Live Portfolio Critiques • Packaging Your Design Case Study'
      }
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      {
        phase: 'Phase 1: Multimodal Prompt Architecture',
        duration: 'Week 1',
        title: 'Multimodal Prompt Architecture & Asset Generation',
        description: 'Photorealistic Imagery with Midjourney v6 • Synthetic Voice Clones with ElevenLabs • Cinematic Video Generation with Runway Gen-3 • Brand Consistency Workflows'
      },
      {
        phase: 'Phase 2: Automated Video & Creative Testing',
        duration: 'Weeks 2 – 3',
        title: 'Automated Video Editing & Hook Testing Workflows',
        description: 'High-Converting UGC Video Frameworks • Algorithmic Hook Testing (50+ Variations) • Automated Assembly Pipelines • Pacing & Dynamic Captions'
      },
      {
        phase: 'Phase 3: Performance Media Buying & Scaling',
        duration: 'Week 4',
        title: 'Performance Media Buying & Campaign Scaling',
        description: 'Meta & TikTok Ads Campaign Structures • Bidding Strategies & Budget Allocation • Creative Fatigue Monitoring • Growth Engine Capstone Launch'
      }
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      {
        phase: 'Phase 1: Core Automations & Webhooks',
        duration: 'Weeks 1 – 4',
        title: 'Core Automations, n8n Pipelines & Webhooks',
        description: 'Foundation Automation Workflows • Webhook Triggers & Multi-App Syncs • Autonomous Lead Enrichment • CRM & Communications Integration'
      },
      {
        phase: 'Phase 2: Client Systems & Vibe Coding',
        duration: 'Weeks 5 – 8',
        title: 'Client Systems & Vibe Coding Micro-Apps',
        description: 'Document Intelligence & Ingestion • Automated Commercial Asset Pipelines • Building Custom AI Tools via Vibe Coding • Client Workflow Portals'
      },
      {
        phase: 'Phase 3: Commercial Retainers & Capstone',
        duration: 'Weeks 9 – 12',
        title: 'Commercial Retainers, Sales Scripts & Capstone Launch',
        description: 'Packaging Automation Retainers (₦200k-$2,500/mo) • Client Discovery & Proposal Templates • Enterprise Automation Capstone • Final Defense & Graduation'
      }
    ];
  }

  // Fallback: ai-automation-digital-skills or generic
  const total = syllabus.length;
  const p1 = syllabus.slice(0, Math.ceil(total / 3));
  const p2 = syllabus.slice(Math.ceil(total / 3), Math.ceil((2 * total) / 3));
  const p3 = syllabus.slice(Math.ceil((2 * total) / 3));

  return [
    {
      phase: 'Phase 1: Core Foundations & Workflows',
      duration: `${p1[0]?.week || 'Week 1'} – ${p1[p1.length - 1]?.week || 'Week 4'}`,
      title: p1[0]?.title || 'Foundations & Tooling',
      description: p1.map(m => m.title).join(' • ')
    },
    {
      phase: 'Phase 2: Practical Application & Pipelines',
      duration: `${p2[0]?.week || 'Week 5'} – ${p2[p2.length - 1]?.week || 'Week 8'}`,
      title: p2[0]?.title || 'Applied Problem Solving',
      description: p2.map(m => m.title).join(' • ')
    },
    {
      phase: 'Phase 3: Capstone Projects & Credential Defense',
      duration: `${p3[0]?.week || 'Week 9'} – ${p3[p3.length - 1]?.week || 'Week 12'}`,
      title: p3[p3.length - 1]?.title || 'Capstone Project & Credential Defense',
      description: p3.map(m => m.title).join(' • ')
    }
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Course Audience Personas
// ---------------------------------------------------------------------------
interface AudiencePersona {
  role: string;
  desc: string;
}

function getCourseAudiencePersonas(course: AcademyCourse): AudiencePersona[] {
  const slug = course.slug;

  if (slug === 'machine-learning-data-science') {
    return [
      {
        role: 'Aspiring Data Scientists & ML Engineers',
        desc: 'Individuals ready to move beyond basic reporting into predictive modeling, feature engineering, and statistical learning algorithms.'
      },
      {
        role: 'Data & Business Analysts Upgrading Skills',
        desc: 'Analysts who already know Excel or SQL and want to upgrade their compensation by mastering Python, Scikit-Learn, and automated predictive pipelines.'
      },
      {
        role: 'Software Developers & Technical Builders',
        desc: 'Engineers seeking to embed predictive machine learning models, regression forecasts, and classification capabilities into real software.'
      },
      {
        role: 'STEM Graduates & Quantitative Professionals',
        desc: 'Graduates in economics, mathematics, engineering, or sciences looking for a fast, project-backed path into commercial data science.'
      }
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      {
        role: 'Career Changers & New Professionals',
        desc: 'Individuals looking to enter the high-demand tech and data field without needing a 4-year computer science degree or complex coding background.'
      },
      {
        role: 'Business, Finance & Operations Professionals',
        desc: 'Accountants, marketers, and operations managers who want to automate manual spreadsheet tasks and build interactive Power BI dashboards.'
      },
      {
        role: 'Recent University Graduates',
        desc: 'Graduates who need verified portfolio proof—demonstrating real SQL queries and BI dashboards—to stand out immediately to hiring managers.'
      },
      {
        role: 'Team Leads & Growing Entrepreneurs',
        desc: 'Founders and managers who need to extract real-time sales, inventory, and customer intelligence from raw spreadsheets to guide revenue decisions.'
      }
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      {
        role: 'Full-Stack & Frontend Developers',
        desc: 'Coders who want to build end-to-end AI applications, master vector databases, and implement autonomous agent patterns with LangGraph.'
      },
      {
        role: 'Backend & Systems Engineers',
        desc: 'Engineers who want to architect resilient LLM orchestration layers, semantic caching, and enterprise retrieval systems with pgvector.'
      },
      {
        role: 'Technical Founders & Builders',
        desc: 'Founders building AI-native SaaS products who require deterministic execution, low-latency APIs, and production-grade reliability.'
      },
      {
        role: 'Computer Science Graduates',
        desc: 'CS and engineering graduates who want to bypass junior generic developer roles and enter the high-compensation AI engineering space.'
      }
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      {
        role: 'C-Suite Executives (CEO, COO, CTO)',
        desc: 'Senior leaders responsible for capital allocation, risk management, and determining where AI delivers real enterprise leverage.'
      },
      {
        role: 'Business Unit Directors & VPs',
        desc: 'Department heads tasked with improving margin efficiency and scaling departmental output through strategic AI adoption.'
      },
      {
        role: 'Management Consultants & Advisors',
        desc: 'Advisors who need rigorous, board-level frameworks to assess enterprise AI readiness, calculate ROI, and guide client transformation.'
      },
      {
        role: 'Enterprise Innovation Leads',
        desc: 'Leaders charged with driving modernization across legacy business units without getting trapped in vendor hype or compliance risks.'
      }
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      {
        role: 'Systems & DevOps Administrators',
        desc: 'IT and infrastructure professionals wanting to self-host n8n with Docker, manage SSL, and eliminate recurring Zapier bills.'
      },
      {
        role: 'Operations & Business Process Engineers',
        desc: 'Professionals managing cross-department data flows between CRMs, ERPs, SQL databases, and team communication channels.'
      },
      {
        role: 'Backend Developers & Integrators',
        desc: 'Coders writing custom Python nodes, webhook handlers, and database triggers to automate business events.'
      },
      {
        role: 'Freelance Technical Automators',
        desc: 'Consultants who want to architect and maintain self-hosted enterprise automation infrastructure for high-paying corporate clients.'
      }
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      {
        role: 'UI/UX & Digital Product Designers',
        desc: 'Designers wanting to lead the next generation of AI-native streaming apps, latency feedback loops, and infinite canvas tools.'
      },
      {
        role: 'Design Systems Leads & Specialists',
        desc: 'Practitioners building dark-mode token architectures, scalable component libraries, and Figma variables for complex web apps.'
      },
      {
        role: 'Frontend Engineers Transitioning to Product',
        desc: 'Developers wanting to master visual hierarchy, user psychology, streaming UX patterns, and modern Figma prototyping.'
      },
      {
        role: 'Design Agency Founders & Freelancers',
        desc: 'Agencies upgrading their service menu to charge premium rates for AI product prototyping, UX audits, and design systems.'
      }
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      {
        role: 'Performance Marketers & Media Buyers',
        desc: 'Growth marketers running paid social on Meta and TikTok needing massive ad creative volume to scale past $50k/mo.'
      },
      {
        role: 'Creative Directors & Video Editors',
        desc: 'Creators wanting to master Midjourney, Runway Gen-3, and ElevenLabs to slash video production timelines and costs.'
      },
      {
        role: 'E-Commerce Brands & D2C Founders',
        desc: 'Store owners wanting to produce high-converting UGC video ads and synthetic product scenes without expensive studio shoots.'
      },
      {
        role: 'Digital Marketing Agencies',
        desc: 'Agencies looking to expand client retainers with automated creative testing pipelines and algorithmic hook generation.'
      }
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      {
        role: 'Freelancers & Solopreneurs',
        desc: 'People who want to package high-demand automation systems and close ₦200,000+ to $2,500/month recurring client retainers.'
      },
      {
        role: 'Agency Owners & Digital Marketers',
        desc: 'Agencies looking to add high-margin CRM automations, lead triage bots, and Vibe Coding tools to their client menu.'
      },
      {
        role: 'Operations & IT Managers',
        desc: 'Professionals looking to modernize internal company infrastructure, connect fragmented tools, and eliminate manual busywork.'
      },
      {
        role: 'Ambitious Knowledge Workers',
        desc: 'Workers aiming to establish themselves as the indispensable systems and automation architect in their company.'
      }
    ];
  }

  // Default / ai-automation-digital-skills
  return [
    {
      role: 'Complete Beginners to AI',
      desc: 'Anyone feeling overwhelmed by AI who wants a structured, step-by-step path to master core prompt and productivity tools from zero.'
    },
    {
      role: 'Office Workers & Administrators',
      desc: 'Professionals looking to complete weekly reports, research, data summarization, and email drafts in minutes instead of hours.'
    },
    {
      role: 'Content Creators & Marketers',
      desc: 'Writers, designers, and marketers who want to 10x their creative output using generative copy, imagery, and audio tools.'
    },
    {
      role: 'Small Business Owners',
      desc: 'Entrepreneurs who want to leverage free and low-cost AI tools to handle customer service, marketing, and admin without hiring a team.'
    }
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Course Prerequisites "What You Do NOT Need"
// ---------------------------------------------------------------------------
function getCoursePrerequisitesNotNeeded(course: AcademyCourse): string[] {
  const slug = course.slug;

  if (slug === 'machine-learning-data-science') {
    return [
      'Advanced mathematics degree or theoretical PhD',
      'Prior machine learning or deep coding background (we teach Python from data basics)',
      'Expensive local GPU hardware (cloud computing environments are provided)'
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      'Prior computer science, coding, or statistics degree',
      'Prior programming experience in Python or C++',
      'Expensive enterprise software licenses (we use tools businesses already run on)'
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      'PhD in machine learning or theoretical AI research',
      'Prior experience with vector databases or LangGraph (we teach these from scratch)',
      'Costly server infrastructure or local GPU rigs'
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      'Programming, coding, or mathematical background',
      'Technical engineering certifications or IT administration experience',
      'Direct pipeline coding (focus is strategy, ROI, economics & governance)'
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      'Advanced computer science degree or full-stack software background',
      'Expensive recurring Zapier subscriptions (we focus on self-hosted n8n)',
      'Physical on-premise server infrastructure'
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      'Coding or frontend software engineering background',
      '3D rendering or motion design expertise',
      'Paid enterprise design plugins or server setups'
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      'Film school degree or professional camera studio',
      'Prior technical video editing expertise',
      'Large advertising budget to practice'
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      'Prior computer science degree or professional software background',
      'Months of complex coding experience',
      'Expensive proprietary software suites'
    ];
  }

  // Default / digital skills
  return [
    'Prior tech or coding experience of any kind',
    'Advanced mathematical or computer science knowledge',
    'Expensive computer hardware'
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Dynamic Course Value Stack (Everything Included)
// ---------------------------------------------------------------------------
interface ValueStackItem {
  title: string;
  desc: string;
}

function getCourseValueStack(course: AcademyCourse): ValueStackItem[] {
  const capstoneName = course.capstoneProjects[0]?.title || 'Practical Capstone Deliverable';
  const highlights = course.highlights || [];

  return [
    {
      title: `✅ ${course.duration} Structured Curriculum`,
      desc: `Step-by-step masterclasses spanning ${course.weeklySyllabus.length} modules, specifically designed for ${course.title} with zero fluff and maximum real-world execution.`
    },
    {
      title: `✅ Industry Capstone: ${capstoneName}`,
      desc: course.capstoneProjects.length > 1
        ? `Build and defend verifiable deliverables including "${capstoneName}" and "${course.capstoneProjects[1]?.title}" to anchor your professional portfolio.`
        : `Build and defend "${capstoneName}" with direct mentor feedback to prove commercial competence.`
    },
    {
      title: `✅ Official ${course.certificateType}`,
      desc: `Verifiable ${course.certificateType} credential signed by Dean Sarumi Hammad upon graduation to showcase on your LinkedIn profile and CV.`
    },
    {
      title: `✅ Direct Mentor Office Hours & Review`,
      desc: `Interactive feedback, practical lab troubleshooting, and dedicated Q&A sessions throughout the cohort so you never get stuck.`
    },
    {
      title: `✅ ${highlights[1] || 'Hands-On Domain Mastery'}`,
      desc: highlights[2] || `Direct hands-on training with industry-standard tooling, real datasets, and production frameworks.`
    },
    {
      title: `✅ ${course.format} Access & Network`,
      desc: `Live interactive sessions, recorded replays in your student portal, complete project resources, and our active builder network.`
    }
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Course Value Framing Quote
// ---------------------------------------------------------------------------
function getCourseValueQuote(course: AcademyCourse): string {
  const slug = course.slug;

  if (slug === 'data-analysis-cohort') {
    return `The analytical capabilities gained in ${course.title} will pay for themselves the moment you deliver your first interactive Power BI dashboard, uncover a critical revenue leak, or secure your target data analyst role.`;
  }
  if (slug === 'machine-learning-data-science') {
    return `The predictive modeling capabilities gained in ${course.title} will pay for themselves the moment you deploy your first machine learning algorithm, complete your capstone defense, or step into a high-paying data science role.`;
  }
  if (slug === 'fullstack-ai-engineering') {
    return `The production engineering capabilities gained in ${course.title} will pay for themselves the moment you ship your first AI-native application, architect an autonomous agent swarm, or land a global engineering contract.`;
  }
  if (slug === 'executive-ai-strategy') {
    return `The strategic governance frameworks gained in ${course.title} will pay for themselves the moment you prevent your first misallocated enterprise AI investment, establish sound data governance, or deploy high-ROI operational leverage.`;
  }
  if (slug === 'enterprise-workflow-automation') {
    return `The enterprise systems capabilities gained in ${course.title} will pay for themselves the moment you replace your first recurring SaaS subscription with self-hosted n8n infrastructure or deploy a resilient cross-platform workflow.`;
  }
  if (slug === 'ai-product-design-ui-ux') {
    return `The design systems and streaming UX capabilities gained in ${course.title} will pay for themselves the moment you ship your first AI-native prototype, deliver a client design system, or secure a senior product design role.`;
  }
  if (slug === 'generative-media-advertising') {
    return `The programmatic creative capabilities gained in ${course.title} will pay for themselves the moment you scale your first winning ad campaign, cut video production costs by 80%, or onboard high-ticket performance marketing clients.`;
  }
  if (slug === 'ai-automation-digital-business-systems') {
    return `The systems building and client acquisition skills gained in ${course.title} will pay for themselves the moment you close your first monthly retainer or deliver your first automated client infrastructure.`;
  }
  return `The practical digital fluency gained in ${course.title} will pay for itself the moment you automate hours of tedious weekly work, amplify your creative output, or stand out in your job applications.`;
}

// ---------------------------------------------------------------------------
// HELPER: Course Testimonials
// ---------------------------------------------------------------------------
interface CourseTestimonial {
  quote: string;
  author: string;
  role: string;
  initials: string;
  gradient: string;
}

function getCourseTestimonials(course: AcademyCourse): CourseTestimonial[] {
  const slug = course.slug;

  if (slug === 'machine-learning-data-science') {
    return [
      {
        quote:
          'Before this 18-week course, machine learning felt like an intimidating wall of pure theory and academic calculus. The curriculum broke down regression, feature engineering, and Scikit-Learn pipelines into practical steps. Defending my end-to-end predictive capstone helped me land my first role as an Associate ML Analyst.',
        author: 'Tunde Adeyemi',
        role: 'Associate Machine Learning Analyst',
        initials: 'TA',
        gradient: 'from-blue-500 to-indigo-500'
      },
      {
        quote:
          'I spent months hopping between random online tutorials without building anything substantial. Here, building real predictive models, tuning hyperparameters, and deploying an inference API gave me a solid, tangible GitHub portfolio that hiring managers actually respected.',
        author: 'Chiamaka Eze',
        role: 'Junior Data Scientist',
        initials: 'CE',
        gradient: 'from-purple-500 to-pink-500'
      },
      {
        quote:
          'The hybrid format with live online labs and practical feedback was game-changing. The mentors walked us through real messy datasets, taught us proper cross-validation, and helped us avoid common data leakage pitfalls. Worth every naira of the ₦60,000 tuition.',
        author: 'Ibrahim Bello',
        role: 'Data Science Practitioner',
        initials: 'IB',
        gradient: 'from-emerald-500 to-teal-500'
      }
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      {
        quote:
          'I had zero coding background when I started. In 16 weeks, I went from struggling with basic Excel to writing multi-table SQL queries and building executive Power BI dashboards. I landed a full-time Business Operations Analyst role within 2 months of graduation.',
        author: 'Blessing Okonkwo',
        role: 'Business Operations Analyst',
        initials: 'BO',
        gradient: 'from-amber-500 to-yellow-500'
      },
      {
        quote:
          'The focus on solving real business problems instead of just clicking buttons is what makes Vixora different. The capstone project was identical to the technical assessment I was given during my interviews.',
        author: 'Emmanuel Oladipo',
        role: 'Data & BI Analyst',
        initials: 'EO',
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        quote:
          'Mentors reviewed our SQL queries, challenged our dashboard layouts, and showed us how to present insights to leadership. That executive presentation training was what set me apart from other candidates.',
        author: 'Zainab Mohammed',
        role: 'Financial Data Analyst',
        initials: 'ZM',
        gradient: 'from-purple-500 to-indigo-500'
      }
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      {
        quote:
          'The LangGraph orchestration and pgvector search modules alone made this cohort worth 10x the price. I went from wrapping OpenAI endpoints to architecting an autonomous multi-agent research swarm that runs reliably in production.',
        author: 'Alexandre Meyer',
        role: 'AI Software Engineer',
        initials: 'AM',
        gradient: 'from-indigo-500 to-cyan-500'
      },
      {
        quote:
          'Code reviews by senior infrastructure leads were brutal and deeply educational. Learning how to handle token latency, streaming WebSockets, and self-healing evaluation loops transformed how I write software.',
        author: 'Kavita Raman',
        role: 'Senior Backend Engineer',
        initials: 'KR',
        gradient: 'from-emerald-500 to-teal-500'
      },
      {
        quote:
          'This is not a prompt engineering bootcamp. You write real TypeScript and Python microservices, deploy real vector indexes, and defend your architecture in front of seasoned engineers.',
        author: 'David Van Der Berg',
        role: 'Full-Stack AI Builder',
        initials: 'DB',
        gradient: 'from-purple-500 to-violet-500'
      }
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      {
        quote:
          'The executive AI audit and governance framework completely changed how our board evaluates vendor proposals. We avoided a costly 6-figure enterprise software mistake in month one.',
        author: 'Dr. Olumide Adeleke',
        role: 'Chief Technology Officer',
        initials: 'OA',
        gradient: 'from-amber-500 to-yellow-500'
      },
      {
        quote:
          'The ROI modeling template alone justified the tuition. We moved our operations unit from scattered employee experiments to a governed, measurable AI deployment with clear KPI tracking.',
        author: 'Sarah Jenkins',
        role: 'VP of Operations',
        initials: 'SJ',
        gradient: 'from-purple-500 to-indigo-500'
      },
      {
        quote:
          'The private executive briefings cut straight through the marketing noise. Essential strategic clarity for any leader stewarding enterprise capital and planning multi-year technological modernization.',
        author: 'Marcus Thorne',
        role: 'Managing Director',
        initials: 'MT',
        gradient: 'from-emerald-500 to-teal-500'
      }
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      {
        quote:
          'We migrated over 120 client workflows from Zapier to self-hosted n8n on our private cloud, saving more than $2,400 per month while unlocking custom Python logic and vector search.',
        author: 'David Balogun',
        role: 'Senior Systems Architect',
        initials: 'DB',
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        quote:
          'Learning Docker deployment, webhook security, and database triggers gave me the confidence to architect mission-critical data pipelines connecting our PostgreSQL database to HubSpot.',
        author: 'Zainab Kabir',
        role: 'Enterprise Integration Lead',
        initials: 'ZK',
        gradient: 'from-purple-500 to-indigo-500'
      },
      {
        quote:
          'The 50+ pre-built n8n enterprise workflow templates paid for the program on day one. I packaged self-hosted automation infrastructure as a new service for our enterprise clients.',
        author: 'Roland Mensah',
        role: 'Technical Operations Consultant',
        initials: 'RM',
        gradient: 'from-emerald-500 to-teal-500'
      }
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      {
        quote:
          'Designing for AI is completely different from designing standard SaaS. Learning how to handle token streaming, latency states, and canvas workspaces in Figma helped me land a Senior Product Designer role at an AI startup.',
        author: 'Jessica Taylor',
        role: 'Lead Product Designer',
        initials: 'JT',
        gradient: 'from-pink-500 to-rose-500'
      },
      {
        quote:
          'The Vixora Obsidian Design Kit and token architecture are exceptional. I went from struggling with static layouts to building responsive, variable-driven AI component libraries.',
        author: 'Ahmed Radwan',
        role: 'Design Systems Engineer',
        initials: 'AR',
        gradient: 'from-purple-500 to-violet-500'
      },
      {
        quote:
          'Client expectations for AI interfaces are evolving rapidly. This course gave me the exact portfolio proof—an interactive AI canvas and design system—that won my biggest client project to date.',
        author: 'Folake Davies',
        role: 'Freelance UX Consultant',
        initials: 'FD',
        gradient: 'from-blue-500 to-indigo-500'
      }
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      {
        quote:
          'We scaled our Meta ad spend from $15k to over $60k per month by testing 40+ generative video variations weekly. Our customer acquisition cost dropped by 34%.',
        author: 'Daniel Evans',
        role: 'Performance Marketing Lead',
        initials: 'DE',
        gradient: 'from-amber-500 to-orange-500'
      },
      {
        quote:
          'Creating photorealistic product scenes and synthetic UGC video in Runway and Midjourney cut our client video production timeline from three weeks to 48 hours.',
        author: 'Chioma Valentine',
        role: 'E-commerce Agency Founder',
        initials: 'CV',
        gradient: 'from-emerald-500 to-teal-500'
      },
      {
        quote:
          'The programmatic creative testing framework is gold. Instead of guessing which creative hook converts, we test systematic visual angles that reliably find winning ads.',
        author: 'Liam O’Connor',
        role: 'Paid Social Media Buyer',
        initials: 'LO',
        gradient: 'from-purple-500 to-indigo-500'
      }
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      {
        quote:
          'I closed my first ₦350,000 monthly automation retainer in week 8 of this program using the exact client acquisition scripts Dean Hammad shared. The n8n lead routing pipeline we built paid for my entire setup.',
        author: 'Kelechi Nwosu',
        role: 'Freelance Automation Specialist',
        initials: 'KN',
        gradient: 'from-purple-500 to-indigo-500'
      },
      {
        quote:
          'The jump from simple prompt tools to building real business infrastructure changed everything for my agency. Clients do not care about ChatGPT tricks; they care about systems that save them 20 hours a week.',
        author: 'Fatima Sanusi',
        role: 'Agency Founder',
        initials: 'FS',
        gradient: 'from-emerald-500 to-teal-500'
      },
      {
        quote:
          'The Vibe Coding module alone gave me the ability to build custom micro-tools for my clients without waiting on developers. Hands down the highest ROI educational investment I have made.',
        author: 'Damilola Adeleke',
        role: 'Systems Consultant',
        initials: 'DA',
        gradient: 'from-amber-500 to-yellow-500'
      }
    ];
  }

  // Default / ai-automation-digital-skills
  return [
    {
      quote:
        'I was completely overwhelmed by AI tools before this cohort. In 12 weeks, I learned how to automate my daily emails, write research briefs, and produce branded marketing materials in minutes. It completely changed how I work.',
      author: 'Grace Okafor',
      role: 'Operations Coordinator',
      initials: 'GO',
      gradient: 'from-pink-500 to-rose-500'
    },
    {
      quote:
        'As a small business owner, I could not afford an expensive marketing agency. Learning generative image workflows and AI customer reply systems saved me over ₦150,000 every single month in freelance fees.',
      author: 'Oluwaseun Bakare',
      role: 'Small Business Owner',
      initials: 'OB',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      quote:
        'The step-by-step guidance from scratch was exactly what I needed. No confusing technical jargon—just clear, practical tools that I started using on my job from week two.',
      author: 'Amina Yusuf',
      role: 'Digital Content Creator',
      initials: 'AY',
      gradient: 'from-purple-500 to-indigo-500'
    }
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Curated Related & Upsell Tracks Mapping
// ---------------------------------------------------------------------------
interface RelatedCourseMapping {
  course: AcademyCourse;
  relationType: 'Prerequisite Foundation' | 'Natural Next Progression' | 'Advanced Upsell' | 'Companion Specialization';
  pitch: string;
}

function getRelatedCourses(current: AcademyCourse): RelatedCourseMapping[] {
  const all = ACADEMY_COURSES;
  const slug = current.slug;

  if (slug === 'machine-learning-data-science') {
    return [
      {
        course: all.find(c => c.slug === 'data-analysis-cohort') || all[0],
        relationType: 'Prerequisite Foundation',
        pitch: 'Master data extraction, SQL relational queries, and Power BI dashboards before diving into advanced predictive algorithms.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Natural Next Progression',
        pitch: 'Scale your predictive models into full-stack autonomous AI applications with production LLM pipelines, vector databases, and cloud deployment.'
      },
      {
        course: all.find(c => c.slug === 'enterprise-workflow-automation') || all[5],
        relationType: 'Companion Specialization',
        pitch: 'Deploy self-hosted n8n pipelines to automate data extraction, trigger your predictive ML models, and sync scored predictions back to production databases.'
      }
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      {
        course: all.find(c => c.slug === 'machine-learning-data-science') || all[8],
        relationType: 'Natural Next Progression',
        pitch: 'The natural step after descriptive analytics: move from reporting past numbers into training predictive machine learning models.'
      },
      {
        course: all.find(c => c.slug === 'enterprise-workflow-automation') || all[5],
        relationType: 'Advanced Upsell',
        pitch: 'Build automated data pipelines that extract, transform, and sync database records across enterprise tools using self-hosted n8n.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Companion Specialization',
        pitch: 'Learn how to build custom interactive data apps, vector search engines, and analytics dashboards with modern full-stack web frameworks.'
      }
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      {
        course: all.find(c => c.slug === 'machine-learning-data-science') || all[8],
        relationType: 'Companion Specialization',
        pitch: 'Deepen your foundational statistical understanding, feature engineering, and model training capabilities behind AI systems.'
      },
      {
        course: all.find(c => c.slug === 'ai-product-design-ui-ux') || all[6],
        relationType: 'Companion Specialization',
        pitch: 'Master the streaming UI patterns, canvas workspaces, and Figma design systems needed to build world-class user interfaces for your AI agents.'
      },
      {
        course: all.find(c => c.slug === 'executive-ai-strategy') || all[4],
        relationType: 'Advanced Upsell',
        pitch: 'Learn how to pitch, budget, and align complex AI engineering initiatives with corporate C-suite executives and board members.'
      }
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      {
        course: all.find(c => c.slug === 'enterprise-workflow-automation') || all[5],
        relationType: 'Companion Specialization',
        pitch: 'Discover how self-hosted n8n and unmetered integration pipelines eliminate recurring SaaS fees and protect sensitive corporate data.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Advanced Upsell',
        pitch: 'Upskill your senior technical staff to architect resilient, scalable AI engineering infrastructure and autonomous agents.'
      },
      {
        course: all.find(c => c.slug === 'data-analysis-cohort') || all[0],
        relationType: 'Companion Specialization',
        pitch: 'Ensure operational teams have strong data literacy in SQL and Power BI to support enterprise AI readiness and KPI reporting.'
      }
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      {
        course: all.find(c => c.slug === 'data-analysis-cohort') || all[0],
        relationType: 'Companion Specialization',
        pitch: 'Combine automated n8n data flows with SQL data warehouses and executive Power BI dashboards for full-cycle business intelligence.'
      },
      {
        course: all.find(c => c.slug === 'machine-learning-data-science') || all[8],
        relationType: 'Advanced Upsell',
        pitch: 'Trigger machine learning models and predictive scoring endpoints directly from your self-hosted enterprise pipelines.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Advanced Upsell',
        pitch: 'Graduate from workflow orchestration to engineering custom full-stack autonomous AI systems with Python and TypeScript.'
      }
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Natural Next Progression',
        pitch: 'Bridge Figma prototypes into functioning full-stack AI applications with React, TypeScript, and API integrations.'
      },
      {
        course: all.find(c => c.slug === 'generative-media-advertising') || all[7],
        relationType: 'Companion Specialization',
        pitch: 'Generate high-fidelity marketing assets, synthetic UGC videos, and campaign visuals for the digital products you design.'
      },
      {
        course: all.find(c => c.slug === 'ai-automation-digital-skills') || all[1],
        relationType: 'Prerequisite Foundation',
        pitch: 'Build solid foundational fluency in core prompting, visual AI, and productivity automation tools.'
      }
    ];
  }

  if (slug === 'generative-media-advertising') {
    return [
      {
        course: all.find(c => c.slug === 'ai-product-design-ui-ux') || all[6],
        relationType: 'Companion Specialization',
        pitch: 'Design high-converting landing pages, interactive product prototypes, and coherent visual design systems for your ad campaigns.'
      },
      {
        course: all.find(c => c.slug === 'ai-automation-digital-business-systems') || all[2],
        relationType: 'Advanced Upsell',
        pitch: 'Automate customer lead capture, CRM onboarding, and invoice distribution from your high-converting advertising funnels.'
      },
      {
        course: all.find(c => c.slug === 'ai-automation-digital-skills') || all[1],
        relationType: 'Prerequisite Foundation',
        pitch: 'Gain versatile general AI productivity and visual workflow skills at an accessible rate.'
      }
    ];
  }

  if (slug === 'ai-automation-digital-skills') {
    return [
      {
        course: all.find(c => c.slug === 'ai-automation-digital-business-systems') || all[2],
        relationType: 'Natural Next Progression',
        pitch: 'The high-touch implementation tier: master n8n, Vibe Coding, client acquisition scripts, and closing ₦200,000+ monthly retainers.'
      },
      {
        course: all.find(c => c.slug === 'data-analysis-cohort') || all[0],
        relationType: 'Companion Specialization',
        pitch: 'Add rigorous Excel, SQL, and business intelligence capabilities to your digital resume for corporate roles.'
      },
      {
        course: all.find(c => c.slug === 'generative-media-advertising') || all[7],
        relationType: 'Companion Specialization',
        pitch: 'Scale your creative output with generative AI video, UGC ad creation, and digital media buying.'
      }
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      {
        course: all.find(c => c.slug === 'ai-automation-digital-skills') || all[1],
        relationType: 'Prerequisite Foundation',
        pitch: 'Recommended starting point if you need to build foundational confidence with core AI tools before client delivery.'
      },
      {
        course: all.find(c => c.slug === 'enterprise-workflow-automation') || all[5],
        relationType: 'Advanced Upsell',
        pitch: 'Scale from freelance client tools into self-hosted, unmetered enterprise n8n infrastructure with custom Python logic.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Advanced Upsell',
        pitch: 'Graduate from low-code platforms to building custom full-stack autonomous AI systems with Python and TypeScript.'
      }
    ];
  }

  // Fallback: 3 other courses from catalog
  return all
    .filter(c => c.slug !== current.slug)
    .slice(0, 3)
    .map((c, i) => ({
      course: c,
      relationType: i === 0 ? 'Natural Next Progression' : i === 1 ? 'Companion Specialization' : 'Advanced Upsell',
      pitch: c.subtitle
    }));
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT: CourseLandingPage
// ---------------------------------------------------------------------------
export function CourseLandingPage({
  course,
  onBackToAcademy,
  onEnroll,
  onSelectCourse,
  onNavigateHome
}: CourseLandingPageProps) {
  const [expandedModules, setExpandedModules] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });
  const [expandedFaqs, setExpandedFaqs] = useState<{ [key: number]: boolean }>({ 0: true, 1: true });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showStickyBanner, setShowStickyBanner] = useState(true);

  // Live ticking countdown timer
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 20, seconds: 43 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 4, minutes: 20, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleModule = (idx: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const toggleAllModules = (expand: boolean) => {
    const next: { [key: number]: boolean } = {};
    course.weeklySyllabus.forEach((_, idx) => {
      next[idx] = expand;
    });
    setExpandedModules(next);
  };

  const toggleFaq = (idx: number) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownloadSyllabus = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
    const content =
      `VIXORA ACADEMY - OFFICIAL COURSE SYLLABUS\n` +
      `Course: ${course.title}\n` +
      `Track: ${course.track}\n` +
      `Level: ${course.level}\n` +
      `Duration: ${course.duration}\n` +
      `Format: ${course.format}\n` +
      `Tuition: ${course.tuition}\n` +
      `Next Cohort: ${course.nextCohortDate}\n\n` +
      `COURSE OVERVIEW:\n${course.description}\n\n` +
      `CURRICULUM BREAKDOWN:\n` +
      course.weeklySyllabus
        .map(
          m =>
            `${m.week}: ${m.title}\n${m.description}\nKey Topics: ${m.topics.join(', ')}\nHands-On Lab: ${m.handsOnLab}\n`
        )
        .join('\n---\n') +
      `\n\nOFFICIAL ENROLLMENT PORTAL: ${BRAND_CONFIG.academyDomain}/course/${course.slug}\n` +
      `WhatsApp Admissions: ${BRAND_CONFIG.whatsapp.usAndGlobal.displayNumber} / ${BRAND_CONFIG.whatsapp.nigeria.displayNumber}`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vixora-Academy-${course.slug}-Syllabus.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSwitchToCourse = (targetCourse: AcademyCourse) => {
    if (onSelectCourse) {
      onSelectCourse(targetCourse);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Derived contextual data for the selected course
  const pricing = parseCoursePricing(course.tuition);
  const problem = getCourseProblemData(course);
  const transformationPhases = getCourseTransformationPhases(course);
  const audiencePersonas = getCourseAudiencePersonas(course);
  const prerequisitesNotNeeded = getCoursePrerequisitesNotNeeded(course);
  const valueStack = getCourseValueStack(course);
  const valueQuote = getCourseValueQuote(course);
  const testimonials = getCourseTestimonials(course);
  const relatedCourses = getRelatedCourses(course);

  return (
    <div id="course-landing-page" className="min-h-screen bg-[#070314] text-neutral-100 font-sans selection:bg-purple-600 selection:text-white pb-28">
      {/* 1. TOP BREADCRUMB & BACK NAVIGATION */}
      <nav className="sticky top-0 z-40 bg-[#0A051C]/90 backdrop-blur-md border-b border-purple-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-400 overflow-hidden">
            <button
              onClick={onBackToAcademy}
              className="inline-flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0 font-medium"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              <span>Academy Catalog</span>
            </button>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-400 hidden md:inline truncate">{course.track}</span>
            <span className="text-neutral-600 hidden md:inline">/</span>
            <span className="text-amber-300 font-semibold truncate">{course.title}</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <WhatsAppContactButton
              variant="secondary"
              label="Admissions"
              message={`Hello Vixora Admissions, I am inquiring about the ${course.title} (${course.tuition}).`}
              className="hidden sm:inline-flex py-1.5 px-3 text-xs"
            />
            <button
              onClick={() => onEnroll(course)}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-neutral-950 shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Enroll ({course.tuition})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mini Quick-Jump Navigation Ribbon */}
        <div className="border-t border-purple-900/20 bg-[#070314]/70 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-4 sm:gap-6 text-xs font-mono text-neutral-400 whitespace-nowrap">
            <button onClick={() => scrollToSection('problem')} className="hover:text-amber-300 transition-colors cursor-pointer">
              The Reality
            </button>
            <button onClick={() => scrollToSection('transformation')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Transformation
            </button>
            <button onClick={() => scrollToSection('curriculum')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Syllabus
            </button>
            <button onClick={() => scrollToSection('audience')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Who It's For
            </button>
            <button onClick={() => scrollToSection('related-tracks')} className="hover:text-amber-300 text-purple-300 font-semibold transition-colors cursor-pointer flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Related Tracks & Progression
            </button>
            <button onClick={() => scrollToSection('pricing')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Pricing
            </button>
            <button onClick={() => scrollToSection('reviews')} className="hover:text-amber-300 transition-colors cursor-pointer">
              Reviews
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-amber-300 transition-colors cursor-pointer">
              FAQ
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (Tailored to Current Course) */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-purple-900/30">
        {/* Glow backdrop elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Course Identity & Value Pitch */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Badges / Eyebrow */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-purple-950/80 border border-purple-600/50 text-purple-300">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {course.track}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-neutral-900/80 border border-neutral-700 text-neutral-300">
                  <Clock className="w-3 h-3 text-purple-400" />
                  {course.duration} &bull; {course.format}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                  <UserCheck className="w-3 h-3" />
                  {course.level}
                </span>
                {course.badge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {course.badge}
                  </span>
                )}
              </div>

              {/* Course Title */}
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.15]">
                {course.title}
              </h1>

              {/* Subtitle / Commercial Promise */}
              <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed max-w-2xl">
                {course.subtitle}
              </p>

              {/* Social Proof Cohort Badge */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 border-2 border-[#070314] flex items-center justify-center text-[10px] font-bold text-white">
                    KM
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 border-2 border-[#070314] flex items-center justify-center text-[10px] font-bold text-white">
                    FA
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 border-2 border-[#070314] flex items-center justify-center text-[10px] font-bold text-white">
                    TO
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-500 border-2 border-[#070314] flex items-center justify-center text-[10px] font-bold text-neutral-950">
                    +48
                  </div>
                </div>
                <div className="text-xs font-mono text-neutral-300">
                  <span className="text-amber-300 font-bold">{course.seatsRemaining} seats remaining</span> at early rate &bull; Next cohort:{' '}
                  <span className="text-white font-medium">{course.nextCohortDate}</span>
                </div>
              </div>

              {/* Dual Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={() => onEnroll(course)}
                  className="px-8 py-4 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Apply Now — {course.tuition}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => scrollToSection('curriculum')}
                  className="px-6 py-4 rounded-2xl text-sm font-bold bg-[#150B30] hover:bg-purple-900/40 text-purple-200 border border-purple-700/50 hover:border-purple-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>View Curriculum ({course.weeklySyllabus.length} Modules)</span>
                </button>
              </div>

              {/* Trust micro-copy */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-neutral-400 font-mono pt-1">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{course.certificateType}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Direct Mentor Office Hours</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Portfolio Capstone Defense</span>
                </div>
              </div>

            </div>

            {/* Right Column: Interactive Course Overview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl bg-gradient-to-b from-[#180C3D] to-[#0E0624] border border-purple-700/50 p-6 sm:p-7 shadow-2xl shadow-purple-950/60 space-y-6 relative overflow-hidden">
                
                {/* Header of Preview Card */}
                <div className="flex items-center justify-between border-b border-purple-800/40 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                      Cohort Overview
                    </span>
                    <h3 className="text-lg font-extrabold text-white truncate max-w-[240px] sm:max-w-xs">
                      {course.title}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    {course.tuition}
                  </span>
                </div>

                {/* Practical Preview Player / Interactive Card */}
                <div
                  onClick={() => setShowVideoModal(true)}
                  className="aspect-video rounded-2xl bg-gradient-to-tr from-purple-950 via-[#1C0D45] to-indigo-950 border border-purple-600/40 flex flex-col items-center justify-center p-4 text-center cursor-pointer group hover:border-amber-400/60 transition-all relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-400/30 group-hover:scale-110 transition-transform mb-2">
                    <Play className="w-5 h-5 fill-neutral-950 ml-0.5" />
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    Click to Preview Course Lab & Projects
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 mt-0.5">
                    {course.duration} &bull; {course.weeklySyllabus.length} Interactive Modules
                  </div>
                </div>

                {/* Key Course Highlights Stack */}
                <div className="space-y-2.5 pt-1">
                  <div className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    Included In This Program
                  </div>
                  {course.highlights.slice(0, 4).map((hl, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Action Button inside Card */}
                <button
                  onClick={() => onEnroll(course)}
                  className="w-full py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-neutral-950 shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Secure Early Seat ({course.tuition})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM (Tailored Course Reality Check) */}
      <section id="problem" className="py-20 border-b border-purple-900/30 bg-[#090418]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              {problem.tag}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {problem.headline}
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              {problem.sub}
            </p>
          </div>

          {/* 3 Problem Diagnostic Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problem.points.map((pt, idx) => (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-[#130A2B] border border-purple-800/40 hover:border-purple-600/60 transition-all space-y-3 shadow-xl"
              >
                <div className="text-3xl">{pt.icon}</div>
                <h3 className="text-base font-bold text-white">{pt.title}</h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {pt.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Highlight Quote Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#180A38] to-indigo-950/60 border border-purple-700/50 text-center max-w-3xl mx-auto">
            <p className="text-sm sm:text-base text-neutral-200 font-medium italic leading-relaxed">
              {problem.quote}
            </p>
            <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mt-3">
              — Dean Sarumi Hammad, Vixora Academy
            </div>
          </div>

        </div>
      </section>

      {/* 4. THE TRANSFORMATION (Structured 3-Phase Progression) */}
      <section id="transformation" className="py-20 border-b border-purple-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              The Learning Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Beginner to Verified Practitioner in {course.duration}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Our curriculum is structured to guarantee practical, portfolio-backed competence rather than abstract passive viewing.
            </p>
          </div>

          {/* 3 Step Transformation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {transformationPhases.map((phase, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-[#140D2D] border border-purple-800/40 relative space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-amber-400">
                      Step 0{idx + 1}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-purple-900/50 text-purple-200 border border-purple-700/40">
                      {phase.duration}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {phase.phase}
                  </h3>
                  <div className="text-xs font-semibold text-purple-300">
                    {phase.title}
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {phase.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-purple-900/40 text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hands-on labs & practical validation</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. FULL CURRICULUM SYLLABUS */}
      <section id="curriculum" className="py-20 border-b border-purple-900/30 bg-[#0A051C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400">
              Week-by-Week Breakdown
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Complete Course Curriculum
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Explore the exact weekly roadmap, tools, and hands-on capstone milestones.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => toggleAllModules(true)}
                className="text-xs font-mono text-purple-300 hover:text-white transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <span className="text-neutral-600">&bull;</span>
              <button
                onClick={() => toggleAllModules(false)}
                className="text-xs font-mono text-purple-300 hover:text-white transition-colors cursor-pointer"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Module Accordions */}
          <div className="space-y-3.5">
            {course.weeklySyllabus.map((module, idx) => {
              const isExpanded = expandedModules[idx] ?? false;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'bg-[#150B30] border-purple-600/70 shadow-lg'
                      : 'bg-[#100726] border-purple-900/40 hover:border-purple-800'
                  }`}
                >
                  <button
                    onClick={() => toggleModule(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                          {module.week}
                        </span>
                        <span className="text-neutral-500">&bull;</span>
                        <span className="text-xs font-mono text-neutral-400">{module.topics.length} Key Topics</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white">{module.title}</h3>
                    </div>

                    <div className="text-neutral-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-amber-400" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-4 border-t border-purple-900/40 text-xs sm:text-sm">
                      <p className="text-neutral-300 leading-relaxed">{module.description}</p>

                      <div className="space-y-2">
                        <div className="text-xs font-mono font-semibold text-purple-300 uppercase tracking-wider">
                          Topics Covered
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {module.topics.map((t, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-2 text-neutral-200">
                              <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {module.handsOnLab && (
                        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 space-y-1">
                          <div className="text-[11px] font-mono font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5" /> Hands-On Practical Lab
                          </div>
                          <div className="text-xs text-neutral-200 font-medium">{module.handsOnLab}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Download Full Syllabus Action */}
          <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white">Need a PDF / Text copy of this syllabus?</div>
              <p className="text-xs text-neutral-400">Download the complete module guide to share with your sponsor or employer.</p>
            </div>

            <button
              onClick={handleDownloadSyllabus}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-purple-700/50 flex items-center gap-2 cursor-pointer transition-all shrink-0"
            >
              {downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Syllabus Downloaded
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-purple-400" /> Download Syllabus
                </>
              )}
            </button>
          </div>

        </div>
      </section>

      {/* 6. WHO THIS IS FOR (Target Audience & Readiness) */}
      <section id="audience" className="py-20 border-b border-purple-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              Audience Alignment
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Is This Course Right for You?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Designed specifically for ambitious learners, career shifters, and professionals ready to build tangible commercial capabilities.
            </p>
          </div>

          {/* 4 Audience Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {audiencePersonas.map((persona, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2.5 shadow-md"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{persona.role}</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed pl-6">
                  {persona.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Prerequisites: What You Need vs Do NOT Need */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* What you do NOT need */}
            <div className="p-6 rounded-2xl bg-[#12082A] border border-neutral-800 space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <X className="w-4 h-4 text-rose-400" /> What You Do NOT Need
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
                {prerequisitesNotNeeded.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-rose-400 font-bold">&times;</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* What you DO need */}
            <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/50 space-y-3">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" /> What You DO Need
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-300">
                {course.prerequisites.map((req, rIdx) => (
                  <li key={rIdx} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 7. WHAT YOU GET (Value Stack) */}
      <section className="py-20 border-b border-purple-900/30 bg-[#090418]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              The Complete Value Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything Included When You Join
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {valueStack.map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
                <div className="text-emerald-400 font-bold text-base sm:text-lg">✅ {item.title}</div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. RELATED PROGRAMS & PROGRESSION TRACKS (Upsell & Cross-Sell Section) */}
      <section id="related-tracks" className="py-20 border-b border-purple-900/30 bg-[#0C061F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/40">
              <Compass className="w-3.5 h-3.5" /> Program Ecosystem & Upsells
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Related Programs & Progression Tracks
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Compare this course with companion tracks across Vixora Academy. Whether you want to build foundational skills first, step up to an advanced tier, or bundle complementary capabilities—explore your optimal path.
            </p>
          </div>

          {/* Comparison Matrix: Current Course vs. Recommended Upsells */}
          <div className="rounded-3xl bg-[#140D2D] border border-purple-800/50 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-purple-800/60 bg-[#090418]">
                    <th className="py-4 px-5 text-neutral-400 font-mono font-semibold uppercase text-xs">Track Dimension</th>
                    
                    {/* Current Course Column */}
                    <th className="py-4 px-5 text-white font-bold bg-purple-950/50 border-x border-purple-700/60">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-400 text-neutral-950 font-black inline-block">
                          CURRENT VIEWED TRACK
                        </span>
                        <div className="text-sm font-extrabold text-white">{course.title}</div>
                      </div>
                    </th>

                    {/* Related Courses Columns */}
                    {relatedCourses.map((rel, rIdx) => (
                      <th key={rIdx} className="py-4 px-5 text-purple-200 font-bold bg-[#170C3B]/60 border-r border-purple-800/40">
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-800/80 text-purple-200 border border-purple-600/50 font-semibold inline-block">
                            {rel.relationType}
                          </span>
                          <div className="text-sm font-extrabold text-white truncate max-w-[200px]">
                            {rel.course.title}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/30 text-neutral-300">
                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-neutral-400">Track & Domain</td>
                    <td className="py-3.5 px-5 bg-purple-950/20 border-x border-purple-700/40 font-semibold text-amber-300">
                      {course.track}
                    </td>
                    {relatedCourses.map((rel, rIdx) => (
                      <td key={rIdx} className="py-3.5 px-5 border-r border-purple-900/30">
                        {rel.course.track}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-neutral-400">Experience Level</td>
                    <td className="py-3.5 px-5 bg-purple-950/20 border-x border-purple-700/40 text-white font-medium">
                      {course.level}
                    </td>
                    {relatedCourses.map((rel, rIdx) => (
                      <td key={rIdx} className="py-3.5 px-5 border-r border-purple-900/30">
                        {rel.course.level}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-neutral-400">Duration & Format</td>
                    <td className="py-3.5 px-5 bg-purple-950/20 border-x border-purple-700/40 text-white">
                      {course.duration} &bull; {course.format}
                    </td>
                    {relatedCourses.map((rel, rIdx) => (
                      <td key={rIdx} className="py-3.5 px-5 border-r border-purple-900/30">
                        {rel.course.duration} &bull; {rel.course.format}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3.5 px-5 font-semibold text-neutral-400">Core Focus</td>
                    <td className="py-3.5 px-5 bg-purple-950/20 border-x border-purple-700/40 text-neutral-200">
                      {course.subtitle}
                    </td>
                    {relatedCourses.map((rel, rIdx) => (
                      <td key={rIdx} className="py-3.5 px-5 border-r border-purple-900/30 text-neutral-300">
                        {rel.pitch}
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-purple-950/30 font-bold">
                    <td className="py-4 px-5 text-white font-mono">Tuition & Enrollment</td>
                    
                    {/* Current Course Action */}
                    <td className="py-4 px-5 border-x border-purple-700/60 text-emerald-400 bg-purple-950/40">
                      <div className="text-base font-black text-amber-300">{course.tuition}</div>
                      <button
                        onClick={() => scrollToSection('pricing')}
                        className="mt-2 w-full py-2 px-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 text-neutral-950 hover:brightness-110 transition-all cursor-pointer text-center"
                      >
                        Enroll in This Track
                      </button>
                    </td>

                    {/* Related Course Actions */}
                    {relatedCourses.map((rel, rIdx) => (
                      <td key={rIdx} className="py-4 px-5 border-r border-purple-900/30">
                        <div className="text-base font-black text-white">{rel.course.tuition}</div>
                        <button
                          onClick={() => handleSwitchToCourse(rel.course)}
                          className="mt-2 w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#21124A] hover:bg-purple-700 text-purple-200 hover:text-white border border-purple-600/50 transition-all cursor-pointer text-center flex items-center justify-center gap-1"
                        >
                          <span>Explore Track</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Individual Upsell / Companion Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedCourses.map((rel, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#140D2D] border border-purple-800/40 hover:border-amber-400/50 transition-all space-y-4 shadow-xl flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-900/60 text-amber-300 border border-purple-600/40">
                      {rel.relationType}
                    </span>
                    <span className="text-xs font-mono font-bold text-white">
                      {rel.course.tuition}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors">
                    {rel.course.title}
                  </h3>

                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {rel.pitch}
                  </p>
                </div>

                <div className="pt-3 border-t border-purple-900/40 space-y-3">
                  <div className="text-[11px] font-mono text-neutral-400">
                    {rel.course.duration} &bull; {rel.course.format}
                  </div>
                  <button
                    onClick={() => handleSwitchToCourse(rel.course)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-purple-900/50 text-neutral-200 hover:text-white border border-purple-700/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View {rel.course.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Multi-Course Bundle & Team Inquiry Callout */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/80 via-[#180E38] to-indigo-950/80 border border-purple-700/60 flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
            <div className="space-y-1.5 max-w-xl">
              <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Looking to Bundle Multiple Tracks or Sponsor a Team?</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Connect directly with Vixora Academy admissions on WhatsApp to discuss custom bundle packages, corporate cohorts, or installment plans.
              </p>
            </div>

            <WhatsAppContactButton
              variant="primary"
              label="Inquire About Bundles"
              message={`Hello Vixora Admissions, I would like to inquire about multi-track bundle discounts or corporate enrollment for ${course.title}.`}
              className="shrink-0"
            />
          </div>

        </div>
      </section>

      {/* 9. PRICING SECTION */}
      <section id="pricing" className="py-20 border-b border-purple-900/30 bg-[#0A051C]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-amber-300 bg-amber-950/50 px-3 py-1 rounded-full border border-amber-500/40">
              <CreditCard className="w-3.5 h-3.5" /> Tuition & Early Bird Rate
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Invest in Practical, Commercial Skills
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Lock in your early applicant seat before standard admissions commence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* Early Bird Price Card (Highlighted) */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#22134F] to-[#12082E] border-2 border-amber-400/80 p-7 sm:p-8 shadow-2xl shadow-amber-500/10 space-y-6 flex flex-col justify-between">
              <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-yellow-400 text-neutral-950 shadow-md">
                ⭐ BEST VALUE &bull; LIMITED SEATS
              </div>

              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  Early Applicant Rate
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl sm:text-5xl font-black text-white">{pricing.early}</div>
                  <div className="text-sm font-mono text-neutral-500 line-through">{pricing.standard}</div>
                </div>
                <p className="text-xs text-amber-200/90 font-medium">
                  {pricing.savings} &bull; Limited seats available for next cohort
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-purple-800/40 text-xs sm:text-sm text-neutral-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> Full {course.duration} Access ({course.weeklySyllabus.length} Modules)
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> Hands-On Capstone Project & Defense
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> Official {course.certificateType}
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" /> Direct Mentor Q&A & Community Access
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onEnroll(course)}
                  className="w-full py-4 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 shadow-xl shadow-amber-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Secure Spot at {pricing.early}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Standard Price Card */}
            <div className="rounded-3xl bg-[#140D2D] border border-purple-900/40 p-7 sm:p-8 space-y-6 flex flex-col justify-between opacity-85 hover:opacity-100 transition-opacity">
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Standard Admissions Price
                </div>
                <div className="text-4xl sm:text-5xl font-black text-neutral-300">{pricing.standard}</div>
                <p className="text-xs text-neutral-400">
                  Effective after early bird period closes
                </p>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-purple-900/30 text-xs sm:text-sm text-neutral-400">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-500" /> Full {course.duration} Access</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-500" /> Capstone Project & Defense</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-500" /> Official Certificate of Completion</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-neutral-500" /> Standard Admissions Queue</div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onEnroll(course)}
                  className="w-full py-3.5 rounded-2xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-all cursor-pointer"
                >
                  Apply Standard ({pricing.standard})
                </button>
              </div>
            </div>

          </div>

          {/* Bank Payment Details Box */}
          <div className="max-w-2xl mx-auto pt-2">
            <BankPaymentDetailsCard
              courseTitle={course.title}
              tuitionAmount={pricing.early}
              onPayOnline={() => onEnroll(course)}
            />
          </div>

          {/* Value Framing Quote Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#180E38] to-indigo-950/60 border border-purple-800/40 text-center max-w-3xl mx-auto space-y-3">
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-medium italic">
              "{valueQuote}"
            </p>
            <div className="pt-2 flex justify-center">
              <WhatsAppContactButton
                variant="secondary"
                label="Have Questions? Inquire via WhatsApp"
                message={`Hello Vixora Academy! I would like to discuss enrolling in the ${course.title} at the ${course.tuition} early price.`}
              />
            </div>
          </div>

        </div>
      </section>

      {/* 10. SOCIAL PROOF & STUDENT TESTIMONIALS */}
      <section id="reviews" className="py-20 border-b border-purple-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
              Verified Student Outcomes
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Real Impact From Vixora Graduates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-[#140D2D] border border-purple-800/40 space-y-4 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex text-amber-400 gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-purple-900/40 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${t.gradient} text-white font-bold text-xs flex items-center justify-center`}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{t.author}</div>
                    <div className="text-[10px] text-amber-300 font-mono">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 11. FAQ (Course FAQs & Admissions Accordions) */}
      <section id="faq" className="py-20 border-b border-purple-900/30 bg-[#0A051C]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400">
              Got Questions?
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {course.faqs.map((faq, idx) => {
              const isExpanded = expandedFaqs[idx] ?? false;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#140D2D] border border-purple-800/40 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-purple-900/20 transition-colors cursor-pointer"
                  >
                    <span className="text-sm sm:text-base font-bold text-white">{faq.q}</span>
                    <div className="text-amber-400 shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 border-t border-purple-900/40 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Universal Admissions FAQ: Recordings & Flexibility */}
            <div className="rounded-2xl bg-[#140D2D] border border-purple-800/40 overflow-hidden">
              <button
                onClick={() => toggleFaq(99)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-purple-900/20 transition-colors cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold text-white">What if I miss a live session? Are replays available?</span>
                <div className="text-amber-400 shrink-0">
                  {expandedFaqs[99] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {expandedFaqs[99] && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-300 border-t border-purple-900/40 pt-3 leading-relaxed">
                  Yes, every live masterclass and practical lab is recorded in high definition and posted to your private student portal within 24 hours. You also receive complete source code, slides, and access to mentor office hours to ask questions.
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 12. FINAL HIGH-CONVERTING CTA SECTION */}
      <section className="py-20 bg-gradient-to-b from-[#140A30] via-[#0E0624] to-[#070314] relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/40">
            <Flame className="w-3.5 h-3.5" /> Next Cohort Starts Soon
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Stop Delaying Your Transition.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-200">
              Master {course.title}.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            {course.duration} from now, you could have a verified capstone portfolio, an official credential, and the exact capabilities hiring teams and paying clients seek.
          </p>

          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 max-w-md mx-auto text-xs font-mono text-red-300">
            ⏳ Only {course.seatsRemaining} seats left at the {course.tuition} early applicant rate.
          </div>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => onEnroll(course)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-neutral-950 shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply Now — Claim Early Rate ({course.tuition})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <WhatsAppContactButton
              variant="secondary"
              label="Chat on WhatsApp"
              message={`Hello Vixora Admissions, I would like to confirm my seat for the ${course.title} at the ${course.tuition} early price.`}
              className="w-full sm:w-auto"
            />
          </div>

          <div className="text-xs font-mono text-neutral-400 pt-2">
            {course.duration} &bull; {course.format} &bull; {course.certificateType}
          </div>

        </div>
      </section>

      {/* 13. PERSISTENT / STICKY EARLY-BIRD OFFER BANNER */}
      {showStickyBanner && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#160B33]/95 backdrop-blur-xl border-t border-amber-400/40 py-3 px-4 sm:px-6 shadow-2xl shadow-black/80">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Left: Offer Details */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white font-mono text-[11px] font-extrabold uppercase shrink-0">
                <Flame className="w-3 h-3" /> Special offer
              </div>

              <div>
                <div className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                  <span className="text-neutral-400 line-through text-xs font-mono">{pricing.standard}</span>
                  <span className="text-amber-400 font-mono">{pricing.early}</span>
                  <span className="text-xs font-normal text-amber-200 hidden md:inline">
                    — {pricing.savings} limited early applicant rate
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 hidden lg:block">
                  Cohort begins {course.nextCohortDate}. {course.seatsRemaining} seats remaining at early price.
                </div>
              </div>
            </div>

            {/* Right: Live Countdown & Action Button */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* Countdown Ticker */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-[11px] text-neutral-400 hidden md:inline">expires in</span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 text-amber-300 font-bold border border-amber-400/30">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-neutral-500 font-bold">:</span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 text-amber-300 font-bold border border-amber-400/30">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-neutral-500 font-bold">:</span>
                <span className="px-2 py-0.5 rounded bg-neutral-900 text-amber-300 font-bold border border-amber-400/30">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onEnroll(course)}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-neutral-950 shadow-md shadow-amber-500/30 transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Claim {pricing.early}</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setShowStickyBanner(false)}
                className="text-neutral-400 hover:text-white p-1 transition-colors cursor-pointer"
                title="Dismiss Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 14. INTERACTIVE COURSE OVERVIEW VIDEO/LAB PREVIEW MODAL */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#12082A] border border-purple-600/50 rounded-3xl overflow-hidden p-6 sm:p-8 space-y-5 shadow-2xl">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-mono border border-amber-400/30">
                <Sparkles className="w-3 h-3" /> {course.title}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Course Walkthrough & Practical Lab Preview
              </h3>
            </div>

            <div className="aspect-video rounded-2xl bg-gradient-to-tr from-purple-950 via-[#180A38] to-indigo-950 border border-purple-500/40 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
              <div className="w-14 h-14 rounded-full bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-400/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-white">{course.duration} Practical Mastery Cohort</div>
              <p className="text-xs text-neutral-300 max-w-md">
                {course.description}
              </p>
              {course.capstoneProjects[0] && (
                <div className="text-[11px] font-mono text-amber-300 bg-purple-900/60 px-3 py-1 rounded-full border border-purple-700/50">
                  Capstone: {course.capstoneProjects[0].title}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setShowVideoModal(false);
                  onEnroll(course);
                }}
                className="py-3 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-all cursor-pointer text-center"
              >
                Enroll Now ({course.tuition})
              </button>
              <button
                onClick={() => setShowVideoModal(false)}
                className="py-3 rounded-xl text-xs font-medium bg-neutral-900 hover:bg-neutral-800 text-neutral-300 transition-colors cursor-pointer text-center"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
