import React, { useState } from "react";
import { DollarSign, Tag, Percent, Users, GraduationCap, Sparkles, MessageSquare, CreditCard, ArrowRight } from "lucide-react";

const DISCOUNT_TOPICS = [
  {
    icon: Percent,
    title: "Descuento por Paquetes de Niveles",
    description: "Ahorra 10% pagando 3 niveles o 15% pagando el ciclo completo de 6 niveles por adelantado.",
    prompt: "¿Cuánto ahorro si pago 3 o 6 niveles por adelantado?",
  },
  {
    icon: Users,
    title: "Bono por Referidos",
    description: "Recibe un descuento de COP 30,000 para ti y tu referido en la matrícula del siguiente nivel.",
    prompt: "¿Cómo aplico el descuento de COP 30,000 por referir a un amigo?",
  },
  {
    icon: GraduationCap,
    title: "Convenios Universitarios",
    description: "Tarifa preferencial con 12% de descuento para estudiantes activos con carné vigente.",
    prompt: "¿Qué universidades tienen convenio del 12% de descuento?",
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
    <section id="precios" className="py-16 sm:py-24 border-b border-slate-800/60 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <DollarSign className="w-3.5 h-3.5" />
            Inversión y Beneficios
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tarifas Accesibles y Descuentos Exclusivos
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Nuestros planes inician desde <strong>COP 280,000</strong> por nivel e incluyen todo el material digital. Utiliza nuestro asistente virtual para cotizar tu programa exacto y calcular tus descuentos.
          </p>
        </div>

        {/* Interactive Quote Builder (Direct Funnel to Lingua) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Simulador de Cotización Rápida</h3>
              <p className="text-xs text-slate-400">Selecciona tus preferencias y consulta el valor oficial con Lingua</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 self-start sm:self-center">
              Cotización en Tiempo Real
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">1. Selecciona el Idioma:</label>
              <div className="grid grid-cols-3 gap-2">
                {["Inglés", "Francés", "Portugués"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedLang === lang
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">2. Selecciona la Modalidad:</label>
              <div className="grid grid-cols-3 gap-2">
                {["Live Online", "Presencial", "Self-Paced"].map((mod) => (
                  <button
                    key={mod}
                    onClick={() => setSelectedMod(mod)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      selectedMod === mod
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 text-center sm:text-left">
              Consulta: <strong>{selectedLang}</strong> en modalidad <strong>{selectedMod}</strong>
            </div>
            <button
              onClick={() =>
                onAskQuestion(
                  `¿Cuánto cuesta exactamente el nivel de ${selectedLang} en modalidad ${selectedMod}, qué incluye y qué descuentos aplican?`
                )
              }
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Preguntar Precio Exacto a Lingua</span>
            </button>
          </div>
        </div>

        {/* Discounts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DISCOUNT_TOPICS.map((disc, idx) => {
            const Icon = disc.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-100">{disc.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{disc.description}</p>
                </div>

                <button
                  onClick={() => onAskQuestion(disc.prompt)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors pt-1"
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
