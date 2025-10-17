"use client";
import { useState } from "react";

export default function AITestModal({ isOpen, onClose, ai }: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSend() {
    if (!input.trim()) return;
    setLoading(true);

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    const res = await fetch("/api/core/chat/stream", {
      method: "POST",
      body: JSON.stringify({
        messages: newMessages,
        provider: ai.provider,
        model: ai.model,
        apiKey: ai.api_key,
      }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let assistantText = "";

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      assistantText += decoder.decode(value, { stream: true });
      setMessages([
        ...newMessages,
        { role: "assistant", content: assistantText },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6 flex flex-col h-[80vh]">
        <h2 className="text-lg font-semibold mb-4">💬 Probar IA ({ai.provider})</h2>

        <div className="flex-1 overflow-y-auto border rounded-md p-3 mb-3 bg-gray-50">
          {messages.map((m, i) => (
            <p key={i} className={m.role === "user" ? "text-right text-indigo-700" : "text-left text-gray-700"}>
              <strong>{m.role === "user" ? "Tú:" : "IA:"}</strong> {m.content}
            </p>
          ))}
          {loading && <p className="text-gray-400 italic mt-2">Pensando...</p>}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-md p-2 text-sm"
            placeholder="Escribe un mensaje..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-500"
          >
            Enviar
          </button>
        </div>

        <button onClick={onClose} className="mt-4 text-gray-500 hover:text-gray-700 text-sm">
          Cerrar
        </button>
      </div>
    </div>
  );
}
