import React from "react";
import { Bot, User, CheckCircle2, AlertTriangle, FileText, Headphones, Sparkles } from "lucide-react";
import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure marked for full GitHub Flavored Markdown (tables, breaks, lists, headers)
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Format markdown text into styled HTML elements safely with marked and DOMPurify
 */
function renderFormattedMarkdown(text, isUser = false) {
  if (!text) return null;
  const rawHtml = marked.parse(text);
  const cleanHtml = DOMPurify.sanitize(rawHtml);

  return (
    <div
      className={`markdown-content ${isUser ? "markdown-content-user" : ""}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}


export function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const isAdvisor = message.role === "human_advisor" || message.isHumanAdvisor;

  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
          isUser
            ? "bg-muted border-border text-foreground"
            : isAdvisor
            ? "bg-emerald-600 border-emerald-600 text-white"
            : message.escalated
            ? "bg-warning/20 border-warning text-foreground"
            : "bg-navy border-navy text-navy-foreground"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : isAdvisor ? (
          <Headphones className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>

      {/* Message Box */}
      <div className={`max-w-[85%] space-y-2 ${isUser ? "items-end text-right" : ""}`}>
        <div
          className={`rounded-xl border px-4 py-3 text-sm leading-relaxed text-left ${
            isUser
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : isAdvisor
              ? "bg-emerald-500/10 border-emerald-500/30 text-foreground"
              : "bg-card border-border text-foreground shadow-xs"
          }`}
        >
          {/* Header for human advisor */}
          {isAdvisor && (
            <div className="flex items-center gap-1.5 mb-2 font-bold text-xs text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Asesor Humano en Vivo (Telegram)</span>
            </div>
          )}

          {/* Message Text with Markdown Rendering */}
          <div className="leading-relaxed">
            {message.content ? (
              <>
                {renderFormattedMarkdown(message.content, isUser)}
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse rounded-xs align-middle" />
                )}
              </>
            ) : message.isStreaming ? (
              <div className="flex items-center gap-2 text-primary text-xs py-1 font-medium">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                </span>
                <span>Lingua está consultando la base de conocimiento...</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Escalation Tag */}
        {message.escalated && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-1.5 text-[11px] font-semibold text-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" />
            Caso escalado a un asesor humano
          </div>
        )}

        {/* Source Citations */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set(message.sources)).map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
              >
                <FileText className="h-3 w-3 text-primary" />
                {s}
              </span>
            ))}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">{message.timestamp || "Ahora"}</p>
      </div>
    </div>
  );
}


