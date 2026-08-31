import React from "react";
import { Building2, Video, Laptop, MapPin, Clock, Calendar, CheckCircle2, MessageSquare } from "lucide-react";

const MODALITIES = [
  {
    icon: Building2,
    badge: "Sede Barranquilla",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    title: "Presencial",
    location: "Calle 45 #22-18, Barranquilla",
    summary: "Clases interactivas cara a cara con docentes y compañeros en instalaciones climatizadas.",
    prompt: "¿Cuáles son los horarios de clases presenciales en la sede de Barranquilla?",
    features: [
      "Franjas en la mañana, noche y sábados intensivos",
      "Ciclos de 8 semanas (3 días por semana)",
      "Atención personalizada en recepción",
      "Material digital y opción de libros físicos",
    ],
  },
  {
    icon: Video,
    badge: "En Vivo vía Zoom",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    title: "Live Online",
    location: "Conexión remota con docente en vivo",
    summary: "Sesiones grupales sincronizadas en tiempo real con retroalimentación inmediata y grabaciones.",
    prompt: "¿En qué horarios puedo tomar clases Live Online por Zoom?",
    features: [
      "Horarios matutinos, nocturnos y sábados",
      "Misma intensidad académica que presencial",
      "Acceso a grabaciones para repaso",
      "Estudia desde cualquier ciudad",
    ],
  },
  {
    icon: Laptop,
    badge: "Plataforma 24/7",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    title: "Self-Paced Online",
    location: "Campus Virtual Riwi Lingua",
    summary: "Avanza a tu propio ritmo con módulos interactivos y club de conversación semanal.",
    prompt: "¿Cómo funciona la modalidad Self-Paced y cuándo es el club de conversación?",
    features: [
      "Acceso ilimitado 24 horas al día, 7 días a la semana",
      "Hasta 12 semanas de plazo por nivel",
      "Clubes de conversación con tutores",
      "Sin interrupciones por días festivos",
    ],
  },
];

export function ModalitiesSection({ onAskQuestion }) {
  return (
    <section id="modalidades" className="py-16 sm:py-24 border-b border-slate-800/60 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Flexibilidad y Modalidades
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Elige Cómo y Dónde Estudiar
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Contamos con opciones presenciales en Barranquilla y formatos 100% remotos. Consulta con <strong>Lingua</strong> para conocer los cupos y horarios exactos de tu interés.
          </p>
        </div>

        {/* Modalities Grid */}
        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {MODALITIES.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <div
                key={index}
                className="rounded-3xl p-6 sm:p-8 bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-inner">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${mod.badgeColor}`}>
                      {mod.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{mod.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      {mod.location}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {mod.summary}
                  </p>

                  <ul className="space-y-2 text-xs text-slate-300 pt-2">
                    {mod.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => onAskQuestion(mod.prompt)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-cyan-300 border border-slate-800 hover:border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Consultar Horarios de {mod.title}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
