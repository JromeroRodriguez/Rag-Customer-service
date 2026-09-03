import React, { useState } from "react";
import { DollarSign, Tag, Percent, Users, GraduationCap, MessageSquare, CreditCard, Sparkles, ArrowRight } from "lucide-react";

const DISCOUNT_TOPICS = [
  {
    icon: Percent,
    title: "Descuento por Paquetes de Niveles",
    description: "Ahorra pagando 3 niveles o el ciclo completo de 6 niveles por adelantado.",
    prompt: "¿Cuánto ahorro si pago 3 o 6 niveles por adelantado en LinguaBridge?",
  },
  {
    icon: Users,
    title: "Bono por Referidos",
    description: "Recibe un beneficio exclusivo para ti y tu referido en la matrícula del siguiente nivel.",
    prompt: "¿Cómo aplico el descuento de referidos y de cuánto es?",
  },
  {
    icon: GraduationCap,
    title: "Convenios Universitarios",
    description: "Tarifa preferencial para estudiantes activos con carné vigente de universidades aliadas.",
    prompt: "¿Qué universidades tienen convenio y qué descuento aplica?",
  },
  {
    icon: CreditCard,
    title: "Facilidades & Cuotas",
    description: "Planes de pago flexibles en cuotas mensuales para modalidades Presencial y Live Online.",
    prompt: "¿Puedo pagar mi curso a cuotas y qué medios de pago reciben?",
  },
];

export function PricingSection({ onAskQuestion }) {
  const [selectedLang, setSelectedLang] = useState("Inglés");
  const [selectedMod, setSelectedMod] = useState("Live Online");

  return (
    <section id="precios" className="py-16 sm:py-24 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="section-eyebrow">
            <DollarSign className="w-3.5 h-3.5" />
            Inversión y Beneficios
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
            Tarifas Oficiales y Beneficios de Descuento
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Ofrecemos planes accesibles con materiales digitales incluidos. Utiliza nuestra asistente virtual <strong className="text-foreground">Lingua</strong> para cotizar tu programa exacto y calcular tus descuentos en tiempo real.
          </p>
        </div>

        {/* Interactive Quote Builder (Direct Funnel to Lingua RAG) */}
        <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-lg shadow-navy/5 max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-foreground font-display">Simulador de Cotización Oficial</h3>
              <p className="text-xs text-muted-foreground">Selecciona tus preferencias para consultar el valor oficial con Lingua</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border self-start sm:self-center">
              Cotización Asistida por IA
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">1. Selecciona el Idioma:</label>
              <div className="grid grid-cols-3 gap-2">
                {["Inglés", "Francés", "Portugués"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedLang === lang
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">2. Selecciona la Modalidad:</label>
              <div className="grid grid-cols-3 gap-2">
                {["Live Online", "Presencial", "Self-Paced"].map((mod) => (
                  <button
                    key={mod}
                    onClick={() => setSelectedMod(mod)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedMod === mod
                        ? "bg-navy text-navy-foreground border-navy"
                        : "bg-card text-foreground border-border hover:bg-muted"
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-foreground text-center sm:text-left">
              Consulta: <strong>{selectedLang}</strong> en modalidad <strong>{selectedMod}</strong>
            </div>
            <button
              onClick={() =>
                onAskQuestion(
                  `¿Cuánto cuesta exactamente el nivel de ${selectedLang} en modalidad ${selectedMod}, qué incluye y qué descuentos aplican?`
                )
              }
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-xs font-bold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Preguntar Precio Exacto a Lingua</span>
            </button>
          </div>
        </div>

        {/* Discounts & Policies Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DISCOUNT_TOPICS.map((disc, idx) => {
            const Icon = disc.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-primary">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{disc.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{disc.description}</p>
                </div>

                <button
                  onClick={() => onAskQuestion(disc.prompt)}
                  className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer transition-colors pt-1"
                >
                  <span>Preguntar a Lingua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


