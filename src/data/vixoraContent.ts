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
  level: 'All Levels' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Executive' | 'Beginner to Intermediate' | 'Beginner to Professional';
  status?: 'active' | 'archived' | 'upcoming';
  track: 'Data & Analytics' | 'Engineering & AI' | 'Executive & Leadership' | 'Business Automation' | 'Design & Marketing';
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
  statsBadge: "Enterprise-Grade Software & Autonomous Systems",
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
        iconName: "Bot",
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
  { name: "Supabase", category: "Database", role: "Real-time PostgreSQL with pgvector embeddings & instant authentication", icon: "Database", badge: "PostgreSQL" },
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
    quote: "Vixora completely transformed our brand and customer operations. Their team delivered a seamless digital platform in record time that our clients love using every day. The attention to detail and execution speed was exceptional.",
    author: "Tree of Mona",
    role: "Founder & Creative Director",
    company: "Subletraces",
    industry: "Brand & Fashion",
    rating: 5
  },
  {
    id: "test-2",
    quote: "The automated ordering and AI customer support system built by Vixora handles over 80% of our daily WhatsApp and online inquiries instantly. We were able to scale our customer base significantly without operational strain.",
    author: "Mrs. Zulaekha",
    role: "Managing Director",
    company: "Hivea Foods",
    industry: "Food & Consumer Goods",
    rating: 5
  },
  {
    id: "test-3",
    quote: "From our digital inventory showcase to inbound vehicle sales pipelines, Vixora acted as our true technology partner. They think like business builders and engineer systems that drive immediate results.",
    author: "Adewale Nafiudeen",
    role: "Managing Director & CEO",
    company: "Omo Oba Sarumi Autos",
    industry: "Automotive & Logistics",
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

export const BANK_PAYMENT_DETAILS = {
  bankName: "OPay",
  accountName: "VIXORA DIGITAL HUB",
  accountNumber: "6112986232"
};

export const ACADEMY_COURSES: AcademyCourse[] = [
  // -------------------------------------------------------------
  // 2026 ACCREDITED CURRICULUM COURSES (Active Catalog)
  // -------------------------------------------------------------
  {
    id: "course-ai-automation-c2",
    slug: "ai-automation-digital-literacy",
    title: "AI Automation & Digital Literacy",
    subtitle: "Master AI prompting, no-code workflows, and automated business agents in a 12-week practical cohort.",
    badge: "2026 Curriculum • ₦60,000",
    level: "Beginner",
    status: "active",
    track: "Business Automation",
    format: "12-Week Hybrid Cohort (Online + Practical Labs)",
    duration: "12 Weeks",
    commitment: "4-5 hrs/week (Flexible Bite-Sized Sessions & Live Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "₦60,000",
    tuitionNote: "Standard 2026 tuition: ₦60,000 ($50 USD). Includes live labs, automated workflows, and lifetime alumni access.",
    seatsRemaining: 15,
    targetAudience: "Beginners, Small Business Owners, Professionals, and Job Seekers looking to master no-code AI automation.",
    description: "This beginner-friendly course teaches students to use AI tools and no-code automation to work faster and earn more. Build real automations and AI assistants for everyday and business tasks.",
    heroPitch: "Master AI prompting, no-code Zapier/Make automations, custom AI agents, and document processing in 12 structured weeks.",
    highlights: [
      "12 weeks of hands-on training with zero coding background required",
      "Master ChatGPT, Claude, Gemini, Zapier, Make, and n8n",
      "Build working automations, custom AI chatbots, and CRM lead flows",
      "Official Vixora Digital Hub Certificate of Completion upon graduation"
    ],
    outcomes: [
      "Use computers, cloud tools and the internet safely and confidently",
      "Write clear prompts that get useful results from AI tools",
      "Design and build no-code automations that connect everyday apps",
      "Build custom AI assistants and chatbots for business operations"
    ],
    prerequisites: [
      "A laptop or smartphone with internet access",
      "Zero coding required (taught from scratch)"
    ],
    curriculum: [
      "Phase 1 — Digital Literacy & Prompt Engineering Foundations",
      "Phase 2 — AI for Writing, Research, Planning & Spreadsheets",
      "Phase 3 — Workflow Automation with Zapier, Make & Custom Chatbots",
      "Phase 4 — Portfolio Project, Client Pitch & Monetization"
    ],
    weeklySyllabus: [
      {
        week: "Week 01",
        title: "Digital Literacy Foundations & Cloud Security",
        description: "Files, folders, Google Drive, password hygiene, and cloud account security setup.",
        topics: ["Cloud file systems", "Passwords & 2FA", "Search skills", "Collaboration workspace"],
        handsOnLab: "Organize a structured cloud folder system and set up all course accounts securely."
      },
      {
        week: "Week 02",
        title: "Introduction to AI & Main AI Tools",
        description: "Guided tour of ChatGPT, Claude, and Gemini across real-world tasks.",
        topics: ["AI vs ML vs LLMs", "Hallucinations & verification", "AI tools comparison", "Responsible AI"],
        handsOnLab: "Execute identical tasks across three AI tools and compare output accuracy and style."
      },
      {
        week: "Week 03",
        title: "Prompt Engineering Principles",
        description: "Role, context, task, format, and constraints for production-grade prompts.",
        topics: ["Anatomy of a strong prompt", "Few-shot prompting", "Chain of thought", "Prompt libraries"],
        handsOnLab: "Rewrite ten weak prompts into production-grade templates and test them."
      },
      {
        week: "Week 04",
        title: "AI for Writing, Research & Planning",
        description: "Drafting, editing, summarizing PDFs, and research verification with AI.",
        topics: ["Document drafting", "PDF summaries", "Fact checking", "AI project planning"],
        handsOnLab: "Produce a comprehensive research summary and work plan using AI."
      },
      {
        week: "Week 05",
        title: "Excel & AI for Spreadsheet Mastery",
        description: "Formulas, sorting, filtering, data cleaning, and automated spreadsheet logic.",
        topics: ["Excel fundamentals", "AI formula generation", "Data cleaning", "Trend insights"],
        handsOnLab: "Build a small business revenue and expense tracker with AI-generated formulas."
      },
      {
        week: "Weeks 06-07",
        title: "Workflow Automation with Zapier & Make",
        description: "Triggers, actions, filters, API webhooks, Zapier, and Make scenario builds.",
        topics: ["Workflow mapping", "Zapier multi-step Zaps", "Make scenarios", "Error handling"],
        handsOnLab: "Build a lead form-to-spreadsheet-to-email notification automation in Zapier and Make."
      },
      {
        week: "Weeks 08-09",
        title: "AI Agents, Chatbots & Operations",
        description: "No-code AI chatbots, knowledge bases, custom GPTs, and business CRM sync.",
        topics: ["Chatbots vs agents", "Knowledge bases", "Customer support bots", "Email triage"],
        handsOnLab: "Build an end-to-end lead capture, AI qualification, and automated follow-up system."
      },
      {
        week: "Weeks 10-12",
        title: "Portfolio Project, Presentation & Monetization",
        description: "Real-world portfolio automation, live presentation, proposal writing, and pricing.",
        topics: ["Portfolio build", "5-min live demo", "Proposal writing", "Service packages"],
        handsOnLab: "Build a complete real-world business automation with documentation and live demo."
      }
    ],
    capstoneProjects: [
      {
        title: "Real-World Business Automation or AI Agent Build",
        description: "A working multi-step automation or custom AI chatbot with documentation and an estimate of time saved for the business.",
        technologies: ["Zapier", "Make.com", "ChatGPT API", "Google Workspace", "Notion"]
      }
    ],
    instructors: [
      {
        name: "Vixora AI Automation Faculty",
        role: "Lead Instructors & Automation Specialists",
        bio: "Practicing automation engineers who build production no-code systems for enterprise clients.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "Do I need any coding experience?",
        a: "No coding is required. The entire course uses no-code visual drag-and-drop tools and plain-language AI prompts."
      }
    ],
    certificateType: "Vixora Certificate of Completion in AI Automation & Digital Literacy"
  },
  {
    id: "course-va-setter-c2",
    slug: "virtual-assistance-appointment-setter",
    title: "Virtual Assistance & Appointment Setting",
    subtitle: "Master executive VA operations, AI productivity, CRM lead management, and cold outreach scripts in an 8-week cohort.",
    badge: "2026 Curriculum • ₦60,000",
    level: "Beginner",
    status: "active",
    track: "Business Automation",
    format: "8-Week Hybrid Cohort (Online + Practical Labs)",
    duration: "8 Weeks",
    commitment: "4-5 hrs/week (Flexible Bite-Sized Sessions & Live Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "₦60,000",
    tuitionNote: "Standard 2026 tuition: ₦60,000 ($50 USD). Includes script suites, CRM templates, and portfolio review.",
    seatsRemaining: 12,
    targetAudience: "Aspiring Virtual Assistants, Appointment Setters, Remote Professionals, and Freelancers.",
    description: "Train to work as a professional virtual assistant and appointment setter. Learn inbox management, scheduling across time zones, CRM lead tracking, AI speed tools, and cold outreach scripts.",
    heroPitch: "Become an in-demand Executive VA & Appointment Setter with AI speed tools, CRM lead management, and proven client outreach scripts.",
    highlights: [
      "8 weeks of practical executive VA and appointment setting training",
      "Master Notion, Google Workspace, Trello, HubSpot CRM, and AI assistants",
      "Cold outreach scripts for email, LinkedIn DMs, and discovery calls",
      "Official Vixora Digital Hub Certificate of Completion upon graduation"
    ],
    outcomes: [
      "Manage high-volume email inboxes and complex calendars across time zones",
      "Run cold outreach campaigns by email and LinkedIn using tested scripts",
      "Manage CRM pipelines and book qualified discovery calls",
      "Package VA and appointment setting services for international clients"
    ],
    prerequisites: [
      "A laptop or smartphone with internet connection",
      "Good written and verbal communication skills"
    ],
    curriculum: [
      "Phase 1 — Introduction to VA & Workspace Admin",
      "Phase 2 — Core VA Operations & AI Productivity",
      "Phase 3 — CRM Systems, Outreach Scripts & Booking Calls",
      "Phase 4 — Client Acquisition, Pricing Packages & Portfolio Launch"
    ],
    weeklySyllabus: [
      {
        week: "Week 01",
        title: "Introduction to VA & Appointment Setting",
        description: "Role expectations, remote work protocols, niche selection, and professional communication.",
        topics: ["VA vs Appointment Setter", "Remote work norms", "Niche positioning", "Email etiquette"],
        handsOnLab: "Draft a professional client introduction email and niche positioning statement."
      },
      {
        week: "Week 02",
        title: "Productivity & Workspace Admin Tools",
        description: "Google Workspace, Notion dashboards, Trello Kanban boards, and Toggl time tracking.",
        topics: ["Google Workspace", "Notion databases", "Trello task boards", "File structure"],
        handsOnLab: "Configure a complete mock client workspace with task boards and shared folders."
      },
      {
        week: "Week 03",
        title: "Email & Calendar Management (Inbox Zero)",
        description: "Inbox Zero methodology, scheduling across time zones, Calendly, and travel itineraries.",
        topics: ["Inbox Zero", "Calendar buffer rules", "Calendly setup", "Conflict resolution"],
        handsOnLab: "Process a mock inbox of 50 client emails and resolve 1 week of scheduling conflicts."
      },
      {
        week: "Week 04",
        title: "AI Productivity Suite for Virtual Assistants",
        description: "Prompting AI for email drafts, Otter meeting notes, research, and social captions.",
        topics: ["AI email drafting", "Meeting transcription", "Web research", "Privacy rules"],
        handsOnLab: "Complete a complex VA task suite (inbox responses, meeting summary, research) with AI."
      },
      {
        week: "Week 05",
        title: "CRM Systems & Lead Management",
        description: "HubSpot / GoHighLevel CRM pipelines, prospect sourcing, and lead qualification.",
        topics: ["CRM fundamentals", "Pipeline stages", "LinkedIn prospect sourcing", "Lead hygiene"],
        handsOnLab: "Build a qualified lead list of 30 prospects inside a CRM workspace."
      },
      {
        week: "Week 06",
        title: "Cold Outreach Strategies & Scriptwriting",
        description: "Cold email copy, LinkedIn DMs, phone scripts, and anti-spam compliance.",
        topics: ["Cold email subject lines", "LinkedIn DM sequences", "Phone call scripts", "Personalization"],
        handsOnLab: "Write a multi-touch outreach sequence (3 emails, 2 LinkedIn DMs, 1 phone script)."
      },
      {
        week: "Week 07",
        title: "Handling Objections & Booking Sales Calls",
        description: "Acknowledge-Reframe-Bridge framework, discovery call qualification, and reducing no-shows.",
        topics: ["Objection handling", "Call qualification", "Confirmation SMS/email", "Metrics tracking"],
        handsOnLab: "Participate in live role-play appointment-setting calls and objection exercises."
      },
      {
        week: "Week 08",
        title: "Landing Clients, Rates & Portfolio Launch",
        description: "Upwork/LinkedIn client sourcing, service packaging, contracts, onboarding, and portfolio.",
        topics: ["Client acquisition", "Hourly vs Retainer", "Onboarding intake", "Portfolio page"],
        handsOnLab: "Build service packages, client onboarding checklist, and present final portfolio."
      }
    ],
    capstoneProjects: [
      {
        title: "VA Service Package & Appointment Setting Campaign",
        description: "Niche service packages, CRM pipeline with 30 prospects, multi-touch outreach sequence, and onboarding checklist.",
        technologies: ["Google Workspace", "Notion", "HubSpot CRM", "Calendly", "ChatGPT"]
      }
    ],
    instructors: [
      {
        name: "Vixora Executive VA Faculty",
        role: "Lead Instructors & Remote Operations Specialists",
        bio: "Veteran executive virtual assistants supporting global founders and high-ticket sales teams.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "Do I need prior experience?",
        a: "No prior experience is required. We teach administrative fundamentals, CRM tools, and outreach scripts from scratch."
      }
    ],
    certificateType: "Vixora Certificate of Completion in Virtual Assistance & Appointment Setting"
  },
  {
    id: "course-web-dev-c2",
    slug: "ai-web-development-vibe-coding",
    title: "AI Web Development & Vibe Coding",
    subtitle: "Build web applications, React frontends, backend databases, and AI features using modern vibe coding toolchains.",
    badge: "2026 Curriculum • ₦60,000",
    level: "Beginner",
    status: "active",
    track: "Engineering & AI",
    format: "12-Week Hybrid Cohort (Online + Coding Labs)",
    duration: "12 Weeks",
    commitment: "5-6 hrs/week (Live Sessions & Build Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "₦60,000",
    tuitionNote: "Standard 2026 tuition: ₦60,000 ($50 USD). Includes live coding labs, code reviews, and hosting deployment.",
    seatsRemaining: 18,
    targetAudience: "Beginners, Aspiring Web Developers, Freelancers, and Entrepreneurs building digital products.",
    description: "Learn to build and launch real websites and web apps using HTML, CSS, JavaScript, React, cloud databases, and AI coding assistants like Cursor and Claude.",
    heroPitch: "Turn product ideas into deployed full-stack web applications with React, databases, and AI pair-programming assistants.",
    highlights: [
      "12 weeks of full-stack web development and vibe coding",
      "Master HTML5, CSS3, JavaScript ES6+, React 19, Tailwind, and Supabase",
      "Integrate live AI APIs (Gemini/OpenAI) into web applications",
      "Deploy production web apps with custom domains on Vercel"
    ],
    outcomes: [
      "Build responsive web applications with HTML, CSS, JavaScript, and React",
      "Use AI tools to write, test, debug, and audit code safely",
      "Connect backend cloud databases and persist user data",
      "Integrate AI features via REST APIs and deploy live to production"
    ],
    prerequisites: [
      "A laptop with internet access",
      "Zero prior coding required (taught from the ground up)"
    ],
    curriculum: [
      "Phase 1 — Web Foundations (HTML5, CSS3, Flexbox, Grid & Git)",
      "Phase 2 — Programming Logic & Vibe Coding (JavaScript DOM & AI Pair Programming)",
      "Phase 3 — Full-Stack Development (React 19, Supabase PostgreSQL & AI APIs)",
      "Phase 4 — Production Deployment, Domain Setup & Portfolio Showcase"
    ],
    weeklySyllabus: [
      {
        week: "Week 01",
        title: "How the Web Works & Workspace Setup",
        description: "Browsers, servers, VS Code, dev tools, and Git/GitHub fundamentals.",
        topics: ["Client-server architecture", "VS Code setup", "DevTools console", "Git & GitHub"],
        handsOnLab: "Set up local coding workspace and publish your first HTML page to GitHub."
      },
      {
        week: "Week 02",
        title: "HTML & Semantic Page Structure",
        description: "Boilerplate, typography, links, form validation, and semantic HTML5.",
        topics: ["Semantic tags", "Forms & inputs", "Accessibility attributes", "DOM planning"],
        handsOnLab: "Build a personal developer bio page and a business lead intake form."
      },
      {
        week: "Week 03",
        title: "CSS Styling, Flexbox & Responsive Design",
        description: "Selectors, box model, Flexbox alignment, CSS Grid, and mobile media queries.",
        topics: ["Box model", "Flexbox layout", "CSS Grid", "Mobile responsive design"],
        handsOnLab: "Style Week 2 HTML files into a responsive, polished business website."
      },
      {
        week: "Week 04",
        title: "JavaScript Fundamentals",
        description: "Variables, data types, operators, conditionals, functions, arrays, and objects.",
        topics: ["Variables & scope", "Arrow functions", "Array methods (map/filter)", "Console debugging"],
        handsOnLab: "Build two standalone JS programs: a price calculator and an interactive quiz."
      },
      {
        week: "Week 05",
        title: "JavaScript DOM & Interactive Web Apps",
        description: "DOM manipulation, event listeners, async/await, fetch API, and LocalStorage.",
        topics: ["DOM querySelector", "Form events", "Async/await fetch", "LocalStorage state"],
        handsOnLab: "Build a dynamic To-Do app and an interactive weather app fetching live API data."
      },
      {
        week: "Week 06",
        title: "Vibe Coding & AI Coding Assistants",
        description: "Prompting AI coding assistants, step-by-step feature prompts, and code auditing.",
        topics: ["Vibe coding models", "Context-rich prompts", "Code auditing", "API key security"],
        handsOnLab: "Build a complete mini web app using AI prompting, then audit and refactor the code."
      },
      {
        week: "Week 07",
        title: "High-Converting Landing Pages with AI",
        description: "Landing page architecture, responsive assets, contact form handlers, and Lighthouse tuning.",
        topics: ["Page structure", "Asset optimization", "Form handlers", "Performance tuning"],
        handsOnLab: "Build a production-ready landing page for a real or sample business."
      },
      {
        week: "Week 08",
        title: "Frontend Frameworks: Introduction to React",
        description: "JSX, components, props, useState, useEffect, and React 19 Vite setup.",
        topics: ["React JSX", "useState & useEffect", "Form handling", "Vite build tool"],
        handsOnLab: "Rebuild an earlier JavaScript app into a modular React application."
      },
      {
        week: "Week 09",
        title: "Backend Services & Database Fundamentals",
        description: "JSON REST APIs, relational database tables, Supabase / PostgreSQL, and CRUD operations.",
        topics: ["REST API basics", "Relational tables", "Supabase PostgreSQL", "CRUD operations"],
        handsOnLab: "Add database persistent storage (saving and retrieving records) to your React app."
      },
      {
        week: "Week 10",
        title: "API Integrations & AI Features",
        description: "Consuming REST APIs, integrating AI model endpoints, and handling loading/errors.",
        topics: ["API consumption", "OpenAI / Gemini endpoints", "Loading states", "Error boundaries"],
        handsOnLab: "Integrate an AI-powered feature (e.g. smart content generator or chatbot) into your web app."
      },
      {
        week: "Weeks 11-12",
        title: "Deployment, Domains & Capstone Showcase",
        description: "Vercel hosting, custom domains, SSL certificates, pre-launch QA, and capstone presentation.",
        topics: ["Vercel hosting", "Custom domain DNS", "Cross-browser QA", "Portfolio showcase"],
        handsOnLab: "Deploy your web application live on a custom URL and present your capstone project."
      }
    ],
    capstoneProjects: [
      {
        title: "Production Web Application with AI Feature Integration",
        description: "Responsive, deployed web application hosted live with database storage and working AI feature API.",
        technologies: ["React 19", "TypeScript", "Tailwind CSS", "Supabase", "Gemini API", "Vercel"]
      }
    ],
    instructors: [
      {
        name: "Vixora Engineering Faculty",
        role: "Lead Instructors & Senior Full-Stack Engineers",
        bio: "Full-stack software engineers building production Web & AI platforms.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "Will my project be live on the internet?",
        a: "Yes! Every student deploys their capstone project live to Vercel with a custom domain."
      }
    ],
    certificateType: "Vixora Certificate of Completion in AI Web Development & Vibe Coding"
  },
  {
    id: "course-content-creation-c2",
    slug: "ai-content-creation-media",
    title: "AI Content Creation & Personal Branding",
    subtitle: "Master AI copywriting, image generation, short video editing, and personal branding in a 10-week sprint.",
    badge: "2026 Curriculum • ₦20,000",
    level: "Beginner",
    status: "active",
    track: "Design & Marketing",
    format: "10-Week Practical Sprint (Online + Creative Labs)",
    duration: "10 Weeks",
    commitment: "3-4 hrs/week (Flexible Replays & Hands-On Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "₦20,000",
    tuitionNote: "Standard 2026 tuition: ₦20,000 ($20 USD). Fast-track creative media sprint.",
    seatsRemaining: 25,
    targetAudience: "Content Creators, Small Business Owners, Social Media Managers, Marketers, and Beginners.",
    description: "Create professional content with AI tools: written posts, images, vertical video, synthetic voiceovers, and short-form clips.",
    heroPitch: "Build an automated content creation engine for social media, YouTube Shorts, Reels, and personal brand monetization.",
    highlights: [
      "10 weeks of practical AI creative content production",
      "Master ChatGPT, Midjourney, Canva, CapCut, and ElevenLabs",
      "Produce viral short video scripts, synthetic voiceovers, and dynamic captions",
      "Batch-produce a 30-day content calendar and publish your portfolio"
    ],
    outcomes: [
      "Write captions, scripts, blogs and ad copy with AI in your own voice",
      "Design graphics and images with AI tools and Canva",
      "Create and edit short videos with AI and CapCut",
      "Package content services for clients and earn from them"
    ],
    prerequisites: [
      "A smartphone or laptop with internet connection",
      "Zero prior design or video editing required"
    ],
    curriculum: [
      "Phase 1 — Foundations & AI Copywriting",
      "Phase 2 — AI Image Generation, Canva & Video Storyboarding",
      "Phase 3 — CapCut Video Editing & AI Audio Synthesis",
      "Phase 4 — Social Media Strategy, 30-Day Calendars & Brand Launch"
    ],
    weeklySyllabus: [
      {
        week: "Week 01",
        title: "Content Creation Fundamentals & AI Toolkit",
        description: "Niche selection, audience personas, content pillars, and AI creative tools tour.",
        topics: ["Content pillars", "Niche positioning", "Value framework", "Ethics & disclosure"],
        handsOnLab: "Draft a niche positioning brief and analyze three top creators in your niche."
      },
      {
        week: "Week 02",
        title: "AI Copywriting & Tone Engineering",
        description: "Prompt frameworks for copy, viral hooks, captions, video scripts, and newsletter copy.",
        topics: ["Copy prompt formula", "Viral hook structure", "Tone customization", "Fact-checking"],
        handsOnLab: "Write 1 week of social captions, a short video script, and a blog outline."
      },
      {
        week: "Week 03",
        title: "AI Image Generation & Canva Design",
        description: "Layout, typography, Canva brand kits, and AI text-to-image prompts.",
        topics: ["Design principles", "Canva mastery", "Image generation prompts", "Commercial usage"],
        handsOnLab: "Design a brand visual kit, 3 social media graphics, and 1 multi-slide carousel."
      },
      {
        week: "Week 04",
        title: "AI Video Production & Storyboarding",
        description: "Short-form video structure (0-3s hook, story, CTA), storyboards, and AI avatars.",
        topics: ["Short-form video formula", "Storyboarding with AI", "Aspect ratios 9:16", "Repurposing"],
        handsOnLab: "Script, storyboard, and generate a 30 to 60 second video."
      },
      {
        week: "Week 05",
        title: "Video Editing with CapCut & AI",
        description: "Trimming, cuts, transitions, automated captions, kinetic subtitles, and sound effects.",
        topics: ["CapCut editing", "AI auto-captions", "Sound design & SFX", "Export settings"],
        handsOnLab: "Edit two short-form videos with AI captions, sound effects, and strong hooks."
      },
      {
        week: "Week 06",
        title: "AI Voiceovers, Audio & Music Production",
        description: "ElevenLabs text-to-speech, audio noise reduction, background music, and voice cloning.",
        topics: ["AI voice generation", "Audio cleaning", "Royalty-free music", "Voice cloning ethics"],
        handsOnLab: "Produce a voiceover video and a short audio snippet."
      },
      {
        week: "Week 07",
        title: "Social Media Strategy & Platform Optimization",
        description: "Platform dynamics for Reels, Shorts, TikTok, LinkedIn, and X algorithms.",
        topics: ["Platform algorithms", "Posting frequency", "Retention hooks", "Analytics metrics"],
        handsOnLab: "Build a multi-platform strategy and produce 3 tailored short-form pieces."
      },
      {
        week: "Week 08",
        title: "Content Calendars, Batching & Scheduling",
        description: "30-day content matrix, batch production pipeline, repurposing, and scheduling.",
        topics: ["Content matrix", "Batch production", "Asset repurposing", "Automated posting"],
        handsOnLab: "Build a 30-day content calendar and batch-produce Week 1 content."
      },
      {
        week: "Weeks 09-10",
        title: "Personal Brand Launch & Monetization",
        description: "Social media profile optimization, portfolio site launch, service packages, and pitches.",
        topics: ["Profile optimization", "Single-page portfolio", "Client retainers", "Final showcase"],
        handsOnLab: "Create a client service offer sheet and present your final capstone project."
      }
    ],
    capstoneProjects: [
      {
        title: "30-Day Content System & Portfolio Showcase",
        description: "Audience brief, 30-day content calendar, 1 week of finished media assets, and published portfolio page.",
        technologies: ["ChatGPT", "Midjourney", "Canva", "CapCut", "ElevenLabs"]
      }
    ],
    instructors: [
      {
        name: "Vixora Creative Media Faculty",
        role: "Lead Instructors & Digital Media Producers",
        bio: "Generative AI creators and media producers.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "Can I take this on smartphone?",
        a: "Yes! Canva, CapCut, and major AI web apps work on smartphones."
      }
    ],
    certificateType: "Vixora Certificate of Completion in AI Content Creation & Personal Branding"
  },
  {
    id: "course-data-science-ml-c2",
    slug: "machine-learning-data-science",
    title: "Data Science & Machine Learning (AI Engineer)",
    subtitle: "Master Python, R, statistical modeling, supervised/unsupervised ML algorithms, model evaluation, and deployment.",
    badge: "2026 Flagship Track • ₦150,000",
    level: "Beginner to Professional",
    status: "active",
    track: "Data & Analytics",
    format: "16-Week Hybrid Cohort (Online + Interactive Labs)",
    duration: "16 Weeks",
    commitment: "5-6 hrs/week (Interactive Sessions & Build Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "₦150,000",
    tuitionNote: "Standard 2026 tuition: ₦150,000 ($120 USD). Flagship AI Engineer program.",
    seatsRemaining: 10,
    targetAudience: "Aspiring Data Scientists, ML Engineers, STEM Graduates, Analysts, and Developers.",
    description: "Go from data science foundations to building, evaluating, and deploying machine learning models in Python and R.",
    heroPitch: "Master Python, R, Scikit-Learn, statistical hypothesis testing, ML regression/classification, and model deployment APIs in 16 weeks.",
    highlights: [
      "16 weeks of rigorous data science and machine learning training",
      "Master Python (NumPy, Pandas, Scikit-Learn) and R (Tidyverse, ggplot2)",
      "Train regression, classification, clustering, and ensemble models",
      "Build an end-to-end ML pipeline with FastAPI model deployment"
    ],
    outcomes: [
      "Clean, manipulate, and explore multi-dimensional business datasets",
      "Build and evaluate supervised and unsupervised ML models",
      "Optimize hyperparameters and prevent overfitting / data leakage",
      "Deploy predictive models as REST API endpoints"
    ],
    prerequisites: [
      "A laptop with internet access",
      "Basic math comfort helpful (taught step-by-step)"
    ],
    curriculum: [
      "Phase 1 — Python & Data Manipulation (NumPy, Pandas & Data Cleaning)",
      "Phase 2 — Visualization, Statistics & R Tidyverse (ggplot2 & EDA)",
      "Phase 3 — Machine Learning (Supervised Regression/Classification & Unsupervised Clustering)",
      "Phase 4 — AI Tools & Neural Networks Introduction",
      "Phase 5 — Capstone Pipeline & ML Career Readiness"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 01-02",
        title: "Introduction to Data Science & Python Setup",
        description: "Data science lifecycle, roles, Jupyter Colab notebook setup, and Python logic.",
        topics: ["Lifecycle stages", "Colab setup", "Python data types", "Control flow"],
        handsOnLab: "Classify business problems into ML tasks and run an end-to-end Colab notebook."
      },
      {
        week: "Weeks 03-04",
        title: "Python Data Handling (NumPy & Pandas)",
        description: "Vectorized array math, Pandas DataFrames, indexing, filtering, and data cleaning.",
        topics: ["NumPy arrays", "Pandas DataFrames", "Data cleaning", "Missing value imputation"],
        handsOnLab: "Load, clean, filter, and summarize a real-world multi-table dataset."
      },
      {
        week: "Weeks 05-06",
        title: "Data Visualization & Statistics Essentials",
        description: "Matplotlib, Seaborn charts, descriptive statistics, probability, and correlation.",
        topics: ["Seaborn charts", "Descriptive stats", "Normal distribution", "Correlation vs causation"],
        handsOnLab: "Build a statistical visualization notebook answering key business questions."
      },
      {
        week: "Weeks 07-08",
        title: "R Programming & Exploratory Data Analysis",
        description: "RStudio IDE, tidyverse data wrangling, ggplot2 Grammar of Graphics, and R Markdown.",
        topics: ["RStudio & tidyverse", "dplyr operations", "ggplot2 charts", "R Markdown reports"],
        handsOnLab: "Perform a full Exploratory Data Analysis on a new dataset in R."
      },
      {
        week: "Weeks 09-10",
        title: "Supervised Learning: Regression Models",
        description: "Train/test splits, Linear Regression, Ridge, Lasso, Decision Tree Regressor, and RMSE.",
        topics: ["Train/test split", "Linear regression", "L1/L2 Regularization", "RMSE evaluation"],
        handsOnLab: "Build and compare two regression models (e.g. house price or sales prediction)."
      },
      {
        week: "Weeks 11-12",
        title: "Supervised Learning: Classification & Ensembles",
        description: "Logistic Regression, Random Forests, Confusion Matrix, F1-Score, and ROC-AUC.",
        topics: ["Logistic regression", "Random Forests", "Confusion matrix", "ROC-AUC curves"],
        handsOnLab: "Build and evaluate a customer churn classifier in scikit-learn."
      },
      {
        week: "Weeks 13-14",
        title: "Unsupervised Learning, Tuning & Pipelines",
        description: "k-Means clustering, PCA dimensionality reduction, GridSearchCV, and scikit-learn Pipelines.",
        topics: ["k-Means clustering", "PCA reduction", "Cross-validation", "scikit-learn Pipelines"],
        handsOnLab: "Build an automated ML Pipeline with hyperparameter tuning and model persistence."
      },
      {
        week: "Weeks 15-16",
        title: "AI Tools, Model Deployment & Capstone Defense",
        description: "FastAPI inference endpoints, Joblib model serialization, and live capstone defense.",
        topics: ["FastAPI endpoints", "Joblib serialization", "GitHub portfolio", "Technical defense"],
        handsOnLab: "Deploy an end-to-end predictive API with FastAPI and defend the final Capstone Project."
      }
    ],
    capstoneProjects: [
      {
        title: "End-to-End Machine Learning Model Pipeline & Technical Report",
        description: "Cleaned dataset, EDA, trained ML model comparison, and FastAPI inference endpoint.",
        technologies: ["Python", "Scikit-Learn", "FastAPI", "R", "Pandas", "Matplotlib"]
      }
    ],
    instructors: [
      {
        name: "Vixora Data Science Faculty",
        role: "Lead Instructors & Senior AI Architects",
        bio: "Senior AI research scientists and enterprise data pipeline engineers.",
        companyBackground: "Vixora Labs"
      }
    ],
    faqs: [
      {
        q: "What programming languages will I learn?",
        a: "Both Python and R, using Jupyter Notebooks, Colab, and RStudio."
      }
    ],
    certificateType: "Official Vixora Certified Machine Learning & Data Science Specialist"
  },
  {
    id: "course-data-analysis-cohort",
    slug: "data-analysis-cohort",
    title: "Data Analysis & Business Intelligence",
    subtitle: "Master Excel, SQL, Python, Power BI, and AI-assisted data storytelling in a 16-week practical cohort.",
    badge: "2026 Curriculum • ₦60,000",
    level: "Beginner",
    status: "active",
    track: "Data & Analytics",
    format: "16-Week Hybrid Cohort (Online & Physical Labs)",
    duration: "16 Weeks",
    commitment: "5-6 hrs/week (Flexible Bite-Sized Sessions & Labs)",
    nextCohortDate: "November 16, 2026",
    tuition: "₦60,000",
    tuitionNote: "Standard 2026 tuition: ₦60,000 ($50 USD). Includes Excel, SQL, Power BI, and Capstone review.",
    seatsRemaining: 12,
    targetAudience: "Students, Graduates, Job Seekers, Analysts, and Complete Beginners.",
    description: "A 16-week project-based program covering the complete data analyst toolkit: Excel → SQL → Power BI → Python & AI-assisted analysis.",
    heroPitch: "Turn raw data into business decisions with Excel, SQL queries, interactive Power BI dashboards, and AI data analysis.",
    highlights: [
      "16 weeks of structured data analysis and business intelligence training",
      "Master Excel, SQL (PostgreSQL/MySQL), Power BI, DAX, and Python",
      "Build interactive executive dashboards and customer retention models",
      "Official Vixora Digital Hub Certificate of Completion upon graduation"
    ],
    outcomes: [
      "Clean messy datasets using Excel & Power Query",
      "Write SQL queries with JOINs, aggregations, and window functions",
      "Build interactive Power BI dashboards with DAX measures",
      "Present executive data stories using the Finding → Evidence → Meaning → Recommendation framework"
    ],
    prerequisites: [
      "A laptop with internet access",
      "Zero prior coding or math required (taught from scratch)"
    ],
    curriculum: [
      "Phase 1 — Excel Fundamentals & Data Cleaning",
      "Phase 2 — SQL Databases & Visual Analytics",
      "Phase 3 — Power BI Intelligence & AI Analysis",
      "Phase 4 — Business Diagnostics & Capstone Defense"
    ],
    weeklySyllabus: [
      {
        week: "Weeks 01-02",
        title: "Introduction to Data Analysis & Excel Fundamentals",
        description: "Data analysis lifecycle, Excel formulas, lookup functions (XLOOKUP), and business sales models.",
        topics: ["Data analysis lifecycle", "Excel formulas & functions", "XLOOKUP & logic", "Sales model building"],
        handsOnLab: "Build an automated Business Sales Analysis model in Excel with summary metrics."
      },
      {
        week: "Weeks 03-04",
        title: "Data Cleaning, Preparation & Pivot Tables",
        description: "Power Query data transformation, descriptive statistics, growth rates, and dynamic Pivot Tables.",
        topics: ["Power Query", "Data cleaning", "Descriptive stats", "Pivot Tables & Slicers"],
        handsOnLab: "Clean an authentic messy multi-year transactional dataset and build an Excel Pivot Dashboard."
      },
      {
        week: "Weeks 05-06",
        title: "Data Visualization & SQL for Data Analysis",
        description: "Visual hierarchy, relational databases, SELECT, WHERE, GROUP BY, JOINs, and window functions.",
        topics: ["Visual hierarchy", "Relational databases", "SQL JOINs & aggregations", "Window functions"],
        handsOnLab: "Query a multi-table Customer & Sales Database to extract revenue cohorts and retention rates."
      },
      {
        week: "Weeks 07-08",
        title: "Power BI Business Intelligence & AI Analysis",
        description: "Star schemas, DAX measures (CALCULATE), cross-filtering, and AI-assisted SQL/formula debugging.",
        topics: ["Power BI modeling", "DAX measures", "Interactive dashboards", "AI formula generation"],
        handsOnLab: "Build a production-ready Power BI Executive Operations & Revenue Dashboard."
      },
      {
        week: "Weeks 09-11",
        title: "Business Data Analysis & Data Storytelling",
        description: "Domain metrics (CAC, LTV, churn), business diagnostics, and executive slide deck frameworks.",
        topics: ["Domain metrics", "Diagnostic analysis", "Storytelling framework", "Executive summaries"],
        handsOnLab: "Conduct a full business diagnostics review on a declining commercial product."
      },
      {
        week: "Weeks 12-16",
        title: "Data Analyst Portfolio, Freelancing & Final Capstone",
        description: "Packaging projects on GitHub/Notion, freelancing offers, and final Capstone Project defense.",
        topics: ["Portfolio packaging", "Freelancing offers", "Proposal writing", "Capstone defense"],
        handsOnLab: "Complete and present your full Final Capstone Project from raw data to recommendations."
      }
    ],
    capstoneProjects: [
      {
        title: "End-to-End Enterprise Sales & Revenue Intelligence Dashboard",
        description: "Power BI dashboard, SQL customer retention database analysis, and executive diagnostic report.",
        technologies: ["Excel", "Power Query", "PostgreSQL", "Power BI", "DAX"]
      }
    ],
    instructors: [
      {
        name: "Vixora Data Analytics Faculty",
        role: "Lead Instructors & Senior BI Engineers",
        bio: "Senior data analysts and business intelligence specialists.",
        companyBackground: "Vixora Digital Hub"
      }
    ],
    faqs: [
      {
        q: "What tools are covered in this course?",
        a: "Excel, Power Query, SQL (PostgreSQL/MySQL), and Power BI."
      }
    ],
    certificateType: "Vixora Certificate of Completion in Data Analysis & Business Intelligence"
  },

  // -------------------------------------------------------------
  // COHORT 1.0 MASTER VAULT (Preserved Untouched)
  // -------------------------------------------------------------
  {
    id: "course-cohort-1-master-bundle",
    slug: "cohort-1-master-bundle",
    title: "Cohort 1.0: 5-in-1 Masterclass All-Access Pass",
    subtitle: "Complete access to all 5 training tracks: AI Content Creation, AI Automation, AI Web Development, Client Acquisition, and PDF Automation & Digital Products.",
    badge: "Flagship Bundle • ₦20,000",
    level: "All Levels",
    status: "active",
    track: "Engineering & AI",
    format: "5 Complete Modular Tracks + 35h Video Vault + 18 PDFs + Private Telegram Mastermind",
    duration: "Full Lifetime Access",
    commitment: "Self-Paced with Ongoing Community Mentorship",
    nextCohortDate: "Immediate Access (Cohort 1.0 Vault)",
    tuition: "₦20,000",
    tuitionNote: "Includes all 5 courses (Standard price ₦44,000 when purchased separately). Save over 54%.",
    seatsRemaining: 15,
    targetAudience: "Ambitious Builders, Creators, Developers, Consultants and Entrepreneurs.",
    description: "The complete Cohort 1.0 vault. Receive full access to all 5 tracks: AI Content Creation, AI Automation, AI Web Development & Design, Client Acquisition & Freelancing, and PDF Automation & Digital Products. Includes all 35+ hours of session recordings, 18 strategy PDFs, workflow blueprints, and lifetime access to our Private Telegram Mastermind.",
    heroPitch: "Everything you need to master AI creation, automate business workflows, build modern web apps, sell high-margin PDF products, and acquire high-paying international clients.",
    highlights: [
      "Access to all 5 training tracks in one single enrollment pass",
      "35+ hours of recorded video masterclasses in our private Telegram group",
      "18 downloadable PDF guidebooks, prompt libraries & workflow blueprints",
      "Full access to the Private Telegram Mastermind with Dean Sarumi Hammad",
      "Cryptographically verifiable graduation certification"
    ],
    outcomes: [
      "Generate photorealistic visual media and short-form video pipelines",
      "Deploy production n8n workflows that automate business operations",
      "Build and deploy modern responsive web apps with React and Tailwind",
      "Research, author, and sell commercial PDF products with automated checkout",
      "Close $1,000 to $5,000 monthly client contracts and international retainers"
    ],
    prerequisites: [
      "A laptop or smartphone with internet connection",
      "Dedication to apply the frameworks and build real projects"
    ],
    curriculum: [
      "Track 1 — AI Content Creation (Image, Video & Audio)",
      "Track 2 — AI Automation & Autonomous Workflows (n8n & APIs)",
      "Track 3 — AI Web Development & Modern Design (React 19 & Tailwind)",
      "Track 4 — Client Acquisition & Freelancing (High-Ticket Positioning)",
      "Track 5 — PDF Automation & AI Digital Product Creation (W6 & W7)"
    ],
    weeklySyllabus: [
      {
        week: "Track 1",
        title: "AI Content Creation Masterclass",
        description: "Diffusion models, prompt engineering, voice cloning, and viral short-form video pipelines.",
        topics: ["Midjourney & Flux prompts", "Character consistency", "ElevenLabs voice cloning", "CapCut video pacing"],
        handsOnLab: "Deliverable: 3 Complete Viral Short Form Video Creatives"
      },
      {
        week: "Track 2",
        title: "AI Automation & Autonomous Systems",
        description: "n8n deployment, webhook architectures, OpenAI function calling, and CRM sync.",
        topics: ["Self-hosted n8n", "Webhook listeners", "AI email responder", "WhatsApp automation"],
        handsOnLab: "Deliverable: End-to-End Automated Client Ingestion & CRM Pipeline"
      },
      {
        week: "Track 3",
        title: "AI Web Development & Modern Design",
        description: "React 19, Tailwind CSS spatial math, AI-assisted vibe coding, and production deployment.",
        topics: ["Component architecture", "Dynamic state & hooks", "Paystack checkout integration", "Production deployment"],
        handsOnLab: "Deliverable: Live Production-Grade Web Application"
      },
      {
        week: "Track 4",
        title: "Client Acquisition & Freelancing",
        description: "High-ticket positioning, Upwork optimization, cold email systems, and closing retainers.",
        topics: ["Irresistible offer design", "Winning Upwork proposals", "Cold outbound campaigns", "Closing discovery calls"],
        handsOnLab: "Deliverable: Signed Client Contract & 50-Lead Outbound Campaign"
      },
      {
        week: "Track 5",
        title: "PDF Automation & AI Digital Product Creation (W6 & W7)",
        description: "Digital product research, validation, AI authoring, visual layout design, and automated storefront delivery.",
        topics: ["Audience research & validation", "AI fact-checking", "PDF guide & workbook formatting", "Paystack/Selar delivery automation"],
        handsOnLab: "Deliverable: Published Commercial PDF Product with Live Checkout Link"
      }
    ],
    capstoneProjects: [
      {
        title: "Full-Stack AI Business or Agency Launch",
        description: "Deploy an automated business engine combining AI media, automated CRM pipelines, modern web landing page, and outbound client acquisition.",
        technologies: ["React 19", "n8n Self-Hosted", "Midjourney & Flux", "Upwork Proposal Deck"]
      }
    ],
    instructors: [
      {
        name: "Sarumi Hammad",
        role: "Dean & Academic Director, Vixora Academy",
        bio: "Director of technical programs and commercial software delivery across enterprise AI and automation clients worldwide.",
        companyBackground: "Vixora Digital Hub Academic Directorate"
      }
    ],
    faqs: [
      {
        q: "How do I access the session recordings and materials after payment?",
        a: "Immediately upon enrollment, you receive direct access instructions and an exclusive invitation link to join the Private Telegram Cohort 1.0 Mastermind where all HD video replays, PDF blueprints, and mentor discussions are hosted."
      },
      {
        q: "Can I watch the sessions at my own pace?",
        a: "Yes. All sessions are permanently archived in the Telegram group so you can watch, rewatch, and download materials anytime at your own speed."
      }
    ],
    certificateType: "Official Vixora Certified Autonomous AI & Growth Engineer"
  },

  // -------------------------------------------------------------
  // ARCHIVED SPECIALIZATIONS (Separated Catalog Section)
  // -------------------------------------------------------------
  {
    id: "course-ai-image-short-videos-creation",
    slug: "ai-image-short-videos-creation",
    title: "AI Image & Short Videos Creation",
    subtitle: "Fast-track 4-week sprint on prompt engineering, photorealistic image generation, and CapCut video editing.",
    badge: "Archived Fast-Track • ₦4,000",
    level: "Beginner",
    status: "archived",
    track: "Design & Marketing",
    format: "4-Week Practical Sprint",
    duration: "4 Weeks",
    commitment: "3-4 hrs/week",
    nextCohortDate: "Archived Sprint",
    tuition: "₦4,000",
    tuitionNote: "Fast-track price: ₦4,000 ($4 USD).",
    seatsRemaining: 0,
    targetAudience: "Creators, Marketers, and Beginners.",
    description: "Learn how to use AI tools to create photorealistic images, stylized graphics, synthetic voiceovers, and short-form video scripts.",
    heroPitch: "Fast-track sprint for AI image generation, viral short-form video production, and social media media assets.",
    highlights: ["4 weeks fast-track sprint", "Midjourney & CapCut workflows", "Certificate of completion"],
    outcomes: ["Generate photorealistic images", "Edit short-form 9:16 vertical videos"],
    prerequisites: ["Smartphone or laptop"],
    curriculum: ["Module 1 — Image Prompting", "Module 2 — Short Video Production"],
    weeklySyllabus: [
      { week: "Week 01", title: "AI Image Generation", description: "Prompt formulas and Midjourney diffusion.", topics: ["Prompts", "Lighting"], handsOnLab: "Generate 5 assets" }
    ],
    capstoneProjects: [{ title: "Short Video Campaign", description: "CapCut video edit", technologies: ["CapCut", "Midjourney"] }],
    instructors: [{ name: "David Adeleke", role: "AI Producer", bio: "Digital media producer.", companyBackground: "Vixora Digital Hub" }],
    faqs: [{ q: "Is this course active?", a: "This sprint is available in our archived catalog." }],
    certificateType: "Certificate of Completion"
  },
  {
    id: "course-ai-automation-digital-skills",
    slug: "ai-automation-digital-skills",
    title: "AI Automation & Digital Skills",
    subtitle: "Beginner-friendly 12-week program covering ChatGPT, Make.com, Zapier, and document automation.",
    badge: "Archived Specialization • ₦10,000",
    level: "Beginner",
    status: "archived",
    track: "Business Automation",
    format: "12-Week Hybrid Cohort",
    duration: "12 Weeks",
    commitment: "4-5 hrs/week",
    nextCohortDate: "Archived Cohort",
    tuition: "₦10,000",
    tuitionNote: "Archived rate: ₦10,000 ($10 USD).",
    seatsRemaining: 0,
    targetAudience: "Students, Job Seekers, and Entrepreneurs.",
    description: "Hands-on program covering prompt engineering, Make/Zapier automations, PDF processing, and freelancing.",
    heroPitch: "Learn to build no-code automations and AI tools for business productivity.",
    highlights: ["Make & Zapier automations", "PDF document extraction", "Freelancing guide"],
    outcomes: ["Master ChatGPT prompts", "Build visual automations"],
    prerequisites: ["Laptop or smartphone"],
    curriculum: ["Module 1 — Prompt Mastery", "Module 2 — No-Code Automations"],
    weeklySyllabus: [
      { week: "Week 01", title: "Prompt Mastery", description: "LLM prompt frameworks.", topics: ["Prompting"], handsOnLab: "Build AI assistant" }
    ],
    capstoneProjects: [{ title: "Business Automation Pipeline", description: "Make.com lead automation", technologies: ["Make.com", "Zapier"] }],
    instructors: [{ name: "Vixora Instructors", role: "Automation Leads", bio: "Automation architects.", companyBackground: "Vixora" }],
    faqs: [{ q: "Is this archived?", a: "Yes, superceded by the 2026 AI Automation & Digital Literacy curriculum." }],
    certificateType: "Certificate of Completion"
  },
  {
    id: "course-ai-automation-digital-business-systems",
    slug: "ai-automation-digital-business-systems",
    title: "AI Automation & Digital Business Systems",
    subtitle: "Advanced 12-week mentorship program on Make.com, n8n, GHL CRM, Vapi voice agents, and high-ticket retainers.",
    badge: "Archived Advanced • ₦60,000",
    level: "Advanced",
    status: "archived",
    track: "Business Automation",
    format: "12-Week Mentorship Cohort",
    duration: "12 Weeks",
    commitment: "5-6 hrs/week",
    nextCohortDate: "Archived Cohort",
    tuition: "₦60,000",
    tuitionNote: "Archived rate: ₦60,000 ($50 USD).",
    seatsRemaining: 0,
    targetAudience: "Professionals, Agency Founders, Consultants.",
    description: "Implementation-focused program for architects building autonomous n8n workflows, GHL funnels, and Vapi voice bots.",
    heroPitch: "Build production AI systems businesses pay for—n8n, Vapi voice agents, and full-stack automation.",
    highlights: ["n8n & Vapi voice agents", "GoHighLevel CRM funnels", "High-ticket retainers"],
    outcomes: ["Deploy self-hosted n8n workflows", "Build conversational voice bots"],
    prerequisites: ["Prior comfort with AI tools"],
    curriculum: ["Module 1 — Advanced Workflows", "Module 2 — Voice Agents"],
    weeklySyllabus: [
      { week: "Week 01", title: "Advanced Workflows", description: "n8n and webhooks.", topics: ["n8n"], handsOnLab: "Build n8n workflow" }
    ],
    capstoneProjects: [{ title: "Autonomous Lead System", description: "Vapi & GHL integration", technologies: ["Vapi", "GHL", "n8n"] }],
    instructors: [{ name: "Vixora Senior Mentors", role: "Systems Architects", bio: "Enterprise architects.", companyBackground: "Vixora" }],
    faqs: [{ q: "Is this archived?", a: "Yes, available in archived specializations." }],
    certificateType: "Certificate of Advanced Mastery"
  },
  {
    id: "course-fullstack-vibe-coding",
    slug: "full-stack-vibe-coding",
    title: "Full Stack Vibe Coding",
    subtitle: "Build web applications with AI pair programming—React, Express APIs, PostgreSQL, and cloud deployment.",
    badge: "Archived Cohort • ₦10,000",
    level: "Beginner to Intermediate",
    status: "archived",
    track: "Engineering & AI",
    format: "12-Week Hybrid Cohort",
    duration: "12 Weeks",
    commitment: "5-7 hrs/week",
    nextCohortDate: "Archived Cohort",
    tuition: "₦10,000",
    tuitionNote: "Archived rate: ₦10,000 ($10 USD).",
    seatsRemaining: 0,
    targetAudience: "Aspiring developers and designers.",
    description: "Learn to build full-stack web applications with React, Node.js, databases, and AI coding assistants.",
    heroPitch: "Build products with AI as your development partner.",
    highlights: ["React & Node.js", "Database modeling", "Vercel deployment"],
    outcomes: ["Build full-stack web apps", "Debug with AI assistance"],
    prerequisites: ["Laptop with internet"],
    curriculum: ["Module 1 — React Frontend", "Module 2 — Node APIs"],
    weeklySyllabus: [
      { week: "Week 01", title: "Web Foundations", description: "HTML/CSS/JS", topics: ["JavaScript"], handsOnLab: "Build landing page" }
    ],
    capstoneProjects: [{ title: "Full-Stack Web App", description: "Deployed web app", technologies: ["React", "Express", "PostgreSQL"] }],
    instructors: [{ name: "Vixora Instructors", role: "Engineers", bio: "Software developers.", companyBackground: "Vixora" }],
    faqs: [{ q: "Is this archived?", a: "Superceded by 2026 AI Web Development & Vibe Coding." }],
    certificateType: "Certificate of Completion"
  },
  {
    id: "course-client-acquisition-freelancing",
    slug: "client-acquisition-freelancing",
    title: "Client Acquisition & Freelancing Masterclass",
    subtitle: "High-ticket offer positioning, Upwork optimization, cold outreach systems, and winning $1,000+ retainers.",
    badge: "Cohort 1.0 Track • ₦10,000",
    level: "All Levels",
    status: "archived",
    track: "Business Automation",
    format: "4-Week Practical Sprint",
    duration: "4 Weeks",
    commitment: "3-4 hrs/week",
    nextCohortDate: "Immediate Vault Access",
    tuition: "₦10,000",
    tuitionNote: "Full access to Cohort 1.0 recorded sessions (₦10,000 / $10 USD).",
    seatsRemaining: 0,
    targetAudience: "Freelancers, Agency Owners, Consultants.",
    description: "Learn client acquisition engines, Upwork proposals, and outreach systems to win international clients.",
    heroPitch: "Stop competing on hourly rates. Position your services as high-ROI investments.",
    highlights: ["Upwork 80%+ proposal formulas", "Cold email templates", "Discovery call script"],
    outcomes: ["Package high-ticket offers", "Close monthly retainers"],
    prerequisites: ["Laptop or smartphone"],
    curriculum: ["Module 1 — Offer Architecture", "Module 2 — Upwork Mastery"],
    weeklySyllabus: [
      { week: "Week 01", title: "Offer Architecture", description: "High-ticket offer design.", topics: ["Offers"], handsOnLab: "Draft offer sheet" }
    ],
    capstoneProjects: [{ title: "Live Client Pitch", description: "Pitch deck and contract", technologies: ["Upwork", "Cold Email"] }],
    instructors: [{ name: "Sarumi Hammad", role: "Dean", bio: "Academic director.", companyBackground: "Vixora" }],
    faqs: [{ q: "Is this in the vault?", a: "Yes, included in Cohort 1.0 Master Vault." }],
    certificateType: "Official Vixora Certified Digital Business Consultant"
  },
  {
    id: "course-pdf-automation-digital-products",
    slug: "pdf-automation-digital-products",
    title: "PDF Automation & AI Digital Product Creation",
    subtitle: "Research audiences, validate problems, author PDF guides with AI, design covers, and automate Paystack delivery.",
    badge: "Cohort 1.0 Track • ₦10,000",
    level: "All Levels",
    status: "archived",
    track: "Business Automation",
    format: "2-Week Sprint",
    duration: "2 Weeks",
    commitment: "3-4 hrs/week",
    nextCohortDate: "Immediate Vault Access",
    tuition: "₦10,000",
    tuitionNote: "Full access to Cohort 1.0 recorded sessions (₦10,000 / $10 USD).",
    seatsRemaining: 0,
    targetAudience: "Creators, Writers, Educators.",
    description: "Build digital income assets by researching hungry audiences, writing PDFs with AI, and automating sales.",
    heroPitch: "Research, write, design, and sell commercial PDF products with automated delivery.",
    highlights: ["Audience research", "AI PDF authoring", "Automated Paystack delivery"],
    outcomes: ["Create 30-50 page PDF guides", "Deploy automated storefronts"],
    prerequisites: ["Laptop or smartphone"],
    curriculum: ["Week 1 — Product Research", "Week 2 — AI Writing & Sales"],
    weeklySyllabus: [
      { week: "Week 01", title: "Product Research", description: "Audience validation.", topics: ["Research"], handsOnLab: "Finalize PDF outline" }
    ],
    capstoneProjects: [{ title: "Commercial PDF Product", description: "PDF & Paystack delivery", technologies: ["AI Writing", "Paystack"] }],
    instructors: [{ name: "Sarumi Hammad", role: "Dean", bio: "Academic director.", companyBackground: "Vixora" }],
    faqs: [{ q: "Is this in the vault?", a: "Yes, included in Cohort 1.0 Master Vault." }],
    certificateType: "Official Vixora Certified Digital Product Specialist"
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

