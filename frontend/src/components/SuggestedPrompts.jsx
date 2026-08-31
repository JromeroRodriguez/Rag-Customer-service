import React from "react";
import { DollarSign, MapPin, Award, AlertTriangle, Globe } from "lucide-react";

const SUGGESTIONS = [
  {
    icon: DollarSign,
    label: "Precios de inglés virtual",
    prompt: "¿Cuánto cuesta el nivel de inglés en modalidad Live Online y qué descuentos hay?",
  },
  {
    icon: MapPin,
    label: "Sedes y horarios",
    prompt: "¿Dónde quedan las clases presenciales y qué horarios tienen?",
  },
  {
    icon: Award,
    label: "Requisitos de certificado",
    prompt: "¿Cuáles son los requisitos para obtener el certificado de nivel?",
  },
  {
    icon: Globe,
    label: "Cursos de alemán (Out of Scope)",
    prompt: "¿Ofrecen cursos de alemán en la academia?",
  },
  {
    icon: AlertTriangle,
    label: "Reclamo de pago (Escalación)",
    prompt: "Me cobraron dos veces la inscripción, quiero la devolución de mi dinero.",
  },
];

export function SuggestedPrompts({ onSelect, disabled }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
        <span>Preguntas frecuentes sugeridas</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onSelect(item.prompt)}
              className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-slate-100 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-left shadow-sm shadow-slate-950/50"
            >
              <div className="p-1 rounded-lg bg-slate-800/80 group-hover:bg-blue-500/10 group-hover:text-blue-400 text-slate-400 transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
