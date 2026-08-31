import React from "react";
import { Bot, User, CheckCircle2, AlertCircle, FileText, Headphones, Sparkles } from "lucide-react";

/**
 * Format markdown text into React elements (Mejora 5)
 */
function renderFormattedMarkdown(text) {
  if (!text) return null;

  // Split into paragraphs by double newlines
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, pIdx) => {
    const lines = para.split("\n");

    // Check if paragraph is a bullet list
    const isList = lines.every((l) => /^\s*[-*•]\s+/.test(l.trim()));

    if (isList) {
      return (
        <ul key={pIdx} className="space-y-1.5 my-2 pl-2">
          {lines.map((line, lIdx) => {
            const cleanLine = line.replace(/^\s*[-*•]\s+/, "");
            return (
              <li key={lIdx} className="flex items-start gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
                <span>{renderInlineStyles(cleanLine)}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <p key={pIdx} className="mb-2 last:mb-0">
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {renderInlineStyles(line)}
            {lIdx < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

/**
 * Parses bold, backticks, and links
 */
function renderInlineStyles(text) {
  if (!text) return null;

  // Split by inline code, bold, or links
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-xs border border-slate-700/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline font-medium break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

export function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const isAdvisor = message.role === "human_advisor" || message.isHumanAdvisor;

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all ${
        isUser
          ? "bg-slate-900/60 border border-slate-800/60 ml-auto max-w-2xl"
          : isAdvisor
          ? "bg-emerald-950/25 border border-emerald-500/40 shadow-lg shadow-emerald-500/10 max-w-3xl"
          : message.escalated
          ? "bg-amber-950/20 border border-amber-500/30 max-w-3xl"
          : "bg-slate-900/80 border border-slate-800 max-w-3xl"
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <User className="w-4 h-4" />
          </div>
        ) : isAdvisor ? (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
            <Headphones className="w-4 h-4" />
          </div>
        ) : (
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-md ${
              message.escalated
                ? "bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-amber-500/20"
                : "bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-cyan-500/20"
            }`}
          >
            <Bot className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {/* Header line for Assistant or Advisor */}
        {!isUser && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-200">
                {isAdvisor ? (
                  <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    Asesor Humano <span className="text-xs font-normal text-slate-400">• Riwi Lingua</span>
                  </span>
                ) : (
                  <>
                    Lingua <span className="text-xs font-normal text-indigo-400">• Riwi Assistant</span>
                  </>
                )}
              </span>
              <span className="text-[11px] text-slate-500">
                {message.timestamp || "Ahora"}
              </span>
            </div>

            {/* Badges */}
            {isAdvisor ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Atención Humana en Vivo</span>
              </div>
            ) : message.escalated ? (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Escalado a asesor humano</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Respuesta automática</span>
              </div>
            )}
          </div>
        )}

        {/* Message Text with Markdown Rendering (Mejora 5) */}
        <div className="text-sm sm:text-base leading-relaxed text-slate-200">
          {renderFormattedMarkdown(message.content)}
        </div>

        {/* Metadata Footer */}
        {!isUser && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            {isAdvisor ? (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <Sparkles className="w-3 h-3" />
                <span>Respuesta oficial de asesor vía Telegram</span>
              </div>
            ) : message.sources && message.sources.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Fuentes:
                </span>
                {Array.from(new Set(message.sources)).map((src, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700/60"
                  >
                    {src}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Información Oficial Verificada</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
