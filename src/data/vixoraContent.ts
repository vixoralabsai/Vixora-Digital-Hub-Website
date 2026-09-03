export interface SolutionItem {
  name: string;
  description: string;
  iconName: string;
  badge?: string;
  capabilities: string[];
}

export interface SolutionCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  items: SolutionItem[];
}

export interface IndustrySpec {
  id: string;
  name: string;
  icon: string;
  summary: string;
  useCases: string[];
  impactMetric: string;
  techFocus: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  subtitle: string;
  duration: string;
  deliverables: string[];
  description: string;
}

export interface TechItem {
  name: string;
  category: 'Backend' | 'Frontend' | 'Database' | 'Cloud & DevOps' | 'AI & Automation' | 'Design & Tooling';
  role: string;
  icon: string;
  badge?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  client: string;
  businessProblem: string;
  solution: string;
  technologiesUsed: string[];
  outcome: string;
  outcomeStats: string;
  imageUrl?: string;
}

export interface ServiceDetail {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: string;
  tagline: string;
}

export interface MetricItem {
  value: string;
  label: string;
  subtext: string;
  highlight: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  industry: string;
  rating: number;
  avatarUrl?: string;
}

export interface InsightItem {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  author: string;
}

export interface AcademyCourse {
  id: string;
  title: string;
  format: string;
  duration: string;
  targetAudience: string;
  description: string;
  curriculum: string[];
}

// -------------------------------------------------------------
// VIXORA DATA STRUCTURES
// -------------------------------------------------------------

export const HERO_CONTENT = {
  headline: "Build Smarter Businesses with Software, AI & Automation",
  supportingText: "From custom software and websites to AI automation, branding, media buying, and creative production—we help businesses grow with modern technology.",
  primaryCTA: "Start Your Project",
  secondaryCTA: "Explore Services",
  statsBadge: "⚡ Powering Next-Gen Enterprise & SME Transformations",
  liveStats: [
    { label: "Uptime & Reliability", val: "99.98%" },
    { label: "Avg. Automation ROI", val: "4.2x" },
    { label: "Deployment Velocity", val: "10x Faster" }
  ]
};

export const TRUSTED_BRANDS = [
  { name: "Apex Global Health", category: "Healthcare" },
  { name: "Stratum Capital", category: "FinTech" },
  { name: "EduNexus Academy", category: "EdTech" },
  { name: "Lumina Real Estate", category: "PropTech" },
  { name: "Kinetix Logistics", category: "Supply Chain" },
  { name: "Novus Retail Group", category: "E-Commerce" },
];

export const SOLUTIONS_CATEGORIES: SolutionCategory[] = [
  {
    id: "growth",
    title: "Business Growth",
    subtitle: "Custom digital infrastructure that scales revenue and operational efficiency.",
    icon: "TrendingUp",
    items: [
      {
        name: "Website Development",
        description: "High-performance, conversion-optimized web applications with modern UX, blazing speeds, and enterprise responsiveness.",
        iconName: "Globe",
        badge: "Core Stack",
        capabilities: ["Next.js & React 19 architecture", "SEO & Core Web Vitals optimization", "Headless CMS & custom integrations", "Multi-language & localization"]
      },
      {
        name: "Software Development",
        description: "Bespoke full-stack web and cloud systems engineered for complex logic, mission-critical workflows, and enterprise compliance.",
        iconName: "Code2",
        badge: "Enterprise",
        capabilities: ["Custom Python & FastAPI backends", "Scalable microservices & REST/GraphQL APIs", "Role-based access control (RBAC)", "High-concurrency database design"]
      },
      {
        name: "SaaS Development",
        description: "End-to-end multi-tenant Software as a Service product development from MVP architecture to production scale.",
        iconName: "Layers",
        badge: "High Growth",
        capabilities: ["Multi-tenant subscription billing & Stripe", "Automated customer onboarding", "Real-time analytics dashboards", "Automated deployment pipelines"]
      }
    ]
  },
  {
    id: "ai",
    title: "AI Solutions",
    subtitle: "Autonomous intelligence, LLM workflows, and generative media to eliminate operational bottlenecks.",
    icon: "Bot",
    items: [
      {
        name: "AI Automation",
        description: "Intelligent end-to-end process orchestration that connects your existing tools and executes high-volume tasks without human delays.",
        iconName: "Cpu",
        badge: "Most Popular",
        capabilities: ["n8n & Zapier workflow orchestration", "ERP & CRM custom AI synchronization", "Document OCR & auto-parsing", "Data extraction & reporting triggers"]
      },
      {
        name: "AI Agents",
        description: "Autonomous goal-seeking agents that research, reason, make decisions, and execute multi-step business actions 24/7.",
        iconName: "Sparkles",
        badge: "Agentic AI",
        capabilities: ["Autonomous decision engines", "Multi-agent swarm coordination", "Tool calling & API execution", "Continuous context learning"]
      },
      {
        name: "AI Chatbots",
        description: "Omnichannel natural language customer support bots grounded in your proprietary knowledge base.",
        iconName: "MessageSquare",
        badge: "24/7 Support",
        capabilities: ["RAG with Supabase vector embeddings", "WhatsApp, Web & Telegram omnichannel", "Human agent escalation protocols", "Sentiment & intent analytics"]
      },
      {
        name: "AI Image Generation",
        description: "Commercial-ready studio assets, product mockups, lifestyle photography, and branded visual campaigns generated on demand.",
        iconName: "Image",
        badge: "Creative AI",
        capabilities: ["High-fidelity brand style tuning", "Product background replacement", "Social media visual kits", "Batch asset generation"]
      },
      {
        name: "AI Video Generation",
        description: "AI-driven high-converting video commercials, synthetic spokesperson presentations, and dynamic video ads at scale.",
        iconName: "Video",
        badge: "UGC Scale",
        capabilities: ["AI video avatar narration", "Automated script-to-video pipelines", "Multilingual lip-sync dubbing", "Short-form viral reel generators"]
      }
    ]
  },
  {
    id: "marketing",
    title: "Marketing & Growth",
    subtitle: "Data-driven creative branding and paid acquisition engines that generate predictable customer pipeline.",
    icon: "Megaphone",
    items: [
      {
        name: "Branding & Identity",
        description: "Comprehensive corporate brand guidelines, visual systems, typographic hierarchies, and brand strategy that commands authority.",
        iconName: "Palette",
        badge: "Identity",
        capabilities: ["Logo design & brand styleguides", "UI/UX design systems in Figma", "Tone of voice & messaging decks", "Collateral & pitch deck design"]
      },
      {
        name: "Media Buying",
        description: "Algorithmic paid advertising management across Meta, Google Ads, TikTok, and LinkedIn targeting high-intent buyers.",
        iconName: "Target",
        badge: "High ROI",
        capabilities: ["Full-funnel attribution tracking", "Creative A/B testing matrix", "Audience segment personalization", "ROAS & conversion scaling"]
      },
      {
        name: "UGC Ads",
        description: "User-generated style video and social ad creatives produced to maximize engagement, lower CAC, and boost CTR.",
        iconName: "Film",
        badge: "Viral Growth",
        capabilities: ["Creator network coordination", "Direct-response ad scripting", "Hook & angle iteration testing", "High-velocity weekly drops"]
      }
    ]
  },
  {
    id: "education",
    title: "Education & Academy",
    subtitle: "Upskilling teams and aspiring builders with cutting-edge software engineering and AI mastery.",
    icon: "GraduationCap",
    items: [
      {
        name: "Vixora Academy",
        description: "Intensive cohort-based training in modern full-stack development, AI engineering, prompt design, and digital entrepreneurship.",
        iconName: "BookOpen",
        badge: "Flagship",
        capabilities: ["Hands-on project-based curriculum", "Mentorship from senior engineers", "Certification & career placement assistance", "Lifetime alumni network access"]
      },
      {
        name: "Corporate Training",
        description: "Tailored enterprise upskilling programs to help company workforces adopt generative AI, automation tools, and modern dev workflows.",
        iconName: "Users",
        badge: "Enterprise",
        capabilities: ["Executive AI strategy briefings", "Departmental workflow automation labs", "Security & governance compliance", "Custom company LMS modules"]
      },
      {
        name: "Workshops & Masterclasses",
        description: "Focused single-day intensives covering specific breakthrough tech like n8n automation, LLM fine-tuning, and growth engineering.",
        iconName: "Calendar",
        badge: "Interactive",
        capabilities: ["Live coding & building sessions", "Downloadable templates & boilerplate", "Q&A with technical architects", "Recorded replay library"]
      }
    ]
  }
];

export const INDUSTRIES: IndustrySpec[] = [
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "HeartPulse",
    summary: "HIPAA-conscious telehealth portals, patient scheduling automation, and AI triage systems.",
    useCases: ["Automated patient intake & reminders", "Secure doctor-patient communication hubs", "Medical document parsing"],
    impactMetric: "-65% Admin Overheads",
    techFocus: "FastAPI, PostgreSQL & Encrypted WebRTC"
  },
  {
    id: "education",
    name: "Education & EdTech",
    icon: "GraduationCap",
    summary: "Custom LMS platforms, interactive student evaluation systems, and AI tutoring assistants.",
    useCases: ["Gamified online learning portals", "Automated assignment grading with feedback", "Live virtual classroom management"],
    impactMetric: "+88% Student Engagement",
    techFocus: "Next.js, Supabase & Vector Search"
  },
  {
    id: "realestate",
    name: "Real Estate & PropTech",
    icon: "Building2",
    summary: "Dynamic property listing engines, 3D tour integrations, and automated WhatsApp lead qualifiers.",
    useCases: ["AI property valuation calculators", "Automated broker lead distribution", "Virtual tenant contract signing"],
    impactMetric: "3.5x Faster Deal Closures",
    techFocus: "React 19, Google Maps API & AWS S3"
  },
  {
    id: "ecommerce",
    name: "E-Commerce & Retail",
    icon: "ShoppingBag",
    summary: "High-speed custom storefronts, dynamic pricing engines, and AI-driven cross-sell recommendations.",
    useCases: ["Omnichannel checkout & inventory sync", "AI UGC video ad campaigns", "Personalized product match bots"],
    impactMetric: "+42% Conversion Rates",
    techFocus: "Next.js, Stripe & n8n Automation"
  },
  {
    id: "restaurants",
    name: "Restaurants & Hospitality",
    icon: "Utensils",
    summary: "Contactless digital menus, direct online ordering systems, and automated reservation management.",
    useCases: ["Direct zero-commission ordering", "Table booking SMS & WhatsApp bots", "Loyalty rewards & automated re-engagement"],
    impactMetric: "Zero Third-Party Fees",
    techFocus: "PWA, WebSockets & Push Notifications"
  },
  {
    id: "ngos",
    name: "NGOs & Non-Profits",
    icon: "Globe2",
    summary: "Impact tracking dashboards, donor management portals, and multi-currency donation gateways.",
    useCases: ["Donor transparency portals", "Automated grant reporting generators", "Volunteer coordination management"],
    impactMetric: "+120% Donor Retention",
    techFocus: "PostgreSQL, Stripe & Chart Dashboards"
  },
  {
    id: "churches",
    name: "Churches & Faith Orgs",
    icon: "Church",
    summary: "Community membership apps, automated sermon media archives, and giving platform integrations.",
    useCases: ["Mobile member engagement app", "Live stream broadcasting hub", "Automated event registrations & reminders"],
    impactMetric: "99% Community Reach",
    techFocus: "React Native, Cloudflare Stream & Supabase"
  },
  {
    id: "government",
    name: "Government & Public Sector",
    icon: "Landmark",
    summary: "Secure citizen service portals, digital permit application workflows, and audit-ready public records.",
    useCases: ["Citizen self-service web portals", "Document verification & digital identity", "Inter-departmental workflow queues"],
    impactMetric: "100% Audit Compliance",
    techFocus: "Python, Docker & Zero-Trust Architecture"
  },
  {
    id: "smes",
    name: "SMEs & Local Businesses",
    icon: "Briefcase",
    summary: "All-in-one business operating platforms replacing disjointed spreadsheets and manual paperwork.",
    useCases: ["Custom invoicing & billing portals", "Automated client onboarding forms", "Inventory & supplier tracking"],
    impactMetric: "15+ Hours Saved/Week",
    techFocus: "Next.js, FastAPI & n8n"
  },
  {
    id: "startups",
    name: "Startups & Tech Founders",
    icon: "Rocket",
    summary: "Rapid prototype to production MVP delivery, robust API backends, and investor-ready architecture.",
    useCases: ["4-week MVP development sprint", "Scalable cloud infra setup", "AI agent feature additions"],
    impactMetric: "4-Week Concept-to-Launch",
    techFocus: "Full-Stack TypeScript & Cloud Run"
  }
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: "Discovery & Blueprint",
    subtitle: "Uncovering your business bottleneck and defining project specifications.",
    duration: "Week 1",
    deliverables: ["Product Requirement Specification (SRS)", "Architecture roadmap", "Budget & milestone timeline", "Competitive audit"],
    description: "We conduct deep architectural interviews with your team to dissect business goals, target user journeys, and technical constraints."
  },
  {
    step: 2,
    title: "Strategic Planning",
    subtitle: "Mapping system architecture, database schema, and integration flows.",
    duration: "Week 1-2",
    deliverables: ["Entity-relationship database schema", "API route contracts", "Security & RBAC governance", "Sprint backlog allocation"],
    description: "Every module, data model, and API endpoint is mapped before a single line of code is written, ensuring zero scope creep."
  },
  {
    step: 3,
    title: "UI/UX & Interactive Design",
    subtitle: "Crafting modern, accessible, and high-converting interface prototypes.",
    duration: "Week 2-3",
    deliverables: ["High-fidelity Figma prototypes", "Design system & component library", "Interactive user flows", "Responsive design matrix"],
    description: "We design clean, ergonomic interfaces prioritizing WCAG AA accessibility, mathematical typography, and micro-interactions."
  },
  {
    step: 4,
    title: "Full-Stack Engineering",
    subtitle: "Writing clean, modular, and type-safe software with automated CI/CD.",
    duration: "Week 3-6",
    deliverables: ["Production React / Next.js frontend", "FastAPI / Node.js backend services", "AI model integrations", "Database migrations"],
    description: "Our senior engineers implement modular components, robust error handling, and server-side secret protection."
  },
  {
    step: 5,
    title: "Rigorous QA & Security Testing",
    subtitle: "Stress testing performance, vulnerabilities, and edge cases.",
    duration: "Week 6-7",
    deliverables: ["Automated end-to-end test suite", "Lighthouse 95+ performance audit", "Security vulnerability scan", "User acceptance sign-off"],
    description: "We run rigorous penetration tests, mobile responsiveness audits, and concurrency load tests across all environments."
  },
  {
    step: 6,
    title: "Production Launch",
    subtitle: "Seamless DNS cutover, zero-downtime container deployment, and monitoring.",
    duration: "Week 7",
    deliverables: ["Containerized Cloud Run / AWS deployment", "SSL / TLS certification", "Real-time telemetry & error logging", "Executive hand-off deck"],
    description: "We orchestrate zero-downtime production releases with automated rollback protections and real-time observability."
  },
  {
    step: 7,
    title: "Support & Continuous Growth",
    subtitle: "Post-launch maintenance, feature scaling, and ongoing AI optimizations.",
    duration: "Ongoing",
    deliverables: ["SLA uptime guarantee", "Quarterly feature sprints", "AI prompt & model upgrades", "24/7 technical helpdesk"],
    description: "We remain your long-term engineering partner, constantly updating your software with emerging AI capabilities and market demands."
  }
];

export const TECHNOLOGIES: TechItem[] = [
  { name: "Python", category: "Backend", role: "High-performance data pipelines, backend APIs & AI engine logic", icon: "Code", badge: "Core" },
  { name: "FastAPI", category: "Backend", role: "Ultra-fast asynchronous Python microservices with automatic OpenAPI documentation", icon: "Zap", badge: "Speed" },
  { name: "Next.js", category: "Frontend", role: "Enterprise React framework with Server Components & SSR", icon: "Globe", badge: "Preferred" },
  { name: "React 19", category: "Frontend", role: "Dynamic reactive interfaces, custom hook architectures & modern state management", icon: "Atom", badge: "UI" },
  { name: "PostgreSQL", category: "Database", role: "ACID-compliant relational database engine for mission-critical records", icon: "Database", badge: "Reliable" },
  { name: "Supabase", category: "Database", role: "Real-time PostgreSQL with pgvector embeddings & instant authentication", icon: "Sparkles", badge: "Vector AI" },
  { name: "Docker", category: "Cloud & DevOps", role: "Containerized reproducible execution environments for edge and cloud runtimes", icon: "Box", badge: "DevOps" },
  { name: "AWS", category: "Cloud & DevOps", role: "Resilient serverless computing, S3 object storage, and global CDN delivery", icon: "Cloud", badge: "Cloud" },
  { name: "OpenAI APIs", category: "AI & Automation", role: "State-of-the-art LLMs, structured JSON extraction, and GPT agent architectures", icon: "Bot", badge: "AI" },
  { name: "TensorFlow", category: "AI & Automation", role: "Custom predictive models, computer vision, and neural network training", icon: "Cpu", badge: "ML" },
  { name: "n8n", category: "AI & Automation", role: "Self-hosted visual workflow automation orchestrator for multi-app triggers", icon: "Workflow", badge: "Automation" },
  { name: "GitHub", category: "Design & Tooling", role: "Automated CI/CD pipelines, version control, and code security scanning", icon: "GitBranch", badge: "CI/CD" },
  { name: "Figma", category: "Design & Tooling", role: "Precision UI/UX wireframing, interactive prototyping, and design tokens", icon: "Figma", badge: "Design" }
];

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "proj-omnicare",
    title: "OmniCare Health Management Portal",
    category: "Software Development",
    client: "OmniCare Regional Hospital Network",
    businessProblem: "Fragmented patient records across 14 clinics causing 45-minute average check-in delays and billing discrepancies.",
    solution: "Engineered a centralized, HIPAA-compliant patient intake portal with biometric verification, automated scheduling, and instant insurance validation.",
    technologiesUsed: ["React 19", "FastAPI", "PostgreSQL", "Docker", "AWS S3"],
    outcome: "Reduced patient check-in wait time by 72% and completely eliminated manual record double-entry across 24,000 monthly patients.",
    outcomeStats: "72% Faster Check-In"
  },
  {
    id: "proj-autoflow",
    title: "AutoFlow Autonomous Support & Sales Swarm",
    category: "AI Automation",
    client: "Kinetix Global Logistics",
    businessProblem: "Overwhelming volume of 1,200+ daily freight tracking and quoting inquiries leading to lost sales opportunities.",
    solution: "Deployed an agentic AI chatbot swarm integrated with WhatsApp and ERP systems capable of resolving real-time tracking requests and generating freight quotes automatically.",
    technologiesUsed: ["Python", "OpenAI APIs", "n8n", "Supabase Vector", "WhatsApp Cloud API"],
    outcome: "Autonomous resolution of 84% of customer inquiries with zero human intervention, unlocking $1.4M in recaptured booking revenue in 90 days.",
    outcomeStats: "84% Automated Inquiries"
  },
  {
    id: "proj-luxora",
    title: "Luxora Living Brand & Digital Platform",
    category: "Branding & Web",
    client: "Luxora Luxury Property Developments",
    businessProblem: "Legacy website lacked luxury appeal and generated low quality leads for $2M+ penthouse developments.",
    solution: "Full brand transformation: high-end brand identity system, 3D architectural web showcase, and targeted meta UGC ad campaign.",
    technologiesUsed: ["Figma", "Next.js", "Tailwind CSS", "Media Buying", "UGC Production"],
    outcome: "Generated 340+ qualified ultra-high-net-worth investor leads and 100% sell-out of Phase 1 residences within 4 months.",
    outcomeStats: "100% Phase 1 Sold Out"
  },
  {
    id: "proj-edulearn",
    title: "EduNexus Enterprise LMS & Academy",
    category: "Education & Academy",
    client: "National Association of SME Founders",
    businessProblem: "Inability to scale executive mentorship and vocational tech training to 10,000+ members geographically dispersed.",
    solution: "Custom multi-tenant learning management system with AI auto-grading, interactive coding sandboxes, and automated credential issuance.",
    technologiesUsed: ["Next.js", "Python", "Supabase", "Docker", "Stripe"],
    outcome: "Trained 8,500+ professionals across 12 countries with an exceptional 94% course completion rate.",
    outcomeStats: "8,500+ Certified Graduates"
  }
];

export const FEATURED_SERVICES: ServiceDetail[] = [
  {
    id: "software-dev",
    title: "Software Development",
    subtitle: "Custom Web & Cloud Platforms",
    tagline: "Engineered for speed, security, and scale.",
    description: "From complex enterprise dashboards to high-concurrency SaaS applications, we architect software tailored precisely to your operational requirements.",
    features: ["Custom web apps with React & Next.js", "Resilient microservices in Python & FastAPI", "Enterprise database architecture & optimization", "Zero-downtime CI/CD deployment pipelines"],
    icon: "Code2"
  },
  {
    id: "ai-automation",
    title: "AI & Automation",
    subtitle: "Autonomous Agents & Workflow Systems",
    tagline: "Replace repetitive busywork with intelligent automation.",
    description: "We deploy custom AI agents, automated workflow pipelines with n8n, and conversational AI chatbots that supercharge team productivity.",
    features: ["Autonomous AI agent swarms", "Omnichannel customer support chatbots", "Document OCR & automated parsing", "Cross-software n8n orchestration"],
    icon: "Bot"
  },
  {
    id: "branding-design",
    title: "Branding & Design",
    subtitle: "Brand Identity & UI/UX Systems",
    tagline: "Design that commands premium positioning.",
    description: "We create distinctive visual identities, precision design systems, and intuitive user experiences that turn first-time visitors into loyal customers.",
    features: ["Comprehensive brand identity styleguides", "Full UI/UX wireframing & prototyping in Figma", "Design tokens & reusable component systems", "Pitch decks & marketing collateral"],
    icon: "Palette"
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing & Media Buying",
    subtitle: "Paid Acquisition & Performance Growth",
    tagline: "Turn ad spend into predictable revenue.",
    description: "Data-driven media buying campaigns across Meta, Google, and TikTok backed by conversion tracking and high-frequency creative testing.",
    features: ["Meta & Google Ads performance campaigns", "Conversion rate optimization (CRO)", "Multi-touch attribution reporting", "Audience segmentation & retargeting"],
    icon: "Megaphone"
  },
  {
    id: "media-production",
    title: "AI Media & Video Production",
    subtitle: "UGC Creatives & AI Generated Video Ads",
    tagline: "High-volume viral video creative at scale.",
    description: "We produce high-converting direct-response video ads, UGC creator content, and AI-narrated synthetic video reels for social dominance.",
    features: ["Direct-response UGC video ads", "AI voiceover & synthetic spokesperson videos", "Batch ad creative iterations", "TikTok, Reels & YouTube Shorts formatting"],
    icon: "Video"
  },
  {
    id: "vixora-academy",
    title: "Vixora Academy & Training",
    subtitle: "Tech & AI Upskilling for Teams & Builders",
    tagline: "Master the skills shaping the future.",
    description: "Practical, project-based training programs in modern software engineering, AI automation, and product building for individuals and corporate teams.",
    features: ["Full-Stack & AI Engineering Cohorts", "Corporate AI adoption masterclasses", "Hands-on project mentorship", "Official Vixora Certification"],
    icon: "GraduationCap"
  }
];

export const BUSINESS_METRICS: MetricItem[] = [
  { value: "120+", label: "Projects Completed", subtext: "Web apps, SaaS, AI workflows & brand launches", highlight: "Delivered on time" },
  { value: "85+", label: "Businesses Served", subtext: "Startups, healthcare providers, retail & enterprises", highlight: "Across 14 countries" },
  { value: "10+", label: "Industries Served", subtext: "Deep domain expertise in healthcare, finance, tech & retail", highlight: "Custom domain logic" },
  { value: "99.4%", label: "Client Satisfaction", subtext: "Average rating across project delivery & post-launch support", highlight: "5-Star verified" },
  { value: "6+", label: "Years of Experience", subtext: "Building robust software and cutting-edge digital products", highlight: "Continuous innovation" }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    quote: "Vixora completely transformed our clinic operations. Their team delivered a custom patient portal in 6 weeks that our doctors and patients love using every day. The attention to detail was exceptional.",
    author: "Dr. Marcus Vance",
    role: "Chief Medical Officer",
    company: "Apex Healthcare Systems",
    industry: "Healthcare",
    rating: 5
  },
  {
    id: "test-2",
    quote: "The AI customer support bot built by Vixora handles over 80% of our daily WhatsApp inquiries instantly. We were able to scale our customer base by 3x without hiring additional support staff.",
    author: "Elena Rostova",
    role: "VP of Operations",
    company: "Novus Retail Group",
    industry: "E-Commerce",
    rating: 5
  },
  {
    id: "test-3",
    quote: "From our brand guidelines to the full web platform launch, Vixora acted as our true technology partner. They think like product founders, not just coders.",
    author: "Kareem Al-Mansoor",
    role: "Founder & CEO",
    company: "Stratum Capital",
    industry: "FinTech / Real Estate",
    rating: 5
  }
];

export const LATEST_INSIGHTS: InsightItem[] = [
  {
    id: "insight-1",
    title: "How to Build an Agentic AI Workflow with Python, FastAPI & n8n",
    category: "AI & Engineering",
    readTime: "6 min read",
    date: "Aug 2026",
    excerpt: "A practical guide to connecting LLMs to your internal database and automating multi-step business actions safely.",
    author: "Vixora Architecture Team"
  },
  {
    id: "insight-2",
    title: "Modern Web Architecture in 2026: Why React 19 & Tailwind 4 Win",
    category: "Web Development",
    readTime: "5 min read",
    date: "Jul 2026",
    excerpt: "Exploring the latency and developer velocity advantages of modern compiler-driven frontend architectures.",
    author: "Lead Frontend Engineer"
  },
  {
    id: "insight-3",
    title: "Scaling Paid Ads with AI Generated UGC & High-Velocity Testing",
    category: "Growth & Marketing",
    readTime: "4 min read",
    date: "Jul 2026",
    excerpt: "How top brands are lowering customer acquisition costs by 40% through automated ad creative generation.",
    author: "Growth Director"
  }
];

export const ACADEMY_COURSES: AcademyCourse[] = [
  {
    id: "course-fullstack-ai",
    title: "Full-Stack & Autonomous AI Engineering Cohort",
    format: "12-Week Live Cohort + Lab",
    duration: "12 Weeks (Part-time)",
    targetAudience: "Software Developers & Technical Founders",
    description: "Master modern full-stack development with React 19, FastAPI, LangChain, autonomous agent swarms, and vector RAG databases.",
    curriculum: [
      "Advanced TypeScript, React 19 & Next.js App Router",
      "Python Microservices with FastAPI & Async I/O",
      "Building Agentic AI Swarms with LangGraph & n8n",
      "Vector Search & pgvector on PostgreSQL",
      "Docker, Cloud Deployment & CI/CD Pipelines"
    ]
  },
  {
    id: "course-executive-ai",
    title: "AI Strategy & Autonomous Operations for Executives",
    format: "4-Week Executive Masterclass",
    duration: "4 Weeks (Interactive)",
    targetAudience: "C-Suite, Directors & Business Leaders",
    description: "Strategic framework for evaluating enterprise AI opportunities, model procurement, data governance, security compliance, and measurable ROI.",
    curriculum: [
      "Enterprise AI Landscape & Model Selection Economics",
      "Identifying 10x ROI Automation Opportunities",
      "Data Governance, Privacy & Security Protocols",
      "Building and Leading AI-Augmented Teams"
    ]
  },
  {
    id: "course-workflow-automation",
    title: "Enterprise Workflow Automation with n8n & Python",
    format: "6-Week Hands-on Bootcamp",
    duration: "6 Weeks",
    targetAudience: "Operations Managers, Devs & Growth Marketers",
    description: "Learn to build self-hosted, resilient workflow automations that connect CRMs, databases, AI models, and communication channels without recurring Zapier fees.",
    curriculum: [
      "Self-Hosting n8n with Docker & Webhooks",
      "Custom Python & JavaScript Function Nodes",
      "Integrating OpenAI, Anthropic & Local LLMs",
      "Automated PDF Invoicing, Parsing & CRM Sync"
    ]
  }
];

export const COMPANY_CONTACT = {
  email: "hello@vixora.com",
  secondaryEmail: "vixoralabsai@gmail.com",
  phone: "+1 (800) 849-6721",
  whatsappNumber: "+18008496721",
  whatsappUrl: "https://wa.me/18008496721?text=Hello%20Vixora%20Team%2C%20I%20would%20like%20to%20discuss%20a%20new%20project.",
  address: "Vixora Digital Hub Headquarters, Silicon Corridor & Cloud Center",
  socials: [
    { name: "Twitter / X", url: "https://twitter.com", icon: "Twitter" },
    { name: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" },
    { name: "GitHub", url: "https://github.com", icon: "Github" },
    { name: "YouTube", url: "https://youtube.com", icon: "Youtube" }
  ]
};
