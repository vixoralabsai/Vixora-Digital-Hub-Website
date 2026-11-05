import assert from 'node:assert/strict';
import {
  getCompletedSessionKeys,
  saveCompletedSessionKeys,
  makeSessionKey,
  isSessionCompleted,
  toggleSessionCompletion,
  clearTrackSessionProgress,
  calculateTrackProgress
} from '../src/utils/sessionProgress.js';

// Polyfill localStorage in Node test environment if needed
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear()
  };
}

console.log('🧪 Starting Vixora Session Progress & Completion Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

async function runTest(name: string, fn: () => Promise<void> | void) {
  try {
    localStorage.clear();
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
  await runTest('makeSessionKey builds composite key format', () => {
    const key = makeSessionKey('ai-content-creation', 'Session 01');
    assert.strictEqual(key, 'ai-content-creation::Session 01');
  });

  await runTest('Toggling session completion adds and removes session key', () => {
    let keys = new Set<string>();
    const track = 'ai-automation';
    const sNum = 'Session 02';

    assert.strictEqual(isSessionCompleted(keys, track, sNum), false);

    keys = toggleSessionCompletion(keys, track, sNum);
    assert.strictEqual(isSessionCompleted(keys, track, sNum), true);

    keys = toggleSessionCompletion(keys, track, sNum);
    assert.strictEqual(isSessionCompleted(keys, track, sNum), false);
  });

  await runTest('Session progress persists to localStorage correctly', () => {
    let keys = new Set<string>();
    keys = toggleSessionCompletion(keys, 'vibe-coding', 'Session 01');
    keys = toggleSessionCompletion(keys, 'vibe-coding', 'Session 03');

    const loadedKeys = getCompletedSessionKeys();
    assert.strictEqual(loadedKeys.size, 2);
    assert.ok(loadedKeys.has('vibe-coding::Session 01'));
    assert.ok(loadedKeys.has('vibe-coding::Session 03'));
  });

  await runTest('calculateTrackProgress computes accurate percentage and completion status', () => {
    let keys = new Set<string>();
    const track = 'client-acquisition';
    const mockSessions = [
      { sessionNumber: 'Session 01' },
      { sessionNumber: 'Session 02' },
      { sessionNumber: 'Session 03' },
      { sessionNumber: 'Session 04' }
    ];

    let calc = calculateTrackProgress(keys, track, mockSessions);
    assert.strictEqual(calc.completedCount, 0);
    assert.strictEqual(calc.percentage, 0);
    assert.strictEqual(calc.isFullyCompleted, false);

    keys = toggleSessionCompletion(keys, track, 'Session 01');
    keys = toggleSessionCompletion(keys, track, 'Session 03');
    calc = calculateTrackProgress(keys, track, mockSessions);

    assert.strictEqual(calc.completedCount, 2);
    assert.strictEqual(calc.percentage, 50);
    assert.strictEqual(calc.isFullyCompleted, false);

    keys = toggleSessionCompletion(keys, track, 'Session 02');
    keys = toggleSessionCompletion(keys, track, 'Session 04');
    calc = calculateTrackProgress(keys, track, mockSessions);

    assert.strictEqual(calc.completedCount, 4);
    assert.strictEqual(calc.percentage, 100);
    assert.strictEqual(calc.isFullyCompleted, true);
  });

  await runTest('clearTrackSessionProgress clears only specified track session progress', () => {
    let keys = new Set<string>();
    keys = toggleSessionCompletion(keys, 'track-a', 'Session 01');
    keys = toggleSessionCompletion(keys, 'track-b', 'Session 01');

    assert.strictEqual(keys.size, 2);

    keys = clearTrackSessionProgress(keys, 'track-a');
    assert.strictEqual(keys.size, 1);
    assert.ok(!keys.has('track-a::Session 01'));
    assert.ok(keys.has('track-b::Session 01'));
  });

  console.log('\n========================================');
  console.log(`📊 Session Progress Tests: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log('========================================\n');

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
