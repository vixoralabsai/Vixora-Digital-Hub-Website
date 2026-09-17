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
  const track = course.track;

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

  if (slug === 'ai-automation-digital-skills') {
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

  if (track === 'Design & Marketing') {
    return {
      tag: 'THE CREATIVE PRODUCTION REVOLUTION',
      headline: 'Traditional Creative Production Is Too Slow. Generative Systems Scale Overnight.',
      sub: 'Brands and agencies demand rapid creative iteration, bespoke ad variants, and dynamic UI prototypes. Creative professionals who combine design intuition with generative AI tools dominate the market.',
      points: [
        {
          icon: '🎨',
          title: 'Hyper-Fast Asset Generation',
          desc: 'Produce high-converting ad variations, product imagery, and video assets in hours rather than waiting on traditional production cycles.'
        },
        {
          icon: '📐',
          title: 'AI-Native UI/UX & Prototypes',
          desc: 'Translate user journeys into functional interactive prototypes and dynamic design systems at unprecedented velocity.'
        },
        {
          icon: '💼',
          title: 'Higher Margins for Creatives',
          desc: 'Agencies and freelancers charge premium campaign retainers while leveraging AI workflows to reduce internal production overhead.'
        }
      ],
      quote:
        '"Creatives who master generative workflows are not being replaced—they are outperforming traditional agencies and delivering superior client ROI."'
    };
  }

  // General fallback for other specialized courses
  return {
    tag: `THE ${course.track.toUpperCase()} REALITY`,
    headline: `Unlock Modern Commercial Competence in ${course.title}.`,
    sub: course.description,
    points: [
      {
        icon: '🎯',
        title: 'Market-Relevant Practical Skills',
        desc: course.highlights[0] || 'Learn industry-standard tools and methodologies directly from active industry practitioners.'
      },
      {
        icon: '💼',
        title: 'Portfolio & Tangible Deliverables',
        desc: course.highlights[1] || 'Graduate with verified capstone projects and live artifacts that prove your capability to employers and clients.'
      },
      {
        icon: '🚀',
        title: 'Mentorship & Professional Network',
        desc: course.highlights[2] || 'Accelerate your progress with live feedback, cohort collaboration, and personalized review.'
      }
    ],
    quote: `"${course.heroPitch || course.subtitle}"`
  };
}

// ---------------------------------------------------------------------------
// HELPER: Dynamic 3-Phase Transformation from Course Syllabus
// ---------------------------------------------------------------------------
function getCourseTransformationPhases(course: AcademyCourse) {
  const syllabus = course.weeklySyllabus;
  const total = syllabus.length;

  if (total === 0) {
    return [
      {
        phase: 'Phase 1: Foundations & Core Tools',
        duration: 'Initial Weeks',
        title: 'Fundamental Architecture & Setup',
        description: 'Set up your professional environment and master core principles, tools, and best practices.'
      },
      {
        phase: 'Phase 2: Applied Workflows & Real Projects',
        duration: 'Core Program',
        title: 'Implementation & Complex Pipelines',
        description: 'Build real-world workflows, solve domain problems, and implement practical solutions.'
      },
      {
        phase: 'Phase 3: Capstone Defense & Career Readiness',
        duration: 'Final Phase',
        title: 'Production Deployment & Certification',
        description: 'Complete your capstone defense, receive your accredited credential, and polish your portfolio.'
      }
    ];
  }

  const p1End = Math.max(1, Math.floor(total / 3));
  const p2End = Math.max(p1End + 1, Math.floor((2 * total) / 3));

  const p1Modules = syllabus.slice(0, p1End);
  const p2Modules = syllabus.slice(p1End, p2End);
  const p3Modules = syllabus.slice(p2End);

  return [
    {
      phase: 'Phase 1: Core Foundations & Workflows',
      duration: `${p1Modules[0]?.week || 'Week 1'} – ${p1Modules[p1Modules.length - 1]?.week || 'Week 3'}`,
      title: p1Modules[0]?.title || 'Foundations & Tooling',
      description: p1Modules.map(m => m.title).join(' • ')
    },
    {
      phase: 'Phase 2: Advanced Implementation & Pipelines',
      duration: `${p2Modules[0]?.week || 'Mid Program'} – ${p2Modules[p2Modules.length - 1]?.week || 'Late Program'}`,
      title: p2Modules[0]?.title || 'Applied Problem Solving',
      description: p2Modules.map(m => m.title).join(' • ')
    },
    {
      phase: 'Phase 3: Capstone, Deployment & Monetization',
      duration: `${p3Modules[0]?.week || 'Final Weeks'} – ${p3Modules[p3Modules.length - 1]?.week || 'Graduation'}`,
      title: p3Modules[p3Modules.length - 1]?.title || 'Capstone Project & Credential Defense',
      description: p3Modules.map(m => m.title).join(' • ')
    }
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Dynamic Course Audience Personas
// ---------------------------------------------------------------------------
function getCourseAudiencePersonas(course: AcademyCourse) {
  const slug = course.slug;
  const track = course.track;

  if (slug === 'machine-learning-data-science') {
    return [
      {
        role: 'Aspiring Data Scientists',
        desc: 'Graduates and professionals seeking to step into machine learning, predictive analytics, and algorithmic model building.'
      },
      {
        role: 'Data & Business Analysts',
        desc: 'Analysts who already work with Excel/SQL and want to upgrade their career with Python, Scikit-Learn, and statistical modeling.'
      },
      {
        role: 'Software Developers & Engineers',
        desc: 'Engineers wanting to understand ML workflows, model evaluation, and how to embed predictive models into applications.'
      },
      {
        role: 'STEM Graduates & Career Switchers',
        desc: 'Motivated learners from engineering, math, finance, or sciences seeking high-value skills and portfolio proof.'
      }
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      {
        role: 'Career Changers',
        desc: 'Individuals looking to transition into a secure, well-paying tech career without needing a computer science degree.'
      },
      {
        role: 'Business & Finance Professionals',
        desc: 'Professionals who spend hours wrestling with manual spreadsheets and want to automate analytics with SQL and Power BI.'
      },
      {
        role: 'Recent University Graduates',
        desc: 'Graduates looking for practical, commercial skills that make their CV stand out to employers immediately.'
      },
      {
        role: 'Entrepreneurs & Managers',
        desc: 'Founders and team leads who need clear, data-driven dashboards to make informed commercial choices.'
      }
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      {
        role: 'Freelancers & Consultants',
        desc: 'Service providers ready to stop trading hours for low fees and package recurring $1k-$3k/mo automation retainers.'
      },
      {
        role: 'Agency Owners & Builders',
        desc: 'Digital agencies expanding their service catalog with custom AI lead pipelines, CRM automations, and Vibe Coding.'
      },
      {
        role: 'Operations & IT Managers',
        desc: 'Professionals tasked with modernizing company infrastructure and automating redundant manual workflows.'
      },
      {
        role: 'Ambitious Career Professionals',
        desc: 'Knowledge workers wanting to position themselves as the indispensable AI systems lead in their company.'
      }
    ];
  }

  if (slug === 'ai-automation-digital-skills') {
    return [
      {
        role: 'Complete Beginners to AI',
        desc: 'Anyone who wants to cut through the confusion and learn how to use modern AI tools step by step from zero.'
      },
      {
        role: 'Office Workers & Administrators',
        desc: 'Professionals wanting to complete reports, correspondence, and research in minutes instead of hours.'
      },
      {
        role: 'Content Creators & Marketers',
        desc: 'Writers and social managers looking to amplify their output with generative copy and multimedia workflows.'
      },
      {
        role: 'Small Business Owners',
        desc: 'Entrepreneurs who want to automate lead responses and customer communication on a lean budget.'
      }
    ];
  }

  if (track === 'Engineering & AI') {
    return [
      {
        role: 'Full-Stack Developers',
        desc: 'Engineers who want to build end-to-end AI applications, master vector databases, and implement autonomous agent patterns.'
      },
      {
        role: 'Backend & Systems Engineers',
        desc: 'Developers building resilient LLM orchestration layers, caching, and enterprise retrieval architectures.'
      },
      {
        role: 'Technical Founders',
        desc: 'Builders creating AI-native SaaS solutions who need production-grade performance from day one.'
      },
      {
        role: 'Computer Science Graduates',
        desc: 'Graduates looking to bypass entry-level queues and enter the high-compensation AI engineering space.'
      }
    ];
  }

  if (track === 'Executive & Leadership') {
    return [
      {
        role: 'C-Suite Executives (CEO, COO, CTO)',
        desc: 'Corporate leaders directing strategic tech investments, risk mitigation, and executive AI adoption.'
      },
      {
        role: 'Business Unit Directors & VPs',
        desc: 'Department heads tasked with improving margin efficiency and scaling departmental output through automation.'
      },
      {
        role: 'Management Consultants',
        desc: 'Advisors who need rigorous, practical frameworks to evaluate client AI readiness and ROI.'
      },
      {
        role: 'Enterprise Innovation Leads',
        desc: 'Transformation leads driving institutional change without getting trapped in vendor hype.'
      }
    ];
  }

  // Default personas
  return [
    {
      role: 'Career Switchers & Up-skillers',
      desc: 'Professionals seeking market-tested modern capabilities to accelerate their salary and career trajectory.'
    },
    {
      role: 'Freelancers & Service Providers',
      desc: 'Solopreneurs looking to package specialized, high-margin client services with verified credentialing.'
    },
    {
      role: 'Business & Operations Leads',
      desc: 'Operators who need hands-on competence to lead teams and build streamlined commercial workflows.'
    },
    {
      role: 'Ambitious Learners & Graduates',
      desc: 'Driven learners who want verifiable capstone portfolio evidence rather than passive video lectures.'
    }
  ];
}

// ---------------------------------------------------------------------------
// HELPER: Course-Specific Testimonials & Social Proof
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
  const track = course.track;

  if (slug === 'machine-learning-data-science') {
    return [
      {
        quote:
          'I went from struggling with abstract math to building Scikit-Learn predictive pipelines and deploying a real Flask API. The capstone project was the centerpiece of my interview for an Associate ML role.',
        author: 'Kelechi M.',
        role: 'Associate Machine Learning Analyst',
        initials: 'KM',
        gradient: 'from-blue-500 to-indigo-500'
      },
      {
        quote:
          'The hands-on data cleaning and model evaluation modules gave me genuine competence. I stopped guessing which algorithm to use and learned how to properly validate predictive performance.',
        author: 'Fatima B.',
        role: 'Junior Data Scientist',
        initials: 'FB',
        gradient: 'from-purple-500 to-pink-500'
      },
      {
        quote:
          'Structured, demanding, and intensely practical. Building an end-to-end churn prediction model during the cohort gave me the exact portfolio evidence I needed to land my first international remote contract.',
        author: 'Tunde O.',
        role: 'Data Science Practitioner',
        initials: 'TO',
        gradient: 'from-emerald-500 to-teal-500'
      }
    ];
  }

  if (slug === 'data-analysis-cohort') {
    return [
      {
        quote:
          'Before this course, I only used Excel for basic tables. Now I write multi-table SQL queries and build live Power BI dashboards. I landed a promotion to Business Analyst within 3 months.',
        author: 'Chidinma O.',
        role: 'Business Operations Analyst',
        initials: 'CO',
        gradient: 'from-amber-500 to-yellow-500'
      },
      {
        quote:
          'The mentor support made all the difference. Learning relational databases and data visualization step-by-step removed all the intimidation. Highly recommended for any career switcher.',
        author: 'Emmanuel K.',
        role: 'Data & BI Analyst',
        initials: 'EK',
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        quote:
          'Having a live capstone portfolio on GitHub and Power BI Service helped me pass technical assessment tests that had previously rejected me.',
        author: 'David K.',
        role: 'Financial Data Analyst',
        initials: 'DK',
        gradient: 'from-purple-500 to-indigo-500'
      }
    ];
  }

  if (slug === 'ai-automation-digital-business-systems') {
    return [
      {
        quote:
          'I closed my first ₦200,000 automation project for a real estate client two months into the program. The proposal templates and n8n modules paid for the course many times over.',
        author: 'Femi A.',
        role: 'Freelance Automation Specialist',
        initials: 'FA',
        gradient: 'from-purple-500 to-indigo-500'
      },
      {
        quote:
          'The mentorship alone was priceless. I stopped guessing and started building reliable multi-step workflows connecting CRMs, webhooks, and AI document parsing that clients eagerly pay for.',
        author: 'Ngozi E.',
        role: 'Agency Founder & Automation Lead',
        initials: 'NE',
        gradient: 'from-emerald-500 to-teal-500'
      },
      {
        quote:
          'This is the clear difference between knowing AI tools and getting paid for AI. The client acquisition framework turned my technical skill into predictable monthly retainer income.',
        author: 'David K.',
        role: 'Systems & AI Consultant',
        initials: 'DK',
        gradient: 'from-amber-500 to-yellow-500'
      }
    ];
  }

  if (slug === 'ai-automation-digital-skills') {
    return [
      {
        quote:
          'I went from being totally confused by AI to building practical automations for my business. I save at least 10 hours a week on customer replies and report generation.',
        author: 'Blessing U.',
        role: 'Small Business Owner',
        initials: 'BU',
        gradient: 'from-pink-500 to-rose-500'
      },
      {
        quote:
          'I added practical AI automation skills to my CV after graduation and got called for 3 interviews in two weeks. It set me apart from everyone else applying.',
        author: 'Tunde A.',
        role: 'Operations Coordinator',
        initials: 'TA',
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        quote:
          'The 12 weeks flew by. Hands-on labs, patient instructors, and real templates. Best educational investment I made this year.',
        author: 'Sarah M.',
        role: 'Digital Content Creator',
        initials: 'SM',
        gradient: 'from-purple-500 to-indigo-500'
      }
    ];
  }

  if (track === 'Engineering & AI') {
    return [
      {
        quote:
          'Building production-grade autonomous agents and multi-stage RAG systems in this cohort took my engineering skill to a global standard.',
        author: 'Chinedu E.',
        role: 'AI Software Engineer',
        initials: 'CE',
        gradient: 'from-indigo-500 to-cyan-500'
      },
      {
        quote:
          'The rigorous focus on latency, semantic caching, and real evaluation suites bridged the gap between toy AI wrappers and enterprise software.',
        author: 'Alexandre P.',
        role: 'Senior Backend Engineer',
        initials: 'AP',
        gradient: 'from-emerald-500 to-teal-500'
      },
      {
        quote:
          'Direct code reviews from experienced AI architects pushed me to write clean, maintainable TypeScript and Python AI services.',
        author: 'Tariq H.',
        role: 'Full-Stack AI Builder',
        initials: 'TH',
        gradient: 'from-purple-500 to-violet-500'
      }
    ];
  }

  // Fallback for other courses
  return [
    {
      quote:
        `The structured training and practical assignments in ${course.title} gave me the confidence and portfolio to achieve immediate results in my daily work.`,
      author: 'Adeola S.',
      role: 'Program Graduate',
      initials: 'AS',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      quote:
        'Zero fluff, direct mentor interaction, and real-world project deliverables. Vixora Academy delivers unmatched practical depth.',
      author: 'Michael B.',
      role: 'Industry Specialist',
      initials: 'MB',
      gradient: 'from-amber-500 to-yellow-500'
    },
    {
      quote:
        'The verifiable certificate and hands-on capstone gave me immediate credibility with leadership and external clients.',
      author: 'Chioma N.',
      role: 'Growth & Operations Specialist',
      initials: 'CN',
      gradient: 'from-emerald-500 to-teal-500'
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
        relationType: 'Advanced Upsell',
        pitch: 'Scale your predictive models into full-stack autonomous AI applications with production LLM pipelines and cloud deployment.'
      },
      {
        course: all.find(c => c.slug === 'ai-automation-digital-business-systems') || all[2],
        relationType: 'Companion Specialization',
        pitch: 'Connect your predictive insights directly into automated client business workflows and high-margin retainers.'
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
        course: all.find(c => c.slug === 'ai-automation-digital-skills') || all[1],
        relationType: 'Companion Specialization',
        pitch: 'Automate repetitive reporting tasks and customer communication with practical AI prompt & workflow tools.'
      },
      {
        course: all.find(c => c.slug === 'enterprise-workflow-automation') || all[5],
        relationType: 'Advanced Upsell',
        pitch: 'Build automated data pipelines that extract, transform, and sync database records across enterprise tools using n8n.'
      }
    ];
  }

  if (slug === 'ai-automation-digital-skills') {
    return [
      {
        course: all.find(c => c.slug === 'ai-automation-digital-business-systems') || all[2],
        relationType: 'Advanced Upsell',
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
        pitch: 'Recommended starting point if you are a complete beginner seeking to build confidence with core AI tools before client delivery.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Advanced Upsell',
        pitch: 'Graduate from low-code platforms to building custom full-stack autonomous AI systems with Python and TypeScript.'
      },
      {
        course: all.find(c => c.slug === 'machine-learning-data-science') || all[8],
        relationType: 'Companion Specialization',
        pitch: 'Add predictive analytics and machine learning algorithms to your business consulting and automation proposals.'
      }
    ];
  }

  if (slug === 'fullstack-ai-engineering') {
    return [
      {
        course: all.find(c => c.slug === 'machine-learning-data-science') || all[8],
        relationType: 'Companion Specialization',
        pitch: 'Deepen your foundational statistical understanding, feature engineering, and model training capabilities.'
      },
      {
        course: all.find(c => c.slug === 'executive-ai-strategy') || all[4],
        relationType: 'Advanced Upsell',
        pitch: 'Learn how to pitch, budget, and align complex AI engineering initiatives with corporate C-suite executives.'
      },
      {
        course: all.find(c => c.slug === 'ai-automation-digital-business-systems') || all[2],
        relationType: 'Companion Specialization',
        pitch: 'Deploy rapid client business solutions using low-code automation tools alongside your custom code.'
      }
    ];
  }

  if (slug === 'executive-ai-strategy') {
    return [
      {
        course: all.find(c => c.slug === 'ai-automation-digital-business-systems') || all[2],
        relationType: 'Companion Specialization',
        pitch: 'Sponsor key operational managers to master practical automation workflows and department-level implementation.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Advanced Upsell',
        pitch: 'Upskill your senior technical staff to architect resilient, scalable AI engineering infrastructure.'
      },
      {
        course: all.find(c => c.slug === 'data-analysis-cohort') || all[0],
        relationType: 'Companion Specialization',
        pitch: 'Ensure operational teams have strong data literacy in SQL and Power BI to support enterprise AI readiness.'
      }
    ];
  }

  if (slug === 'enterprise-workflow-automation') {
    return [
      {
        course: all.find(c => c.slug === 'ai-automation-digital-business-systems') || all[2],
        relationType: 'Natural Next Progression',
        pitch: 'Learn the commercial side of automation: client acquisition, discovery calls, and selling monthly retainers.'
      },
      {
        course: all.find(c => c.slug === 'data-analysis-cohort') || all[0],
        relationType: 'Companion Specialization',
        pitch: 'Combine automated n8n data flows with SQL data warehouses and executive Power BI dashboards.'
      },
      {
        course: all.find(c => c.slug === 'machine-learning-data-science') || all[8],
        relationType: 'Advanced Upsell',
        pitch: 'Trigger machine learning models and predictive scoring endpoints directly from your enterprise workflows.'
      }
    ];
  }

  if (slug === 'ai-product-design-ui-ux') {
    return [
      {
        course: all.find(c => c.slug === 'generative-media-advertising') || all[7],
        relationType: 'Companion Specialization',
        pitch: 'Generate high-fidelity marketing assets, UGC videos, and campaign visuals for the products you design.'
      },
      {
        course: all.find(c => c.slug === 'fullstack-ai-engineering') || all[3],
        relationType: 'Advanced Upsell',
        pitch: 'Bridge UI/UX design with full-stack engineering to build your own functional AI product prototypes.'
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
        pitch: 'Design stunning user experiences, landing pages, and interactive product prototypes for ad campaigns.'
      },
      {
        course: all.find(c => c.slug === 'ai-automation-digital-skills') || all[1],
        relationType: 'Prerequisite Foundation',
        pitch: 'Gain versatile general AI productivity and visual workflow skills at an accessible rate.'
      },
      {
        course: all.find(c => c.slug === 'ai-automation-digital-business-systems') || all[2],
        relationType: 'Advanced Upsell',
        pitch: 'Automate customer lead capture, CRM onboarding, and invoice distribution from your advertising funnels.'
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
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">&times;</span> Prior computer science degree or PhD
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">&times;</span> Years of complex coding background
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-rose-400 font-bold">&times;</span> Expensive high-end computing servers
                </li>
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
            <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
              <div className="text-emerald-400 font-bold text-base sm:text-lg">✅ {course.duration} Structured Curriculum</div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Step-by-step masterclasses spanning {course.weeklySyllabus.length} modules, designed with zero fluff and maximum real-world execution.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
              <div className="text-emerald-400 font-bold text-base sm:text-lg">✅ Portfolio Capstone Project</div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Build real-world client-ready deliverables: {course.capstoneProjects[0]?.title || 'A practical capstone project'} to display in your portfolio.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
              <div className="text-emerald-400 font-bold text-base sm:text-lg">✅ Official Accredited Certificate</div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Verifiable {course.certificateType} signed by Dean Sarumi Hammad to showcase on your LinkedIn profile and CV.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
              <div className="text-emerald-400 font-bold text-base sm:text-lg">✅ Mentor Office Hours & Q&A</div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Direct guidance, code reviews, and live Q&A sessions throughout the cohort so you never get stuck.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
              <div className="text-emerald-400 font-bold text-base sm:text-lg">✅ Real Business Commercial Context</div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Learn not just the tools, but how they translate into billable freelance services, promotions, or commercial projects.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#140D2D] border border-purple-800/40 space-y-2">
              <div className="text-emerald-400 font-bold text-base sm:text-lg">✅ Hybrid Access & Community</div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Access live virtual sessions, interactive practical labs, recorded replays, and our active builder network.
              </p>
            </div>
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
            />
          </div>

          {/* Value Framing Quote Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#180E38] to-indigo-950/60 border border-purple-800/40 text-center max-w-3xl mx-auto space-y-3">
            <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-medium italic">
              "The commercial capabilities gained in {course.title} will pay for themselves the moment you implement your first automated solution, deliver your first project, or secure your target role."
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
