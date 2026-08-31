import React from "react";
import { Bot, Sparkles, MessageSquare, BookOpen, Layers, DollarSign, CalendarCheck } from "lucide-react";

export function Navbar({ onOpenChat }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 text-left">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-gradient-to-r from-violet-600 to-indigo-600 text-white tracking-wider uppercase shadow-sm">
                RIWI
              </span>
              <span className="font-bold text-base sm:text-lg text-slate-100 tracking-tight">
                Lingua
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Academia de Idiomas
            </p>
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/70 p-1 rounded-xl border border-slate-800/80 text-xs font-medium text-slate-300">
          <button
            onClick={() => scrollToSection("programas")}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            Programas
          </button>
          <button
            onClick={() => scrollToSection("modalidades")}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Modalidades
          </button>
          <button
            onClick={() => scrollToSection("precios")}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Tarifas & Becas
          </button>
          <button
            onClick={() => scrollToSection("matricula")}
            className="px-3 py-1.5 rounded-lg hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-cyan-400" />
            Matrícula
          </button>
        </div>

        {/* Action Button: Opens Assistant Drawer */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consultar con Lingua</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
