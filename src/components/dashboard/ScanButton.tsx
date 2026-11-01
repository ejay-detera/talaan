"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, AlertCircle, X, CheckCircle2 } from "lucide-react";
import { downscaleImage } from "@/lib/image-client";
import { saveOfflineScan } from "@/lib/offline-db";

interface ScanButtonProps {
  className?: string;
}

/**
 * ScanButton
 *
 * Implements the Floating Action Button (FAB) pattern per user directive.
 * Anchors in the bottom-right thumb zone, keeping the counter workspace
 * uncluttered while maintaining one-tap access to camera capture.
 * Supports store-and-forward offline queueing when connection is lost.
 */
export function ScanButton({ className = "" }: ScanButtonProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setNoticeMessage(null);
    setUploading(true);

    try {
      // 1. Client downscale to protect Vercel serverless body limits
      const processedFile = await downscaleImage(file);

      // 2. Check offline status first
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await saveOfflineScan(processedFile, file.name);
        setNoticeMessage("Saved to offline queue. Will auto-upload when you reconnect.");
        return;
      }

      // 3. Upload to extract endpoint
      const formData = new FormData();
      formData.append("file", processedFile);

      try {
        const res = await fetch("/api/pages/extract", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data.error?.message || "Could not read notebook page. Please try again.");
          return;
        }

        if (data.status === "retake_requested") {
          setErrorMessage(
            `Photo is blurry: ${data.reason}. Please retake in brighter lighting.`
          );
          return;
        }

        if (data.page_id) {
          router.push(`/pages/${data.page_id}/review`);
        } else {
          setErrorMessage("Could not generate review page. Please try again.");
        }
      } catch {
        // Network dropped mid-upload -> save to offline queue
        await saveOfflineScan(processedFile, file.name);
        setNoticeMessage("Connection interrupted. Page saved to offline queue.");
      }
    } catch {
      setErrorMessage("Could not process photo. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
        aria-label="Capture or upload photo of notebook page"
      />

      {/* Floating Error Toast */}
      {errorMessage && (
        <div
          role="alert"
          className="fixed bottom-24 right-4 sm:right-6 max-w-sm p-3.5 rounded-row bg-[#FDF2F2] border border-margin text-margin text-xs font-semibold shadow-paper-lg flex items-start gap-2.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="flex-1 leading-relaxed">{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-margin hover:opacity-75 p-0.5 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Notice Toast */}
      {noticeMessage && (
        <div
          role="status"
          className="fixed bottom-24 right-4 sm:right-6 max-w-sm p-3.5 rounded-row bg-[#F2F7EE] border border-paid/40 text-paid text-xs font-semibold shadow-paper-lg flex items-start gap-2.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-paid" />
          <span className="flex-1 leading-relaxed">{noticeMessage}</span>
          <button
            type="button"
            onClick={() => setNoticeMessage(null)}
            className="text-paid hover:opacity-75 p-0.5 cursor-pointer"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className={`fixed bottom-5 sm:bottom-6 right-4 sm:right-6 z-30 ${className}`}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-[56px] px-6 rounded-full bg-ink hover:bg-ink/90 active:scale-[0.98] disabled:bg-rule disabled:text-muted disabled:cursor-not-allowed text-sheet text-base font-bold shadow-paper-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer select-none border border-sheet/25 paper-press"
          aria-label="Scan notebook page"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Reading notebook...</span>
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              <span>Scan Page</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
