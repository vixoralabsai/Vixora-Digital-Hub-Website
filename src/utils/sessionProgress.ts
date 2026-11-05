/**
 * Vixora Academy — Student Session Learning Progress Utility
 * Manages localStorage state for marking track sessions as complete.
 */

const STORAGE_KEY = 'vixora_completed_sessions_v1';

/**
 * Retrieves the set of completed session keys from localStorage safely.
 */
export function getCompletedSessionKeys(): Set<string> {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((item): item is string => typeof item === 'string'));
    }
  } catch (err) {
    console.error('Failed to parse completed sessions from localStorage', err);
  }
  return new Set();
}

/**
 * Saves the set of completed session keys to localStorage.
 */
export function saveCompletedSessionKeys(keys: Set<string>): void {
  if (typeof window === 'undefined' && typeof localStorage === 'undefined') return;
  try {
    const arrayData = Array.from(keys);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arrayData));
  } catch (err) {
    console.error('Failed to save completed sessions to localStorage', err);
  }
}

/**
 * Generates a unique key for a session under a specific track.
 */
export function makeSessionKey(trackSlug: string, sessionNumber: string): string {
  return `${trackSlug}::${sessionNumber}`;
}

/**
 * Checks if a session key is marked as completed.
 */
export function isSessionCompleted(completedKeys: Set<string>, trackSlug: string, sessionNumber: string): boolean {
  return completedKeys.has(makeSessionKey(trackSlug, sessionNumber));
}

/**
 * Toggles the completion status of a session, returning a new updated Set.
 */
export function toggleSessionCompletion(completedKeys: Set<string>, trackSlug: string, sessionNumber: string): Set<string> {
  const next = new Set(completedKeys);
  const key = makeSessionKey(trackSlug, sessionNumber);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  saveCompletedSessionKeys(next);
  return next;
}

/**
 * Clears all completed sessions for a specific track, returning a new updated Set.
 */
export function clearTrackSessionProgress(completedKeys: Set<string>, trackSlug: string): Set<string> {
  const next = new Set(completedKeys);
  const prefix = `${trackSlug}::`;
  for (const key of Array.from(next)) {
    if (key.startsWith(prefix)) {
      next.delete(key);
    }
  }
  saveCompletedSessionKeys(next);
  return next;
}

/**
 * Calculates progress statistics for a set of sessions.
 */
export function calculateTrackProgress(
  completedKeys: Set<string>,
  trackSlug: string,
  sessions: { sessionNumber: string }[]
): { completedCount: number; totalCount: number; percentage: number; isFullyCompleted: boolean } {
  const totalCount = sessions.length;
  if (totalCount === 0) {
    return { completedCount: 0, totalCount: 0, percentage: 0, isFullyCompleted: false };
  }

  let completedCount = 0;
  for (const s of sessions) {
    if (isSessionCompleted(completedKeys, trackSlug, s.sessionNumber)) {
      completedCount++;
    }
  }

  const percentage = Math.round((completedCount / totalCount) * 100);
  const isFullyCompleted = completedCount === totalCount && totalCount > 0;

  return { completedCount, totalCount, percentage, isFullyCompleted };
}
