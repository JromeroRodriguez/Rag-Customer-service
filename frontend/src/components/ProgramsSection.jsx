import React from "react";
import { BookOpen, Check, Globe, Languages, Compass, MessageSquare, Sparkles } from "lucide-react";

const PROGRAMS = [
  {
    id: "ingles",
    name: "Inglés Profesional & Conversacional",
    code: "EN",
    icon: Globe,
    description:
      "Desarrolla fluidez para el mercado laboral global, entornos tech y certificación internacional.",
    levels: "Marco CEFR (A1 a C2)",
    popular: true,
    features: [
      "Clubes de conversación semanales incluidos",
      "Prueba de nivelación diagnóstica",
      "Materiales digitales interactivos",
      "Certificado digital verificable",
    ],
    prompt: "¿Cuánto cuesta el programa de inglés, qué horarios tienen y qué modalidades ofrecen?",
  },
  {
    id: "frances",
    name: "Francés Dinámico",
    code: "FR",
    icon: Languages,
    description:
      "Aprende el idioma de la diplomacia, cultura y procesos migratorios como Express Entry Quebec.",
    levels: "Marco CEFR (A1 a C2)",
    popular: false,
    features: [
      "Enfoque en fonética y pronunciación",
      "Docentes expertos y bilingües",
      "Grupos reducidos por sesión",
      "Preparación base para pruebas oficiales",
    ],
    prompt: "¿Cuáles son los precios, modalidades y fechas de inicio para el curso de francés?",
  },
  {
    id: "portugues",
    name: "Portugués de Negocios",
    code: "PT",
    icon: Compass,
    description:
      "Conecta con el mercado de Brasil y América Latina con un aprendizaje ágil y práctico.",
    levels: "Marco CEFR (A1 a C2)",
    popular: false,
    features: [
      "Inmersión comunicativa acelerada",
      "Prácticas aplicadas a negocios",
      "Horarios flexibles en franjas mañana y noche",
      "Plataforma virtual 24/7",
    ],
    prompt: "¿Qué costos, horarios y modalidades manejan para portugués?",
  },
];

export function ProgramsSection({ onAskQuestion }) {
  return (
    <section id="programas" className="py-16 sm:py-24 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="section-eyebrow">
            <BookOpen className="w-3.5 h-3.5" />
            Oferta Académica Oficial
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
            Programas de Idiomas bajo el Marco CEFR
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Aprende con estándares internacionales. Cada nivel se adapta a tus metas y disponibilidad. Consulta con <strong className="text-foreground">Lingua</strong> para recibir una cotización oficial y plan personalizado.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {PROGRAMS.map((prog) => {
            const Icon = prog.icon;
            return (
              <div
                key={prog.id}
                className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between border bg-card transition-shadow duration-200 ${
                  prog.popular
                    ? "border-primary shadow-lg shadow-primary/10"
                    : "border-border hover:shadow-md"
                }`}
              >
                {prog.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider">
                    Más Solicitado
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-primary">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-navy text-navy-foreground tracking-wider font-display">
                        {prog.code}
                      </span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">
                      6 Niveles CEFR
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground font-display">{prog.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{prog.description}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-muted border border-border">
                    <div className="text-[11px] text-muted-foreground font-medium">Niveles disponibles:</div>
                    <div className="font-bold text-foreground text-xs mt-0.5">{prog.levels}</div>
                  </div>

                  <ul className="space-y-2 text-xs text-foreground/80 pt-1">
                    {prog.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-success shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onAskQuestion(prog.prompt)}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-xs font-bold transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Cotizar {prog.name.split(" ")[0]} con Lingua</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-6 rounded-2xl bg-accent border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-foreground text-base font-display">¿No conoces tu nivel de idioma?</h4>
            <p className="text-xs text-muted-foreground">
              Descubre tu nivel actual con nuestra <strong className="text-foreground">prueba de clasificación diagnóstica gratuita</strong>. Pregúntale a Lingua cómo presentarla y los requisitos.
            </p>
          </div>
          <button
            onClick={() => onAskQuestion("¿Cómo funciona la prueba de clasificación gratuita de 20 minutos y cómo puedo presentarla?")}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-xs font-bold whitespace-nowrap cursor-pointer transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consultar Test con Lingua</span>
          </button>
        </div>
      </div>
    </section>
  );
}


