"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";

interface NotebookStripProps {
  imageUrl?: string | null;
  className?: string;
}

/**
 * Collapsible notebook image viewer per decision D3.
 * shortcut: full-page display instead of per-row crops because extraction does not return bounding boxes.
 */
export function NotebookStrip({ imageUrl, className = "" }: NotebookStripProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!imageUrl) {
    return null;
  }

  return (
    <div className={`rounded-sheet border border-rule bg-sheet overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-xs font-bold text-pencil hover:bg-paper/50 transition-colors cursor-pointer select-none"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-ink" />
          <span>Orihinal na Litrato ng Kuwaderno</span>
        </span>
        <span className="flex items-center gap-1 text-muted text-sm">
          <span>{isOpen ? "Itago" : "Ipakita"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {isOpen && (
        <div className="p-3 border-t border-rule bg-[#1A1D20]/5 flex justify-center">
          <div className="relative max-h-[460px] w-full overflow-auto rounded-row flex justify-center bg-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Handwritten notebook page strip"
              className="max-h-[460px] w-auto object-contain rounded-row shadow-sm"
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
}
