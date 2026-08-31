import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { ProgramsSection } from "./components/ProgramsSection";
import { ModalitiesSection } from "./components/ModalitiesSection";
import { PricingSection } from "./components/PricingSection";
import { EnrollmentSteps } from "./components/EnrollmentSteps";
import { Footer } from "./components/Footer";
import { ChatDrawer } from "./components/ChatDrawer";
import { Bot } from "lucide-react";

export function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLiveAdvisorActive, setIsLiveAdvisorActive] = useState(false);
  const [sessionId, setSessionId] = useState(() => "std_" + Math.random().toString(36).substring(2, 8));

  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "¡Hola! Soy Lingua, la asistente virtual de **Riwi Lingua** en Barranquilla.\n\nPuedo orientarte sobre nuestros programas de **Inglés, Francés y Portugués**, precios, modalidades (Presencial, Live Online y Self-Paced), horarios, requisitos de certificación y proceso de matrícula.\n\n¿En qué te puedo colaborar hoy?",
      timestamp: "Inicio",
      escalated: false,
      sources: ["schedules-and-modalities.md", "pricing-and-levels.md"],
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to real-time live chat SSE stream + Polling fallback for human advisor replies
  useEffect(() => {
    const handleIncomingAdvisorMessage = (incomingMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === incomingMsg.id)) {
          return prev; // Avoid duplicates
        }
        return [
          ...prev,
          {
            id: incomingMsg.id,
            role: "human_advisor",
            content: incomingMsg.content,
            timestamp:
              incomingMsg.timestamp ||
              new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isHumanAdvisor: true,
          },
        ];
      });
      setIsDrawerOpen(true);
    };

    // 1. SSE Connection
    let eventSource = null;
    try {
      eventSource = new EventSource(`/api/live-chat/stream/${sessionId}`);

      eventSource.addEventListener("advisor_message", (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingAdvisorMessage(data);
        } catch (err) {
          console.error("Error parsing advisor message:", err);
        }
      });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.role === "human_advisor") {
            handleIncomingAdvisorMessage(data);
          }
        } catch {
          // Ignore heartbeat or non-json
        }
      };
    } catch (e) {
      console.warn("SSE initialization error:", e);
    }

    // 2. Polling fallback every 2.5 seconds
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/live-chat/messages/${sessionId}`);
        if (res.ok) {
          const { messages: incomingList } = await res.json();
          if (Array.isArray(incomingList)) {
            incomingList.forEach(handleIncomingAdvisorMessage);
          }
        }
      } catch {
        // Silent network fallback
      }
    }, 2500);

    return () => {
      eventSource?.close();
      clearInterval(pollInterval);
    };
  }, [sessionId]);

  const [studentName, setStudentName] = useState(() => sessionStorage.getItem("riwi_student_name") || "");
  const [pendingEscalation, setPendingEscalation] = useState(null);

  const handleEndLiveAdvisor = async () => {
    setIsLiveAdvisorActive(false);
    fetch(`/api/live-chat/end/${sessionId}`, { method: "POST" }).catch(() => {});
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        role: "assistant",
        content:
          "Has regresado al modo **Asistente Virtual Lingua (IA)**. ¿En qué más te puedo colaborar hoy?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleSendMessage = async (questionText) => {
    if (!questionText.trim() || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: isLiveAdvisorActive ? "Enviado al asesor" : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);

    // If waiting for the student's name to connect with advisor
    if (pendingEscalation) {
      const cleanName = questionText.trim();
      setStudentName(cleanName);
      sessionStorage.setItem("riwi_student_name", cleanName);

      // Trigger Telegram alert with real student name
      fetch("/api/live-chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          studentName: cleanName,
          question: pendingEscalation.question,
          answer: pendingEscalation.answer,
        }),
      }).catch(() => {});

      setIsLiveAdvisorActive(true);
      const escalationContext = pendingEscalation;
      setPendingEscalation(null);

      const confirmMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `¡Mucho gusto, **${cleanName}**! Le acabo de transferir tu consulta a nuestro asesor humano en Telegram.\n\nEn un momento te responderá directamente por aquí.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, confirmMsg]);
      return;
    }

    // If already talking with a live human advisor, forward directly to Telegram (NO LLM)
    if (isLiveAdvisorActive) {
      try {
        await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: questionText, sessionId, studentName }),
        });
      } catch (err) {
        console.error("Error forwarding to advisor:", err);
      }
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText, sessionId, studentName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error en el procesamiento de la consulta.");
      }

      // If escalation requires the student's name, ask for it before alerting Telegram
      if (data.requiresName) {
        setPendingEscalation({ question: questionText, answer: data.answer });
        const namePromptMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "Con gusto te conecto con un asesor humano de admisiones y ventas. Para poder atenderte mejor, **¿cuál es tu nombre completo?**",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, namePromptMsg]);
        return;
      }

      if (data.escalated) {
        setIsLiveAdvisorActive(true);
      }

      if (data.answer) {
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer,
          escalated: Boolean(data.escalated),
          sources: data.sources || [],
          usage: data.usage || null,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error("Query error:", err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Disculpa, ocurrió un error técnico al consultar la base de conocimiento: ${err.message}. Verifica que el backend y el servicio estén activos.`,
        escalated: true,
        sources: [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Notify backend to clean old session history
    fetch(`/api/live-chat/reset/${sessionId}`, { method: "POST" }).catch(() => {});

    // Generate a fresh session ID
    const newSession = "std_" + Math.random().toString(36).substring(2, 8);
    setSessionId(newSession);

    // Reset local states
    setIsLiveAdvisorActive(false);
    setStudentName("");
    setPendingEscalation(null);
    sessionStorage.removeItem("riwi_student_name");

    setMessages([
      {
        id: "welcome-1",
        role: "assistant",
        content:
          "¡Hola! Soy Lingua, la asistente virtual de **Riwi Lingua** en Barranquilla.\n\nPuedo orientarte sobre nuestros programas de **Inglés, Francés y Portugués**, precios, modalidades (Presencial, Live Online y Self-Paced), horarios, requisitos de certificación y proceso de matrícula.\n\n¿En qué te puedo colaborar hoy?",
        timestamp: "Inicio",
        escalated: false,
        sources: ["schedules-and-modalities.md", "pricing-and-levels.md"],
      },
    ]);
  };

  const handleAskQuestionFromHome = (prompt) => {
    setIsDrawerOpen(true);
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Universal Top Navigation */}
      <Navbar onOpenChat={() => setIsDrawerOpen(true)} />

      {/* Main Single-Page Experience */}
      <main className="flex-1">
        <HeroSection
          onAskQuestion={handleAskQuestionFromHome}
          onOpenChat={() => setIsDrawerOpen(true)}
        />
        <ProgramsSection onAskQuestion={handleAskQuestionFromHome} />
        <ModalitiesSection onAskQuestion={handleAskQuestionFromHome} />
        <PricingSection onAskQuestion={handleAskQuestionFromHome} />
        <EnrollmentSteps onAskQuestion={handleAskQuestionFromHome} />
      </main>

      {/* Footer */}
      <Footer onOpenChat={() => setIsDrawerOpen(true)} />

      {/* Floating Action Button for Assistant */}
      {!isDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="group flex items-center gap-3 px-4 py-3.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-sm shadow-2xl shadow-blue-500/40 hover:scale-105 transition-all duration-200 cursor-pointer border border-cyan-400/30"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-slate-950 text-cyan-400">
              <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-200">¿Dudas? Pregunta a</div>
              <div className="text-xs font-extrabold text-white">Riwi Lingua</div>
            </div>
          </button>
        </div>
      )}

      {/* Slide-over Chat Drawer */}
      <ChatDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onReset={handleReset}
        isLiveAdvisorActive={isLiveAdvisorActive}
        onEndLiveAdvisor={handleEndLiveAdvisor}
      />
    </div>
  );
}

export default App;
