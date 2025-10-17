"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatCore() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy Theo, tu asistente de viajes 🌍 ¿Dónde te gustaría comenzar?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    if (!input.trim()) return;

    const userMsg: Msg = { role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // ✅ Llamada directa al endpoint que usa Gemini 2.5-flash
      const res = await fetch("/api/core/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          // brand_id se ignora, pero lo dejamos por compatibilidad
          brand_id: "traveler-mode",
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al conectar con Gemini");
      }

      // 🔸 En esta versión no hay streaming real: se recibe todo el texto final
      const json = await res.json();
      const aiText = json.output || "Sin respuesta de Gemini";

      setMessages((m) => [...m, { role: "assistant", content: aiText }]);
    } catch (e: any) {
      console.error("⚠️ Error ChatCore:", e);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "⚠️ No pude conectar con Theo Core (Gemini). Revisa tu clave API en .env.local.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[85%] rounded-2xl px-4 py-2 ${
              m.role === "assistant"
                ? "bg-slate-100 text-slate-800"
                : "bg-slate-900 text-white ml-auto"
            }`}
          >
            {m.content}
          </motion.div>
        ))}
        {loading && (
          <div className="text-sm text-slate-500">Theo está pensando…</div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="mt-3 flex gap-2">
        <input
          className="flex-1 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          placeholder="Cuéntame tu idea: '7 días en Perú con naturaleza y gastronomía'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
