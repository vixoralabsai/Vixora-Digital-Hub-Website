/**
 * Vixora Academy — Telegram Learning Space Configuration
 * 
 * Provides track-specific Telegram channels and groups for Cohort 1.0
 * as well as the all-access bundle mapping.
 * 
 * Strict Access Policy:
 * - Master All-Access Vault (https://t.me/+SGIRa-T4lL1hZTk0): PAID FULL ACCESS BUNDLE ONLY.
 * - Single tracks receive only their respective track invite.
 * - Public Community (https://t.me/vixoraacademy): Open to everyone.
 */

export interface TelegramTrackInvite {
  trackId: string;
  trackSlug: string;
  courseId: string;
  title: string;
  description: string;
  inviteUrl: string;
  accessTier: 'single' | 'bundle' | 'public';
}

export const TELEGRAM_CONFIG = {
  // Official admissions & support username
  supportUsername: process.env.TELEGRAM_SUPPORT_USERNAME || 'VixoraAdmissions',
  
  // Public community channel (open to anyone)
  publicCommunity:
    process.env.TELEGRAM_PUBLIC_COMMUNITY ||
    'https://t.me/vixoraacademy',

  // Master All-Access Cohort 1.0 Vault (All 4 course recordings - Paid full access ONLY)
  masterBundleInvite:
    process.env.TELEGRAM_INVITE_MASTER_BUNDLE ||
    'https://t.me/+SGIRa-T4lL1hZTk0',

  // Track 1: AI Content Creation (Image, Video & Audio)
  contentCreationInvite:
    process.env.TELEGRAM_INVITE_CONTENT_CREATION ||
    'https://t.me/+wfBtF79zAWJhMTNk',

  // Track 2: AI Automation No Code (Digital Business Systems)
  automationInvite:
    process.env.TELEGRAM_INVITE_AUTOMATION ||
    'https://t.me/+g8Upx0T9tOcwOTg0',

  // Track 3: AI Web & App Development (Vibe Coding)
  vibeCodingInvite:
    process.env.TELEGRAM_INVITE_VIBE_CODING ||
    'https://t.me/+CVf0IxhvRWFkYjZk',

  // Track 4: Client Acquisition & Retainers
  freelancingInvite:
    process.env.TELEGRAM_INVITE_FREELANCING ||
    'https://t.me/+kItRKPShz-Y2NjM8',

  // Specialized: PDF Automation (AI Digital Product Creation)
  pdfAutomationInvite:
    process.env.TELEGRAM_INVITE_PDF_AUTOMATION ||
    'https://t.me/+nsbDIiXSU7sxZmVk',
};

/**
 * Returns the track-specific Telegram invitations for a given course ID or slug.
 * 
 * Access Enforcement:
 * - Full bundle returns the Master Vault containing all 4 course recordings plus track spaces.
 * - Single-track payments return ONLY that track's space, strictly withholding the master vault.
 */
export function getTelegramInvitesForCourse(courseIdOrSlug: string): TelegramTrackInvite[] {
  const normalized = (courseIdOrSlug || '').toLowerCase().trim();

  // Master Vault Invite (All 5 tracks, all recordings, Dean Sarumi mastermind)
  const masterVault: TelegramTrackInvite = {
    trackId: 'track-cohort1-master-vault',
    trackSlug: 'cohort-1-master-bundle',
    courseId: 'course-cohort-1-master-bundle',
    title: 'Cohort 1.0 Master Vault (All 5 Course Recordings & Mastermind)',
    description: 'Direct unlisted cloud replays for all 5 tracks, prompt libraries, and Dean Sarumi mastermind.',
    inviteUrl: TELEGRAM_CONFIG.masterBundleInvite,
    accessTier: 'bundle'
  };

  // Track 1: AI Content Creation
  const track1: TelegramTrackInvite = {
    trackId: 'track-ai-content',
    trackSlug: 'ai-image-short-videos-creation',
    courseId: 'course-ai-image-short-videos-creation',
    title: 'AI Content Creation Vault',
    description: 'Direct-response UGC video ads, prompt recipes, and creative production masterminds.',
    inviteUrl: TELEGRAM_CONFIG.contentCreationInvite,
    accessTier: 'single'
  };

  // Track 2: AI Automation No Code
  const track2: TelegramTrackInvite = {
    trackId: 'track-ai-automation',
    trackSlug: 'ai-automation-digital-business-systems',
    courseId: 'course-ai-automation-digital-business-systems',
    title: 'AI Automation No Code Vault',
    description: 'Make.com, Zapier, n8n workflows, Vapi voice agents, and lead pipeline blueprints.',
    inviteUrl: TELEGRAM_CONFIG.automationInvite,
    accessTier: 'single'
  };

  // Track 3: AI Web & App Development (Vibe Coding)
  const track3: TelegramTrackInvite = {
    trackId: 'track-vibe-coding',
    trackSlug: 'fullstack-vibe-coding',
    courseId: 'course-fullstack-vibe-coding',
    title: 'AI Web & App Development (Vibe Coding) Vault',
    description: 'React, Vite, TypeScript codebases, backend APIs, and Paystack integration repos.',
    inviteUrl: TELEGRAM_CONFIG.vibeCodingInvite,
    accessTier: 'single'
  };

  // Track 4: Client Acquisition
  const track4: TelegramTrackInvite = {
    trackId: 'track-freelancing',
    trackSlug: 'client-acquisition-freelancing',
    courseId: 'course-client-acquisition-freelancing',
    title: 'Client Acquisition & Retainers Vault',
    description: 'Cold outreach scripts, Upwork proposal teardowns, and high-ticket service contract templates.',
    inviteUrl: TELEGRAM_CONFIG.freelancingInvite,
    accessTier: 'single'
  };

  // Specialized Track 5: PDF Automation & Digital Products
  const pdfTrack: TelegramTrackInvite = {
    trackId: 'track-pdf-automation',
    trackSlug: 'pdf-automation-digital-products',
    courseId: 'course-pdf-automation-digital-products',
    title: 'PDF Automation & AI Digital Products Vault',
    description: 'Automated digital product creation, PDF compilers, and passive revenue funnels.',
    inviteUrl: TELEGRAM_CONFIG.pdfAutomationInvite,
    accessTier: 'single'
  };

  // 1. MASTER BUNDLE: Paid full-access clients unlock the Master Recording Vault + individual track vaults
  if (
    normalized.includes('bundle') ||
    normalized.includes('cohort-1-master') ||
    normalized === 'course-cohort-1-master-bundle'
  ) {
    return [masterVault, track1, track2, track3, track4, pdfTrack];
  }

  // 2. Track 1: AI Content Creation
  if (
    normalized.includes('content') ||
    normalized.includes('image') ||
    normalized.includes('video') ||
    normalized === 'course-ai-image-short-videos-creation' ||
    normalized === 'ai-image-short-videos-creation'
  ) {
    return [track1];
  }

  // 3. Specialized: PDF Automation / Digital Products (check before general automation)
  if (
    normalized.includes('pdf') ||
    normalized.includes('digital-product') ||
    normalized.includes('product-creation')
  ) {
    return [pdfTrack];
  }

  // 4. Track 2: AI Automation No Code
  if (
    normalized.includes('automation') ||
    normalized.includes('systems') ||
    normalized === 'course-ai-automation-digital-business-systems' ||
    normalized === 'course-ai-automation-digital-skills' ||
    normalized === 'ai-automation-digital-business-systems' ||
    normalized === 'ai-automation-digital-skills'
  ) {
    return [track2];
  }

  // 5. Track 3: AI Web & App Development (Vibe Coding)
  if (
    normalized.includes('vibe') ||
    normalized.includes('web-dev') ||
    normalized.includes('fullstack') ||
    normalized === 'course-fullstack-vibe-coding' ||
    normalized === 'fullstack-vibe-coding'
  ) {
    return [track3];
  }

  // 6. Track 4: Client Acquisition & Retainers
  if (
    normalized.includes('client') ||
    normalized.includes('acquisition') ||
    normalized.includes('freelanc') ||
    normalized === 'course-client-acquisition-freelancing' ||
    normalized === 'client-acquisition-freelancing'
  ) {
    return [track4];
  }

  // 7. General fallback: return public community channel (NEVER the private recording vault)
  return [
    {
      trackId: 'track-public-community',
      trackSlug: 'vixora-academy-public',
      courseId: normalized || 'public',
      title: 'Vixora Academy Public Telegram Community',
      description: 'Official student announcements, open workshops, and community networking.',
      inviteUrl: TELEGRAM_CONFIG.publicCommunity,
      accessTier: 'public'
    }
  ];
}
