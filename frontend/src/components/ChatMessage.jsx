import React from "react";
import { Bot, User, CheckCircle2, AlertCircle, FileText, Zap } from "lucide-react";

export function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl transition-all ${
        isUser
          ? "bg-slate-900/60 border border-slate-800/60 ml-auto max-w-2xl"
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
        {/* Header line for Assistant */}
        {!isUser && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-200">
                Lingua <span className="text-xs font-normal text-indigo-400">• RIWI Assistant</span>
              </span>
              <span className="text-[11px] text-slate-500">
                {message.timestamp || "Ahora"}
              </span>
            </div>

            {/* Escalation or Success Badge */}
            {message.escalated ? (
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

        {/* Message Text */}
        <div className="text-sm sm:text-base leading-relaxed text-slate-200 whitespace-pre-wrap">
          {message.content}
        </div>

        {/* Metadata Footer: Sources and Token Usage */}
        {!isUser && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            {/* Sources list */}
            {message.sources && message.sources.length > 0 && (
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
            )}

            {/* Official verification trust indicator */}
            <div className="ml-auto flex items-center gap-1 text-[11px] text-slate-500">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Información Oficial Verificada</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
