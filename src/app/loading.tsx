import Image from "next/image";

export default function Loading() {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-paper/85 text-pencil font-sans selection:bg-marker backdrop-blur-[2px]"
      aria-hidden="true"
    >
      {/* Pinned Sticky Notepad Loader */}
      <div className="relative w-full max-w-[340px] bg-[#FFF9D2] border border-[#EADB85] rounded-row p-5 sm:p-6 shadow-sticky select-none animate-in fade-in zoom-in-95 duration-200 transform -rotate-1">
        {/* Physical Pushpin Graphic */}
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center pointer-events-none"
          aria-hidden="true"
        >
          <span className="w-4 h-4 rounded-full bg-margin border border-[#9A1F1E] shadow-sm block relative">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 absolute top-0.5 left-0.5" />
          </span>
        </div>

        {/* Notepad Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#EADB85]/70">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/talaan-icon.png"
              alt="Talaan logo"
              width={26}
              height={26}
              className="flex-shrink-0 object-contain"
            />
            <span className="font-display font-black text-sm text-[#383318] tracking-tight">
              Talaan
            </span>
          </div>
          <span className="text-[11px] font-sans font-semibold text-[#6E5D1E] uppercase tracking-wider">
            Counter Memo
          </span>
        </div>

        {/* Handwritten Memo Body */}
        <div className="py-3">
          <p className="font-hand text-xl text-[#383318] leading-tight">
            &ldquo;Sulat pa rin sa papel &bull; Talaan ang bahala sa kuwenta.&rdquo;
          </p>
        </div>

        {/* Loading Bar Below */}
        <div className="pt-2 border-t border-[#EADB85]/70 space-y-2">
          <div className="h-1.5 w-full bg-[#EADB85] rounded-xs overflow-hidden relative">
            <div className="h-full w-2/5 bg-ink rounded-xs animate-shimmer-slide" />
          </div>

          <div className="flex items-center justify-between text-xs font-sans text-[#6E5D1E]">
            <span className="font-medium truncate pr-2">
              Opening counter listahan...
            </span>
            <span className="tabular-nums font-bold text-ink shrink-0">
              Deterministic
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
