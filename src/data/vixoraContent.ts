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

export interface CourseSyllabusModule {
  week: string;
  title: string;
  description: string;
  topics: string[];
  handsOnLab: string;
}

export interface CourseCapstone {
  title: string;
  description: string;
  technologies: string[];
}

export interface CourseInstructor {
  name: string;
  role: string;
  bio: string;
  companyBackground: string;
}

export interface CourseFaq {
  q: string;
  a: string;
}

export interface AcademyCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  level: 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Executive';
  track: 'Engineering & AI' | 'Executive & Leadership' | 'Business Automation' | 'Design & Marketing';
  format: string;
  duration: string;
  commitment: string;
  nextCohortDate: string;
  tuition: string;
  tuitionNote: string;
  seatsRemaining: number;
  targetAudience: string;
  description: string;
  heroPitch: string;
  highlights: string[];
  outcomes: string[];
  prerequisites: string[];
  curriculum: string[];
  weeklySyllabus: CourseSyllabusModule[];
  capstoneProjects: CourseCapstone[];
  instructors: CourseInstructor[];
  faqs: CourseFaq[];
  certificateType: string;
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
    id: "course-ai-automation-digital-skills",
    slug: "ai-automation-digital-skills",
    title: "AI Automation & Digital Skills",
    subtitle: "While most people are still asking ChatGPT to write birthday messages, you'll be building automations, creating AI content, and getting paid for skills the market is desperate for — no tech background required.",
    badge: "🔥 Early Bird: ₦30,000",
    level: "Beginner",
    track: "Business Automation",
    format: "12-Week Hybrid Cohort (Online + Practical Sessions)",
    duration: "12 Weeks",
    commitment: "4-5 hrs/week (Flexible Bite-Sized Sessions)",
    nextCohortDate: "October 26, 2026",
    tuition: "₦30,000",
    tuitionNote: "Early applicant rate (Standard: ₦35,000). Limited cohort seats available.",
    seatsRemaining: 14,
    targetAudience: "Students, Job Seekers, Small Business Owners, Entrepreneurs, and Complete Beginners.",
    description: "A 12-week, hands-on program built for complete beginners who want to go from 'I've heard of ChatGPT' to 'I automate things for a living' — without writing a single line of code. Master AI productivity tools, scroll-stopping content generation, Make/Zapier/Notion automations, document handling, and client freelancing monetization.",
    heroPitch: "Everyone's talking about AI. In 12 weeks, you'll actually know how to use it — build automations, create AI content, and get paid for in-demand skills.",
    highlights: [
      "12 weeks of structured, hands-on training with zero fluff",
      "5 comprehensive modules: AI tools, content, automation, documents & monetization",
      "A real, practical project for your portfolio — not just theory",
      "Official Vixora Certificate of Completion upon graduation",
      "Beginner-friendly teaching — zero coding or tech background needed",
      "Hybrid access — learn online or in practical sessions with community support"
    ],
    outcomes: [
      "Master ChatGPT & frontier AI tools to work 10x faster and clearer",
      "Create scroll-stopping AI-generated images, videos & high-accuracy prompts",
      "Build automated workflows with Make, Zapier & Notion to replace repetitive tasks",
      "Automate PDF & document processing so tedious paperwork runs itself",
      "Turn your new skills into income — freelancing, skill packaging & client acquisition"
    ],
    prerequisites: [
      "A laptop or smartphone with internet access",
      "Zero coding or tech background required (if you can send a WhatsApp message, you can do this)",
      "Willingness to practice hands-on projects"
    ],
    curriculum: [
      "Module 1 — AI Tools Fundamentals (ChatGPT & Prompt Mastery)",
      "Module 2 — AI Content Creation (Images, Videos & Creative Generation)",
      "Module 3 — Simple Automation (Make, Zapier & Notion Workflows)",
      "Module 4 — PDF & Document Automation (Paperwork Streamlining)",
      "Module 5 — Making Money With AI Skills (Freelancing & Client Acquisition)"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2 (Module 1)",
        title: "AI Tools Fundamentals",
        description: "Master ChatGPT and other leading AI tools to work faster, think clearer, and get more done in less time — the foundation everything else is built on.",
        topics: [
          "Understanding Large Language Models without tech jargon",
          "Prompt Engineering: The precise syntax to get exact results every time",
          "ChatGPT, Claude & Perplexity workflows for research & writing",
          "Building customized GPTs and reusable personal productivity assistants"
        ],
        handsOnLab: "Build your customized personal AI Productivity Assistant tailored to your career or business."
      },
      {
        week: "Weeks 3-4 (Module 2)",
        title: "AI Content Creation",
        description: "Learn to create scroll-stopping AI-generated images and videos, and master the art of prompting so the AI gives you exactly what you want, every time.",
        topics: [
          "Photorealistic AI image generation with Midjourney & Ideogram",
          "Generating realistic voiceovers, avatars & videos with Runway & ElevenLabs",
          "Social media content repurposing pipelines and hooks",
          "Graphic design and branding assets creation without Photoshop"
        ],
        handsOnLab: "Create a complete visual branding & social media content campaign using 100% AI generation."
      },
      {
        week: "Weeks 5-7 (Module 3)",
        title: "Simple Automation (Make, Zapier & Notion)",
        description: "Get hands-on with Make, Zapier, and Notion to automate the repetitive tasks that eat up your day — the same skills businesses pay freelancers to set up.",
        topics: [
          "Visual automation basics: Triggers, actions & data passing",
          "Automating lead notifications from forms to WhatsApp & email",
          "Connecting Notion databases to Google Sheets and calendar apps",
          "Building automated client onboarding & task dispatch pipelines"
        ],
        handsOnLab: "Deploy a live 3-step automation that collects customer inquiries and dispatches instant WhatsApp notifications."
      },
      {
        week: "Weeks 8-9 (Module 4)",
        title: "PDF & Document Automation",
        description: "Stop drowning in paperwork. Learn to automate document handling and processing so tedious admin work runs itself.",
        topics: [
          "Extracting structured data from receipts, invoices & PDF contracts",
          "Automated report generation and document summarization",
          "Connecting cloud folders (Google Drive / Dropbox) to auto-parsers",
          "Eliminating hours of manual data entry and spreadsheet typing"
        ],
        handsOnLab: "Build an automated PDF Invoice Reader that extracts line items into a structured spreadsheet instantly."
      },
      {
        week: "Weeks 10-12 (Module 5)",
        title: "Making Money With AI Skills",
        description: "Turn everything you've learned into income — how to freelance, package your skills, and find your first paying clients.",
        topics: [
          "Packaging automation & AI services into high-ticket freelance offers",
          "Creating an irresistible portfolio with your course capstone projects",
          "Finding paying clients on Upwork, LinkedIn, WhatsApp & local businesses",
          "Pricing your services: Charging for value, not hourly time"
        ],
        handsOnLab: "Publish your live Capstone Portfolio Website and pitch your first 3 prospective clients."
      }
    ],
    capstoneProjects: [
      {
        title: "End-to-End Business Automation & Lead Pipeline",
        description: "A complete no-code automation system connecting customer forms, WhatsApp alerts, Google Drive filing, and automated client onboarding.",
        technologies: ["Make.com", "Zapier", "ChatGPT API", "Notion", "WhatsApp API", "Google Workspace"]
      },
      {
        title: "AI-Powered Content Creation & Social Media Suite",
        description: "A rapid content generation engine that produces branded graphics, video scripts, synthetic voiceovers, and scheduled social posts.",
        technologies: ["Midjourney", "ElevenLabs", "ChatGPT", "Canva AI", "Airtable"]
      },
      {
        title: "Automated Document Parser & Invoice Manager",
        description: "An administrative tool that monitors incoming emails, extracts structured data from attached PDF invoices, and logs expenses into spreadsheets.",
        technologies: ["Make.com", "AI Document Parser", "Google Sheets", "Gmail Automation"]
      }
    ],
    instructors: [
      {
        name: "Vixora Digital Hub Instructors & AI Practitioners",
        role: "Head of AI Automation Training, Vixora Academy",
        bio: "Veteran automation architects who build real client systems and teach beginners with zero tech jargon.",
        companyBackground: "Vixora Academy Certified Instructors"
      }
    ],
    faqs: [
      {
        q: "Do I need any tech or coding experience?",
        a: "None at all. This course is built specifically for beginners — if you can use WhatsApp, you can do this."
      },
      {
        q: "I'm busy. Can I really keep up?",
        a: "The program is hybrid and structured around real-life schedules. You'll get practical, bite-sized sessions — not a full-time commitment."
      },
      {
        q: "Is this really beginner-friendly, or will I get lost?",
        a: "Every module starts from zero. Nobody gets left behind — the whole point is to make AI simple, not intimidating."
      },
      {
        q: "What happens after I apply?",
        a: "You'll receive confirmation and next steps, including your cohort start date and how to secure your seat at the early price."
      },
      {
        q: "What if I finish and still don't know how to make money from this?",
        a: "Module 5 is built specifically to bridge learning into earning — freelancing strategy and finding your first clients are baked into the curriculum, not an afterthought."
      }
    ],
    certificateType: "Vixora Certificate of Completion in AI Automation & Digital Skills"
  },
  {
    id: "course-ai-automation-digital-business-systems",
    slug: "ai-automation-digital-business-systems",
    title: "AI Automation & Digital Business Systems",
    subtitle: "This isn't the \"learn the basics\" course. This is where you build real automations, real client systems, and a real freelance or business income — with direct mentorship the whole way.",
    badge: "🔥 Early Bird: ₦60,000 (Reg ₦150,000+)",
    level: "Advanced",
    track: "Business Automation",
    format: "12-Week Implementation & Mentorship-Led Cohort",
    duration: "12 Weeks",
    commitment: "5-6 hrs/week (Implementation Labs + Mentorship)",
    nextCohortDate: "November 2, 2026",
    tuition: "₦60,000",
    tuitionNote: "Early bird rate: ₦60,000 (Standard: ₦65,000 — regular value ₦100,000 – ₦150,000+). Includes direct mentorship, client acquisition training & real client projects.",
    seatsRemaining: 8,
    targetAudience: "Professionals, Business Owners, Agency Founders, Freelancers, Consultants, and Digital Skills Graduates ready to build & monetize AI systems.",
    description: "Vixora Academy's advanced, implementation-focused program for people ready to go beyond tools and start building. You'll learn to design, build, and deploy AI-powered automations and solutions — the kind organizations and clients actually pay for — with hands-on mentorship, real business projects, and direct support.",
    heroPitch: "Stop using AI tools. Start building AI systems businesses pay for — real automations, real client systems, and a real income stream with direct mentorship.",
    highlights: [
      "Advanced, implementation-focused curriculum (not a repeat of the basics)",
      "Direct mentorship and higher-touch support throughout",
      "Real business projects — building your actual portfolio, not sample exercises",
      "Client acquisition training — finding and closing clients, not just theory",
      "Access to an active community of other builders",
      "A clear path to freelance or service-business income"
    ],
    outcomes: [
      "Architect multi-step advanced automations with Make, Zapier, Notion, n8n & GHL",
      "Deliver professional-level AI image and video production assets for paying clients",
      "Deploy business process & PDF automation systems solving high-ticket operational pain points",
      "Build custom AI tools and web products using Vibe Coding without a traditional dev background",
      "Master end-to-end client acquisition, discovery calls, scoping, and retaining recurring contracts"
    ],
    prerequisites: [
      "Basic comfort with AI tools (ChatGPT, prompting fundamentals)",
      "General digital literacy — this is the advanced track, not a from-zero start",
      "Laptop with reliable internet connection and willingness to build real projects"
    ],
    curriculum: [
      "Module 1 — Advanced AI Workflows (Make, Zapier, Notion, n8n & GHL)",
      "Module 2 — Advanced Prompting & AI Production (Client & Business Media)",
      "Module 3 — Business Process & PDF Automation (Operational Pain Points)",
      "Module 4 — Vibe Coding & AI-Powered Solutions (Custom Web Tools)",
      "Module 5 — Client & Project Implementation (First Call to Delivery)",
      "Module 6 — Freelancing & Service Business (Packaging Offers & Retainers)",
      "Module 7 — Mentorship, Community & Capstone Client Deployments"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2 (Module 1)",
        title: "Advanced AI Workflows",
        description: "Go beyond the basics with Make, Zapier, Notion, n8n, and GHL — building serious, multi-step automations that solve real business problems.",
        topics: [
          "Multi-step conditional logic, error routers, and fallback handlers in Make.com",
          "Self-hosted & cloud n8n workflows for complex enterprise integrations",
          "GoHighLevel (GHL) CRM automation, pipeline triggers & SMS/email sequences",
          "Notion databases as real-time automation control centers and dashboards"
        ],
        handsOnLab: "Build and deploy a multi-channel lead routing & onboarding automation engine with Make and n8n."
      },
      {
        week: "Weeks 3-4 (Module 2)",
        title: "Advanced Prompting & AI Production",
        description: "Professional-level prompting, plus AI image and video production built for client and business use — not just personal projects.",
        topics: [
          "System prompts, multi-persona chains, and structured JSON output extraction",
          "Commercial AI image generation, consistent character & brand style matching",
          "AI video commercials, dynamic voice cloning, and lip-syncing for client ads",
          "Building automated batch content production pipelines"
        ],
        handsOnLab: "Create an end-to-end commercial video ad campaign asset pack for a real business client."
      },
      {
        week: "Weeks 5-6 (Module 3)",
        title: "Business Process & PDF Automation",
        description: "Design automation systems that solve real operational pain points for businesses — the kind of work clients will pay premium rates for.",
        topics: [
          "Automated PDF extraction, invoice OCR, and receipt parsing with AI models",
          "Document generation pipelines (contract generation, proposals, automated reports)",
          "ERP & accounting software sync (QuickBooks, Google Sheets, Airtable)",
          "Human-in-the-loop review queues for compliance and quality control"
        ],
        handsOnLab: "Deploy an automated invoice ingestion and financial summary system that saves 15+ hours/week."
      },
      {
        week: "Weeks 7-8 (Module 4)",
        title: "Vibe Coding & AI-Powered Solutions",
        description: "Learn to build working AI-powered tools and products, even without a traditional developer background.",
        topics: [
          "Modern AI-assisted code generation (Cursor, Claude Code, Lovable, Replit)",
          "Building micro-SaaS calculators, lead magnets, and customer client portals",
          "Integrating Gemini and OpenAI APIs into web interfaces with secure backends",
          "Deploying fast, responsive web apps with zero devops hassle"
        ],
        handsOnLab: "Build and publish a live, functional AI-powered web tool that prospective clients can test."
      },
      {
        week: "Weeks 9-10 (Module 5)",
        title: "Client & Project Implementation",
        description: "Take a project from first conversation to delivered solution — the exact process professionals use to run real client work.",
        topics: [
          "Conducting discovery calls & diagnosing high-value automation opportunities",
          "Writing winning scopes of work (SOW), PRDs, and implementation milestones",
          "Client onboarding, environment staging, and testing protocols",
          "Handover documentation, Loom video walk-throughs, and client training"
        ],
        handsOnLab: "Package a complete client proposal with detailed scope, architecture diagram, and milestone pricing."
      },
      {
        week: "Weeks 11-12 (Module 6 & 7)",
        title: "Freelancing, Service Business & Mentorship",
        description: "Package your skills into a service business, find and close clients, build recurring retainers, and receive direct 1-on-1 mentorship.",
        topics: [
          "High-ticket service packaging & recurring monthly maintenance retainers",
          "Cold outreach, inbound LinkedIn funnels, and closing discovery calls",
          "Pricing your work (from ₦200k fixed projects to $2,500/mo retainers)",
          "Graduation review, portfolio polishing, and peer mastermind community"
        ],
        handsOnLab: "Launch your official automation service landing page & portfolio with active client outreach."
      }
    ],
    capstoneProjects: [
      {
        title: "Enterprise Multi-App Lead & Automation Engine",
        description: "A production-grade n8n, Make.com, and GHL multi-system automation integrating webhook routers, CRM pipelines, and autonomous client notifications.",
        technologies: ["n8n", "Make.com", "GoHighLevel", "OpenAI / Gemini API", "Notion", "PostgreSQL"]
      },
      {
        title: "AI-Generated Commercial Production Suite & Client Asset Pipeline",
        description: "An automated commercial media pipeline producing consistent-character visual campaigns, promotional AI video clips, voiceovers, and scheduled deliverables.",
        technologies: ["Midjourney v6", "Runway Gen-3 / Kling", "ElevenLabs", "Claude 3.7", "Airtable"]
      },
      {
        title: "Autonomous Invoice Ingestion & Document Intelligence Portal",
        description: "An operational enterprise tool that monitors email inboxes, parses PDF invoices via OCR, reconciles ledger items, and triggers payment receipts.",
        technologies: ["Make.com", "AI Document OCR", "Google Sheets / QuickBooks", "Zapier", "Slack API"]
      },
      {
        title: "Custom AI Micro-SaaS Tool (Vibe Coding Capstone)",
        description: "A deployed, client-facing web application with custom prompt logic and interactive UI built using modern AI code generation.",
        technologies: ["React / Vite", "Tailwind CSS", "Gemini API", "Cloud Run / Vercel"]
      }
    ],
    instructors: [
      {
        name: "Vixora Digital Hub Senior Systems Engineers & Mentors",
        role: "Director of Enterprise AI Architecture & Training",
        bio: "Senior automation specialists and business architects who build production automations for high-growth enterprises and guide students 1-on-1.",
        companyBackground: "Vixora Digital Hub Senior Practitioners"
      }
    ],
    faqs: [
      {
        q: "Do I need to take the Mass Market course first?",
        a: "Not required, but you should already be comfortable with basic AI tools and general digital literacy — Premium builds from there, it doesn't start from zero."
      },
      {
        q: "How is this different from the Mass Market course?",
        a: "Mass Market teaches you to use AI. Premium teaches you to build and monetize AI systems — with direct mentorship, real client-style projects, and a path to freelance/business income."
      },
      {
        q: "What kind of support do I get?",
        a: "Direct mentorship, community access, and higher-touch guidance through real project work — not just pre-recorded lessons."
      },
      {
        q: "Can I really start earning from this?",
        a: "Yes — client acquisition and freelancing strategy are built directly into the curriculum, and real business projects give you portfolio proof to show prospective clients."
      },
      {
        q: "What if I'm not sure Premium is right for me yet?",
        a: "Start with the Mass Market track — you can move up into Premium whenever you're ready. See the Choose Your Path comparison table on this page."
      }
    ],
    certificateType: "Vixora Certificate of Advanced Mastery in AI Automation & Digital Business Systems"
  },
  {
    id: "course-fullstack-ai",
    slug: "fullstack-ai-engineering",
    title: "Full-Stack & Autonomous AI Engineering Cohort",
    subtitle: "Architect production SaaS, agentic workflows, LangGraph pipelines, and low-latency microservices from zero to scale.",
    badge: "Flagship Engineering Cohort",
    level: "Advanced",
    track: "Engineering & AI",
    format: "12-Week Live Cohort + Project Lab",
    duration: "12 Weeks",
    commitment: "6-8 hrs/week (Live sessions + Labs)",
    nextCohortDate: "October 14, 2026",
    tuition: "$1,850",
    tuitionNote: "Or 3 monthly installments of $650. Corporate sponsorship accepted.",
    seatsRemaining: 6,
    targetAudience: "Software Engineers, Full-Stack Developers, Technical Leads, and Ambitious Builders looking to master modern AI engineering.",
    description: "Go beyond toy prompts and basic API wrappers. Learn how to architect enterprise-grade AI applications with deterministic execution, self-healing agent swarms, vector retrieval, pgvector indexing, and production deployment.",
    heroPitch: "Become the top 1% of modern engineers who can design, code, and deploy resilient autonomous AI systems from database schema to clean frontend UI.",
    highlights: [
      "Live code reviews by senior AI infrastructure leads",
      "Deploy 3 real-world production capstones to your portfolio",
      "Private Discord mastermind & direct office hours",
      "Official Vixora Certified AI Engineer credential"
    ],
    outcomes: [
      "Master TypeScript, React 19, FastAPI, and async Python backends",
      "Build multi-agent autonomous teams with LangGraph and StateGraph",
      "Implement high-recall Hybrid RAG with pgvector and semantic re-ranking",
      "Containerize and deploy with Docker, Fly.io, and Cloud Run"
    ],
    prerequisites: [
      "Working knowledge of JavaScript/TypeScript or Python",
      "Basic familiarity with REST APIs and databases",
      "Git version control essentials"
    ],
    curriculum: [
      "Advanced TypeScript & React 19 Next-Gen Architectures",
      "High-Performance Python Microservices with FastAPI",
      "Agentic AI Swarms, State Machines & LangGraph",
      "Production RAG: Chunking, Embeddings & pgvector",
      "Observability, Token Budgets, Eval Frameworks & Cloud Deploy"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2",
        title: "Modern Full-Stack Foundation & High-Concurrency APIs",
        description: "Set up enterprise TypeScript environments, asynchronous Python microservices with FastAPI, Pydantic schemas, and JWT auth architectures.",
        topics: [
          "React 19 Server Components & State Management",
          "FastAPI Async Lifespans & Dependency Injection",
          "PostgreSQL connection pooling with AsyncPG & Prisma",
          "Structured JSON response contracts & schema validation"
        ],
        handsOnLab: "Build an authenticated multi-tenant backend API with real-time SSE event streaming."
      },
      {
        week: "Weeks 3-5",
        title: "Autonomous Agent Swarms & Deterministic Orchestration",
        description: "Move from single LLM calls to multi-agent architectures using LangGraph, tool-calling protocols, and human-in-the-loop validation.",
        topics: [
          "StateGraph design: Cycles, branching, and state checkpointing",
          "Tool-calling standards with function signatures & error fallbacks",
          "Self-correcting code & data verification agents",
          "Orchestrating multi-model pipelines (Gemini 2.5, Claude 3.5, GPT-4o)"
        ],
        handsOnLab: "Deploy an Autonomous Research & Fact-Checking Agent that searches, verifies, and generates structured reports."
      },
      {
        week: "Weeks 6-8",
        title: "Enterprise RAG: Vector Databases, Chunking & Semantic Search",
        description: "Architect production retrieval pipelines that prevent hallucinations and scale to millions of corporate documents.",
        topics: [
          "Document parsing: PDFs, Markdown, Notion, and Google Drive",
          "Context-aware chunking strategies & embedding benchmarks",
          "Hybrid Search: Combining BM25 keyword search with pgvector cosine similarity",
          "Cross-encoder re-ranking and citation generation"
        ],
        handsOnLab: "Build an Enterprise Knowledge Base Assistant with source document page citations and role-based access control."
      },
      {
        week: "Weeks 9-10",
        title: "Evaluation, Observability & Token Cost Engineering",
        description: "Learn how to monitor LLM performance in production, measure latency, track hallucination rates, and optimize token usage.",
        topics: [
          "Prompt engineering vs. fine-tuning economics",
          "Setting up Langfuse / OpenInference observability traces",
          "Automated LLM-as-a-Judge test suites for regression testing",
          "Rate-limiting, semantic caching with Redis, and fallback queues"
        ],
        handsOnLab: "Implement an automated evaluation pipeline that scores your agent's response accuracy before shipping."
      },
      {
        week: "Weeks 11-12",
        title: "Capstone Defense & Production Cloud Deployment",
        description: "Package your full-stack AI system into Docker containers and deploy with CI/CD to scalable cloud infrastructure.",
        topics: [
          "Multi-stage Docker builds for Python and Node",
          "Container orchestration on Google Cloud Run & Fly.io",
          "Domain setup, SSL, CORS, and rate limiting reverse proxies",
          "Final Capstone Project live showcase to hiring partners & clients"
        ],
        handsOnLab: "Deploy your production-grade Capstone application with a custom domain, CI/CD, and live monitoring."
      }
    ],
    capstoneProjects: [
      {
        title: "Autonomous RFP & Technical Proposal Synthesizer",
        description: "A complete multi-agent application that ingests 100+ page enterprise RFP documents, parses requirements, and coordinates 3 specialized agents to draft compliant technical proposals.",
        technologies: ["React 19", "FastAPI", "LangGraph", "pgvector", "PostgreSQL", "Docker"]
      },
      {
        title: "Real-Time Voice & Screen Co-Pilot for Support Engineers",
        description: "Low-latency multimodal assistant that monitors support tickets, analyzes error logs, and suggests deterministic code fixes with verified regression tests.",
        technologies: ["TypeScript", "Gemini Multimodal Live API", "FastAPI", "WebSockets", "Tailwind CSS"]
      },
      {
        title: "Self-Healing Data Scraping & Market Intelligence Pipeline",
        description: "An autonomous agent swarm that browses competitor websites, recovers automatically when DOM structures change, and updates Postgres analytics dashboards.",
        technologies: ["Python", "Playwright", "FastAPI", "Supabase", "Redis"]
      }
    ],
    instructors: [
      {
        name: "Dr. Marcus Vance",
        role: "Head of AI Engineering, Vixora Labs",
        bio: "Former Principal Architect with 12+ years of experience scaling distributed systems and deep learning infrastructure.",
        companyBackground: "Ex-Google Cloud & Autonomous Systems Lead"
      },
      {
        name: "Elena Rostova",
        role: "Senior Full-Stack & Agentic Architect",
        bio: "Specialist in high-throughput React architectures and LangGraph orchestration pipelines.",
        companyBackground: "Vixora Digital Hub Senior Architect"
      }
    ],
    faqs: [
      {
        q: "What is the time commitment required?",
        a: "Expect approximately 6-8 hours per week: 3 hours of live interactive lectures/labs, and 3-5 hours of hands-on project building and mentor reviews."
      },
      {
        q: "Are the live sessions recorded if I miss one?",
        a: "Yes! Every live session, code-along, and Q&A is recorded in high definition and posted to your private student portal within 2 hours with all repository links."
      },
      {
        q: "Do you offer corporate or employer reimbursement support?",
        a: "Yes! Over 60% of our students are sponsored by their employers. We provide formal syllabus documents, tax invoices, and learning justification templates."
      },
      {
        q: "Will I receive a verifiable certificate?",
        a: "Yes, graduates who successfully complete their capstone project receive a blockchain-verified Vixora Certified AI Engineer credential and portfolio endorsement."
      }
    ],
    certificateType: "Vixora Certified Full-Stack AI Engineer (VC-FAIE)"
  },
  {
    id: "course-executive-ai",
    slug: "executive-ai-strategy",
    title: "AI Strategy & Autonomous Operations for Executives",
    subtitle: "A no-fluff strategic masterclass for C-suite leaders and directors to deploy AI profitably and mitigate organizational risk.",
    badge: "Executive Leadership Track",
    level: "Executive",
    track: "Executive & Leadership",
    format: "4-Week Executive Cohort (Interactive Masterclass)",
    duration: "4 Weeks",
    commitment: "3-4 hrs/week (Evening/Weekend executive slots)",
    nextCohortDate: "October 20, 2026",
    tuition: "$2,400",
    tuitionNote: "Includes 1-on-1 private strategy audit for your enterprise roadmap.",
    seatsRemaining: 4,
    targetAudience: "CEOs, CTOs, CIOs, Managing Directors, VPs of Operations, and Business Owners.",
    description: "Cut through the AI hype and understand the actual unit economics, enterprise security frameworks, workflow transformations, and governance models required to build an AI-native organization.",
    heroPitch: "Lead your organization's AI transformation with strategic clarity, proven ROI frameworks, and executive governance.",
    highlights: [
      "1-on-1 enterprise AI audit with Vixora Managing Partners",
      "Executive templates: AI Vendor RFP, ROI Calculator & Governance Policies",
      "Exclusive peer network of fellow C-suite leaders and founders",
      "Private executive briefing on emerging frontier models"
    ],
    outcomes: [
      "Identify high-ROI automation vectors across sales, ops, and product",
      "Establish strict enterprise data security and compliance guardrails",
      "Evaluate build vs. buy decisions for proprietary AI systems",
      "Create a 12-month company-wide AI adoption roadmap"
    ],
    prerequisites: [
      "Executive, Director, or Senior Management role",
      "No coding background required; focus is on strategy, economics & execution"
    ],
    curriculum: [
      "The Modern Enterprise AI Landscape & Unit Economics",
      "Mapping 10x ROI Automation Vectors across Business Units",
      "Security, IP Protection, SOC2 & Regulatory Compliance",
      "Leading AI-Augmented Teams & Change Management"
    ],
    weeklySyllabus: [
      {
        week: "Week 1",
        title: "Frontier AI Landscape, Architecture & Unit Economics",
        description: "Deconstruct the true capabilities of modern LLMs, reasoning models, and agent architectures without confusing technical jargon.",
        topics: [
          "Foundation Models vs. Open Weights vs. Specialized SLMs",
          "Understanding token economics, inference costs & API budgets",
          "Demystifying RAG, Agent Swarms, and Fine-Tuning",
          "Identifying false promises and vendor vaporware"
        ],
        handsOnLab: "Perform an executive unit-cost audit for 3 potential enterprise AI use cases."
      },
      {
        week: "Week 2",
        title: "High-ROI Opportunity Mapping & Workflow Deconstruction",
        description: "Systematically map your organization's highest-cost manual workflows and design autonomous replacement systems.",
        topics: [
          "The Automation Matrix: Impact vs. Feasibility scoring",
          "Transforming Customer Support, Operations, and Finance pipelines",
          "Human-in-the-loop safety nets and approval thresholds",
          "Calculating payback periods and productivity multiples"
        ],
        handsOnLab: "Create an Executive Business Case & ROI Projection for your company's #1 automation priority."
      },
      {
        week: "Week 3",
        title: "Security, IP Sovereignty & Data Governance Guardrails",
        description: "Protect proprietary corporate data, prevent IP leakage, and maintain compliance across international regulatory standards.",
        topics: [
          "Zero-data retention agreements with model providers",
          "Private VPC deployment vs. public cloud APIs",
          "GDPR, HIPAA, and EU AI Act compliance essentials",
          "Creating enforceable internal employee AI usage guidelines"
        ],
        handsOnLab: "Draft a comprehensive Corporate AI Governance Policy tailored to your sector."
      },
      {
        week: "Week 4",
        title: "Execution Roadmap, Talent Strategy & 1-on-1 Advisory",
        description: "Synthesize your company's 12-month implementation roadmap and review during your private advisory session.",
        topics: [
          "Hiring AI engineering talent vs. upskilling existing staff",
          "Structuring build-vs-buy contracts with software agencies",
          "Executive communication & board alignment strategies",
          "Continuous iteration & maintaining technological agility"
        ],
        handsOnLab: "Finalize your company's 12-Month Enterprise AI Transformation Blueprint."
      }
    ],
    capstoneProjects: [
      {
        title: "Enterprise AI Transformation & ROI Blueprint",
        description: "A board-ready strategic document detailing the target architecture, budget allocation, vendor selection criteria, and expected 18-month ROI for your organization.",
        technologies: ["ROI Financial Models", "Risk Matrix", "Governance Framework", "Vendor RFP Template"]
      }
    ],
    instructors: [
      {
        name: "Arthur Sterling",
        role: "Managing Partner & Strategic Lead",
        bio: "Former enterprise technology director with 15+ years advising Fortune 500 executives on digital transformation.",
        companyBackground: "Vixora Digital Hub Strategy Office"
      }
    ],
    faqs: [
      {
        q: "Do I need any programming experience?",
        a: "No. This course is specifically engineered for business leaders, executives, and strategists. All concepts are translated into business impact, unit economics, and operational frameworks."
      },
      {
        q: "How does the 1-on-1 private strategy audit work?",
        a: "During Week 4, you will have a dedicated 60-minute confidential consultation with Vixora Managing Partners to audit your organization's proprietary roadmap."
      }
    ],
    certificateType: "Vixora Executive AI Strategist Certificate"
  },
  {
    id: "course-workflow-automation",
    slug: "enterprise-workflow-automation",
    title: "Enterprise Workflow Automation with n8n & Python",
    subtitle: "Build self-hosted, resilient automation pipelines that connect CRMs, databases, AI models, and communication channels without recurring SaaS fees.",
    badge: "High-Demand Practical Skills",
    level: "Intermediate",
    track: "Business Automation",
    format: "6-Week Hands-On Bootcamp",
    duration: "6 Weeks",
    commitment: "5 hrs/week (Live sessions + Workflows)",
    nextCohortDate: "November 3, 2026",
    tuition: "$950",
    tuitionNote: "Includes lifetime access to Vixora's proprietary n8n template library (50+ workflows).",
    seatsRemaining: 9,
    targetAudience: "Operations Managers, Automation Specialists, Growth Engineers, and Technical Consultants.",
    description: "Replace costly Zapier subscriptions with self-hosted, unmetered n8n workflows integrated with custom Python logic, vector search, webhooks, and enterprise databases.",
    heroPitch: "Master self-hosted, scalable automation and eliminate manual operational bottlenecks across your entire organization.",
    highlights: [
      "Access to 50+ battle-tested enterprise n8n workflow templates",
      "Learn self-hosting with Docker, SSL, and webhook security",
      "Integrate OpenAI, Claude, and open-source models directly into workflows",
      "Build custom Python nodes for complex business logic"
    ],
    outcomes: [
      "Deploy self-hosted n8n on Docker with automatic backups and failovers",
      "Automate CRM synchronization (HubSpot, Salesforce) with zero data loss",
      "Build AI-powered document parsers, lead qualifiers, and invoice processors",
      "Save thousands of dollars annually in third-party automation bills"
    ],
    prerequisites: [
      "Basic understanding of APIs, JSON data, and webhooks",
      "No advanced programming required, basic Python/JavaScript is a bonus"
    ],
    curriculum: [
      "Self-Hosting n8n on Cloud Infrastructure with Docker",
      "Mastering Webhooks, JSON Transformations & Custom Code Nodes",
      "Embedding AI Models: Sentiment, Summarization & Data Extraction",
      "Automated PDF Invoicing, Parsing, Email & CRM Synchronization",
      "Error Handling, Queueing, Rate Limiting & Enterprise Security"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2",
        title: "Self-Hosting n8n & Architecture Fundamentals",
        description: "Deploy n8n on Docker/VPS, configure SSL reverse proxies, webhook security, and understand the node execution model.",
        topics: [
          "Docker Compose setup with Postgres persistence",
          "Securing endpoints with API keys, basic auth & rate limiting",
          "JSON payload manipulation with JavaScript expressions",
          "Working with complex arrays, merging, and filtering nodes"
        ],
        handsOnLab: "Spin up your own production-grade n8n instance and connect your first live webhook trigger."
      },
      {
        week: "Weeks 3-4",
        title: "AI Nodes, Vector Search & Document Intelligence",
        description: "Integrate LLMs directly into visual workflows to summarize emails, extract unstructured PDF tables, and route tickets.",
        topics: [
          "LangChain nodes in n8n: Memory, Output Parsers & Agents",
          "Extracting structured JSON from messy invoices and contracts",
          "Vector embeddings and similarity searches in workflow nodes",
          "Autonomous triage of incoming lead emails with sentiment scoring"
        ],
        handsOnLab: "Build an AI Invoice & Receipt Extractor that parses PDFs from email and updates Postgres + Notion automatically."
      },
      {
        week: "Weeks 5-6",
        title: "Enterprise Integration, Failovers & Retainer Monetization",
        description: "Connect multi-app stacks (Slack, Salesforce, Stripe, PostgreSQL), handle network failures gracefully, and package workflows as consulting retainers.",
        topics: [
          "Error-trigger workflows, automatic retries & Slack alerting",
          "Handling rate limits on third-party APIs (Stripe, HubSpot)",
          "Building automated client onboarding & provisioning portals",
          "Packaging and pricing automation retainers for clients"
        ],
        handsOnLab: "Deploy an End-to-End Client Onboarding & Billing Pipeline that synchronizes 5 distinct platforms simultaneously."
      }
    ],
    capstoneProjects: [
      {
        title: "Autonomous Lead Enrichment & CRM Routing Engine",
        description: "A high-speed workflow that intercepts incoming web form leads, searches LinkedIn & company registries via API, scores fit with Gemini AI, and routes to sales reps in Slack.",
        technologies: ["n8n", "Docker", "PostgreSQL", "Gemini AI", "Slack API", "HubSpot"]
      },
      {
        title: "Automated Multi-Channel Content Repurposing Pipeline",
        description: "Ingests long-form videos/audio, generates transcriptions via Whisper, produces 5 platform-specific social posts with AI, and queues drafts in social managers.",
        technologies: ["n8n", "Whisper", "Claude 3.5", "Buffer API", "Airtable"]
      }
    ],
    instructors: [
      {
        name: "Devon Chen",
        role: "Lead Automation Engineer, Vixora Labs",
        bio: "Built and maintains hundreds of mission-critical enterprise workflows powering millions in ARR.",
        companyBackground: "Automation Lead & n8n Specialist"
      }
    ],
    faqs: [
      {
        q: "Why use self-hosted n8n instead of Zapier or Make?",
        a: "Zapier charges per task, making high-volume workflows cost hundreds or thousands every month. Self-hosted n8n runs on your own server with unlimited workflows and executions for just a $5-10/mo hosting bill, while keeping all data private."
      }
    ],
    certificateType: "Vixora Certified Automation Specialist (VCAS)"
  },
  {
    id: "course-ai-product-design",
    slug: "ai-product-design-ui-ux",
    title: "AI-Native Product Design, UI/UX & Design Systems",
    subtitle: "Design generative interfaces, canvas workflows, agent state visualizers, and scalable token systems in Figma.",
    badge: "Design & UX Masterclass",
    level: "Intermediate",
    track: "Design & Marketing",
    format: "6-Week Live Workshop",
    duration: "6 Weeks",
    commitment: "4-6 hrs/week",
    nextCohortDate: "November 10, 2026",
    tuition: "$1,100",
    tuitionNote: "Includes the complete Vixora Obsidian Design System UI Kit in Figma.",
    seatsRemaining: 8,
    targetAudience: "UI/UX Designers, Product Designers, Design Leads, and Frontend Engineers.",
    description: "Traditional static UI patterns fail when designing for nondeterministic AI experiences. Learn to craft streaming text interactions, agent feedback loops, canvas workspaces, and modern dark-mode design systems.",
    heroPitch: "Design the next generation of AI-native products with modern visual craft, tokenized design systems, and seamless generative interactions.",
    highlights: [
      "Access to the complete Vixora Obsidian Design Kit (.fig)",
      "Design for streaming, latency, hallucinations, and confidence scores",
      "Interactive prototyping with Figma variables and generative plugins",
      "Live portfolio critiques from top product design directors"
    ],
    outcomes: [
      "Design generative UI patterns that build user trust and clarity",
      "Build scalable token systems (colors, typography, radii, elevation)",
      "Prototype complex canvas and conversational interfaces in Figma",
      "Deliver engineering-ready specifications with zero friction"
    ],
    prerequisites: [
      "Familiarity with Figma fundamentals (Auto-layout, components)",
      "Basic understanding of digital product design principles"
    ],
    curriculum: [
      "The Anatomy of AI-Native Interfaces & Mental Models",
      "Tokenized Design Systems: Cosmic Dark Themes & Neon Accents",
      "Streaming States, Latency Feedback & Confidence Indicators",
      "Canvas & Infinite Workspace UX Patterns",
      "Design System Handoff & Frontend Code Synchronization"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 1-2",
        title: "Foundations of AI UI & The Vixora Token System",
        description: "Master modern typography ratios, mathematical spacing, dark palette saturation, and building atomic components.",
        topics: [
          "Eliminating AI Slop: Principles of genuine craft and typography pairing",
          "Building mathematical 8pt spacing and nested corner radius rules",
          "Figma variables: Semantic tokens for light and dark modes",
          "Crafting high-contrast accessible inputs and control states"
        ],
        handsOnLab: "Build a comprehensive Design Token Architecture & Component Library in Figma."
      },
      {
        week: "Weeks 3-4",
        title: "Designing for Nondeterministic AI & Generative UX",
        description: "Solve the core UX challenges of AI: handling latency, streaming states, hallucinations, and prompt affordances.",
        topics: [
          "Streaming typography effects & micro-interaction physics",
          "Confidence ratings, source citations & rollback controls",
          "Human-in-the-loop approval drawers and modal patterns",
          "Multimodal inputs: Combining voice, image, and text triggers"
        ],
        handsOnLab: "Design an AI Copilot Interface featuring streaming responses, citation drawers, and confidence scores."
      },
      {
        week: "Weeks 5-6",
        title: "Infinite Canvas Workspaces & Production Handoff",
        description: "Design node-based visual editors and canvas workspaces for modern agent workflows, and prepare developer-ready tokens.",
        topics: [
          "Spatial UI: Pan, zoom, minimaps, and infinite node connections",
          "State transition animations and micro-copy for AI interactions",
          "Exporting Figma tokens to Tailwind CSS variables automatically",
          "Final capstone review & portfolio case study presentation"
        ],
        handsOnLab: "Design an Interactive Agent Workflow Builder on an infinite canvas with complete node configurations."
      }
    ],
    capstoneProjects: [
      {
        title: "Next-Gen AI Canvas & Workspace Studio",
        description: "A complete end-to-end Figma prototype of a multi-modal canvas workspace featuring node connections, live agent execution pills, and citation inspectors.",
        technologies: ["Figma Variables", "Component Architecture", "Design Tokens", "Tailwind CSS Handoff"]
      }
    ],
    instructors: [
      {
        name: "Soren Morales",
        role: "Head of Design & Brand Identity, Vixora Hub",
        bio: "Award-winning designer with 10+ years crafting premium brand systems and AI-first software interfaces.",
        companyBackground: "Vixora Design Systems Lead"
      }
    ],
    faqs: [
      {
        q: "Do I get full access to the Vixora Figma files?",
        a: "Yes! All enrolled students receive our complete production design system file with 200+ components, token collections, and dark/light variants."
      }
    ],
    certificateType: "Vixora Certified AI Product Designer"
  },
  {
    id: "course-generative-media-marketing",
    slug: "generative-media-advertising",
    title: "Generative Media, UGC Ad Automation & Media Buying",
    subtitle: "Scale high-converting paid social campaigns with AI video generation, automated creative testing, and ROAS optimization.",
    badge: "Growth & Creative Track",
    level: "All Levels",
    track: "Design & Marketing",
    format: "4-Week Intensive Sprint",
    duration: "4 Weeks",
    commitment: "4 hrs/week",
    nextCohortDate: "November 17, 2026",
    tuition: "$850",
    tuitionNote: "Includes AI video generation credit vouchers for workshop labs.",
    seatsRemaining: 12,
    targetAudience: "Growth Marketers, Media Buyers, Brand Founders, and Creative Directors.",
    description: "Lower customer acquisition costs by generating hundreds of personalized UGC video ads, testing hooks algorithmically, and managing scalable campaigns across Meta, TikTok, and Google Ads.",
    heroPitch: "Generate 50+ high-converting ad variations in minutes and master high-velocity media buying with AI creative pipelines.",
    highlights: [
      "Access to prompt engineering templates for Midjourney, Runway & ElevenLabs",
      "Automated video editing pipelines for TikTok & Meta Reels",
      "Media buying strategies for scaling past $50k/month ad spend",
      "Live ad creative teardowns and conversion audits"
    ],
    outcomes: [
      "Generate hyper-realistic AI avatars and voiceovers that convert",
      "Build automated split-testing workflows for video hooks and CTAs",
      "Lower blended CAC / CPA by 30-50% with creative volume",
      "Master programmatic media buying on Meta and TikTok"
    ],
    prerequisites: [
      "Basic familiarity with social media marketing or ad platforms (Meta Ads / TikTok Ads)"
    ],
    curriculum: [
      "AI Creative Synthesis: Avatars, Voice Cloning & Scriptwriting",
      "High-Conversion UGC Frameworks & 3-Second Hook Formulas",
      "Automated Video Assembly & Dynamic Captions",
      "Data-Driven Media Buying, Scaling Budgets & ROAS Attribution"
    ],
    weeklySyllabus: [
      {
        week: "Week 1",
        title: "AI Scriptwriting, Voice Cloning & Avatar Generation",
        description: "Master viral direct-response copywriting and produce photorealistic synthetic talent.",
        topics: [
          "Direct response scripting frameworks (Hook, Problem, Solution, CTA)",
          "Voice cloning and emotional cadence control with ElevenLabs",
          "Generating realistic human avatars and lip-syncing pipelines",
          "B-roll generation using Midjourney and Runway Gen-3"
        ],
        handsOnLab: "Produce 5 unique synthetic UGC ad videos from scratch with voiceover and lip-sync."
      },
      {
        week: "Week 2",
        title: "Automating Dynamic Video Assembly & Hook Variations",
        description: "Build automated rendering pipelines that generate 20+ hook combinations from a single script.",
        topics: [
          "Programmatic video rendering with Remotion and Python",
          "Dynamic auto-captions, sound effects & viral pacing",
          "A/B testing top-of-funnel hooks in the first 3 seconds",
          "Batch processing assets for TikTok, Instagram Reels, and YouTube Shorts"
        ],
        handsOnLab: "Set up an automated batch pipeline that generates 15 video variations in under 10 minutes."
      },
      {
        week: "Week 3",
        title: "Meta & TikTok Media Buying Strategies for 2026",
        description: "Deploy creative testing frameworks to isolate winning hooks without burning ad spend.",
        topics: [
          "Dynamic Creative Testing (DCT) setup on Meta Ads Manager",
          "TikTok Spark Ads & organic-to-paid amplification",
          "Budget scaling rules and bid cap strategies",
          "Analyzing creative fatigue and refresh cycles"
        ],
        handsOnLab: "Launch a live DCT testing campaign with your generated variations and establish attribution tracking."
      },
      {
        week: "Week 4",
        title: "Attribution, ROAS Optimization & Retainer Scaling",
        description: "Analyze blended metrics (MER, CAC, LTV) and package creative-as-a-service retainers for clients.",
        topics: [
          "Server-side tracking (CAPI) and attribution modeling",
          "Calculating true Marginal ROAS and customer lifetime value",
          "Packaging generative ad production as a $5k/mo agency service",
          "Final campaign performance review & certificate award"
        ],
        handsOnLab: "Present a complete 30-day Campaign Scale Plan with projected ROAS and budget allocation."
      }
    ],
    capstoneProjects: [
      {
        title: "Omnichannel Generative Ad Campaign & Growth Engine",
        description: "A complete launch-ready ad campaign featuring 20 AI UGC video variations, automated landing page personalization, and Meta/TikTok media buying structure.",
        technologies: ["Runway Gen-3", "ElevenLabs", "Midjourney", "Meta Ads Manager", "TikTok Ads"]
      }
    ],
    instructors: [
      {
        name: "Nadia Thorne",
        role: "Director of Growth & Paid Media, Vixora Hub",
        bio: "Managed over $15M in profitable ad spend across D2C and B2B SaaS platforms.",
        companyBackground: "Vixora Media Collective"
      }
    ],
    faqs: [
      {
        q: "Do I need high-end video editing software like Premiere or After Effects?",
        a: "No! We teach cloud-based AI tools and automated pipelines that do not require expensive hardware or prior editing experience."
      }
    ],
    certificateType: "Vixora Certified Growth & Media Specialist"
  }
];

import { BRAND_CONFIG } from './brandConfig';
export { BRAND_CONFIG };

export const COMPANY_CONTACT = {
  email: BRAND_CONFIG.email,
  secondaryEmail: BRAND_CONFIG.secondaryEmail,
  phone: BRAND_CONFIG.phone,
  whatsappNumber: BRAND_CONFIG.whatsappNumber,
  whatsappUrl: BRAND_CONFIG.whatsappUrl,
  domain: BRAND_CONFIG.domain,
  academyDomain: BRAND_CONFIG.academyDomain,
  address: BRAND_CONFIG.address,
  socials: [
    { name: "Twitter / X", url: "https://twitter.com", icon: "Twitter" },
    { name: "LinkedIn", url: "https://linkedin.com", icon: "Linkedin" },
    { name: "GitHub", url: "https://github.com", icon: "Github" },
    { name: "YouTube", url: "https://youtube.com", icon: "Youtube" }
  ]
};

