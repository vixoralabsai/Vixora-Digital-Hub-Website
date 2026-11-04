export interface CurriculumWeek {
  weekNumber: number;
  title: string;
  objectives: string[];
  topics: string[];
  handsOn: string;
  deliverable: string;
}

export interface CoursePhase {
  phaseNumber: number;
  name: string;
  weeksRange: string;
  description: string;
}

export interface CapstoneSpec {
  title: string;
  requirements: string[];
  durationMinutesDemo: number;
}

export interface TrainingCourse {
  id: string;
  slug: string;
  title: string;
  category: 'AI & Automation' | 'Virtual Assistance' | 'Web Development' | 'Content Creation' | 'Data Science & ML' | 'Data Analysis';
  durationWeeks: number;
  format: string;
  level: string;
  priceNaira: number;
  priceDisplay: string;
  tagline: string;
  overview: string;
  learningOutcomes: string[];
  toolsUsed: string[];
  phases: CoursePhase[];
  weeks: CurriculumWeek[];
  assessment: string[];
  capstoneSpec: CapstoneSpec;
}

export const TRAINING_COURSES: TrainingCourse[] = [
  // 1. AI Automation & Digital Literacy Cohort 2
  {
    id: 'course-ai-automation-c2',
    slug: 'ai-automation-digital-literacy',
    title: 'AI Automation & Digital Literacy',
    category: 'AI & Automation',
    durationWeeks: 12,
    format: 'Online / Physical (Hybrid)',
    level: 'Beginner (No coding required)',
    priceNaira: 60000,
    priceDisplay: '₦60,000',
    tagline: 'Master AI prompting, no-code workflows, and automated business agents.',
    overview: 'This beginner-friendly course teaches students to use AI tools and no-code automation to work faster and earn more. Students start with digital literacy, learn to prompt AI tools well, then build real automations and AI assistants for everyday and business tasks. The course ends with a portfolio project and a clear path to offering automation services.',
    learningOutcomes: [
      'Use computers, cloud tools and the internet safely and confidently',
      'Write clear prompts that get useful results from AI tools',
      'Use AI to speed up writing, research, planning and spreadsheet work',
      'Design and build no-code automations that connect everyday apps',
      'Build a simple AI assistant or chatbot',
      'Automate common business tasks such as email, lead follow-up and social media',
      'Package and price automation work for clients or employers'
    ],
    toolsUsed: ['ChatGPT', 'Claude', 'Gemini', 'Excel / Google Sheets', 'Google Workspace', 'Zapier', 'Make', 'n8n', 'No-code Chatbot Builders'],
    phases: [
      { phaseNumber: 1, name: 'Foundations', weeksRange: 'Weeks 1-3', description: 'Digital literacy, cloud workspaces, AI basics, and prompt engineering.' },
      { phaseNumber: 2, name: 'AI for Productivity', weeksRange: 'Weeks 4-5', description: 'Writing, research, planning, note-taking, and AI-assisted spreadsheets.' },
      { phaseNumber: 3, name: 'Automation & Agents', weeksRange: 'Weeks 6-9', description: 'Workflow mapping, Zapier & Make builds, AI chatbots, and CRM lead flows.' },
      { phaseNumber: 4, name: 'Application & Monetization', weeksRange: 'Weeks 10-12', description: 'Portfolio build, client presentation, proposal writing, and service packages.' }
    ],
    assessment: [
      'Weekly practical assignments',
      'Mid-course practical (prompting and one working automation)',
      'Portfolio project: a working automation or AI assistant with documentation and a short demo',
      'Certificate issued on completing all weekly deliverables and the portfolio project'
    ],
    capstoneSpec: {
      title: 'Real-World Business Automation or AI Agent Build',
      requirements: [
        'A real business problem, clearly described',
        'A working multi-step automation or custom AI chatbot',
        'Documentation covering purpose, steps, tools used, and maintenance guidelines',
        'An estimate of time or money saved for the business'
      ],
      durationMinutesDemo: 5
    },
    weeks: [
      {
        weekNumber: 1,
        title: 'Digital Literacy Foundations',
        objectives: ['Build confidence with devices, files, and online tools', 'Learn safe-use basics and cloud account setup'],
        topics: ['Files, folders, and cloud storage (Google Drive)', 'Email, calendars, and online collaboration', 'Search skills and judging online information', 'Passwords, 2FA, and avoiding common scams', 'Setting up course account security'],
        handsOn: 'Organize a structured cloud folder system and set up all course accounts securely.',
        deliverable: 'Organized workspace and account security checklist'
      },
      {
        weekNumber: 2,
        title: 'Introduction to AI & Main AI Tools',
        objectives: ['Understand what AI can and cannot do', 'Get comfortable with major AI assistants'],
        topics: ['What AI, ML, and Large Language Models are in plain language', 'What AI does well and where it fails (hallucinations, bias)', 'Guided tour of ChatGPT, Claude, and Gemini', 'Responsible use: privacy, honesty, and output verification'],
        handsOn: 'Execute identical tasks across three AI tools and compare output accuracy and style.',
        deliverable: 'AI tools comparative evaluation matrix'
      },
      {
        weekNumber: 3,
        title: 'Prompt Engineering Principles',
        objectives: ['Write prompts that produce reliable, useful results', 'Build a personal prompt library'],
        topics: ['Anatomy of a strong prompt: role, context, task, format, constraints', 'Few-shot prompting and step-by-step instructions', 'Iterative prompt refinement and chain-of-thought', 'Creating reusable prompt templates', 'Common prompting mistakes to avoid'],
        handsOn: 'Rewrite ten weak prompts into production-grade templates and test them.',
        deliverable: 'Personal prompt library (at least 10 reusable templates)'
      },
      {
        weekNumber: 4,
        title: 'AI for Writing, Research & Planning',
        objectives: ['Use AI to save time on knowledge work', 'Fact-check and verify AI outputs'],
        topics: ['Drafting and editing emails, documents, and reports', 'Summarizing long PDFs, research papers, and meeting notes', 'Researching with AI and verifying primary sources', 'Planning: schedules, project milestones, and to-do systems', 'AI note-taking and audio transcription tools'],
        handsOn: 'Produce a comprehensive research summary and work plan using AI, accompanied by a source verification log.',
        deliverable: 'Verified research summary, project plan, and fact-check notes'
      },
      {
        weekNumber: 5,
        title: 'Excel & AI for Spreadsheet Mastery',
        objectives: ['Use spreadsheets effectively with AI assistance', 'Clean and analyze business data faster'],
        topics: ['Spreadsheet fundamentals: formulas, sorting, filtering, charts', 'Using AI to write, debug, and explain complex formulas', 'Data cleaning and normalization with AI assistance', 'Summarizing data trends and generating executive insights', 'Auditing AI-generated spreadsheet logic'],
        handsOn: 'Build a small business revenue and expense tracker with AI-generated formulas.',
        deliverable: 'Working Excel/Google Sheets tracker with documentation'
      },
      {
        weekNumber: 6,
        title: 'Workflow Automation Basics',
        objectives: ['Develop a workflow mindset', 'Map out automations before building'],
        topics: ['What automation is and identifying high-ROI tasks', 'Triggers, actions, filters, and conditional paths', 'Mapping manual business processes into logical steps', 'APIs, webhooks, and JSON data payloads in plain language', 'Automation feasibility audit'],
        handsOn: 'Map three repetitive manual tasks using visual flowchart software.',
        deliverable: '3 workflow maps with one selected for build phase'
      },
      {
        weekNumber: 7,
        title: 'Building Automations with No-Code Tools',
        objectives: ['Build working automations in Zapier and Make', 'Test, debug, and handle errors'],
        topics: ['Zapier: multi-step zaps, filters, and delay paths', 'Make (Integromat): scenarios, routers, and data mappers', 'Connecting Gmail, Google Sheets, Calendar, and Webforms', 'Error handling, testing runs, and monitoring logs', 'Free tier limits and operational cost optimization'],
        handsOn: 'Build a lead form-to-spreadsheet-to-email notification automation in both Zapier and Make.',
        deliverable: 'Two deployed working automations with execution logs'
      },
      {
        weekNumber: 8,
        title: 'AI Agents & Custom Chatbots',
        objectives: ['Understand how custom AI assistants and agents operate', 'Build a no-code chatbot for a real use case'],
        topics: ['Chatbots vs. autonomous agents: key differences', 'Knowledge bases: uploading custom PDFs and brand docs', 'Building a custom GPT / no-code chatbot for customer support', 'Embedding AI steps inside no-code automation workflows', 'Safety guardrails, human-in-the-loop escalation'],
        handsOn: 'Build, train, and test an AI customer support chatbot for a real or mock business.',
        deliverable: 'Working custom AI chatbot with test conversation log'
      },
      {
        weekNumber: 9,
        title: 'Automating Business Operations',
        objectives: ['Apply automation to core sales and operations tasks', 'Combine AI reasoning with no-code triggers'],
        topics: ['Email automation: sorting, AI auto-replies, and triage', 'Lead capture, qualification, and automated CRM sync', 'Social media scheduling and content distribution', 'Automated invoicing, payment receipts, and booking links', 'Calculating time and dollar savings for clients'],
        handsOn: 'Build an end-to-end lead capture, AI qualification, and automated follow-up system.',
        deliverable: 'Production business automation system with time-saved estimate'
      },
      {
        weekNumber: 10,
        title: 'Portfolio Project Build',
        objectives: ['Design and build a complete real-world automation', 'Write comprehensive project documentation'],
        topics: ['Selecting a real operational bottleneck', 'Scoping build architecture and selecting toolchains', 'Building, testing, and refining error handling', 'Writing maintainable user documentation'],
        handsOn: 'Build the core portfolio project with instructor review checkpoints.',
        deliverable: 'Working automation project with draft documentation'
      },
      {
        weekNumber: 11,
        title: 'Portfolio Presentation & Peer Review',
        objectives: ['Present technical builds clearly to non-technical stakeholders', 'Incorporate feedback and polish builds'],
        topics: ['Demoing automations to non-technical clients', 'Explaining the problem statement, solution, and ROI', 'Handling peer and instructor technical review', 'Final bug fixes and user documentation polish'],
        handsOn: 'Present a 5-minute live demo to the cohort and refine the build based on feedback.',
        deliverable: 'Final polished automation, demo video, and documentation'
      },
      {
        weekNumber: 12,
        title: 'Monetizing Your Automation Skills',
        objectives: ['Turn automation skills into income', 'Position and package services professionally'],
        topics: ['Earning pathways: freelancing, agency services, job roles', 'Finding prospective clients and writing proposals', 'Pricing automation retainer and project models', 'Creating a professional portfolio page and LinkedIn presence', 'Continued learning roadmap in AI and n8n'],
        handsOn: 'Draft a service offer sheet, a one-page client proposal, and publish a portfolio.',
        deliverable: 'Published portfolio, service offer sheet, and client proposal'
      }
    ]
  },

  // 2. Virtual Assistance & Appointment Setter Cohort 2
  {
    id: 'course-va-setter-c2',
    slug: 'virtual-assistance-appointment-setter',
    title: 'Virtual Assistance & Appointment Setting',
    category: 'Virtual Assistance',
    durationWeeks: 8,
    format: 'Online / Physical (Hybrid)',
    level: 'Beginner (No experience required)',
    priceNaira: 60000,
    priceDisplay: '₦60,000',
    tagline: 'Master executive VA operations, AI productivity, CRM lead management, and cold outreach.',
    overview: 'This practical course trains students to work as professional virtual assistants and appointment setters. Students learn the admin, communication, and productivity skills clients pay for, how to use AI tools to work faster, and how to find leads and book sales calls through outreach. The course ends with a portfolio, a set of service packages, and a plan to land the first client.',
    learningOutcomes: [
      'Explain what virtual assistants and appointment setters do, and choose a niche',
      'Communicate professionally with clients in writing and on calls',
      'Manage email, calendars and tasks for a client',
      'Use Google Workspace, Notion, Trello and similar tools',
      'Use AI tools to draft, summarize, schedule and organize',
      'Manage leads in a simple CRM',
      'Run cold outreach by email, LinkedIn and phone using clear scripts',
      'Handle objections and book qualified calls',
      'Find clients, set rates and onboard them professionally'
    ],
    toolsUsed: ['Google Workspace (Gmail, Calendar, Drive)', 'Notion', 'Trello', 'Calendly', 'CRM (HubSpot / GoHighLevel)', 'ChatGPT', 'Claude', 'LinkedIn', 'Zoom', 'Slack'],
    phases: [
      { phaseNumber: 1, name: 'Foundations', weeksRange: 'Weeks 1-2', description: 'Career paths, professional communication, and digital admin tools.' },
      { phaseNumber: 2, name: 'Core VA Operations', weeksRange: 'Weeks 3-4', description: 'Inbox zero, calendar management, and AI productivity tools for VAs.' },
      { phaseNumber: 3, name: 'Appointment Setting', weeksRange: 'Weeks 5-7', description: 'CRM lead tracking, cold outreach scripts, and objection handling.' },
      { phaseNumber: 4, name: 'Client Acquisition & Career', weeksRange: 'Week 8', description: 'Pricing packages, onboarding checklists, portfolio, and landing clients.' }
    ],
    assessment: [
      'Weekly practical assignments',
      'Mock client tasks (inbox zero, calendar scheduling, and task board)',
      'Mock appointment-setting call and outreach script set',
      'Final project: service package, outreach campaign plan, and portfolio',
      'Certificate issued on completing all weekly deliverables and final project'
    ],
    capstoneSpec: {
      title: 'VA Service Package & Appointment Setting Campaign',
      requirements: [
        'Niche statement and ideal client profile',
        '2-3 service packages with clear pricing models',
        'Lead list of 30 qualified prospects in a CRM',
        'Multi-channel outreach sequence (email, LinkedIn, call script)',
        'Client onboarding checklist and professional portfolio page'
      ],
      durationMinutesDemo: 5
    },
    weeks: [
      {
        weekNumber: 1,
        title: 'Introduction to VA & Appointment Setting',
        objectives: ['Understand VA and appointment setter roles', 'Develop professional communication etiquette'],
        topics: ['What VAs do: admin, support, scheduling, appointment setting', 'Remote work expectations and managing client relationships', 'Selecting a high-value niche (Real Estate, Coaching, E-commerce, Tech)', 'Professional email tone, grammar, and client messaging', 'Video call etiquette, time zones, and reliability protocols'],
        handsOn: 'Draft a professional client introduction email and niche positioning statement.',
        deliverable: 'Niche statement and professional email communication pack'
      },
      {
        weekNumber: 2,
        title: 'Productivity & Workspace Admin Tools',
        objectives: ['Set up and master tools expected by high-paying clients', 'Organize files and task boards cleanly'],
        topics: ['Google Workspace: Drive permissions, Docs, Sheets organization', 'Notion: building client dashboards and databases', 'Trello & Asana: Kanban boards, task allocation, and tracking', 'File naming conventions and cloud folder structures', 'Time tracking tools (Toggl, Clockify) and daily workflow routines'],
        handsOn: 'Configure a complete mock client workspace with task boards, shared folders, and SOP docs.',
        deliverable: 'Complete mock client workspace link and SOP template'
      },
      {
        weekNumber: 3,
        title: 'Email & Calendar Management (Inbox Zero)',
        objectives: ['Manage high-volume client inboxes and complex calendars', 'Schedule meetings seamlessly across time zones'],
        topics: ['Inbox Zero methodology: labels, filters, and priority folders', 'Drafting and deploying reusable email template suites', 'Calendar management rules, buffer times, and time zone math', 'Mastering scheduling tools like Calendly and SavvyCal', 'Travel, itinerary, and meeting coordination basics', 'Confidentiality, passwords, and security protocols'],
        handsOn: 'Process a mock inbox of 50 client emails and resolve 1 week of scheduling conflicts.',
        deliverable: 'Processed mock inbox, resolved calendar schedule, and handover note'
      },
      {
        weekNumber: 4,
        title: 'AI Productivity Suite for Virtual Assistants',
        objectives: ['Use AI tools to execute VA tasks 3x faster', 'Audit AI outputs for accuracy and privacy'],
        topics: ['Prompting AI for email drafts, meeting summaries, and reports', 'AI audio transcription and automated meeting notes (Otter, Fathom)', 'Research and web data extraction with AI assistance', 'Drafting social media captions and simple client docs', 'Client privacy: what NEVER goes into public AI tools'],
        handsOn: 'Complete a complex VA task suite (inbox responses, meeting summary, research) with AI assistance.',
        deliverable: 'AI-assisted task execution pack and custom VA prompt sheet'
      },
      {
        weekNumber: 5,
        title: 'CRM Systems & Lead Management',
        objectives: ['Track leads and pipeline stages in a CRM', 'Build and clean a prospective client lead list'],
        topics: ['What CRMs are and why clients need them (HubSpot, GoHighLevel)', 'Setting up CRM pipelines: stages, contacts, and custom tags', 'Lead sourcing: LinkedIn Sales Navigator, directories, and web tools', 'Lead qualification: criteria for high-value prospects', 'Setting up follow-up tasks, reminders, and data hygiene'],
        handsOn: 'Build a qualified lead list of 30 prospects inside a CRM workspace.',
        deliverable: 'CRM workspace with 30 qualified prospects and tagged pipelines'
      },
      {
        weekNumber: 6,
        title: 'Cold Outreach Strategies & Scriptwriting',
        objectives: ['Execute cold outreach via email, LinkedIn, and phone', 'Write persuasive outreach sequences that get replies'],
        topics: ['Appointment setting mechanics and client KPIs', 'Cold email copy: subject lines, value hook, call-to-action', 'LinkedIn outreach: profile optimization, connection notes, DMs', 'Cold call fundamentals and opening phone scripts', 'Personalizing outreach at scale using AI assistance', 'Anti-spam compliance, unsubscribe rules, and ethics'],
        handsOn: 'Write a multi-touch outreach sequence (3 emails, 2 LinkedIn DMs, 1 phone script) for your niche.',
        deliverable: 'Multi-touch outreach copy sequence and phone script sheet'
      },
      {
        weekNumber: 7,
        title: 'Handling Objections & Booking Sales Calls',
        objectives: ['Overcome sales objections calmly and professionally', 'Book qualified discovery calls with low no-show rates'],
        topics: ['Common prospect objections (no time, too expensive, send info)', 'The Acknowledge-Reframe-Bridge objection framework', 'Qualifying prospects before offering booking links', 'Call confirmation sequences, SMS reminders, and reducing no-shows', 'Handing off qualified leads to closing sales reps', 'Tracking metrics: open rate, reply rate, booking rate'],
        handsOn: 'Participate in live role-play appointment-setting calls and complete objection exercises.',
        deliverable: 'Recorded/transcribed mock appointment call and objection response matrix'
      },
      {
        weekNumber: 8,
        title: 'Landing Clients, Rates & Portfolio Launch',
        objectives: ['Package services, set competitive rates, and land your first client', 'Present your final portfolio'],
        topics: ['Where to find clients: Upwork, Fiverr, LinkedIn DMs, agencies', 'Creating high-converting service packages (hourly vs. retainer vs. per-booking)', 'Drafting proposals, service agreements, and invoicing', 'Client onboarding process: intake forms, password setup, Slack rules', 'Building a professional portfolio page and LinkedIn profile', 'Final capstone project presentations'],
        handsOn: 'Build service packages, client onboarding checklist, and present your final portfolio.',
        deliverable: 'Service packages, onboarding checklist, portfolio link, and capstone presentation'
      }
    ]
  },

  // 3. AI Web Development Cohort 2
  {
    id: 'course-web-dev-c2',
    slug: 'ai-web-development-vibe-coding',
    title: 'AI Web Development & Vibe Coding',
    category: 'Web Development',
    durationWeeks: 12,
    format: 'Online / Physical (Hybrid)',
    level: 'Beginner (No prior coding required)',
    priceNaira: 60000,
    priceDisplay: '₦60,000',
    tagline: 'Build web applications, React frontends, and AI features using modern vibe coding toolchains.',
    overview: 'This course teaches students to build and launch real websites and web apps using modern web fundamentals together with AI coding tools. Students first learn HTML, CSS, and JavaScript so they understand what they are building, then use vibe coding and AI assistants to build faster, add features, connect databases and AI, and deploy live projects. The course ends with a full capstone site or app and a freelancing-ready portfolio.',
    learningOutcomes: [
      'Explain how websites and web apps work',
      'Build responsive pages with HTML, CSS and JavaScript',
      'Use AI coding tools to plan, build, debug and improve code, and check what the AI produces',
      'Build landing pages and multi-page sites quickly',
      'Build a simple React front end',
      'Store and retrieve data with a basic backend and database',
      'Add AI features to an app through an API',
      'Deploy a site with a domain and hosting',
      'Present their work and win freelance projects'
    ],
    toolsUsed: ['VS Code', 'Git & GitHub', 'Claude', 'ChatGPT', 'Cursor', 'React 19', 'Tailwind CSS', 'Supabase / PostgreSQL', 'REST APIs', 'Vercel / Cloud Run'],
    phases: [
      { phaseNumber: 1, name: 'Web Foundations', weeksRange: 'Weeks 1-3', description: 'How the web works, Semantic HTML5, CSS layout, Flexbox, and Grid.' },
      { phaseNumber: 2, name: 'Programming & Vibe Coding', weeksRange: 'Weeks 4-6', description: 'JavaScript DOM, async APIs, and AI-assisted code generation.' },
      { phaseNumber: 3, name: 'Full-Stack Apps & AI', weeksRange: 'Weeks 7-10', description: 'Landing pages, React components, databases, and AI API integrations.' },
      { phaseNumber: 4, name: 'Deployment & Freelancing', weeksRange: 'Weeks 11-12', description: 'Production hosting, custom domains, capstone launch, and portfolio.' }
    ],
    assessment: [
      'Weekly coding assignments',
      'Mid-course project: responsive multi-section website',
      'Capstone project: full web app or SaaS deployed live on custom domain',
      'Certificate issued on completing all weekly deliverables and capstone'
    ],
    capstoneSpec: {
      title: 'Production Web Application with AI Feature Integration',
      requirements: [
        'A real-world problem and written project brief',
        'Responsive, deployed web application hosted live',
        'Dynamic backend storage or database integration',
        'Working AI feature integrated via API (e.g. text generator, chatbot, analyzer)',
        'GitHub repository with clear README, prompt log, and architecture notes'
      ],
      durationMinutesDemo: 10
    },
    weeks: [
      {
        weekNumber: 1,
        title: 'How the Web Works & Workspace Setup',
        objectives: ['Understand client-server architecture', 'Set up a professional developer workspace'],
        topics: ['Browsers, web servers, domains, and DNS in plain language', 'Frontend vs. Backend responsibilities', 'VS Code setup, essential extensions, and terminal basics', 'Browser developer tools (Inspect element, Console, Network)', 'Git & GitHub fundamentals: init, add, commit, push, repositories'],
        handsOn: 'Set up local coding workspace and publish your first HTML page to GitHub.',
        deliverable: 'GitHub account with first live repository published'
      },
      {
        weekNumber: 2,
        title: 'HTML & Semantic Page Structure',
        objectives: ['Build accessible, well-structured web pages', 'Master HTML5 form elements'],
        topics: ['HTML document boilerplate and core element tags', 'Headings, typography, lists, links, and media tags', 'Form controls: inputs, textareas, selects, and validation attributes', 'Semantic HTML5 (<header>, <nav>, <main>, <section>, <footer>)', 'Planning DOM structure before writing code'],
        handsOn: 'Build a personal developer bio page and a business lead intake form.',
        deliverable: 'Two semantic HTML pages pushed to GitHub'
      },
      {
        weekNumber: 3,
        title: 'CSS Styling, Flexbox & Responsive Design',
        objectives: ['Style web pages to modern design standards', 'Build mobile-responsive layouts using Flexbox and Grid'],
        topics: ['CSS selectors, specificity, colors, typography, and box model', 'Flexbox layout patterns: axis alignment, wrapping, and spacing', 'CSS Grid for multi-column page layouts', 'Responsive design with mobile-first media queries', 'UI contrast, hierarchy, and visual consistency'],
        handsOn: 'Style Week 2 HTML files into a responsive, polished business website.',
        deliverable: 'Responsive, fully-styled multi-section website'
      },
      {
        weekNumber: 4,
        title: 'JavaScript Fundamentals',
        objectives: ['Understand core programming logic', 'Write clean JavaScript code'],
        topics: ['Variables (const, let), primitives, and data types', 'Operators, conditionals (if/else, switch), and ternary', 'Functions, arrow syntax, and scope', 'Arrays, objects, and common array methods (map, filter)', 'Debugging code using browser console logs and breakpoints'],
        handsOn: 'Build two standalone JS programs: a price calculator and an interactive quiz.',
        deliverable: 'JavaScript exercise script suite in GitHub'
      },
      {
        weekNumber: 5,
        title: 'JavaScript DOM & Interactive Web Apps',
        objectives: ['Make web pages respond to user actions', 'Fetch live data from external APIs'],
        topics: ['DOM manipulation: querySelector, classList, innerHTML', 'Event handling: clicks, form submit, input changes', 'Client-side form validation and error messages', 'Asynchronous JS: Promises, async/await, and fetch API', 'Storing state in LocalStorage'],
        handsOn: 'Build a dynamic To-Do app and an interactive weather app fetching live API data.',
        deliverable: 'Two interactive JavaScript web applications'
      },
      {
        weekNumber: 6,
        title: 'Vibe Coding & AI Coding Assistants',
        objectives: ['Build applications collaboratively with AI assistants', 'Maintain code quality and security control'],
        topics: ['What vibe coding is: capabilities, sweet spots, and failure modes', 'Writing precise build prompts: context, tech stack, constraints', 'Breaking complex app features into step-by-step AI prompts', 'Reading, testing, debugging, and auditing AI-generated code', 'Security basics: protecting API keys and avoiding public leaks'],
        handsOn: 'Build a complete mini web app using AI prompting, then audit and refactor the code.',
        deliverable: 'AI-generated web app, prompt log, and code review audit notes'
      },
      {
        weekNumber: 7,
        title: 'High-Converting Landing Pages with AI',
        objectives: ['Build production landing pages in hours', 'Optimize for speed and search visibility'],
        topics: ['Landing page architecture: Hero, Benefits, Social Proof, CTA', 'Drafting copy, component layouts, and code with AI', 'Asset optimization: responsive images, icons, Google Fonts', 'Connecting contact forms to email notifications', 'Basic SEO meta tags and Lighthouse performance tuning'],
        handsOn: 'Build a production-ready landing page for a real or sample business.',
        deliverable: 'Production landing page project (Mid-Course Capstone)'
      },
      {
        weekNumber: 8,
        title: 'Frontend Frameworks: Introduction to React',
        objectives: ['Understand why modern frontend frameworks exist', 'Build component-driven React applications'],
        topics: ['React fundamentals: JSX, components, and props', 'Managing component state with useState and side effects with useEffect', 'Rendering dynamic lists and handling form inputs in React', 'Project structure using Vite and React 19', 'Using AI assistants to generate and explain React component trees'],
        handsOn: 'Rebuild an earlier JavaScript app into a modular React application.',
        deliverable: 'Working React web application built with Vite'
      },
      {
        weekNumber: 9,
        title: 'Backend Services & Database Fundamentals',
        objectives: ['Understand how web apps persist and query data', 'Connect a React frontend to a cloud database'],
        topics: ['How frontends talk to backends via HTTP and JSON', 'Relational database basics: tables, rows, columns, primary keys', 'Setting up a hosted database (Supabase / PostgreSQL)', 'Performing CRUD operations (Create, Read, Update, Delete)', 'API secret protection and basic database security'],
        handsOn: 'Add database persistent storage (saving and retrieving records) to your React app.',
        deliverable: 'Full-stack application storing data in a cloud database'
      },
      {
        weekNumber: 10,
        title: 'API Integrations & AI Features',
        objectives: ['Integrate third-party REST APIs into web apps', 'Add intelligent AI capabilities safely'],
        topics: ['Consuming REST APIs and handling edge errors', 'Integrating AI model APIs (OpenAI / Gemini / Claude)', 'Building custom AI features: text generator, summary bot, analyzer', 'Securing API keys with server proxies or environment variables', 'Managing API latency, loading states, and rate limits'],
        handsOn: 'Integrate an AI-powered feature (e.g. smart content generator or chatbot) into your web app.',
        deliverable: 'Deployed web application with working AI integration'
      },
      {
        weekNumber: 11,
        title: 'Deployment, Domains & Production Hosting',
        objectives: ['Publish web apps live to the global internet', 'Build your final capstone project'],
        topics: ['Deploying frontends to Vercel / Netlify / Render', 'Configuring custom domains and SSL/TLS certificates', 'Environment variable management in production', 'Pre-launch QA: cross-browser testing and mobile responsiveness', 'Capstone project build sprint with instructor reviews'],
        handsOn: 'Deploy your web application live on a custom URL and build capstone features.',
        deliverable: 'Live deployed web application and capstone build progress'
      },
      {
        weekNumber: 12,
        title: 'Capstone Showcase, Portfolio & Freelancing',
        objectives: ['Present your capstone project with confidence', 'Position yourself for freelance web projects and jobs'],
        topics: ['Presenting live technical web demos to non-technical stakeholders', 'Building an impressive developer portfolio site and GitHub profile', 'Finding freelance web clients: proposals, pricing, scope docs', 'Client project contracts, milestones, and delivery handover', 'Post-course web development roadmap'],
        handsOn: 'Present your live capstone demo to the class and publish your portfolio site.',
        deliverable: 'Final deployed capstone project, live portfolio site, and GitHub repo'
      }
    ]
  },

  // 4. AI Content Creation Cohort 2
  {
    id: 'course-content-creation-c2',
    slug: 'ai-content-creation-media',
    title: 'AI Content Creation & Personal Branding',
    category: 'Content Creation',
    durationWeeks: 10,
    format: 'Online / Physical (Hybrid)',
    level: 'Beginner (No design or editing experience required)',
    priceNaira: 20000,
    priceDisplay: '₦20,000',
    tagline: 'Master AI copywriting, image generation, short video editing, and personal branding.',
    overview: 'This hands-on course teaches students to create professional content with AI tools: written posts, images, video, voiceovers, and short-form clips. Students learn content strategy, build a repeatable production system, and finish with a personal brand and portfolio they can use to attract followers, clients, or employers.',
    learningOutcomes: [
      'Choose a niche and understand their audience',
      'Write captions, scripts, blogs and ad copy with AI, in their own voice',
      'Design graphics and images with AI tools and Canva',
      'Create and edit short videos with AI and CapCut',
      'Produce voiceovers, audio and music with AI',
      'Plan, batch-produce and schedule a month of content',
      'Build a personal brand and a portfolio',
      'Package content services for clients and earn from them'
    ],
    toolsUsed: ['ChatGPT', 'Claude', 'Gemini', 'Canva', 'Midjourney / AI Image Generators', 'CapCut', 'ElevenLabs / AI Voice Tools', 'Social Media Schedulers'],
    phases: [
      { phaseNumber: 1, name: 'Foundations & Copy', weeksRange: 'Weeks 1-2', description: 'Niche selection, audience brief, AI copy, and prompt writing.' },
      { phaseNumber: 2, name: 'Visual, Video & Audio', weeksRange: 'Weeks 3-6', description: 'AI graphics, Canva kits, CapCut video editing, and AI voiceovers.' },
      { phaseNumber: 3, name: 'Strategy & Calendars', weeksRange: 'Weeks 7-8', description: 'Platform strategies, short-form Reels/Shorts, and 30-day batch calendars.' },
      { phaseNumber: 4, name: 'Brand & Monetization', weeksRange: 'Weeks 9-10', description: 'Personal brand launch, published portfolio, and client service offers.' }
    ],
    assessment: [
      'Weekly content assignments',
      'Mid-course review of a content set (written, image, and short video)',
      'Final project: 30-day content plan with 1 complete week of finished content',
      'Certificate issued on completing all weekly deliverables and final project'
    ],
    capstoneSpec: {
      title: '30-Day Content System & Portfolio Showcase',
      requirements: [
        'A defined niche and target audience brief',
        'Comprehensive 30-day content calendar',
        'One complete week of production-ready content (2 written posts, 3 graphics, 2 short videos with captions)',
        'Personal brand guide and live published portfolio page'
      ],
      durationMinutesDemo: 5
    },
    weeks: [
      {
        weekNumber: 1,
        title: 'Content Creation Fundamentals & AI Toolkit',
        objectives: ['Understand what makes content succeed', 'Select a niche and set up AI tools'],
        topics: ['Content pillars: written, image, video, audio', 'Choosing a high-impact niche and defining audience personas', 'What makes content valuable: educate, inspire, entertain, convert', 'Guided tour of the AI content creation toolkit', 'Ethics: disclosure, copyright, and maintaining human authenticity'],
        handsOn: 'Draft a niche positioning brief and analyze three top creators in your niche.',
        deliverable: 'Niche and audience strategy brief'
      },
      {
        weekNumber: 2,
        title: 'AI Copywriting & Tone Engineering',
        objectives: ['Write high-converting copy with AI while preserving human voice', 'Build reusable copywriting prompts'],
        topics: ['Prompt frameworks for copy: Role, Audience, Goal, Tone, Format', 'Crafting viral hooks, captions, video scripts, and thread posts', 'Writing blog articles, email newsletters, and direct response ads', 'Editing AI drafts to sound natural and match brand voice', 'Fact-checking and eliminating AI clichés'],
        handsOn: 'Write 1 week of social captions, a short video script, and a blog outline.',
        deliverable: 'Copywriting content pack and custom prompt library'
      },
      {
        weekNumber: 3,
        title: 'AI Image Generation & Canva Design',
        objectives: ['Create eye-catching visual assets and graphics', 'Maintain a unified brand visual identity'],
        topics: ['Graphic design fundamentals: layout, typography, contrast, spacing', 'Canva mastery: templates, brand kits, and asset exporting', 'AI image generators: writing descriptive text-to-image prompts', 'Refining, upscaling, and editing AI-generated images', 'Image licensing and commercial usage rights'],
        handsOn: 'Design a brand visual kit, 3 social media graphics, and 1 multi-slide carousel.',
        deliverable: 'Brand visual kit and 4 social graphic assets'
      },
      {
        weekNumber: 4,
        title: 'AI Video Production & Storyboarding',
        objectives: ['Plan and produce short-form video content', 'Use AI tools for scriptwriting and video generation'],
        topics: ['Short-form video structure: Hook (0-3s), Story, Call-To-Action', 'Scripting and storyboarding video ideas with AI assistance', 'Text-to-video tools, stock footage sourcing, and AI avatars', 'Repurposing long-form articles into short video scripts', 'Video aspect ratios for Reels, Shorts, and TikTok'],
        handsOn: 'Script, storyboard, and generate a 30 to 60 second video.',
        deliverable: 'First short-form video file with script'
      },
      {
        weekNumber: 5,
        title: 'Video Editing with CapCut & AI',
        objectives: ['Edit polished short-form videos with captions and effects', 'Master speed editing workflows'],
        topics: ['CapCut essentials: trimming, cuts, transitions, and overlays', 'Automated AI captions and custom subtitle styling', 'Audio balancing, background music, and sound effects', 'Color grading, framing, and high-quality export settings', 'Filing and organizing video asset libraries'],
        handsOn: 'Edit two short-form videos with AI captions, sound effects, and strong hooks.',
        deliverable: 'Two fully edited short-form videos'
      },
      {
        weekNumber: 6,
        title: 'AI Voiceovers, Audio & Music Production',
        objectives: ['Add studio-quality voiceovers and audio to content', 'Use AI audio tools responsibly'],
        topics: ['AI voice generators (ElevenLabs) and text-to-speech customization', 'Cleaning, noise reduction, and audio enhancement', 'Sourcing royalty-free music and AI music generation', 'Ethics and consent in AI voice cloning', 'Podcast snippet creation and audio waveform videos'],
        handsOn: 'Produce a voiceover video and a short audio snippet.',
        deliverable: 'Voiceover video and audio snippet file'
      },
      {
        weekNumber: 7,
        title: 'Social Media Strategy & Platform Domination',
        objectives: ['Build platform-specific content strategies', 'Master short-form algorithms'],
        topics: ['Platform dynamics: Instagram vs. TikTok vs. YouTube Shorts vs. LinkedIn vs. X', 'Content pillars, posting frequencies, and optimal timing', 'Writing high-retention hooks that hold viewer attention', 'Short-form formats: tutorials, behind-the-scenes, stories, trends', 'Reading analytics: impressions, watch time, engagement rate'],
        handsOn: 'Build a multi-platform content strategy and produce 3 platform-tailored short-form pieces.',
        deliverable: 'Platform strategy document and 3 short-form content pieces'
      },
      {
        weekNumber: 8,
        title: 'Content Calendars, Batching & Scheduling',
        objectives: ['Plan a full 30-day content calendar', 'Master batch production to save 15+ hours weekly'],
        topics: ['Building a 30-day content matrix and calendar', 'Batch production pipeline: Plan ➔ Write ➔ Design ➔ Edit ➔ Schedule', 'Repurposing 1 core idea into 5 distinct platform assets', 'Social media scheduling tools and automated posting', 'Avoiding creator burnout and maintaining consistency'],
        handsOn: 'Build a 30-day content calendar and batch-produce Week 1 content.',
        deliverable: '30-day content calendar with Week 1 finished assets'
      },
      {
        weekNumber: 9,
        title: 'Personal Brand Building & Portfolio Launch',
        objectives: ['Build a recognizable personal or agency brand', 'Publish a portfolio showcasing your work'],
        topics: ['Personal brand positioning, bio optimization, and header design', 'Highlight setups and pinned posts for conversion', 'Curating portfolio pieces and writing short case studies', 'Building a clean, single-page portfolio website', 'Collecting client testimonials and proof screenshots'],
        handsOn: 'Optimize social media profiles and publish a live portfolio page.',
        deliverable: 'Optimized brand profiles and published portfolio page'
      },
      {
        weekNumber: 10,
        title: 'Monetizing Content Skills & Final Showcase',
        objectives: ['Monetize your content creation skills', 'Present your final capstone project'],
        topics: ['Monetization paths: freelancing, social media management, UGC, affiliate', 'Finding prospective clients and pitching your services', 'Creating service packages (retainers, content packs)', 'Contracts, invoicing, and client communication basics', 'Final project presentations and cohort feedback'],
        handsOn: 'Create a client service offer sheet and present your final capstone project.',
        deliverable: 'Service offer package, pitch deck, and final capstone project'
      }
    ]
  },

  // 5. Data Science & Machine Learning Cohort 2 (AI Engineer Track)
  {
    id: 'course-data-science-ml-c2',
    slug: 'machine-learning-data-science',
    title: 'Data Science & Machine Learning (AI Engineer)',
    category: 'Data Science & ML',
    durationWeeks: 16,
    format: 'Online / Physical (Hybrid)',
    level: 'Beginner to Professional (Comfort with basic math helpful)',
    priceNaira: 150000,
    priceDisplay: '₦150,000',
    tagline: 'Master Python, R, statistical modeling, supervised/unsupervised ML, and AI model evaluation.',
    overview: 'This course takes students from the basics of data science to building and evaluating machine learning models. Students learn Python and R, the statistics and theory behind common models, and how to use modern AI tools in their workflow. The course ends with a capstone project and a portfolio.',
    learningOutcomes: [
      'Follow the full data science workflow, from problem definition to model delivery',
      'Write Python and R code to clean, explore and visualize data',
      'Apply statistics and probability to interpret data and model results',
      'Build, evaluate and improve regression, classification and clustering models',
      'Explain how common machine learning models work, in plain language',
      'Use AI and LLM tools to speed up data science work responsibly',
      'Complete a portfolio-ready capstone project in Python or R'
    ],
    toolsUsed: ['Python (NumPy, Pandas, Matplotlib, Seaborn, scikit-learn)', 'R & RStudio (tidyverse, ggplot2)', 'Google Colab / Jupyter', 'Git & GitHub', 'AI Assistants'],
    phases: [
      { phaseNumber: 1, name: 'Python & Data Prep', weeksRange: 'Weeks 1-4', description: 'Data science workflow, Python logic, Pandas, and data cleaning.' },
      { phaseNumber: 2, name: 'Visualization & Statistics', weeksRange: 'Weeks 5-8', description: 'Python charts, probability, statistics, and R programming with ggplot2.' },
      { phaseNumber: 3, name: 'Machine Learning', weeksRange: 'Weeks 9-13', description: 'Supervised ML (Regression & Classification), Unsupervised Clustering, and Model Tuning.' },
      { phaseNumber: 4, name: 'AI & Neural Nets Intro', weeksRange: 'Week 14', description: 'AI prompt patterns for ML, code validation, and Neural Networks introduction.' },
      { phaseNumber: 5, name: 'Capstone & Career', weeksRange: 'Weeks 15-16', description: 'End-to-end model build, portfolio GitHub publication, and ML career paths.' }
    ],
    assessment: [
      'Weekly practical assignments',
      'Mid-course practical test (Python data handling and statistics)',
      'Model-building assessment (Weeks 10-13)',
      'Capstone project: notebook or R Markdown report, model, and presentation',
      'Certificate issued on completing all weekly deliverables and capstone'
    ],
    capstoneSpec: {
      title: 'End-to-End Machine Learning Model Pipeline & Technical Report',
      requirements: [
        'Clear problem statement and quantitative success metrics',
        'Cleaned dataset with documented data preparation decisions',
        'Exploratory Data Analysis (EDA) with statistical visualizations',
        'At least two ML models trained and compared with appropriate evaluation metrics (RMSE, F1, ROC-AUC)',
        'Short executive report with actionable business recommendations',
        'Published GitHub repository with clean Jupyter Notebook or R Markdown report'
      ],
      durationMinutesDemo: 10
    },
    weeks: [
      {
        weekNumber: 1,
        title: 'Introduction to Data Science & Workspace Setup',
        objectives: ['Understand data science vs. analysis vs. ML', 'Master the 6-stage data science lifecycle'],
        topics: ['Data science, data analysis, ML, and AI: how they relate', 'Roles and career paths: Data Scientist, ML Engineer, Data Analyst', 'The lifecycle: Define ➔ Collect ➔ Clean ➔ Explore ➔ Model ➔ Evaluate ➔ Deliver', 'Problem framing: prediction vs. classification vs. clustering', 'Setting up Google Colab, RStudio, and GitHub'],
        handsOn: 'Classify real-world business problems into ML tasks and run an end-to-end Colab notebook.',
        deliverable: 'One-page problem definition brief and initialized notebook'
      },
      {
        weekNumber: 2,
        title: 'Python Fundamentals for Data Science',
        objectives: ['Write basic Python code with confidence', 'Work comfortably in Jupyter notebooks'],
        topics: ['Variables, data types (int, float, string, bool), and operators', 'Data structures: lists, tuples, dictionaries, sets', 'Control flow: conditionals (if/elif/else) and loops (for, while)', 'Functions, arguments, and module imports', 'Reading and fixing Python syntax and runtime errors'],
        handsOn: 'Write Python scripts to parse and summarize raw customer and transaction data.',
        deliverable: 'Python fundamentals notebook pushed to GitHub'
      },
      {
        weekNumber: 3,
        title: 'Python for Data Handling (NumPy & Pandas)',
        objectives: ['Manipulate and transform structured datasets in Python', 'Master Pandas DataFrames'],
        topics: ['NumPy arrays and vectorized mathematical operations', 'Pandas Series and DataFrames architecture', 'Loading CSV, Excel, and JSON files', 'Selecting, filtering, indexing, and sorting rows/columns', 'Groupby aggregations, merging datasets, and feature creation'],
        handsOn: 'Load, filter, merge, and summarize a real-world multi-table dataset.',
        deliverable: 'Pandas data handling notebook'
      },
      {
        weekNumber: 4,
        title: 'Data Cleaning & Preprocessing',
        objectives: ['Detect and fix data quality anomalies', 'Prepare raw data for machine learning models'],
        topics: ['Missing values: detection, dropping vs. imputation techniques', 'Duplicates, inconsistent string formatting, and type casting', 'Identifying and handling statistical outliers', 'Encoding categorical variables: One-Hot and Label Encoding', 'Feature scaling: StandardScaler and MinMaxScaler'],
        handsOn: 'Clean a messy raw dataset and document every cleaning decision in a change log.',
        deliverable: 'Cleaned dataset file and data preparation notebook'
      },
      {
        weekNumber: 5,
        title: 'Data Visualization in Python',
        objectives: ['Create clear, informative statistical charts', 'Communicate data distributions visually'],
        topics: ['Matplotlib fundamentals and figure customization', 'Seaborn for statistical data visualization', 'Histograms, box plots, scatter plots, bar charts, line plots', 'Heatmaps and correlation matrix visualization', 'Design principles: avoiding misleading visual representations'],
        handsOn: 'Build a statistical visualization notebook answering key business questions.',
        deliverable: 'Data visualization notebook with written takeaways'
      },
      {
        weekNumber: 6,
        title: 'Statistics & Probability Essentials',
        objectives: ['Understand statistical foundation of data science', 'Avoid statistical interpretation errors'],
        topics: ['Descriptive statistics: mean, median, variance, standard deviation', 'Probability fundamentals and standard normal distribution', 'Sampling methods, Central Limit Theorem (conceptual)', 'Correlation vs. causation and scatter matrices', 'Introduction to hypothesis testing and p-values'],
        handsOn: 'Calculate summary statistics, correlations, and hypothesis tests on Python datasets.',
        deliverable: 'Statistics notebook + Mid-Course Practical Test completion'
      },
      {
        weekNumber: 7,
        title: 'R Programming Fundamentals & Tidyverse',
        objectives: ['Write basic R code in RStudio', 'Manipulate data using the tidyverse library'],
        topics: ['RStudio IDE, scripts, and R Markdown document setup', 'Vectors, matrices, data frames, and R syntax syntax', 'Importing data into R', 'dplyr operations: select, filter, arrange, mutate, summarize, group_by', 'Comparing R and Python approaches for identical data tasks'],
        handsOn: 'Re-implement earlier data manipulation tasks in R using dplyr.',
        deliverable: 'R data handling script / R Markdown report'
      },
      {
        weekNumber: 8,
        title: 'Exploratory Data Analysis (EDA) in R',
        objectives: ['Execute systematic EDA on new datasets', 'Build publication-grade charts with ggplot2'],
        topics: ['ggplot2: Grammar of Graphics framework', 'Plotting distributions, relationships, and categorical splits', 'Correlation analysis and trend lines in R', 'Systematic EDA checklist and reporting', 'Generating HTML/PDF reports using R Markdown'],
        handsOn: 'Perform a full Exploratory Data Analysis on a new dataset in R.',
        deliverable: 'Comprehensive EDA report rendered in R Markdown'
      },
      {
        weekNumber: 9,
        title: 'Machine Learning Foundations & Scikit-Learn',
        objectives: ['Understand how machine learning models learn', 'Establish a disciplined ML workflow'],
        topics: ['What ML is: Supervised vs. Unsupervised vs. Reinforcement', 'Features (X) and targets (y)', 'Train/Test split and cross-validation strategies', 'Overfitting vs. Underfitting and Bias-Variance tradeoff', 'Introduction to scikit-learn API structure'],
        handsOn: 'Split a dataset, train a baseline scikit-learn model, and evaluate test performance.',
        deliverable: 'Baseline machine learning pipeline notebook'
      },
      {
        weekNumber: 10,
        title: 'Supervised Learning: Regression Models',
        objectives: ['Build regression models to predict continuous numeric values', 'Evaluate and compare regression metrics'],
        topics: ['Simple and Multiple Linear Regression', 'Loss functions (MSE, MAE) and gradient descent concept', 'Regularization techniques: Ridge (L2) and Lasso (L1)', 'Decision Tree Regression and Random Forest Regressor', 'Evaluation metrics: MAE, RMSE, R-Squared'],
        handsOn: 'Build and compare two regression models (e.g. house price or sales prediction).',
        deliverable: 'Regression model build and comparison notebook'
      },
      {
        weekNumber: 11,
        title: 'Supervised Learning: Classification Models',
        objectives: ['Build classification models to predict discrete categories', 'Select evaluation metrics tailored to the problem'],
        topics: ['Logistic Regression and decision boundaries', 'k-Nearest Neighbors (k-NN) and Decision Trees', 'Random Forest Classifier and ensemble methods', 'Confusion matrix, Precision, Recall, F1-Score, ROC-AUC', 'Handling imbalanced datasets (SMOTE introduction)'],
        handsOn: 'Build and evaluate a customer churn or default classifier in scikit-learn.',
        deliverable: 'Classification model comparison notebook'
      },
      {
        weekNumber: 12,
        title: 'Unsupervised Learning & Clustering',
        objectives: ['Find hidden patterns and groupings in unlabeled data', 'Explain cluster insights to business stakeholders'],
        topics: ['Unsupervised learning principles and use cases', 'k-Means clustering algorithm and finding optimal k (Elbow method)', 'Hierarchical clustering introduction', 'Dimensionality reduction: Principal Component Analysis (PCA)', 'Customer segmentation and anomaly detection applications'],
        handsOn: 'Segment customer transaction data into distinct behavioral clusters.',
        deliverable: 'Clustering notebook with business segment profiles'
      },
      {
        weekNumber: 13,
        title: 'Model Evaluation, Tuning & Pipelines',
        objectives: ['Systematically improve ML model performance', 'Build clean scikit-learn Pipelines'],
        topics: ['Cross-validation strategies (k-Fold, Stratified k-Fold)', 'Hyperparameter tuning: GridSearchCV and RandomizedSearchCV', 'Feature engineering and automated feature selection', 'Preventing data leakage between train and test sets', 'Building scikit-learn Pipelines and saving models with Joblib'],
        handsOn: 'Build an automated ML Pipeline with hyperparameter tuning and model persistence.',
        deliverable: 'Tuned ML pipeline notebook and saved model file'
      },
      {
        weekNumber: 14,
        title: 'AI Tools for Data Science & Neural Nets Intro',
        objectives: ['Use AI tools to accelerate data science workflows responsibly', 'Understand fundamental neural network concepts'],
        topics: ['Prompt engineering for data science code, debugging, and feature ideas', 'Auditing and testing AI-generated code and statistical assumptions', 'Data privacy and security rules with external AI tools', 'Neural Networks: artificial neurons, weights, biases, and activation functions', 'First look at Deep Learning vs. Traditional Machine Learning'],
        handsOn: 'Complete a complex ML workflow with AI assistance, logging all code verifications.',
        deliverable: 'AI-assisted ML analysis notebook with verification audit log'
      },
      {
        weekNumber: 15,
        title: 'Capstone Project Build Sprint',
        objectives: ['Build an end-to-end data science and machine learning project', 'Document project methodology and findings'],
        topics: ['Problem selection, dataset acquisition, and scope approval', 'Executing data cleaning, EDA, feature engineering, and modeling', 'Evaluating multiple candidate models with cross-validation', 'Writing technical documentation and executive takeaways'],
        handsOn: 'Build your capstone project notebook with instructor review checkpoints.',
        deliverable: 'Draft capstone project notebook or R Markdown report'
      },
      {
        weekNumber: 16,
        title: 'Capstone Presentation, Portfolio & Career',
        objectives: ['Present results with technical confidence', 'Publish your portfolio and prepare for data science roles'],
        topics: ['Presenting ML technical results to non-technical audiences', 'Building an impressive GitHub portfolio and Kaggle presence', 'Structuring your CV and LinkedIn for Data Science / AI roles', 'Freelancing, consulting, and pricing data projects', 'Interview preparation and post-course learning roadmap'],
        handsOn: 'Present your live capstone demo to the class and publish your GitHub portfolio.',
        deliverable: 'Final capstone project, GitHub repository, and live portfolio'
      }
    ]
  },

  // 6. Data Analysis Cohort 2
  {
    id: 'course-data-analysis-c2',
    slug: 'data-analysis-cohort',
    title: 'Data Analysis & Business Intelligence',
    category: 'Data Analysis',
    durationWeeks: 16,
    format: 'Online / Physical (Hybrid)',
    level: 'Beginner to Professional',
    priceNaira: 60000,
    priceDisplay: '₦60,000',
    tagline: 'Master Excel, SQL, Python, Power BI, and AI-assisted data storytelling.',
    overview: 'This is a practical, beginner-to-professional course that takes students from raw data to clear business insight. Students learn Excel, statistics, SQL, and Python, get a short introduction to Power BI, and learn to use AI tools to work faster. The course ends with a capstone project and a portfolio they can show to employers and clients.',
    learningOutcomes: [
      'Follow a structured analysis workflow, from business question to recommendation',
      'Clean, organize and analyze data in Excel, SQL and Python',
      'Apply core statistics to interpret data correctly',
      'Build clear charts and dashboards in Excel, Python and Power BI',
      'Use AI tools to speed up analysis while checking the results for accuracy',
      'Present findings as a clear story to non-technical audiences',
      'Complete a portfolio-ready capstone project'
    ],
    toolsUsed: ['Excel / Google Sheets', 'SQL (SQLite / PostgreSQL)', 'Python (Pandas, Matplotlib, Seaborn)', 'Power BI Desktop', 'ChatGPT / Claude'],
    phases: [
      { phaseNumber: 1, name: 'Excel Mastery', weeksRange: 'Weeks 1-5', description: 'Data analysis workflow, Excel formulas, data cleaning, Pivot Tables, and interactive dashboards.' },
      { phaseNumber: 2, name: 'Statistics & SQL', weeksRange: 'Weeks 6-8', description: 'Business statistics, SQL queries, aggregate functions, JOINs, and subqueries.' },
      { phaseNumber: 3, name: 'Python for Analysts', weeksRange: 'Weeks 9-11', description: 'Python logic, Pandas DataFrames, data reshaping, and Seaborn visualization.' },
      { phaseNumber: 4, name: 'Power BI & AI Tools', weeksRange: 'Weeks 12-13', description: 'Power BI dashboards, Power Query, and AI-assisted analysis prompting.' },
      { phaseNumber: 5, name: 'Capstone & Data Storytelling', weeksRange: 'Weeks 14-16', description: 'Industry case studies, executive storytelling, capstone build, and portfolio launch.' }
    ],
    assessment: [
      'Weekly practical assignments',
      'Mid-course practical test (Excel & SQL)',
      'Capstone project: report, multi-tool analysis, dashboard, and presentation',
      'Certificate issued on completing all weekly deliverables and capstone'
    ],
    capstoneSpec: {
      title: 'End-to-End Business Data Analysis & Executive Dashboard',
      requirements: [
        'A clear business problem statement and analysis questions',
        'Cleaned dataset with documented data preparation decisions',
        'Multi-tool analysis (e.g. Excel + SQL or Python)',
        'Interactive dashboard (Excel or Power BI)',
        'Short executive written report with data-driven recommendations',
        'Published portfolio repository with clear README'
      ],
      durationMinutesDemo: 10
    },
    weeks: [
      {
        weekNumber: 1,
        title: 'Introduction to Data Analysis & Workflow',
        objectives: ['Understand what data analysts do', 'Master the 6-step data analysis lifecycle'],
        topics: ['What data analysis is and types: Descriptive, Diagnostic, Predictive, Prescriptive', 'Data Analyst career paths and industry roles', 'The analysis lifecycle: Ask ➔ Prepare ➔ Process ➔ Analyze ➔ Share ➔ Act', 'Types of data: structured vs. unstructured, quantitative vs. qualitative', 'Tools overview and setting up Excel, Google Colab, and portfolio folder'],
        handsOn: 'Classify sample datasets and translate a vague business problem into a clear analysis question.',
        deliverable: 'One-page analysis question brief'
      },
      {
        weekNumber: 2,
        title: 'Excel Fundamentals & Logical Formulas',
        objectives: ['Work confidently in Excel / Google Sheets', 'Master essential business formulas'],
        topics: ['Excel interface, data entry, formatting, and Excel Tables', 'Core mathematical functions: SUM, AVERAGE, COUNT, MIN, MAX', 'Logical functions: IF, AND, OR, nested IFs', 'Relative ($A1) vs. Absolute ($A$1) cell references', 'Modern lookups: XLOOKUP and VLOOKUP', 'Sorting and multi-level filtering'],
        handsOn: 'Build a comprehensive business sales tracker using formulas and lookups.',
        deliverable: 'Completed Excel sales tracking workbook'
      },
      {
        weekNumber: 3,
        title: 'Data Cleaning & Preparation in Excel',
        objectives: ['Detect and fix data quality anomalies in Excel', 'Document cleaning decisions'],
        topics: ['Identifying duplicates, missing values, and inconsistent text', 'Text functions: TRIM, CLEAN, LEFT, RIGHT, CONCAT, TEXTSPLIT', 'Formatting dates and numbers correctly', 'Data validation rules and drop-down list creation', 'Introduction to Power Query for automated data cleaning'],
        handsOn: 'Clean a messy raw customer dataset and create a documented change log.',
        deliverable: 'Cleaned Excel dataset and data cleaning change log'
      },
      {
        weekNumber: 4,
        title: 'Data Analysis with Excel Pivot Tables',
        objectives: ['Summarize large datasets quickly', 'Answer business questions using Pivot Tables'],
        topics: ['Creating Pivot Tables, grouping data, and adding Slicers', 'Conditional aggregation: SUMIFS, COUNTIFS, AVERAGEIFS', 'Calculated fields and calculated items in Pivot Tables', 'Summarizing sales, regional performance, and growth trends'],
        handsOn: 'Analyze 1 year of sales transaction data by product line, region, and month.',
        deliverable: 'Pivot Table summary report with 3 actionable business insights'
      },
      {
        weekNumber: 5,
        title: 'Excel Dashboards & Data Visualization',
        objectives: ['Choose appropriate chart types for business metrics', 'Build an interactive Excel dashboard'],
        topics: ['Chart selection guide: bar, line, pie, scatter, combo charts', 'Visualization design rules: visual hierarchy, color palette, clutter removal', 'Common chart mistakes and misleading graphics to avoid', 'Building interactive dashboards connected to Pivot Slicers'],
        handsOn: 'Design and build an interactive sales performance dashboard in Excel.',
        deliverable: 'Interactive Excel Dashboard workbook'
      },
      {
        weekNumber: 6,
        title: 'Statistics Essentials for Data Analysts',
        objectives: ['Understand statistical principles used in business analysis', 'Avoid interpretation errors'],
        topics: ['Measures of central tendency: mean, median, mode', 'Measures of spread: range, variance, standard deviation', 'Understanding data distributions and identifying outliers', 'Correlation vs. causation in business metrics', 'Sampling, bias, and introductory hypothesis testing'],
        handsOn: 'Calculate summary statistics and correlation matrices on real business datasets.',
        deliverable: 'Statistics analysis worksheet with written interpretations'
      },
      {
        weekNumber: 7,
        title: 'SQL Fundamentals for Data Extraction',
        objectives: ['Understand database architecture', 'Retrieve and aggregate data using SQL'],
        topics: ['Databases, tables, rows, columns, primary and foreign keys', 'SELECT, WHERE, ORDER BY, LIMIT, DISTINCT statements', 'Filtering with numeric, text, and date conditions', 'SQL aggregate functions: COUNT, SUM, AVG, MIN, MAX', 'Grouping data with GROUP BY'],
        handsOn: 'Query a sample e-commerce database to extract key sales metrics.',
        deliverable: 'SQL query script answering 10 business questions'
      },
      {
        weekNumber: 8,
        title: 'Intermediate SQL: Joins, Subqueries & CASE',
        objectives: ['Combine data from multiple relational tables', 'Write advanced business queries'],
        topics: ['Relational joins: INNER JOIN, LEFT JOIN, RIGHT JOIN', 'Filtering aggregated results using HAVING', 'Subqueries in WHERE and SELECT clauses', 'Conditional logic with CASE WHEN statements', 'Date manipulation functions in SQL', 'Introduction to Common Table Expressions (CTEs)'],
        handsOn: 'Solve multi-table business queries (top customers, monthly revenue, repeat purchase rate).',
        deliverable: 'Intermediate SQL query set + Mid-Course Practical Test completion'
      },
      {
        weekNumber: 9,
        title: 'Python Fundamentals for Data Analysis',
        objectives: ['Write basic Python code for data analysis', 'Work comfortably in Google Colab notebooks'],
        topics: ['Google Colab / Jupyter notebook interface', 'Python variables, data types, lists, and dictionaries', 'Conditional statements, loops, and custom functions', 'Importing essential data libraries'],
        handsOn: 'Write Python scripts that process lists of transaction records.',
        deliverable: 'Python fundamentals practice notebook'
      },
      {
        weekNumber: 10,
        title: 'Data Manipulation with Pandas',
        objectives: ['Load, clean, and reshape datasets in Python', 'Replicate Excel/SQL tasks in Pandas'],
        topics: ['Pandas DataFrames and Series architecture', 'Loading CSV and Excel files into Pandas', 'Filtering, selecting, and sorting DataFrames', 'Handling missing values and duplicates in Python', 'groupby aggregations and merging DataFrames'],
        handsOn: 'Clean and summarize a raw business dataset in Pandas.',
        deliverable: 'Pandas data manipulation and cleaning notebook'
      },
      {
        weekNumber: 11,
        title: 'Exploratory Data Analysis & Seaborn Charts',
        objectives: ['Perform systematic EDA in Python', 'Create publication-ready charts using Seaborn'],
        topics: ['Matplotlib and Seaborn visualization libraries', 'Plotting distributions, bar charts, line graphs, and box plots', 'Correlation heatmaps and pair plots', 'Executing an EDA checklist on a new dataset'],
        handsOn: 'Perform a complete Exploratory Data Analysis on a business dataset.',
        deliverable: 'EDA notebook with statistical visualizations and insights'
      },
      {
        weekNumber: 12,
        title: 'Power BI Introduction & Dashboard Build',
        objectives: ['Understand Power BI in the analysis stack', 'Build a one-page business dashboard'],
        topics: ['What Power BI is and connecting to data sources', 'Data cleaning in Power Query Editor', 'Core visual types, filters, and interactive Slicers', 'Designing clean one-page executive dashboards'],
        handsOn: 'Rebuild your Excel sales dashboard inside Power BI Desktop.',
        deliverable: 'One-page Power BI Dashboard file'
      },
      {
        weekNumber: 13,
        title: 'AI for Data Analysis & Verification Protocols',
        objectives: ['Use AI tools to accelerate formula, SQL, and Python writing', 'Verify AI output for accuracy'],
        topics: ['Prompt patterns for Excel formulas, SQL queries, and Pandas code', 'Using AI to explain statistical findings and suggest cleaning steps', 'Auditing and testing AI-generated queries and formulas', 'Data privacy and security rules when using external AI tools'],
        handsOn: 'Complete a complex analysis task with AI assistance, logging all code verifications.',
        deliverable: 'AI-assisted analysis notebook with verification audit log'
      },
      {
        weekNumber: 14,
        title: 'Industry Case Studies & Capstone Kickoff',
        objectives: ['Study real-world analysis across sales, marketing, and finance', 'Plan your capstone project'],
        topics: ['Real-world case studies: E-commerce Churn, Retail Inventory, SaaS Conversion', 'Selecting a capstone dataset and framing business questions', 'Scoping analysis deliverables and timeline'],
        handsOn: 'Analyze two industry case studies and submit your capstone project proposal.',
        deliverable: 'Approved capstone project proposal document'
      },
      {
        weekNumber: 15,
        title: 'Data Storytelling, Reporting & Capstone Build',
        objectives: ['Transform raw numbers into a compelling business story', 'Build your capstone project'],
        topics: ['Observation vs. Actionable Business Insight', 'Structuring an executive report: Summary, Findings, Recommendations', 'Presenting analysis to non-technical stakeholders', 'Designing clean presentation slides for analysts'],
        handsOn: 'Execute your capstone analysis, build dashboards, and draft the executive report.',
        deliverable: 'Draft capstone report and dashboard'
      },
      {
        weekNumber: 16,
        title: 'Capstone Presentation, Portfolio & Career',
        objectives: ['Present findings with confidence', 'Publish your portfolio and prepare for job/freelance opportunities'],
        topics: ['Presenting data results to executive stakeholders', 'Building a developer portfolio on GitHub and LinkedIn', 'CV and LinkedIn profile optimization for Data Analyst roles', 'Freelancing, pricing analysis projects, and finding clients', 'Interview preparation and post-course learning roadmap'],
        handsOn: 'Present your live capstone demo to the class and publish your portfolio.',
        deliverable: 'Final capstone project report, dashboard, and published portfolio'
      }
    ]
  }
];

export function getTrainingCourseBySlug(slug: string): TrainingCourse | undefined {
  return TRAINING_COURSES.find(c => c.slug === slug || c.id === slug);
}
