import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

export function ChatInput({ onSendMessage, isLoading, placeholder }) {
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder || "Escribe tu pregunta sobre programas, precios o matrícula..."}
        disabled={isLoading}
        className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary-dark disabled:opacity-40"
        aria-label="Enviar pregunta"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </button>
    </form>
  );
}

