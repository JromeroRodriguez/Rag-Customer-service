import React, { useState } from "react";
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck, CheckCircle2, Bot, Send, Zap, HelpCircle } from "lucide-react";

export function HeroSection({ onAskQuestion, onOpenChat }) {
  const [quickInput, setQuickInput] = useState("");

  const handleQuickSubmit = (e) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onAskQuestion(quickInput.trim());
    setQuickInput("");
  };

  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-16 sm:pb-20 border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-[650px] h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* Left Column: Headline & Value Prop */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-semibold text-slate-300 shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-slate-400">Atención Inmediata 24/7 •</span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent font-bold">
                Asistente Virtual Oficial
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Tu camino hacia la fluidez en <span className="text-blue-400">Inglés</span>,{" "}
              <span className="text-indigo-400">Francés</span> y{" "}
              <span className="text-cyan-400">Portugués</span>.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Bienvenido a <strong>Riwi Lingua</strong> en Barranquilla. Diseñamos planes de estudio personalizados bajo el marco <strong>CEFR</strong> (A1 a C2). Consulta horarios, precios, becas y matrículas en tiempo real con <strong>Lingua</strong>.
            </p>

            {/* Quick action chips */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-slate-400 flex items-center justify-center lg:justify-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                <span>¿Qué deseas consultar hoy? Haz clic para preguntar a Lingua:</span>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                {[
                  "¿Cuánto cuesta el curso de inglés virtual?",
                  "¿Qué horarios hay en la sede de Barranquilla?",
                  "¿Cómo funciona el test gratis de nivelación?",
                  "¿Qué descuentos tienen por pronto pago?",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onAskQuestion(prompt)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left shadow-sm"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* Bullet Highlights */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Respuesta en segundos
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Datos 100% oficiales
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Escalación directa a asesor humano
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Chat Launcher Box */}
          <div className="flex-1 w-full max-w-lg">
            <div className="rounded-3xl p-1 bg-gradient-to-tr from-slate-800 via-indigo-900/40 to-cyan-900/30 shadow-2xl">
              <div className="bg-slate-950/95 rounded-[22px] p-6 sm:p-7 space-y-5 border border-slate-800/80">
                {/* Header info */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white p-0.5 shadow-md">
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                        <Bot className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-violet-600 text-white uppercase">
                          RIWI
                        </span>
                        <h3 className="font-bold text-sm text-slate-100">Lingua Assistant</h3>
                      </div>
                      <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        En línea
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Oficial RIWI
                  </span>
                </div>

                {/* Assistant greeting bubble */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed space-y-2">
                  <p>
                    ¡Hola! Soy <strong>Lingua</strong>. Estoy entrenada con todos los documentos oficiales de <strong>Riwi Lingua</strong>.
                  </p>
                  <p className="text-slate-400">
                    Escribe tu pregunta sobre horarios, precios de cursos, descuentos, certificaciones o matrículas y te responderé al instante.
                  </p>
                </div>

                {/* Direct input form */}
                <form onSubmit={handleQuickSubmit} className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    placeholder="Escribe tu consulta aquí..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none shadow-inner"
                  />
                  <button
                    type="submit"
                    disabled={!quickInput.trim()}
                    className="shrink-0 p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md disabled:opacity-40 cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Open chat CTA */}
                <button
                  onClick={onOpenChat}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Abrir Asistente Virtual</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
