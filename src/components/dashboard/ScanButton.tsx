"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, Loader2, AlertCircle, X, CheckCircle2 } from "lucide-react";
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
 * uncluttered while providing instant one-tap camera capture or gallery upload.
 * Supports store-and-forward offline queueing when connection is lost.
 */
export function ScanButton({ className = "" }: ScanButtonProps) {
  const router = useRouter();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Click-outside and Escape key listener to cleanly dismiss menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsMenuOpen(false);
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
      if (cameraInputRef.current) cameraInputRef.current.value = "";
      if (galleryInputRef.current) galleryInputRef.current.value = "";
    }
  };

  return (
    <>
      {/* Hidden Camera Input (launches device viewfinder immediately) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
        aria-label="Use camera to photograph notebook page"
      />

      {/* Hidden Gallery Input (opens photo library / files) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
        aria-label="Choose photo of notebook page from gallery"
      />

      {/* Floating Error Toast */}
      {errorMessage && (
        <div
          role="alert"
          className="fixed bottom-[164px] sm:bottom-[172px] right-4 sm:right-6 max-w-sm p-3.5 rounded-row bg-[#FDF2F2] border border-margin text-margin text-xs font-semibold shadow-paper-lg flex items-start gap-2.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200"
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
          className="fixed bottom-[164px] sm:bottom-[172px] right-4 sm:right-6 max-w-sm p-3.5 rounded-row bg-[#F2F7EE] border border-paid/40 text-paid text-xs font-semibold shadow-paper-lg flex items-start gap-2.5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200"
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

      {/* Floating Action Button (FAB) & Menu Anchor */}
      <div className={`fixed bottom-8 sm:bottom-8 right-4 sm:right-6 z-30 ${className}`}>
        {/* Paper Popover Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="Scan page options"
            className="absolute bottom-16 right-0 mb-2 w-60 p-1.5 rounded-row bg-sheet border border-rule shadow-paper-lg space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150 z-40 select-none"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                cameraInputRef.current?.click();
              }}
              className="w-full min-h-[48px] px-3 py-2 rounded-xs flex items-center gap-3 text-pencil hover:bg-paper/80 hover:text-ink transition-colors cursor-pointer text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-ink/10 text-ink flex items-center justify-center flex-shrink-0 group-hover:bg-ink group-hover:text-sheet transition-colors">
                <Camera className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold leading-tight">Use Camera</div>
                <div className="text-[11px] text-muted font-normal mt-0.5">Take photo of notebook</div>
              </div>
            </button>

            <div className="h-px bg-rule/60 my-0.5" />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false);
                galleryInputRef.current?.click();
              }}
              className="w-full min-h-[48px] px-3 py-2 rounded-xs flex items-center gap-3 text-pencil hover:bg-paper/80 hover:text-ink transition-colors cursor-pointer text-left group"
            >
              <div className="w-9 h-9 rounded-full bg-paper text-pencil flex items-center justify-center flex-shrink-0 border border-rule group-hover:border-ink group-hover:text-ink transition-colors">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold leading-tight">Photo Gallery</div>
                <div className="text-[11px] text-muted font-normal mt-0.5">Choose existing photo</div>
              </div>
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (uploading) return;
            setIsMenuOpen((prev) => !prev);
          }}
          disabled={uploading}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          className="h-[52px] w-[52px] sm:h-[56px] sm:w-auto px-0 sm:px-6 rounded-full bg-ink hover:bg-ink/90 active:scale-[0.98] disabled:bg-rule disabled:text-muted disabled:cursor-not-allowed text-sheet text-base font-bold shadow-paper-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer select-none border border-sheet/25 paper-press"
          aria-label="Scan notebook page options"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="hidden sm:inline">Reading notebook...</span>
            </>
          ) : (
            <>
              <Camera className="w-5 h-5" />
              <span className="hidden sm:inline">Scan Page</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}
