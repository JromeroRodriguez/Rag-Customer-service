import React from "react";
import { MessageSquare, ArrowRight, ShieldCheck, CheckCircle2, BookOpen, Globe2, MapPin, Zap } from "lucide-react";

export function HeroSection({ onAskQuestion, onOpenChat }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Column: Headline & Value Prop */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="section-eyebrow">
              <span className="flex h-2 w-2 rounded-full bg-success"></span>
              Academia de idiomas • Barranquilla
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-[3.3rem] font-extrabold tracking-tight text-navy leading-[1.12] font-display">
              Domina <span className="text-primary">Inglés, Francés y Portugués</span> con RIWI.
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Aprende con estándares del marco europeo <strong className="text-foreground">CEFR (A1 a C2)</strong> en nuestra sede de <strong className="text-foreground">Barranquilla</strong> o en modalidad <strong className="text-foreground">100% virtual</strong>. Resuelve tus dudas al instante con <strong className="text-foreground">Lingua</strong>, nuestra asistente virtual 24/7.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onOpenChat}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground font-bold text-sm sm:text-base shadow-sm transition-colors cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Consultar con Lingua</span>
              </button>

              <a
                href="#precios"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-card hover:bg-muted border border-border text-foreground font-semibold text-sm sm:text-base transition-colors"
              >
                <span>Ver Precios & Modalidades</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>

            {/* Quick question chips to funnel directly into RAG */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-semibold text-muted-foreground flex items-center justify-center lg:justify-start gap-1.5">
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
                    className="text-xs px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground hover:text-primary border border-border transition-colors cursor-pointer text-left shadow-xs"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Test de nivelación gratuito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Certificado digital verificable
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Cohortes el 1.ᵉʳ lunes de cada mes
              </span>
            </div>
          </div>


          {/* Right Column: Corporate Summary Card */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="rounded-2xl bg-card border border-border shadow-xl shadow-navy/5 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-primary font-bold font-display">
                    LB
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground font-display">RIWI LinguaBridge Academy</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-destructive" /> Calle 45 #22-18, Barranquilla
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-success/10 text-success border border-success/20">
                  Inscripciones Abiertas
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Globe2, label: "Idiomas", value: "Inglés, Francés, Portugués" },
                  { icon: BookOpen, label: "Niveles", value: "Marco CEFR (A1 a C2)" },
                  { icon: Zap, label: "Modalidades", value: "Presencial, Live & Self-Paced" },
                  { icon: ShieldCheck, label: "Descuentos", value: "Hasta 15% + Referidos" },
                ].map((item) => (
                  <div key={item.label} className="p-3.5 rounded-xl bg-muted border border-border">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1">
                      <item.icon className="w-3.5 h-3.5 text-primary" /> {item.label}
                    </div>
                    <div className="font-bold text-foreground text-sm">{item.value}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  onAskQuestion
                    ? onAskQuestion("¿Cuánto cuesta el nivel de inglés en modalidad Live Online?")
                    : onOpenChat()
                }
                className="w-full p-4 rounded-xl bg-accent border border-border hover:border-primary/40 transition-colors cursor-pointer group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shrink-0 group-hover:bg-primary-dark transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-primary">Prueba rápida con Lingua:</div>
                    <div className="text-xs text-muted-foreground truncate">"¿Cuánto cuesta el nivel de inglés online?"</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

