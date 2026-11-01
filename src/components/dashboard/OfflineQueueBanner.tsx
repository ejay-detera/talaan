"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, CloudUpload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useOfflineScanQueue } from "@/hooks/useOfflineScanQueue";

interface OfflineQueueBannerProps {
  className?: string;
}

export function OfflineQueueBanner({ className = "" }: OfflineQueueBannerProps) {
  const {
    queueCount,
    isOnline,
    isSyncing,
    syncProgress,
    syncError,
    lastSyncedPageId,
    syncQueue,
  } = useOfflineScanQueue();

  // If online, no queued scans, and no errors or sync messages, hide banner
  if (isOnline && queueCount === 0 && !isSyncing && !syncError && !lastSyncedPageId) {
    return null;
  }

  return (
    <div
      className={`rounded-sheet border shadow-xs overflow-hidden transition-all duration-200 select-none ${
        !isOnline
          ? "bg-[#FFF9E6] border-[#FFE14D] text-[#7A5800]"
          : syncError
          ? "bg-[#FFF2F2] border-margin text-margin"
          : "bg-sheet border-rule text-pencil"
      } ${className}`}
      role="region"
      aria-label="Offline Scan Status"
    >
      <div className="px-4 py-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side: Status Icon & Informational Message */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {!isOnline ? (
              <WifiOff className="w-5 h-5 text-[#B45309]" />
            ) : isSyncing ? (
              <Loader2 className="w-5 h-5 text-ink animate-spin" />
            ) : syncError ? (
              <AlertCircle className="w-5 h-5 text-margin" />
            ) : lastSyncedPageId ? (
              <CheckCircle2 className="w-5 h-5 text-paid" />
            ) : (
              <CloudUpload className="w-5 h-5 text-ink" />
            )}
          </div>

          <div className="text-xs sm:text-sm">
            {!isOnline ? (
              <p className="font-semibold text-pencil">
                <span className="font-bold text-[#B45309]">Offline Mode:</span> Internet
                unavailable. Snapped pages will save locally and auto-upload when reconnected.
                {queueCount > 0 && (
                  <span className="ml-1 font-bold">
                    ({queueCount} scan{queueCount > 1 ? "s" : ""} pending)
                  </span>
                )}
              </p>
            ) : isSyncing ? (
              <p className="font-semibold text-pencil">
                <span className="font-bold text-ink">Syncing offline scans:</span>{" "}
                {syncProgress
                  ? `Uploading photo ${syncProgress.current} of ${syncProgress.total}...`
                  : "Uploading queued pages..."}
              </p>
            ) : syncError ? (
              <p className="font-semibold text-margin">
                <span className="font-bold">Sync Error:</span> {syncError}
              </p>
            ) : lastSyncedPageId ? (
              <p className="font-semibold text-paid">
                <span className="font-bold">Sync Complete:</span> Offline pages uploaded and
                extracted successfully.
              </p>
            ) : (
              <p className="font-semibold text-pencil">
                <span className="font-bold text-ink">{queueCount}</span> offline scan
                {queueCount > 1 ? "s" : ""} stored locally on this device.
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Action Trigger */}
        <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
          {lastSyncedPageId && (
            <Link
              href={`/pages/${lastSyncedPageId}/review`}
              className="min-h-[44px] px-3.5 py-2 rounded-pill bg-paid text-sheet text-xs font-bold inline-flex items-center gap-1.5 hover:bg-paid/90 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <span>View Extracted Page &rarr;</span>
            </Link>
          )}

          {isOnline && queueCount > 0 && !isSyncing && (
            <button
              type="button"
              onClick={() => syncQueue()}
              className="min-h-[44px] px-4 py-2 rounded-pill bg-ink text-sheet text-xs font-bold inline-flex items-center gap-1.5 hover:bg-ink/90 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <CloudUpload className="w-3.5 h-3.5" />
              <span>Upload Now ({queueCount})</span>
            </button>
          )}

          {isSyncing && (
            <div className="min-h-[44px] px-3 py-2 text-xs font-bold text-muted inline-flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

