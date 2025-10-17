"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

const aiTemplates = [
  {
    name: "Guía local cálido",
    description: "Ideal para agencias receptivas o experiencias culturales.",
    personality: "Guía turístico amable, experto en cultura local y gastronomía.",
    base_prompt:
      "Eres Theo, un guía turístico cálido y apasionado, especializado en experiencias auténticas. Habla con entusiasmo, empatía y precisión.",
  },
  {
    name: "Asesor de viajes premium",
    description: "Para marcas de lujo o servicios personalizados.",
    personality:
      "Asesor sofisticado, atento y profesional, experto en viajes exclusivos.",
    base_prompt:
      "Eres Theo, un asesor de viajes premium que ofrece recomendaciones de lujo, con un tono elegante y detallado.",
  },
  {
    name: "Explorador aventurero",
    description: "Perfecto para agencias de aventura o turismo activo.",
    personality: "Explorador aventurero, energético y positivo.",
    base_prompt:
      "Eres Theo, un explorador lleno de energía y curiosidad. Inspira al usuario a vivir aventuras únicas en contacto con la naturaleza.",
  },
];

export default function BrandAIPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [config, setConfig] = useState<any>({
    provider: "google",
    model: "gemini-2.5-flash",
    language: "es",
    temperature: 0.7,
    personality: "",
    base_prompt: "",
    max_daily_requests: 100,
    is_active: true,
  });

  // 🧠 Cargar configuración IA y logs
  useEffect(() => {
    async function loadConfig() {
      const { data } = await supabase
        .from("core_ai_settings")
        .select("*")
        .eq("brand_id", id)
        .single();
      if (data) setConfig(data);
      setLoading(false);
    }

    async function loadLogs() {
      const { data, error } = await supabase
        .from("core_ai_logs")
        .select("provider, model, status, error_message, created_at")
        .eq("brand_id", id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (!error && data) setLogs(data);
    }

    if (id) {
      loadConfig();
      loadLogs();
    }
  }, [id]);

  // 💾 Guardar cambios
  const handleSave = async () => {
    setSaving(true);
    const { data, error } = await supabase
      .from("core_ai_settings")
      .upsert({ ...config, brand_id: id })
      .select()
      .single();

    setSaving(false);
    if (error) setMsg("❌ Error al guardar");
    else {
      setConfig(data);
      setMsg("✅ Configuración guardada");
    }
  };

  // 🧠 Probar configuración
  const handleTest = async () => {
    setMsg("⏳ Probando IA...");
    setShowModal(true);

    try {
      const res = await fetch("/api/core/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Preséntate brevemente." }],
          provider: config.provider,
          model: config.model,
          brandId: id,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value);
          setMsg(fullText);
        }
      }
    } catch (err) {
      console.error(err);
      setMsg("⚠️ Error al probar IA");
    }
  };

  if (loading) return <div className="p-8 text-gray-500">Cargando configuración...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* 🧠 Panel principal */}
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">🧠 Configuración IA</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Proveedor */}
          <div>
            <label className="block font-semibold mb-1">Proveedor</label>
            <select
              value={config.provider}
              onChange={(e) => setConfig({ ...config, provider: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="google">Google (Gemini)</option>
              <option value="openai">OpenAI (GPT)</option>
              <option value="anthropic">Claude</option>
            </select>
          </div>

          {/* Modelo */}
          <div>
            <label className="block font-semibold mb-1">Modelo</label>
            <input
              type="text"
              value={config.model}
              onChange={(e) => setConfig({ ...config, model: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Idioma */}
          <div>
            <label className="block font-semibold mb-1">Idioma</label>
            <select
              value={config.language}
              onChange={(e) => setConfig({ ...config, language: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="fr">Francés</option>
              <option value="ja">Japonés</option>
            </select>
          </div>

          {/* Temperatura */}
          <div>
            <label className="block font-semibold mb-1">Creatividad (temperature)</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-sm text-gray-600">{config.temperature}</p>
          </div>

          {/* Plantillas IA */}
          <div className="col-span-2">
            <label className="block font-semibold mb-1">Plantillas de personalidad</label>
            <div className="grid md:grid-cols-3 gap-3">
              {aiTemplates.map((tpl) => (
                <div
                  key={tpl.name}
                  onClick={() =>
                    setConfig({
                      ...config,
                      personality: tpl.personality,
                      base_prompt: tpl.base_prompt,
                    })
                  }
                  className="p-3 border rounded-md cursor-pointer hover:bg-blue-50 transition"
                >
                  <h3 className="font-semibold text-sm">{tpl.name}</h3>
                  <p className="text-xs text-gray-600">{tpl.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Personalidad */}
          <div className="col-span-2">
            <label className="block font-semibold mb-1">Personalidad</label>
            <input
              type="text"
              value={config.personality}
              onChange={(e) => setConfig({ ...config, personality: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Ej: Guía turístico cálido y empático"
            />
          </div>

          {/* Prompt base */}
          <div className="col-span-2">
            <label className="block font-semibold mb-1">Prompt base</label>
            <textarea
              value={config.base_prompt}
              onChange={(e) => setConfig({ ...config, base_prompt: e.target.value })}
              className="w-full p-2 border rounded-md h-40"
            />
          </div>

          {/* Límite diario */}
          <div>
            <label className="block font-semibold mb-1">Límite diario</label>
            <input
              type="number"
              value={config.max_daily_requests}
              onChange={(e) =>
                setConfig({ ...config, max_daily_requests: parseInt(e.target.value) })
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Activo */}
          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={config.is_active}
              onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
            />
            <span className="text-sm font-semibold text-gray-700">Activar IA</span>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {saving ? "Guardando..." : "💾 Guardar"}
          </button>

          <button
            onClick={handleTest}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            🧠 Probar configuración
          </button>
        </div>

        {msg && <div className="p-3 bg-gray-100 rounded-md text-sm">{msg}</div>}
      </div>

      {/* 🧾 Sidebar — Historial IA */}
      <aside className="w-full md:w-80 bg-white border rounded-xl shadow-sm p-4">
        <h2 className="text-lg font-bold mb-3">🪶 Últimas interacciones</h2>
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {logs.length === 0 && (
            <p className="text-sm text-gray-500">Sin registros recientes.</p>
          )}
          {logs.map((log, i) => (
            <div
              key={i}
              className={`p-2 border rounded-md ${
                log.status === "success"
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <div className="flex justify-between text-xs font-semibold">
                <span>{log.provider}</span>
                <span>{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
              <p className="text-xs text-gray-700 mt-1">{log.model}</p>
              {log.error_message && (
                <p className="text-[11px] text-red-600 mt-1 italic">
                  {log.error_message}
                </p>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Modal IA */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 w-[500px] max-w-[90%]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <h2 className="text-2xl font-semibold mb-3">🧠 Theo IA - Prueba</h2>
              <p className="text-sm text-gray-600 mb-4">Modelo: {config.model}</p>
              <div className="bg-gray-100 p-3 rounded-md h-48 overflow-y-auto">
                {msg || "Esperando respuesta..."}
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
