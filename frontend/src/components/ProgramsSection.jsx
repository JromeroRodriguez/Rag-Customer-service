import React from "react";
import { BookOpen, Check, Award, Sparkles, Languages, Globe, Compass, MessageSquare, ArrowRight } from "lucide-react";

const PROGRAMS = [
  {
    id: "ingles",
    name: "Inglés Profesional & Tech",
    code: "EN",
    codeColor: "from-blue-600 to-cyan-500",
    icon: Globe,
    headline: "Fluidez para el mercado global, entrevistas tech y certificaciones.",
    levels: "A1 (Principiante) a C2 (Maestría)",
    prompt: "¿Cuánto cuesta el programa de inglés y qué modalidades tienen?",
    highlights: [
      "Marco CEFR (A1 a C2) por ciclos de 8 semanas",
      "Clubes de conversación semanales incluidos",
      "Material digital y certificado digital verificable",
    ],
  },
  {
    id: "frances",
    name: "Francés Dinámico",
    code: "FR",
    codeColor: "from-indigo-600 to-violet-500",
    icon: Languages,
    headline: "Enfoque comunicativo, fonética y preparación para procesos migratorios.",
    levels: "A1 a C2 • Preparación DELF",
    prompt: "¿Cuáles son los precios y horarios del programa de francés?",
    highlights: [
      "Grupos reducidos con docentes expertos",
      "Énfasis en pronunciación y fluidez real",
      "Modalidades en vivo, presencial y autoestudio",
    ],
  },
  {
    id: "portugues",
    name: "Portugués de Negocios",
    code: "PT",
    codeColor: "from-emerald-600 to-teal-500",
    icon: Compass,
    headline: "Aprende el idioma de las oportunidades comerciales en América Latina.",
    levels: "A1 a C2 • Enfoque empresarial",
    prompt: "¿Qué costos y fechas de inicio manejan para portugués?",
    highlights: [
      "Inmersión comunicativa acelerada",
      "Horarios flexibles en franjas mañana y noche",
      "Acceso 24/7 a plataforma de contenidos",
    ],
  },
];

export function ProgramsSection({ onAskQuestion }) {
  return (
    <section id="programas" className="py-16 sm:py-24 border-b border-slate-800/60 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            Nuestra Oferta Académica
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Programas Oficiales en 3 Idiomas
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Aprende con estándares internacionales. Cada nivel se adapta a tus metas y disponibilidad. Pregunta a <strong>Lingua</strong> para recibir una cotización y plan personalizado.
          </p>
        </div>

        {/* Programs Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {PROGRAMS.map((prog) => (
            <div
              key={prog.id}
              className="rounded-3xl p-6 sm:p-8 bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-6 shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                      {React.createElement(prog.icon, { className: "w-5 h-5" })}
                    </div>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-md bg-gradient-to-r ${prog.codeColor} text-white tracking-wider`}>
                      {prog.code}
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300">
                    CEFR A1-C2
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-slate-100">{prog.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{prog.headline}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
                  <div className="text-[11px] text-slate-400 font-semibold mb-1">Niveles disponibles:</div>
                  <div className="font-bold text-slate-100">{prog.levels}</div>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  {prog.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button that opens Chat */}
              <button
                onClick={() => onAskQuestion(prog.prompt)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-blue-500/20 transition-all cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Cotizar {prog.name.split(" ")[0]} con Lingua</span>
              </button>
            </div>
          ))}
        </div>

        {/* Free Placement Test Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/25 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="font-bold text-slate-100 text-base sm:text-lg">¿No sabes en qué nivel iniciar?</h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Descubre tu nivel actual con nuestra prueba de nivelación gratuita de 20 minutos. Pregúntale a Lingua los requisitos y cómo presentarla hoy mismo.
            </p>
          </div>
          <button
            onClick={() => onAskQuestion("¿Cómo presento la prueba de clasificación gratuita de 20 minutos?")}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 whitespace-nowrap cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consultar Test con Lingua</span>
          </button>
        </div>
      </div>
    </section>
  );
}
