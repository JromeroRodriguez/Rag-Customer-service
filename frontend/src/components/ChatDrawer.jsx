import React, { useRef, useEffect } from "react";
import { X, Sparkles, Trash2, Headphones, ArrowLeft, Bot } from "lucide-react";
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
  isLiveAdvisorActive = false,
  onEndLiveAdvisor,
  pendingEscalation,
  onRequestAdvisor,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  if (!isOpen) return null;

  const inputPlaceholder = isLiveAdvisorActive
    ? "Escribe tu mensaje para el asesor humano..."
    : pendingEscalation?.step === "name"
    ? "Escribe tu nombre y apellido (ej. Carlos Pérez)..."
    : pendingEscalation?.step === "phone"
    ? "Escribe tu WhatsApp de 10 dígitos (ej. 300 123 4567)..."
    : "Escribe tu pregunta sobre programas, precios o matrícula...";


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy/60 backdrop-blur-xs transition-opacity">
      {/* Centered Modal Card */}
      <div className="w-full max-w-3xl h-[92vh] sm:h-[85vh] bg-background rounded-2xl border border-border shadow-2xl flex flex-col justify-between overflow-hidden animate-in zoom-in-95 fade-in duration-200">
        {/* Modal Header */}
        <header className="p-4 sm:p-5 border-b border-border bg-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isLiveAdvisorActive
                  ? "bg-emerald-600 text-white"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {isLiveAdvisorActive ? (
                <Headphones className="h-5 w-5" />
              ) : (
                <Bot className="h-5 w-5" />
              )}
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-foreground leading-tight">
                {isLiveAdvisorActive
                  ? "Atención con Asesor Humano"
                  : "Lingua — Asistente Virtual"}
              </h2>
              <p className="text-[12px] text-muted-foreground">
                {isLiveAdvisorActive
                  ? "Conectado en tiempo real vía Telegram"
                  : "Respuestas oficiales basadas en la academia"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isLiveAdvisorActive && !pendingEscalation && onRequestAdvisor && (
              <button
                onClick={onRequestAdvisor}
                title="Hablar con un asesor humano en vivo"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 border border-emerald-500/20 text-xs font-semibold transition-all duration-150 cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Hablar con Asesor</span>
                <span className="sm:hidden">Asesor</span>
              </button>
            )}
            {messages.length > 1 && (
              <button
                onClick={onReset}
                title="Limpiar conversación"
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              title="Cerrar ventana"
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Live Advisor Active Banner */}
        {isLiveAdvisorActive && (
          <div className="px-4 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold">Atención en vivo con asesor humano</span>
            </div>
            {onEndLiveAdvisor && (
              <button
                onClick={onEndLiveAdvisor}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors text-[11px] cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Volver al Asistente Virtual</span>
              </button>
            )}
          </div>
        )}

        {/* Escalation Lead Capture Step Banner */}
        {pendingEscalation && !isLiveAdvisorActive && (
          <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500"></span>
              <span className="font-semibold">
                {pendingEscalation.step === "name"
                  ? "Paso 1 de 2: Escribe tu Nombre y Apellido completo"
                  : "Paso 2 de 2: Escribe tu número de WhatsApp (10 dígitos)"}

              </span>
            </div>
            <button
              onClick={() => onSendMessage("cancelar")}
              className="text-[11px] text-amber-800 hover:text-amber-950 underline cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && !isLiveAdvisorActive && !messages.some((m) => m.isStreaming) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 animate-spin text-primary" />
              Lingua está consultando la base de conocimiento...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Area: Suggestions + Input */}
        <div className="p-3 sm:p-5 border-t border-border bg-card space-y-3">
          {!isLiveAdvisorActive && !pendingEscalation && (
            <SuggestedPrompts onSelect={onSendMessage} disabled={isLoading} />
          )}

          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading && !isLiveAdvisorActive}
            placeholder={inputPlaceholder}
          />
        </div>
      </div>
    </div>
  );
}
