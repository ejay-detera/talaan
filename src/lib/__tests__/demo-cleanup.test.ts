import { describe, it, expect } from "vitest";
import { selectExpiredAnonymousUsers, DEMO_TTL_DAYS, type CleanupUserCandidate } from "../demo-cleanup";

describe("selectExpiredAnonymousUsers", () => {
  const now = new Date("2026-10-28T12:00:00Z");

  it("selects only anonymous users older than TTL", () => {
    const eightDaysAgo = new Date("2026-10-20T11:59:00Z").toISOString();
    const sixDaysAgo = new Date("2026-10-22T12:01:00Z").toISOString();

    const users: CleanupUserCandidate[] = [
      { id: "anon-old", is_anonymous: true, created_at: eightDaysAgo },
      { id: "anon-young", is_anonymous: true, created_at: sixDaysAgo },
      { id: "email-old", is_anonymous: false, created_at: eightDaysAgo, email: "demo@talaan.ph" },
      { id: "email-standard", is_anonymous: undefined, created_at: eightDaysAgo, email: "nena@store.ph" },
    ];

    const result = selectExpiredAnonymousUsers(users, now);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("anon-old");
  });

  it("never deletes non-anonymous users even if years old", () => {
    const twoYearsAgo = new Date("2024-01-01T00:00:00Z").toISOString();
    const users: CleanupUserCandidate[] = [
      { id: "admin-user", is_anonymous: false, created_at: twoYearsAgo, email: "owner@talaan.ph" },
      { id: "demo-user", is_anonymous: false, created_at: twoYearsAgo, email: "demo@talaan.ph" },
    ];

    const result = selectExpiredAnonymousUsers(users, now);
    expect(result).toEqual([]);
  });

  it("skips users with missing or invalid created_at", () => {
    const users: CleanupUserCandidate[] = [
      { id: "anon-invalid", is_anonymous: true, created_at: "" },
      { id: "anon-missing", is_anonymous: true },
    ];

    const result = selectExpiredAnonymousUsers(users, now);
    expect(result).toEqual([]);
  });

  it("honors maxLimit cap", () => {
    const tenDaysAgo = new Date("2026-10-18T00:00:00Z").toISOString();
    const users: CleanupUserCandidate[] = Array.from({ length: 60 }).map((_, i) => ({
      id: `anon-${i}`,
      is_anonymous: true,
      created_at: tenDaysAgo,
    }));

    const result = selectExpiredAnonymousUsers(users, now, DEMO_TTL_DAYS, 25);
    expect(result).toHaveLength(25);
  });
});
