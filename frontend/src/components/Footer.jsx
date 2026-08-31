import React from "react";
import { Bot, MapPin, Mail, Shield, MessageCircle } from "lucide-react";

export function Footer({ onOpenChat }) {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-12 px-4 sm:px-6 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {/* Col 1: Brand */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-600 to-indigo-600 text-white tracking-wider uppercase">
              RIWI
            </span>
            <span className="font-bold text-base text-slate-100">
              LinguaBridge
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Academia de idiomas con metodología intensiva de alto impacto para la formación de talento global.
          </p>
          <div className="text-[11px] text-slate-500">
            Plataforma de Orientación y Atención al Estudiante RIWI
          </div>
        </div>

        {/* Col 2: Ubicación */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">Sede Principal</h4>
          <p className="flex items-start gap-2 leading-relaxed">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>Calle 45 #22-18, Barranquilla, Atlántico, Colombia (GMT-5)</span>
          </p>
          <p className="text-slate-500">
            Atención presencial: Lunes a Viernes 6:00 AM – 8:00 PM • Sábados 8:00 AM – 1:00 PM
          </p>
        </div>

        {/* Col 3: Programas */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">Programas CEFR</h4>
          <ul className="space-y-1.5 text-slate-400">
            <li>Inglés (A1 a C2) — Live Online, Presencial & Self-Paced</li>
            <li>Francés (A1 a C2) — Live Online, Presencial & Self-Paced</li>
            <li>Portugués (A1 a C2) — Live Online, Presencial & Self-Paced</li>
            <li>Clubes de Conversación Semanales (Miércoles 6 PM)</li>
          </ul>
        </div>

        {/* Col 4: Soporte IA & Asesor */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">Atención al Estudiante</h4>
          <p className="leading-relaxed">
            ¿Tienes dudas sobre pagos, horarios o certificados? Consulta con nuestro asistente inteligente.
          </p>
          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md cursor-pointer hover:opacity-95 transition-opacity"
          >
            <Bot className="w-4 h-4" />
            <span>Abrir Chat con Lingua</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
        <div>
          © {new Date().getFullYear()} Riwi Lingua. Todos los derechos reservados. Módulo 5.7 AI Automatizador.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-500">
            <Shield className="w-3.5 h-3.5" />
            Atención Segura y Confidencial
          </span>
        </div>
      </div>
    </footer>
  );
}
