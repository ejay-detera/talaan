"use client";

import { useState, useCallback } from "react";
import type { ReviewEntry } from "@/types/ledger";

const DRAFT_VERSION = "v1";

interface ReviewDraft {
  version: string;
  entries: ReviewEntry[];
  writtenTotal: number | null;
  updatedAt: number;
}

export function useReviewDraft(
  pageId: string,
  initialEntries: ReviewEntry[],
  initialWrittenTotal: number | null
) {
  const storageKey = `talaan_draft_${pageId}`;

  // Lazy initialize state from sessionStorage to avoid cascading renders (rerender-lazy-state-init)
  const [entries, setEntries] = useState<ReviewEntry[]>(() => {
    if (typeof window === "undefined") return initialEntries;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed: ReviewDraft = JSON.parse(raw);
        if (parsed.version === DRAFT_VERSION && Array.isArray(parsed.entries)) {
          return parsed.entries;
        }
      }
    } catch {
      // Ignore sessionStorage read errors
    }
    return initialEntries;
  });

  const [writtenTotal, setWrittenTotal] = useState<number | null>(() => {
    if (typeof window === "undefined") return initialWrittenTotal;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const parsed: ReviewDraft = JSON.parse(raw);
        if (parsed.version === DRAFT_VERSION && typeof parsed.writtenTotal !== "undefined") {
          return parsed.writtenTotal;
        }
      }
    } catch {
      // Ignore sessionStorage read errors
    }
    return initialWrittenTotal;
  });

  // Persist edits to sessionStorage whenever entries or writtenTotal changes
  const persistDraft = useCallback(
    (newEntries: ReviewEntry[], newWrittenTotal: number | null) => {
      try {
        const draft: ReviewDraft = {
          version: DRAFT_VERSION,
          entries: newEntries,
          writtenTotal: newWrittenTotal,
          updatedAt: Date.now(),
        };
        sessionStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        // Storage quota exceeded or disabled
      }
    },
    [storageKey]
  );

  const updateEntries = useCallback(
    (updater: (prev: ReviewEntry[]) => ReviewEntry[]) => {
      setEntries((prev) => {
        const next = updater(prev);
        persistDraft(next, writtenTotal);
        return next;
      });
    },
    [persistDraft, writtenTotal]
  );

  const updateWrittenTotal = useCallback(
    (total: number | null) => {
      setWrittenTotal(total);
      persistDraft(entries, total);
    },
    [entries, persistDraft]
  );

  const clearDraft = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  }, [storageKey]);

  return {
    entries,
    writtenTotal,
    updateEntries,
    updateWrittenTotal,
    clearDraft,
  };
}
