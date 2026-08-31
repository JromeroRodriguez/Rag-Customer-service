import React from "react";
import { CheckCircle, Award, Calendar, AlertCircle, ArrowRight, Sparkles, MessageSquare } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Test de Clasificación",
    description: "Toma el test gratuito de 20 minutos (online o presencial). Principiantes absolutos inician directo.",
  },
  {
    step: "02",
    title: "Elige Modalidad & Horario",
    description: "Selecciona entre Presencial en Barranquilla, Live Online por Zoom o Self-Paced 24/7.",
  },
  {
    step: "03",
    title: "Registro de Admisión",
    description: "Completa el formulario en línea o en recepción en la Calle 45 #22-18.",
  },
  {
    step: "04",
    title: "Pago de Matrícula",
    description: "Asegura tu cupo antes del cierre de inscripciones por transferencia, tarjeta o efectivo.",
  },
  {
    step: "05",
    title: "Inicio de Cohorte",
    description: "Recibe accesos y bienvenida. ¡Iniciamos clases el primer lunes de cada mes!",
  },
];

export function EnrollmentSteps({ onAskQuestion }) {
  return (
    <section id="matricula" className="py-16 sm:py-24 border-b border-slate-800/60 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            Admisiones y Certificaciones
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Paso a Paso para Comenzar tus Clases
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Nuevas cohortes inician cada mes. Pregunta a <strong>Lingua</strong> sobre fechas de cierre, requisitos y certificado final.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STEPS.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3 relative flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  {s.step}
                </span>
                <h3 className="font-bold text-sm text-slate-100">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Query Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-100">Certificación Oficial</h4>
                  <p className="text-xs text-slate-400">Expedición digital con código único verificable</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Al cumplir con los criterios de asistencia y evaluación, recibirás tu certificación oficial de nivel según el marco CEFR.
              </p>
            </div>

            <button
              onClick={() => onAskQuestion("¿Cuáles son los requisitos exactos de asistencia y nota para obtener el certificado?")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Consultar Requisitos de Certificación</span>
            </button>
          </div>

          <div className="p-6 sm:p-7 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-100">Políticas de Matrícula y Pausas</h4>
                  <p className="text-xs text-slate-400">Transferencias de horario y garantías</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Conoce nuestras políticas flexibles para cambios de horario, pausas de estudio y reembolsos en la primera semana.
              </p>
            </div>

            <button
              onClick={() => onAskQuestion("¿Cómo funcionan los cambios de horario y las pausas de estudio?")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Consultar Políticas con Lingua</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
