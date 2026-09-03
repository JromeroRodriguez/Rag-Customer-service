import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { ProgramsSection } from "./components/ProgramsSection";
import { ModalitiesSection } from "./components/ModalitiesSection";
import { PricingSection } from "./components/PricingSection";
import { EnrollmentSteps } from "./components/EnrollmentSteps";
import { Footer } from "./components/Footer";
import { ChatDrawer } from "./components/ChatDrawer";
import { MessageSquare } from "lucide-react";
import { WELCOME_MESSAGE } from "./lib/riwi-data.js";
import { validateStudentName, validateStudentPhone } from "./lib/validation.js";


export function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLiveAdvisorActive, setIsLiveAdvisorActive] = useState(false);

  const [sessionId, setSessionId] = useState(() => {
    try { sessionStorage.clear(); } catch {}
    return "std_" + Math.random().toString(36).substring(2, 8);
  });

  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
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

      // Handle /cerrar from advisor in Telegram
      eventSource.addEventListener("live_ended", () => {
        setIsLiveAdvisorActive(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            role: "assistant",
            content:
              "El asesor humano ha finalizado la sesión en vivo. ¡Muchas gracias por comunicarte con nosotros! Has regresado al modo **Lingua Assistant (IA)**. ¿En qué más te puedo colaborar hoy?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      });

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "live_ended") {
            setIsLiveAdvisorActive(false);
          } else if (data.role === "human_advisor") {
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

  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
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

  const handleRequestAdvisor = () => {
    if (isLiveAdvisorActive) return;
    setPendingEscalation({
      step: "name",
      question: "Solicitud directa de asesor humano desde el chat",
      answer: "El estudiante solicitó comunicarse con un asesor humano.",
    });

    const advisorPromptMsg = {
      id: `req-${Date.now()}`,
      role: "assistant",
      content:
        "¡Con gusto te comunico con un asesor humano de admisiones y ventas de **Riwi Lingua**! Para poder atenderte de forma personalizada, **¿cuál es tu nombre y apellido?**",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, advisorPromptMsg]);
    setIsDrawerOpen(true);
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

    // Captura en dos pasos (Nombre -> WhatsApp) antes de conectar al asesor
    if (pendingEscalation) {
      const inputVal = questionText.trim();

      // Opción de cancelar la solicitud de asesor y volver al bot
      if (["cancelar", "salir", "volver", "no gracias"].includes(inputVal.toLowerCase())) {
        setPendingEscalation(null);
        const cancelMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Entendido, cancelamos la transferencia a un asesor humano. Puedes seguir consultándome libremente sobre programas, horarios, precios o certificaciones de **Riwi Lingua**. ¿En qué más te puedo colaborar?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, cancelMsg]);
        return;
      }

      if (pendingEscalation.step === "name") {
        const check = validateStudentName(inputVal);
        if (!check.valid) {
          const errMsg = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `**Nombre no válido**: ${check.error}\n\n*(Escribe tu nombre y apellido, o escribe **cancelar** si prefieres no continuar).*`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, errMsg]);
          return;
        }

        const validName = check.sanitized;
        setStudentName(validName);
        setPendingEscalation({
          step: "phone",
          question: pendingEscalation.question,
          answer: pendingEscalation.answer,
          studentName: validName,
        });

        const askPhoneMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Mucho gusto, **${validName}**. Por favor indícanos tu **número de WhatsApp** (10 dígitos, estándar colombiano, ej: \`300 123 4567\`):`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, askPhoneMsg]);
        return;
      }

      if (pendingEscalation.step === "phone") {
        const check = validateStudentPhone(inputVal);
        if (!check.valid) {
          const errMsg = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `**WhatsApp no válido**: ${check.error}\n\n*(Ingresa los 10 dígitos de tu celular en Colombia, o escribe **cancelar** para regresar al asistente).*`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((prev) => [...prev, errMsg]);
          return;
        }



        const validPhone = check.sanitized;
        setStudentPhone(validPhone);
        const nameToUse = pendingEscalation.studentName || studentName || "Estudiante";

        // Enviar alerta a Telegram con Nombre + WhatsApp validados
        fetch("/api/live-chat/escalate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            studentName: nameToUse,
            studentPhone: validPhone,
            question: pendingEscalation.question,
            answer: pendingEscalation.answer,
          }),
        }).catch(() => {});

        setIsLiveAdvisorActive(true);
        setPendingEscalation(null);

        const confirmMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `¡Excelente, **${nameToUse}**! Tu solicitud ya fue enviada a nuestro asesor humano en Telegram con tu número de contacto (\`${validPhone}\`).\n\nEn un momento te responderá directamente por aquí en vivo.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, confirmMsg]);
        return;
      }
    }


    // If already talking with a live human advisor, forward directly to Telegram (NO LLM)
    if (isLiveAdvisorActive) {
      try {
        await fetch("/api/query", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: questionText, sessionId, studentName, studentPhone }),
        });
      } catch (err) {
        console.error("Error forwarding to advisor:", err);
      }
      return;
    }

    setIsLoading(true);

    const assistantMsgId = `asst-${Date.now()}`;
    const placeholderMsg = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, placeholderMsg]);

    // Build recent conversation history for Multi-turn RAG
    const conversationHistory = messages
      .filter((m) => m && (m.role === "user" || m.role === "assistant"))
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          sessionId,
          studentName,
          history: conversationHistory,
          stream: true,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Error en el servidor: ${res.status}`);
      }

      // Check if response is an SSE stream
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream") && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedContent = "";
        let finalData = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          for (const evt of events) {
            const lines = evt.split("\n");
            let eventName = "message";
            let eventData = "";

            for (const line of lines) {
              if (line.startsWith("event:")) {
                eventName = line.replace("event:", "").trim();
              } else if (line.startsWith("data:")) {
                eventData = line.replace("data:", "").trim();
              }
            }

            if (!eventData) continue;

            try {
              const parsed = JSON.parse(eventData);
              if (eventName === "chunk" && parsed.content) {
                accumulatedContent += parsed.content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsgId
                      ? { ...m, content: accumulatedContent, isStreaming: true }
                      : m
                  )
                );
              } else if (eventName === "done") {
                finalData = parsed;
              } else if (eventName === "error") {
                throw new Error(parsed.error || "Error en el procesamiento del stream.");
              }
            } catch (err) {
              console.warn("Error parsing stream chunk:", err);
            }
          }
        }

        // Apply final stream metadata
        if (finalData) {
          if (finalData.requiresName) {
            setPendingEscalation({ step: "name", question: questionText, answer: finalData.answer });
            const promptNameText = finalData.answer
              ? `${finalData.answer}\n\nPara comunicarte con nuestro asesor, **¿cuál es tu nombre completo?**`
              : "Con gusto te conecto con un asesor humano de admisiones y ventas. Para poder atenderte mejor, **¿cuál es tu nombre completo?**";

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: promptNameText,
                      isStreaming: false,
                      escalated: true,
                      sources: finalData.sources || [],
                    }
                  : m
              )
            );
          } else {
            if (finalData.escalated) {
              setIsLiveAdvisorActive(true);
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      content: finalData.answer || accumulatedContent,
                      isStreaming: false,
                      escalated: Boolean(finalData.escalated),
                      sources: finalData.sources || [],
                      usage: finalData.usage || null,
                    }
                  : m
              )
            );
          }
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, isStreaming: false, content: accumulatedContent }
                : m
            )
          );
        }
      } else {
        // Fallback for non-stream JSON responses
        const data = await res.json();

        if (data.requiresName) {
          setPendingEscalation({ step: "name", question: questionText, answer: data.answer });
          const namePromptMsg = data.answer
            ? `${data.answer}\n\nPara comunicarte con nuestro asesor, **¿cuál es tu nombre completo?**`
            : "Con gusto te conecto con un asesor humano de admisiones y ventas. Para poder atenderte mejor, **¿cuál es tu nombre completo?**";

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: namePromptMsg,
                    isStreaming: false,
                    escalated: true,
                    sources: data.sources || [],
                  }
                : m
            )
          );
          return;
        }

        if (data.escalated) {
          setIsLiveAdvisorActive(true);
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content: data.answer,
                  isStreaming: false,
                  escalated: Boolean(data.escalated),
                  sources: data.sources || [],
                  usage: data.usage || null,
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Query error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: `Disculpa, ocurrió un error técnico al consultar la base de conocimiento: ${err.message}. Verifica que el backend y el servicio estén activos.`,
                isStreaming: false,
                escalated: true,
                sources: [],
              }
            : m
        )
      );
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

    setMessages([WELCOME_MESSAGE]);
  };

  const handleAskQuestionFromHome = (prompt) => {
    setIsDrawerOpen(true);
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
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

      {/* Floating Action Button for Assistant (when modal is closed) */}
      {!isDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary hover:bg-primary-dark text-primary-foreground font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer border border-white/20"
            aria-label="Abrir asistente"
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/20 text-white">
              <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
            </div>
            <span className="hidden sm:inline">Consultar con Lingua</span>
          </button>
        </div>
      )}

      {/* Slide-over / Modal Chat Drawer */}
      <ChatDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        messages={messages}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onReset={handleReset}
        isLiveAdvisorActive={isLiveAdvisorActive}
        onEndLiveAdvisor={handleEndLiveAdvisor}
        pendingEscalation={pendingEscalation}
        onRequestAdvisor={handleRequestAdvisor}
      />


    </div>
  );
}

export default App;


