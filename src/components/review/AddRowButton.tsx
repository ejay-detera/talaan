import React from "react";
import { Plus } from "lucide-react";

interface AddRowButtonProps {
  onAdd: () => void;
  className?: string;
}

export function AddRowButton({ onAdd, className = "" }: AddRowButtonProps) {
  return (
    <button
      type="button"
      onClick={onAdd}
      className={`inline-flex items-center justify-center gap-2 w-full h-[48px] rounded-row border border-dashed border-rule bg-sheet/60 hover:bg-sheet text-pencil font-semibold text-sm transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${className}`}
    >
      <Plus className="w-4 h-4 text-ink" />
      <span>Magdagdag ng Linya (Add Row)</span>
    </button>
  );
}
