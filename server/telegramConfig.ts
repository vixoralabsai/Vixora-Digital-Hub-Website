/**
 * Vixora Academy — Telegram Learning Space Configuration
 * 
 * Provides track-specific Telegram channels and groups for Cohort 1.0
 * as well as the all-access bundle mapping.
 */

export interface TelegramTrackInvite {
  trackId: string;
  trackSlug: string;
  courseId: string;
  title: string;
  description: string;
  inviteUrl: string;
  accessTier: 'single' | 'bundle';
}

export const TELEGRAM_CONFIG = {
  // Official admissions & support
  supportUsername: process.env.TELEGRAM_SUPPORT_USERNAME || 'VixoraAdmissions',
  
  // Track 1: AI Content Creation
  contentCreationInvite:
    process.env.TELEGRAM_INVITE_CONTENT_CREATION ||
    'https://t.me/+VixoraContentCreationCohort1',

  // Track 2: AI Automation & Digital Business Systems
  automationInvite:
    process.env.TELEGRAM_INVITE_AUTOMATION ||
    'https://t.me/+VixoraAutomationCohort1',

  // Track 3: AI Web Development & Vibe Coding
  vibeCodingInvite:
    process.env.TELEGRAM_INVITE_VIBE_CODING ||
    'https://t.me/+VixoraVibeCodingCohort1',

  // Track 4: Client Acquisition & Freelancing
  freelancingInvite:
    process.env.TELEGRAM_INVITE_FREELANCING ||
    'https://t.me/+VixoraClientAcquisitionCohort1',

  // Master All-Access Cohort 1.0 Vault
  masterBundleInvite:
    process.env.TELEGRAM_INVITE_MASTER_BUNDLE ||
    'https://t.me/+VixoraCohort1MasterVault'
};

/**
 * Returns the track-specific Telegram invitations for a given course ID or slug.
 * For the master bundle, returns all four track links plus the master vault.
 */
export function getTelegramInvitesForCourse(courseIdOrSlug: string): TelegramTrackInvite[] {
  const normalized = (courseIdOrSlug || '').toLowerCase().trim();

  const track1: TelegramTrackInvite = {
    trackId: 'track-ai-content',
    trackSlug: 'ai-image-short-videos-creation',
    courseId: 'course-ai-image-short-videos-creation',
    title: 'AI Content Creation Vault',
    description: 'Direct-response UGC video ads, prompt recipes, and creative production masterminds.',
    inviteUrl: TELEGRAM_CONFIG.contentCreationInvite,
    accessTier: 'single'
  };

  const track2: TelegramTrackInvite = {
    trackId: 'track-ai-automation',
    trackSlug: 'ai-automation-digital-business-systems',
    courseId: 'course-ai-automation-digital-business-systems',
    title: 'AI Automation & Systems Vault',
    description: 'Make.com, Zapier, n8n workflows, Vapi voice agents, and lead pipeline blueprints.',
    inviteUrl: TELEGRAM_CONFIG.automationInvite,
    accessTier: 'single'
  };

  const track3: TelegramTrackInvite = {
    trackId: 'track-vibe-coding',
    trackSlug: 'fullstack-vibe-coding',
    courseId: 'course-fullstack-vibe-coding',
    title: 'AI Web Development & Vibe Coding Vault',
    description: 'React, Vite, TypeScript codebases, backend APIs, and Paystack integration repos.',
    inviteUrl: TELEGRAM_CONFIG.vibeCodingInvite,
    accessTier: 'single'
  };

  const track4: TelegramTrackInvite = {
    trackId: 'track-freelancing',
    trackSlug: 'client-acquisition-freelancing',
    courseId: 'course-client-acquisition-freelancing',
    title: 'Client Acquisition & Retainers Vault',
    description: 'Cold outreach scripts, Upwork proposal teardowns, and high-ticket service contract templates.',
    inviteUrl: TELEGRAM_CONFIG.freelancingInvite,
    accessTier: 'single'
  };

  // Master Bundle: Student unlocks ALL 4 track vaults
  if (
    normalized.includes('bundle') ||
    normalized.includes('cohort-1-master') ||
    normalized === 'course-cohort-1-master-bundle'
  ) {
    return [track1, track2, track3, track4];
  }

  // Track 1
  if (
    normalized.includes('content') ||
    normalized.includes('image') ||
    normalized.includes('video') ||
    normalized === 'course-ai-image-short-videos-creation' ||
    normalized === 'ai-image-short-videos-creation'
  ) {
    return [track1];
  }

  // Track 2
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

  // Track 3
  if (
    normalized.includes('vibe') ||
    normalized.includes('web-dev') ||
    normalized.includes('fullstack') ||
    normalized === 'course-fullstack-vibe-coding' ||
    normalized === 'fullstack-vibe-coding'
  ) {
    return [track3];
  }

  // Track 4
  if (
    normalized.includes('client') ||
    normalized.includes('acquisition') ||
    normalized.includes('freelanc') ||
    normalized === 'course-client-acquisition-freelancing' ||
    normalized === 'client-acquisition-freelancing'
  ) {
    return [track4];
  }

  // General fallback: return master bundle invite
  return [
    {
      trackId: 'track-general',
      trackSlug: normalized,
      courseId: normalized,
      title: 'Vixora Academy Cohort 1.0 Learning Space',
      description: 'Official student group with HD video replays, lesson PDFs, and instructor Q&A.',
      inviteUrl: TELEGRAM_CONFIG.masterBundleInvite,
      accessTier: 'single'
    }
  ];
}
