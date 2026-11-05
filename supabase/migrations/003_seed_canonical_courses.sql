-- ==============================================================================
-- Vixora Academy: 003_seed_canonical_courses.sql
-- Idempotently seeds all canonical academy courses from ACADEMY_COURSES
-- ==============================================================================

INSERT INTO courses (
  id,
  title,
  slug,
  price_naira,
  price_kobo,
  duration,
  level,
  badge,
  description,
  status
) VALUES 
  (
    'ai-automation-digital-literacy',
    'AI Automation & Digital Literacy',
    'ai-automation-digital-literacy',
    60000.00,
    6000000,
    '12 Weeks',
    'Beginner',
    '2026 Curriculum • ₦60,000',
    'Master AI prompting, no-code workflows, and automated business agents in a 12-week practical cohort.',
    'published'
  ),
  (
    'virtual-assistance-appointment-setter',
    'Virtual Assistance & Appointment Setting',
    'virtual-assistance-appointment-setter',
    60000.00,
    6000000,
    '8 Weeks',
    'Beginner',
    '2026 Curriculum • ₦60,000',
    'Master executive VA operations, AI productivity, CRM lead management, and cold outreach scripts in an 8-week cohort.',
    'published'
  ),
  (
    'ai-web-development-vibe-coding',
    'AI Web Development & Vibe Coding',
    'ai-web-development-vibe-coding',
    60000.00,
    6000000,
    '12 Weeks',
    'Beginner',
    '2026 Curriculum • ₦60,000',
    'Build web applications, React frontends, backend databases, and AI features using modern vibe coding toolchains.',
    'published'
  ),
  (
    'ai-content-creation-media',
    'AI Content Creation & Personal Branding',
    'ai-content-creation-media',
    20000.00,
    2000000,
    '10 Weeks',
    'Beginner',
    '2026 Curriculum • ₦20,000',
    'Master AI copywriting, image generation, short video editing, and personal branding in a 10-week sprint.',
    'published'
  ),
  (
    'ai-image-short-videos-creation',
    'AI Image & Short Videos Creation',
    'ai-image-short-videos-creation',
    10000.00,
    1000000,
    '4 Weeks',
    'Beginner',
    'Fast-Track Sprint • ₦10,000',
    'Learn how to use state-of-the-art AI tools to create photorealistic images, stylized graphics, viral short-form video scripts, synthetic voiceovers, and captivating personal or faceless videos.',
    'published'
  ),
  (
    'data-analysis-cohort',
    'Data Analysis & Business Intelligence',
    'data-analysis-cohort',
    60000.00,
    6000000,
    '16 Weeks',
    'Beginner',
    '2026 Curriculum • ₦60,000',
    'Master Excel, SQL, Python, Power BI, and AI-assisted data storytelling in a 16-week practical cohort.',
    'published'
  ),
  (
    'ai-automation-digital-skills',
    'AI Automation & Digital Skills',
    'ai-automation-digital-skills',
    30000.00,
    3000000,
    '12 Weeks',
    'Beginner',
    'Early Tuition: ₦30,000',
    'A 12-week, hands-on program built for complete beginners who want to go from ''I''ve heard of ChatGPT'' to ''I automate things for a living''.',
    'published'
  ),
  (
    'ai-automation-digital-business-systems',
    'AI Automation & Digital Business Systems',
    'ai-automation-digital-business-systems',
    60000.00,
    6000000,
    '12 Weeks',
    'Advanced',
    'Early Tuition: ₦60,000 (Reg ₦150,000+)',
    'Vixora Academy''s advanced, implementation-focused program for people ready to go beyond tools and start building.',
    'published'
  ),
  (
    'full-stack-vibe-coding',
    'Full Stack Vibe Coding',
    'full-stack-vibe-coding',
    50000.00,
    5000000,
    '12 weeks',
    'Beginner to Intermediate',
    '12-Week Production Cohort',
    'Learn to turn ideas into working full-stack products using modern AI-assisted development workflows.',
    'published'
  ),
  (
    'machine-learning-data-science',
    'Data Science & Machine Learning (AI Engineer)',
    'machine-learning-data-science',
    150000.00,
    15000000,
    '16 weeks',
    'Beginner to Professional',
    '2026 Flagship Track • ₦150,000',
    'Master Python, R, statistical modeling, supervised/unsupervised ML algorithms, model evaluation, and deployment.',
    'published'
  ),
  (
    'client-acquisition-freelancing',
    'Client Acquisition & Freelancing Masterclass',
    'client-acquisition-freelancing',
    25000.00,
    2500000,
    '4 Weeks',
    'All Levels',
    'Cohort 1.0 Track • ₦25,000',
    'A step-by-step masterclass on positioning yourself, packaging your digital & AI skills, finding high-paying clients, writing proposals that win, outreach workflows, and building a sustainable freelance business.',
    'published'
  ),
  (
    'pdf-automation-digital-products',
    'PDF Automation & AI Digital Product Creation',
    'pdf-automation-digital-products',
    20000.00,
    2000000,
    '2 Weeks',
    'All Levels',
    'Cohort 1.0 Track • ₦20,000',
    'Research high-demand audiences, validate market problems with AI, author professional PDF guides, design covers and visual layouts, and automate instant checkout delivery with Paystack and Selar.',
    'published'
  ),
  (
    'cohort-1-master-bundle',
    'Cohort 1.0: 5-in-1 Masterclass All-Access Pass',
    'cohort-1-master-bundle',
    45000.00,
    4500000,
    'Full Lifetime Access',
    'All Levels',
    'Flagship 5-in-1 Bundle • Save 72%',
    'One purchase unlocks all five Cohort 1.0 masterclass tracks: AI Content Creation, AI Automation, AI Web Development (Full Stack Vibe Coding), Client Acquisition & Freelancing, and PDF Automation & Digital Products.',
    'published'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  price_naira = EXCLUDED.price_naira,
  price_kobo = EXCLUDED.price_kobo,
  duration = EXCLUDED.duration,
  level = EXCLUDED.level,
  badge = EXCLUDED.badge,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  updated_at = NOW();
