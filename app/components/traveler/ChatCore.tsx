"use client";

import { useState, useEffect, useRef } from "react";

export default function ChatCore() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: "assistant",
      content: "👋 ¡Hola! Soy Theo, tu asistente de viajes. ¿Dónde te gustaría comenzar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [domain, setDomain] = useState("localhost");

  useEffect(() => {
    // Detecta el dominio automáticamente
    if (typeof window !== "undefined") {
      const currentDomain = window.location.hostname;
      setDomain(currentDomain === "localhost" ? "waiki.pe" : currentDomain);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { role: "user", content: input };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/core/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain,
          prompt: input,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al conectar con Theo Core");
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.output || "Sin respuesta" },
      ]);
    } catch (err: any) {
      console.error("⚠️ Error ChatCore:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ No pude conectar con Theo Core. Revisa la configuración del brand o el dominio.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-neutral-300 dark:border-neutral-700 p-4 flex items-center gap-3">
        <input
          type="text"
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje..."
          className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "✈️ Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
