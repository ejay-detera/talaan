"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  Send,
  Loader2,
  HelpCircle,
  ShieldAlert,
  Bot,
  User,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AskCards } from "./AskCards";
import type { AskResultCards } from "@/lib/ask/schemas";
import type { AskStreamEvent } from "@/lib/ask/agent";

const STARTER_PROMPTS = [
  "Sino ang dapat singilin ngayon?",
  "May mali ba sa pahina ko?",
  "Magkano utang ni Nanay Cora?",
  "Kumusta benta at utang?",
];

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text?: string;
  cards?: AskResultCards;
  fallback?: boolean;
  guard_passed?: boolean;
  error?: string;
}

export function AskDrawer() {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const fabPositionClass = isDashboard
    ? "bottom-[84px] sm:bottom-[92px] right-4 sm:right-6"
    : "bottom-5 sm:bottom-6 right-4 sm:right-6";

  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [toolTrace, setToolTrace] = useState<string | null>(null);
  const [streamingCards, setStreamingCards] = useState<AskResultCards | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load chat messages from sessionStorage on mount (persists across navigation)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("talaan_ask_messages");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch {
      // Ignore sessionStorage quota/incognito errors
    }
  }, []);

  // Save chat messages to sessionStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        sessionStorage.setItem("talaan_ask_messages", JSON.stringify(messages));
      } catch {
        // Ignore
      }
    }
  }, [messages]);

  function handleResetChat() {
    setMessages([]);
    try {
      sessionStorage.removeItem("talaan_ask_messages");
    } catch {
      // Ignore
    }
  }

  // Auto-scroll to bottom of chat when new content arrives
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto-focus input when opened
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStatus, streamingCards, scrollToBottom]);

  // Handle escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          setIsOpen(false);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isFullScreen]);

  function handleCloseAll() {
    setIsOpen(false);
    setIsFullScreen(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }

  function handleSidePanelClose() {
    setIsOpen(false);
    setIsFullScreen(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }

  async function handleSend(textToSend: string) {
    const q = textToSend.trim();
    if (!q || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `asst-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: q },
    ]);

    setQuestion("");
    setIsLoading(true);
    setCurrentStatus("Sinusuri ang tanong sa talaan...");
    setToolTrace(null);
    setStreamingCards(null);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error?.message || `Error status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body received from server.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      let receivedCards: AskResultCards | null = null;
      let finalAnswerText = "";
      let isFallback = false;
      let isGuardPassed = false;
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;

          const jsonStr = trimmed.slice(6);
          try {
            const event = JSON.parse(jsonStr) as AskStreamEvent;

            switch (event.type) {
              case "status":
                setCurrentStatus(event.message);
                break;
              case "tool":
                setToolTrace(event.tool);
                break;
              case "cards":
                receivedCards = event.cards;
                setStreamingCards(event.cards);
                break;
              case "answer":
                finalAnswerText = event.text;
                isFallback = !!event.fallback;
                isGuardPassed = !!event.guard_passed;
                break;
              case "error":
                streamError = event.error;
                break;
              case "done":
                setCurrentStatus(null);
                break;
            }
          } catch {
            // Ignore parse errors on partial stream chunks
          }
        }
      }

      // Append assistant message once stream finishes
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: "assistant",
          text: finalAnswerText || (streamError ? undefined : "Walang tugon na natanggap."),
          cards: receivedCards || undefined,
          fallback: isFallback,
          guard_passed: isGuardPassed,
          error: streamError || undefined,
        },
      ]);
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: "assistant",
            error: (err as Error)?.message || "Nagkaroon ng aberya sa pagsagot.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
      setCurrentStatus(null);
      setToolTrace(null);
      setStreamingCards(null);
    }
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleSend(question);
  }

  return (
    <>
      {/* Floating Action Button (FAB) Anchored at bottom-right */}
      <div className={`fixed ${fabPositionClass} z-30 transition-all duration-200`}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-[50px] px-5 rounded-full bg-[#FFFEF8] hover:bg-white text-pencil border border-[#D5DEC6] hover:border-ink shadow-paper-lg hover:shadow-paper-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer select-none active:scale-[0.98] paper-press"
          aria-label="Tanungin si Talaan (Ask ledger)"
        >
          <Sparkles className="w-4.5 h-4.5 text-ink shrink-0" />
          <span className="text-sm font-bold font-sans tracking-tight">
            Tanungin si Talaan
          </span>
        </button>
      </div>

      {/* Side Panel / Full-Screen Drawer Overlay & Container */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop (Active in normal side panel mode) */}
            {!isFullScreen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleSidePanelClose}
                className="fixed inset-0 bg-pencil/40 backdrop-blur-[2px] z-40"
                aria-hidden="true"
              />
            )}

            {/* Panel Container (Responsive Side Panel or Full Screen) */}
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Tanungin si Talaan Assistant"
              initial={
                isFullScreen
                  ? { opacity: 0, scale: 0.98 }
                  : { x: "100%", opacity: 0.6 }
              }
              animate={
                isFullScreen
                  ? { opacity: 1, scale: 1, x: 0 }
                  : { x: 0, opacity: 1 }
              }
              exit={
                isFullScreen
                  ? { opacity: 0, scale: 0.98 }
                  : { x: "100%", opacity: 0 }
              }
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              className={
                isFullScreen
                  ? "fixed inset-0 w-full h-full z-50 bg-[#F2F5EC] flex flex-col overflow-hidden text-pencil font-sans"
                  : "fixed top-0 right-0 h-full w-full sm:w-[500px] lg:w-[540px] max-w-full z-50 bg-[#F2F5EC] border-l border-[#D5DEC6] shadow-2xl flex flex-col overflow-hidden text-pencil font-sans"
              }
            >
              {/* Header Bar */}
              <div className="bg-[#FFFEF8] border-b border-[#D5DEC6] px-4 sm:px-6 py-3.5 flex items-center justify-between shrink-0 select-none shadow-[0_1px_2px_rgba(35,38,43,0.04)]">
                {/* Title and Model Badge */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-sm bg-[#EEF2E6] border border-[#D5DEC6] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-ink" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-base sm:text-lg text-pencil tracking-tight">
                      Tanungin si Talaan
                    </h2>
                    <p className="text-[11px] text-muted font-sans hidden sm:block">
                      Itanong ang tungkol sa mga suki, pautang, o discrepancy
                    </p>
                  </div>
                </div>

                {/* Header Action Controls */}
                <div className="flex items-center gap-1.5">
                  {/* Reset/Clear Chat Button */}
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleResetChat}
                      className="h-9 px-2.5 rounded-sm border border-[#D5DEC6] hover:border-pencil/50 bg-white text-muted hover:text-pencil text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      aria-label="Bagong Tanong (Clear chat)"
                      title="Mag-umpisa ng bagong pagtatanong"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Bagong Tanong</span>
                    </button>
                  )}

                  {/* Full Screen Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsFullScreen((prev) => !prev)}
                    className="h-9 px-2.5 sm:px-3 rounded-sm border border-[#D5DEC6] hover:border-pencil/50 bg-white text-muted hover:text-pencil text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    aria-label={isFullScreen ? "Exit Fullscreen" : "Full Screen"}
                    title={isFullScreen ? "Ibalik sa side panel" : "Palakihin (Full Screen)"}
                  >
                    {isFullScreen ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Side Panel</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Full Screen</span>
                      </>
                    )}
                  </button>

                  {/* Separate Close Button for Full-Screen Mode or Side Panel */}
                  {isFullScreen ? (
                    <button
                      type="button"
                      onClick={handleCloseAll}
                      className="h-9 px-3 rounded-sm bg-red-margin/10 hover:bg-red-margin/20 text-red-margin border border-red-margin/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      aria-label="Isara ang buong chat"
                      title="Isara ang buong chat"
                    >
                      <X className="w-4 h-4" />
                      <span>Isara</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSidePanelClose}
                      className="w-9 h-9 rounded-sm border border-[#D5DEC6] hover:border-pencil/50 bg-white text-muted hover:text-pencil flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Isara ang side panel"
                      title="Isara"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Scroll Area */}
              <div
                className={
                  isFullScreen
                    ? "flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 sm:px-8 py-5 space-y-4"
                    : "flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4"
                }
              >
                {/* Empty State Welcome Card */}
                {messages.length === 0 && (
                  <div className="relative rounded-row border border-[#D5DEC6] bg-[#FFFEF8] p-5 shadow-paper space-y-3.5 select-none my-2">
                    {/* Paper Tape */}
                    <div
                      className="absolute -top-2 left-6 w-20 h-3.5 bg-[#EAE3CE]/80 border border-[#DDD3BC]/70 rounded-[2px] -rotate-1 pointer-events-none"
                      aria-hidden="true"
                    />

                    <div>
                      <h3 className="font-display font-bold text-base text-pencil tracking-tight">
                        Ano ang nais mong malaman sa ledger?
                      </h3>
                      <p className="text-xs text-muted font-sans mt-1 leading-relaxed">
                        Maaari mong itanong ang tungkol sa mga suki na dapat singilin, balanse sa utang,
                        o mga discrepancy sa talaan.
                      </p>
                    </div>

                    {/* Starter Prompts */}
                    <div>
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Pumili ng tanong:
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {STARTER_PROMPTS.map((prompt) => (
                          <button
                            key={prompt}
                            type="button"
                            disabled={isLoading}
                            onClick={() => handleSend(prompt)}
                            className="text-xs px-3 py-2 bg-white border border-[#D5DEC6] hover:border-pencil text-pencil font-sans font-medium rounded-sm transition-colors text-left flex items-center justify-between cursor-pointer active:scale-[0.99] disabled:opacity-50"
                          >
                            <span>&ldquo;{prompt}&rdquo;</span>
                            <span className="text-ink font-bold text-sm">→</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Conversation History */}
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    {/* User Question Bubble */}
                    {msg.role === "user" && (
                      <div className="flex justify-end">
                        <div className="max-w-[85%] sm:max-w-[75%] bg-[#FFFDF5] border border-[#DDD3BC] p-3 sm:p-3.5 rounded-sm shadow-sm space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted uppercase tracking-wider">
                            <User className="w-3 h-3 text-pencil" />
                            <span>Tindera</span>
                          </div>
                          <p className="text-sm font-sans text-pencil leading-relaxed">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Assistant Response Card */}
                    {msg.role === "assistant" && (
                      <div className="flex justify-start">
                        <div className="w-full bg-white border border-[#D5DEC6] p-4 sm:p-4.5 rounded-sm shadow-paper space-y-3">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-pencil uppercase tracking-wider border-b border-[#F0F2EB] pb-2">
                            <Bot className="w-3.5 h-3.5 text-ink" />
                            <span>Talaan</span>
                          </div>

                          {/* Render Result Cards If Present */}
                          {msg.cards && <AskCards cards={msg.cards} />}

                          {/* Render Answer Prose */}
                          {msg.text && (
                            <p className="text-sm text-pencil font-sans leading-relaxed whitespace-pre-line pt-1">
                              {msg.text}
                            </p>
                          )}

                          {/* Render Error */}
                          {msg.error && (
                            <div className="bg-[#FFF5F5] border border-red-margin/40 p-3 rounded-sm text-xs text-red-margin font-sans flex items-center gap-2">
                              <ShieldAlert className="w-4 h-4 shrink-0" />
                              <span>{msg.error}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* In-Flight Streaming State */}
                {isLoading && (
                  <div className="space-y-3">
                    {/* Live Cards Received Early */}
                    {streamingCards && (
                      <div className="bg-white border border-[#D5DEC6] p-4 rounded-sm shadow-paper space-y-2">
                        <span className="text-xs font-bold text-pencil uppercase tracking-wider block border-b border-[#F0F2EB] pb-2">
                          Resulta Mula sa Talaan
                        </span>
                        <AskCards cards={streamingCards} />
                      </div>
                    )}

                    {/* Live Status & Tool Trace */}
                    <div className="bg-[#F8FAEF] border border-[#E6EAD8] p-3.5 rounded-sm text-xs font-sans text-pencil space-y-1.5 animate-pulse">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-ink" />
                        <span className="font-semibold">
                          {currentStatus || "Nagsusuri sa talaan..."}
                        </span>
                      </div>
                      {toolTrace && (
                        <p className="text-[11px] text-muted pl-5 font-mono">
                          &bull; Tool: {toolTrace}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Bottom Sticky Input Bar */}
              <div className="bg-[#FFFEF8] border-t border-[#D5DEC6] p-3 sm:p-4 shrink-0 select-none shadow-[0_-1px_3px_rgba(35,38,43,0.03)]">
                <div
                  className={
                    isFullScreen ? "max-w-4xl mx-auto w-full" : "w-full"
                  }
                >
                  <form onSubmit={handleFormSubmit} className="flex gap-2 items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Halimbawa: Sino ang may overdue na utang?"
                      disabled={isLoading}
                      maxLength={300}
                      className="flex-1 min-h-[48px] px-3.5 py-2.5 text-sm bg-white border border-[#D5DEC6] rounded-sm text-pencil placeholder:text-muted/60 focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-all font-sans"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !question.trim()}
                      className="min-h-[48px] px-4 sm:px-5 bg-ink text-white font-sans font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-ink/90 active:scale-[0.98] transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">Tanungin</span>
                    </button>
                  </form>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

