import React, { useRef, useEffect } from "react";
import { Sparkles, Trash2, Headphones, ArrowLeft } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SuggestedPrompts } from "./SuggestedPrompts";

export function ChatPanel({
  messages,
  isLoading,
  onSendMessage,
  onReset,
  isLiveAdvisorActive = false,
  onEndLiveAdvisor,
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <section id="asistente" className="bg-secondary/40 py-10 sm:py-14 min-h-[calc(100vh-140px)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
          <header className="flex items-center justify-between border-b border-border bg-card px-5 py-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  isLiveAdvisorActive
                    ? "bg-emerald-600 text-white"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {isLiveAdvisorActive ? (
                  <Headphones className="w-5 h-5" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="font-display text-base font-bold tracking-tight text-foreground">
                  {isLiveAdvisorActive ? "Asesor Humano en Vivo" : "Lingua • Asistente Virtual"}
                </h2>
                <p className="text-[12px] text-muted-foreground">
                  {isLiveAdvisorActive
                    ? "Conectado en tiempo real vía Telegram"
                    : "Respuestas basadas en documentación oficial de la academia"}
                </p>
              </div>
            </div>

            {messages.length > 1 && (
              <button
                onClick={onReset}
                title="Limpiar conversación"
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
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

          <div className="max-h-[62vh] min-h-[420px] space-y-6 overflow-y-auto px-4 py-6 sm:px-6">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isLoading && !isLiveAdvisorActive && !messages.some((m) => m.isStreaming) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 animate-spin text-primary" />
                Lingua está consultando la base de conocimiento...
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-border bg-card px-4 py-4 sm:px-6 space-y-3">
            {!isLiveAdvisorActive && (
              <SuggestedPrompts onSelect={onSendMessage} disabled={isLoading} />
            )}
            <ChatInput
              onSendMessage={onSendMessage}
              isLoading={isLoading && !isLiveAdvisorActive}
              placeholder={
                isLiveAdvisorActive
                  ? "Escribe tu mensaje para el asesor humano..."
                  : "Escribe tu pregunta sobre programas, precios o matrícula..."
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
