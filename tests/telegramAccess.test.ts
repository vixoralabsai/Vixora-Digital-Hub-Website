import assert from 'node:assert/strict';
import { getTelegramInvitesForCourse, TELEGRAM_CONFIG } from '../server/telegramConfig.js';

console.log('🧪 Starting Vixora Academy Telegram Access Gating & Multi-Track Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name: string, fn: () => Promise<void> | void) {
  try {
    await fn();
    console.log(`✅ [PASS] ${name}`);
    testsPassed++;
  } catch (err: any) {
    console.error(`❌ [FAIL] ${name}`);
    console.error(err);
    testsFailed++;
  }
}

async function runAllTests() {
  // Test 1: Master Bundle unlocks the Master Vault link (https://t.me/+SGIRa-T4lL1hZTk0)
  await runTest('Master Bundle returns official 5-course recordings vault (https://t.me/+SGIRa-T4lL1hZTk0)', () => {
    const invites = getTelegramInvitesForCourse('course-cohort-1-master-bundle');
    assert.ok(invites.length >= 1, 'Should return at least 1 invite for bundle');
    const master = invites.find(i => i.accessTier === 'bundle');
    assert.ok(master, 'Should include bundle-tier master invite');
    assert.strictEqual(master.inviteUrl, 'https://t.me/+SGIRa-T4lL1hZTk0');
    assert.strictEqual(master.inviteUrl, TELEGRAM_CONFIG.masterBundleInvite);
  });

  // Test 2: Master Bundle returns individual tracks in addition to the master vault
  await runTest('Master Bundle includes all 5 individual track spaces', () => {
    const invites = getTelegramInvitesForCourse('cohort-1-master-bundle');
    const urls = invites.map(i => i.inviteUrl);
    assert.ok(urls.includes('https://t.me/+SGIRa-T4lL1hZTk0'), 'Must contain master recordings vault');
    assert.ok(urls.includes('https://t.me/+wfBtF79zAWJhMTNk'), 'Must contain AI Content track');
    assert.ok(urls.includes('https://t.me/+g8Upx0T9tOcwOTg0'), 'Must contain AI Automation track');
    assert.ok(urls.includes('https://t.me/+CVf0IxhvRWFkYjZk'), 'Must contain Vibe Coding track');
    assert.ok(urls.includes('https://t.me/+kItRKPShz-Y2NjM8'), 'Must contain Client Acquisition track');
    assert.ok(urls.includes('https://t.me/+nsbDIiXSU7sxZmVk'), 'Must contain PDF Automation track');
  });

  // Test 3: AI Content Creation single track gating
  await runTest('AI Content Creation single track returns ONLY content vault and NEVER master recordings vault', () => {
    const invites = getTelegramInvitesForCourse('course-ai-image-short-videos-creation');
    assert.strictEqual(invites.length, 1);
    assert.strictEqual(invites[0].inviteUrl, 'https://t.me/+wfBtF79zAWJhMTNk');
    assert.notStrictEqual(invites[0].inviteUrl, 'https://t.me/+SGIRa-T4lL1hZTk0', 'Single track MUST NOT receive master vault');
  });

  // Test 4: AI Automation No Code single track gating
  await runTest('AI Automation single track returns ONLY automation vault and NEVER master recordings vault', () => {
    const invites = getTelegramInvitesForCourse('course-ai-automation-digital-business-systems');
    assert.strictEqual(invites.length, 1);
    assert.strictEqual(invites[0].inviteUrl, 'https://t.me/+g8Upx0T9tOcwOTg0');
    assert.notStrictEqual(invites[0].inviteUrl, 'https://t.me/+SGIRa-T4lL1hZTk0');
  });

  // Test 5: AI Web & App Dev (Vibe Coding) single track gating
  await runTest('AI Web Dev / Vibe Coding single track returns ONLY vibe coding vault and NEVER master recordings vault', () => {
    const invites = getTelegramInvitesForCourse('course-fullstack-vibe-coding');
    assert.strictEqual(invites.length, 1);
    assert.strictEqual(invites[0].inviteUrl, 'https://t.me/+CVf0IxhvRWFkYjZk');
    assert.notStrictEqual(invites[0].inviteUrl, 'https://t.me/+SGIRa-T4lL1hZTk0');
  });

  // Test 6: Client Acquisition single track gating
  await runTest('Client Acquisition single track returns ONLY freelancing vault and NEVER master recordings vault', () => {
    const invites = getTelegramInvitesForCourse('course-client-acquisition-freelancing');
    assert.strictEqual(invites.length, 1);
    assert.strictEqual(invites[0].inviteUrl, 'https://t.me/+kItRKPShz-Y2NjM8');
    assert.notStrictEqual(invites[0].inviteUrl, 'https://t.me/+SGIRa-T4lL1hZTk0');
  });

  // Test 7: PDF Automation specialized track gating
  await runTest('PDF Automation track returns ONLY pdf automation vault and NEVER master recordings vault', () => {
    const invites = getTelegramInvitesForCourse('pdf-automation');
    assert.strictEqual(invites.length, 1);
    assert.strictEqual(invites[0].inviteUrl, 'https://t.me/+nsbDIiXSU7sxZmVk');
    assert.notStrictEqual(invites[0].inviteUrl, 'https://t.me/+SGIRa-T4lL1hZTk0');
  });

  // Test 8: Unknown or general query returns public channel fallback and NEVER private recordings vault
  await runTest('Unknown query safely defaults to public community channel (@vixoraacademy)', () => {
    const invites = getTelegramInvitesForCourse('unregistered-test-course');
    assert.strictEqual(invites.length, 1);
    assert.strictEqual(invites[0].accessTier, 'public');
    assert.strictEqual(invites[0].inviteUrl, 'https://t.me/vixoraacademy');
    assert.notStrictEqual(invites[0].inviteUrl, 'https://t.me/+SGIRa-T4lL1hZTk0');
  });

  console.log('\n========================================');
  console.log(`📊 Telegram Access Tests: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('========================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
