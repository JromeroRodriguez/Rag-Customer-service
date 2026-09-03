import React from "react";
import { Building2, Video, Laptop, MapPin, Clock, Calendar, CheckCircle2, MessageSquare } from "lucide-react";

const MODALITIES = [
  {
    icon: Building2,
    badge: "Sede Barranquilla",
    title: "Presencial",
    location: "Calle 45 #22-18, Barranquilla",
    summary: "Clases interactivas cara a cara con docentes y compañeros en instalaciones climatizadas.",
    prompt: "¿Cuáles son los horarios de clases presenciales en la sede de Barranquilla?",
    features: [
      "Franjas en la mañana, noche y sábados intensivos",
      "Ciclos por niveles con docentes presenciales",
      "Atención personalizada en recepción física",
      "Material digital y opción de biblioteca",
    ],
  },
  {
    icon: Video,
    badge: "En Vivo vía Zoom",
    title: "Live Online",
    location: "Conexión remota con docente en vivo (GMT-5)",
    summary: "Sesiones grupales sincronizadas en tiempo real con retroalimentación inmediata y grabaciones.",
    prompt: "¿En qué horarios puedo tomar clases Live Online por Zoom?",
    features: [
      "Horarios matutinos, nocturnos y sábados",
      "Misma intensidad académica que presencial",
      "Acceso a grabaciones de clases para repaso",
      "Estudia desde cualquier lugar sin desplazarte",
    ],
  },
  {
    icon: Laptop,
    badge: "Plataforma 24/7",
    title: "Self-Paced Online",
    location: "Campus Virtual LinguaBridge",
    summary: "Avanza a tu propio ritmo con módulos interactivos y club de conversación semanal.",
    prompt: "¿Cómo funciona la modalidad Self-Paced y cuándo es el club de conversación?",
    features: [
      "Acceso ilimitado 24 horas al día, 7 días a la semana",
      "Flexibilidad total para compaginar con trabajo",
      "Clubes de conversación semanales con tutores",
      "Sin interrupciones por días festivos",
    ],
  },
];

export function ModalitiesSection({ onAskQuestion }) {
  return (
    <section id="modalidades" className="py-16 sm:py-24 border-b border-border bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="section-eyebrow">
            <Clock className="w-3.5 h-3.5" />
            Modalidades y Flexibilidad
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
            Elige la Modalidad que se Adapte a tu Rutina
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Contamos con opciones presenciales en Barranquilla y formatos 100% remotos. Consulta con <strong className="text-foreground">Lingua</strong> para conocer los cupos y horarios exactos disponibles.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {MODALITIES.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <div
                key={index}
                className="rounded-2xl p-6 sm:p-8 bg-card border border-border hover:shadow-md transition-shadow flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-accent border border-border flex items-center justify-center text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-accent text-accent-foreground border border-border">
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-foreground font-display">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-destructive shrink-0" />
                      {mod.location}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {mod.summary}
                  </p>

                  <ul className="space-y-2 text-xs text-foreground/80 pt-1">
                    {mod.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onAskQuestion(mod.prompt)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                  <span>Consultar Horarios de {mod.title} con Lingua</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


