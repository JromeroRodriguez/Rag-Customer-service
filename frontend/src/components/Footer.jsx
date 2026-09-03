import React from "react";
import { MapPin, MessageSquare, GraduationCap } from "lucide-react";

export function Footer({ onOpenChat }) {
  return (
    <footer className="border-t border-border bg-navy text-navy-foreground py-14 px-4 sm:px-6 text-xs">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-base text-white font-display">
              RIWI LinguaBridge
            </span>
          </div>
          <p className="leading-relaxed opacity-80">
            Academia de idiomas con metodología intensiva de alto impacto para la formación de talento global.
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-xs text-white font-display">Sede Principal</h4>
          <p className="flex items-start gap-2 leading-relaxed opacity-80">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Calle 45 #22-18, Barranquilla, Atlántico, Colombia (GMT-5)</span>
          </p>
          <p className="opacity-70">
            Atención presencial: Lunes a Viernes 6:00 AM – 8:00 PM • Sábados 8:00 AM – 1:00 PM
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-xs text-white font-display">Programas CEFR</h4>
          <ul className="space-y-1.5 opacity-80">
            <li>Inglés (A1 a C2) — Live Online, Presencial & Self-Paced</li>
            <li>Francés (A1 a C2) — Live Online, Presencial & Self-Paced</li>
            <li>Portugués (A1 a C2) — Live Online, Presencial & Self-Paced</li>
            <li>Clubes de Conversación Semanales (Miércoles 6 PM)</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="font-bold uppercase tracking-wider text-xs text-white font-display">Atención al Estudiante</h4>
          <p className="leading-relaxed opacity-80">
            ¿Tienes dudas sobre pagos, horarios o certificados? Consulta con nuestra asistente virtual.
          </p>
          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-primary-foreground font-bold text-xs cursor-pointer transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Abrir Chat con Lingua</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 opacity-70 text-[11px]">
        <div>© {new Date().getFullYear()} RIWI LinguaBridge Academy. Todos los derechos reservados.</div>
        <div>Barranquilla, Colombia</div>
      </div>
    </footer>
  );
}

