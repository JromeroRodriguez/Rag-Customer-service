import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";

export function ChatInput({ onSendMessage, isLoading, placeholder }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 p-2.5 sm:p-3 rounded-2xl bg-slate-900/95 border border-slate-800 focus-within:border-blue-500/80 shadow-xl shadow-slate-950/80 transition-all duration-150"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || "Pregunta sobre cursos, precios, horarios, certificaciones..."}
        disabled={isLoading}
        className="w-full resize-none bg-transparent px-2 sm:px-3 py-1.5 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none max-h-32 disabled:opacity-50"
      />

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-blue-500/25 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </form>
  );
}
