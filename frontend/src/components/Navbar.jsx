import React from "react";
import { BookOpen, Layers, DollarSign, CalendarCheck, MessageSquare, GraduationCap } from "lucide-react";

export function Navbar({ activeTab = "home", setActiveTab = () => {}, onOpenChat }) {
  const scrollToSection = (id) => {
    if (activeTab !== "home") {
      setActiveTab("home");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const links = [
    { id: "programas", label: "Programas", icon: BookOpen },
    { id: "modalidades", label: "Modalidades", icon: Layers },
    { id: "precios", label: "Precios", icon: DollarSign },
    { id: "matricula", label: "Matrícula", icon: CalendarCheck },
  ];

  return (
    <nav className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <button
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-navy text-navy-foreground group-hover:bg-primary transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-1.5 py-0.5 rounded bg-primary text-primary-foreground tracking-wider uppercase font-display">
                RIWI
              </span>
              <span className="font-bold text-base sm:text-lg text-foreground tracking-tight font-display">
                LinguaBridge
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Language Academy • Barranquilla
            </p>
          </div>
        </button>

        <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => scrollToSection(l.id)}
              className="px-3 py-2 rounded-lg hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}



