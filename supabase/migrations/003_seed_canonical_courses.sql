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
    'ai-image-short-videos-creation',
    'AI Image & Short Videos Creation',
    'ai-image-short-videos-creation',
    10000.00,
    1000000,
    '4 Weeks',
    'Beginner',
    'Fast-Track Sprint • ₦10,000',
    'Learn how to use state-of-the-art AI tools to create photorealistic images, stylized graphics, viral short-form video scripts, synthetic voiceovers, and captivating personal or faceless videos. From Midjourney, Flux, and Ideogram to CapCut, ElevenLabs, and Runway, you''ll build an automated creative content engine from your laptop or smartphone.',
    'published'
  ),
  (
    'data-analysis-cohort',
    'Data Analysis Cohort',
    'data-analysis-cohort',
    60000.00,
    6000000,
    '16 Weeks',
    'Beginner',
    'Early Tuition: ₦60,000',
    'A 16-week, project-based program that takes you through the full analyst toolkit: Excel → SQL → Power BI → AI-Assisted Analysis. You won''t just learn what a pivot table is. You''ll clean real messy datasets, write SQL queries that answer real business questions, build interactive Power BI dashboards, and finish with a portfolio-ready capstone project.',
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
    'A 12-week, hands-on program built for complete beginners who want to go from ''I''ve heard of ChatGPT'' to ''I automate things for a living'' — without writing a single line of code. Master AI productivity tools, scroll-stopping content generation, Make/Zapier/Notion automations, document handling, and client freelancing monetization.',
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
    'Vixora Academy''s advanced, implementation-focused program for people ready to go beyond tools and start building. You''ll learn to design, build, and deploy AI-powered automations and solutions — the kind organizations and clients actually pay for — with hands-on mentorship, real business projects, and direct support.',
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
    'Learn to turn ideas into working full-stack products using modern AI-assisted development workflows. You will learn how to plan an application, build responsive interfaces, create backend APIs, connect databases, add authentication, integrate third-party services, debug with AI, use Git and GitHub, deploy to production, and present a finished portfolio project.',
    'published'
  ),
  (
    'machine-learning-data-science',
    'Machine Learning & Data Science',
    'machine-learning-data-science',
    60000.00,
    6000000,
    '18 weeks',
    'Beginner to Intermediate',
    '18-Week Comprehensive Cohort',
    'Learn how to work with data, uncover meaningful insights, build predictive models, and apply machine learning to real-world problems. This practical 18-week course takes learners from data analysis fundamentals through machine learning workflows, model evaluation, and portfolio-ready projects.',
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
    'Cohort 1.0 Master Track • ₦25,000',
    'A step-by-step masterclass on positioning yourself, packaging your digital & AI skills, finding high-paying clients, writing proposals that win, outreach workflows, and building a sustainable freelance business.',
    'published'
  ),
  (
    'cohort-1-master-bundle',
    'Cohort 1.0: 4-in-1 Masterclass All-Access Pass',
    'cohort-1-master-bundle',
    45000.00,
    4500000,
    'Full Lifetime Access',
    'All Levels',
    'Flagship 4-in-1 Bundle • Save 69%',
    'One purchase unlocks all four Cohort 1.0 masterclass tracks: AI Content Creation, AI Automation, AI Web Development (Full Stack Vibe Coding), and Client Acquisition & Freelancing with full Telegram community access and resources.',
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
