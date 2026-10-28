export const DEMO_TTL_DAYS = 7;
export const MAX_PER_RUN = 50;

export interface CleanupUserCandidate {
  id: string;
  is_anonymous?: boolean;
  created_at?: string;
  email?: string;
}

/**
 * Pure filter function to select expired anonymous users.
 * Safeguard: NEVER selects non-anonymous (email/phone) accounts under any circumstance.
 */
export function selectExpiredAnonymousUsers(
  users: CleanupUserCandidate[],
  now = new Date(),
  ttlDays = DEMO_TTL_DAYS,
  maxLimit = MAX_PER_RUN
): CleanupUserCandidate[] {
  const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
  const nowMs = now.getTime();

  const expired: CleanupUserCandidate[] = [];

  for (const user of users) {
    if (expired.length >= maxLimit) {
      break;
    }

    // Strict guard: MUST be explicitly marked anonymous
    if (user.is_anonymous !== true) {
      continue;
    }

    if (!user.created_at) {
      continue;
    }

    const createdTime = new Date(user.created_at).getTime();
    if (isNaN(createdTime)) {
      continue;
    }

    if (nowMs - createdTime >= ttlMs) {
      expired.push(user);
    }
  }

  return expired;
}
