"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getOfflineScans,
  deleteOfflineScan,
  saveOfflineScan,
  isIndexedDBSupported,
  type OfflineScan,
} from "@/lib/offline-db";

export function useOfflineScanQueue() {
  const [scans, setScans] = useState<OfflineScan[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(
    () => (typeof navigator !== "undefined" ? navigator.onLine : true)
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedPageId, setLastSyncedPageId] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(
    null
  );

  const syncingRef = useRef(false);

  // 1. Initial state setup & IndexedDB loading
  const refreshQueue = useCallback(async () => {
    if (!isIndexedDBSupported()) return;
    try {
      const items = await getOfflineScans();
      setScans(items);
    } catch {
      // Quiet fail if DB not accessible
    }
  }, []);

  // 2. Track online/offline status and load initial queue
  useEffect(() => {
    let mounted = true;

    if (isIndexedDBSupported()) {
      void getOfflineScans()
        .then((items) => {
          if (mounted) {
            setScans(items);
          }
        })
        .catch(() => {
          // Quiet fail if DB not accessible
        });
    }

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      mounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 3. Sequential Queue Sync Implementation
  const syncQueue = useCallback(async (): Promise<{
    successCount: number;
    lastPageId: string | null;
  }> => {
    if (syncingRef.current || !navigator.onLine || !isIndexedDBSupported()) {
      return { successCount: 0, lastPageId: null };
    }

    syncingRef.current = true;
    setIsSyncing(true);
    setSyncError(null);

    let successCount = 0;
    let newestPageId: string | null = null;

    try {
      const pendingScans = await getOfflineScans();
      if (pendingScans.length === 0) {
        setIsSyncing(false);
        syncingRef.current = false;
        return { successCount: 0, lastPageId: null };
      }

      setSyncProgress({ current: 0, total: pendingScans.length });

      for (let i = 0; i < pendingScans.length; i++) {
        const item = pendingScans[i];
        setSyncProgress({ current: i + 1, total: pendingScans.length });

        const formData = new FormData();
        const fileObj = new File([item.blob], item.fileName, {
          type: item.mimeType || "image/jpeg",
        });
        formData.append("file", fileObj);

        const res = await fetch("/api/pages/extract", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(
            errData.error?.message || `Sync failed with HTTP ${res.status}`
          );
        }

        const data = await res.json();
        if (data.page_id) {
          newestPageId = data.page_id;
        }

        // Successfully extracted & stored in cloud -> remove from local IndexedDB
        await deleteOfflineScan(item.id);
        successCount++;
      }

      if (newestPageId) {
        setLastSyncedPageId(newestPageId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error during sync";
      setSyncError(msg);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
      setSyncProgress(null);
      await refreshQueue();
    }

    return { successCount, lastPageId: newestPageId };
  }, [refreshQueue]);

  // 4. Auto-sync trigger on network reconnection
  useEffect(() => {
    if (isOnline && scans.length > 0 && !isSyncing && !syncingRef.current) {
      syncQueue();
    }
  }, [isOnline, scans.length, isSyncing, syncQueue]);

  // 5. Enqueue scan helper
  const enqueueScan = useCallback(
    async (file: Blob | File, fileName?: string): Promise<OfflineScan> => {
      const scan = await saveOfflineScan(file, fileName);
      await refreshQueue();
      return scan;
    },
    [refreshQueue]
  );

  return {
    scans,
    queueCount: scans.length,
    isOnline,
    isSyncing,
    syncProgress,
    syncError,
    lastSyncedPageId,
    refreshQueue,
    syncQueue,
    enqueueScan,
  };
}
