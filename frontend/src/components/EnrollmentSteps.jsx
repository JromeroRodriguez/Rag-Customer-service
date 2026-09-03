import React from "react";
import { CheckCircle, Award, Calendar, AlertCircle, ArrowRight } from "lucide-react";
import { ENROLLMENT_STEPS } from "../lib/riwi-data.js";

export function EnrollmentSteps({ onAskQuestion }) {
  return (
    <section id="matricula" className="py-16 sm:py-24 border-b border-border bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="section-eyebrow">
            <Calendar className="w-3.5 h-3.5" />
            Admisiones & Certificaciones
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-navy tracking-tight font-display">
            ¿Cómo es el Proceso de Matrícula?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Nuevas cohortes inician el <strong className="text-foreground">primer lunes de cada mes</strong>. Las inscripciones cierran el jueves anterior a la fecha de inicio.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ENROLLMENT_STEPS.map((s) => (
            <div
              key={s.step}
              className="p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-shadow space-y-2"
            >
              <span className="text-2xl font-black text-primary font-display">{s.step}</span>
              <h3 className="font-bold text-sm text-foreground font-display">{s.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-primary">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground font-display">Certificación Oficial de Nivel</h4>
                <p className="text-xs text-muted-foreground">Emisión digital automática e institucional</p>
              </div>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed">
              LinguaBridge by RIWI expide un <strong>Certificado de Finalización (PDF verificable)</strong> al cumplir:
            </p>
            <ul className="space-y-2 text-xs text-foreground/80">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <span>Asistir al menos al <strong>80% de las clases en vivo</strong> (o 90% de módulos self-paced).</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success shrink-0" />
                <span>Obtener una calificación mínima de <strong>70% en el examen final</strong>.</span>
              </li>
            </ul>
            <div className="p-2.5 rounded-xl bg-muted text-[11px] text-muted-foreground border border-border">
              * Certificado físico impreso opcional: COP 25,000.
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent border border-border flex items-center justify-center text-primary">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground font-display">Transferencias y Reembolsos</h4>
                <p className="text-xs text-muted-foreground">Políticas claras y transparentes</p>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Cambio de horario o modalidad:</strong> 1 transferencia gratuita por nivel (sujeto a disponibilidad).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Reembolsos:</strong> Disponibles únicamente durante la primera semana de la cohorte (menos COP 50,000 administrativos).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong>Pausas:</strong> Después de la 1.ª semana, puedes pausar y retomar el nivel dentro de los siguientes 60 días.</span>
              </li>
            </ul>
            <button
              onClick={() => onAskQuestion("¿Cuáles son las políticas de cancelación y transferencias de horario?")}
              className="mt-2 text-xs font-bold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Consultar políticas con Lingua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

