"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, AlertCircle } from "lucide-react";
import { downscaleImage } from "@/lib/image-client";

interface ScanButtonProps {
  className?: string;
}

export function ScanButton({ className = "" }: ScanButtonProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setUploading(true);

    try {
      // 1. Client downscale to protect Vercel serverless body limits
      const processedFile = await downscaleImage(file);

      // 2. Upload to extract endpoint
      const formData = new FormData();
      formData.append("file", processedFile);

      const res = await fetch("/api/pages/extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error?.message || "Hindi ma-extract ang kuwaderno. Pakisubukang muli.");
        return;
      }

      if (data.status === "retake_requested") {
        setErrorMessage(
          `Malabo ang litrato: ${data.reason}. Paki-ulit ang pagkuha nang mas maliwanag.`
        );
        return;
      }

      if (data.page_id) {
        router.push(`/pages/${data.page_id}/review`);
      } else {
        setErrorMessage("Walang nabuong review page. Pakisubukang muli.");
      }
    } catch {
      setErrorMessage("Network error habang ina-upload ang litrato. Pakisubukang muli.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
        aria-label="Kumuha o mag-upload ng litrato ng kuwaderno"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full h-[56px] rounded-full bg-ink hover:bg-ink/90 active:scale-[0.99] disabled:bg-rule disabled:text-muted disabled:cursor-not-allowed text-sheet text-base font-bold shadow-paper transition-all flex items-center justify-center gap-2.5 cursor-pointer select-none px-7"
      >
        {uploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Binabasa ng Muse Glimmer AI...</span>
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            <span>Kunan ang Kuwaderno (Scan Page)</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div
          role="alert"
          className="p-3 rounded-row bg-[#FDF2F2] border border-margin text-margin text-xs font-semibold flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
