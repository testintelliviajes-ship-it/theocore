"use client";
import { useState } from "react";

export default function AITestModal({ isOpen, onClose, config }: any) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function sendMessage() {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/core/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          provider: config.provider,
          model: config.model,
          apiKey: config.api_key,
        }),
      });

      const data = await res.text();
      setMessages([...newMessages, { role: "assistant", content: data }]);
    } catch (err) {
      console.error("Error en IA:", err);
      alert("Error en la comunicación con la IA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-fadeIn">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Probar IA — {config?.provider === "google" ? "Gemini" : "OpenAI"} ({config?.model})
        </h2>

        <div className="border rounded-lg h-64 overflow-y-auto p-3 bg-gray-50 space-y-2">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm text-center mt-16">
              Escribe un mensaje para comenzar la prueba.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-[75%] text-sm ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe algo..."
            className="flex-1 border rounded-md px-3 py-2"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500"
          >
            {loading ? "..." : "Enviar"}
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
