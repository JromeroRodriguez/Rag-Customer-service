import React, { useRef, useEffect } from "react";
import { X, Bot, Trash2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SuggestedPrompts } from "./SuggestedPrompts";

export function ChatDrawer({
  isOpen,
  onClose,
  messages,
  isLoading,
  onSendMessage,
  onReset,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md transition-opacity">
      {/* Centered Modal Card */}
      <div className="w-full max-w-3xl h-[92vh] sm:h-[85vh] bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl shadow-black/80 flex flex-col justify-between overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-violet-600 text-white uppercase">
                  RIWI
                </span>
                <h3 className="font-bold text-sm sm:text-base text-slate-100">Lingua Assistant</h3>
              </div>
              <p className="text-[11px] text-slate-400">Asistente Virtual • Atención en Tiempo Real</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 1 && (
              <button
                onClick={onReset}
                title="Limpiar conversación"
                className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              title="Cerrar ventana"
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 flex items-center justify-center text-blue-400">
                <Bot className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="flex-1 space-y-2 py-1">
                <span className="text-xs font-semibold text-slate-400">Consultando información oficial...</span>
                <div className="h-2 bg-slate-800 rounded-full w-3/4"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Area: Suggestions + Input */}
        <div className="p-3 sm:p-5 border-t border-slate-800 bg-slate-900/90 space-y-3">
          <SuggestedPrompts onSelect={onSendMessage} disabled={isLoading} />
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
