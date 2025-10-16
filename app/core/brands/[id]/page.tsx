"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function BrandDetailPage() {
  const { id } = useParams(); // id de la marca
  const [brand, setBrand] = useState<any>(null);
  const [aiConfig, setAiConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  // Campos del formulario
  const providers = ["google", "openai", "anthropic"];
  const modelsByProvider: Record<string, string[]> = {
    google: ["gemini-2.5-flash", "gemini-1.5-pro", "gemini-1.0-pro"],
    openai: ["gpt-5-turbo", "gpt-4o-mini", "gpt-4-turbo"],
    anthropic: ["claude-3.5-sonnet", "claude-3-opus", "claude-3-haiku"],
  };

  // 🔹 Cargar marca + configuración IA
  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      try {
        setLoading(true);

        // Marca
        const { data: brandData, error: brandErr } = await supabase
          .from("core_brands")
          .select("id, name, country, logo_url, language, status")
          .eq("id", id)
          .single();

        if (brandErr) throw brandErr;
        setBrand(brandData);

        // Configuración IA
        const { data: aiData, error: aiErr } = await supabase
          .from("core_ai_status")
          .select(
            "id, provider, model, temperature, max_output_tokens, personality, language"
          )
          .eq("brand_id", id)
          .single();

        if (aiErr) throw aiErr;
        setAiConfig(aiData);
      } catch (err: any) {
        console.error(err);
        setMsg(`❌ Error cargando datos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // 🔹 Guardar configuración IA
  const handleSave = async () => {
    if (!aiConfig) return;
    try {
      setMsg("Guardando configuración...");
      const { error } = await supabase
        .from("core_ai_status")
        .update({
          provider: aiConfig.provider,
          model: aiConfig.model,
          temperature: aiConfig.temperature,
          max_output_tokens: aiConfig.max_output_tokens,
          personality: aiConfig.personality,
          language: aiConfig.language,
          updated_at: new Date().toISOString(),
        })
        .eq("brand_id", id);
      if (error) throw error;
      setMsg("✅ Configuración IA actualizada correctamente");
    } catch (err: any) {
      setMsg(`❌ Error al guardar: ${err.message}`);
    }
  };

  if (loading) return <div className="p-6">Cargando configuración...</div>;
  if (!brand) return <div className="p-6">Marca no encontrada.</div>;

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center gap-3 border-b pb-4">
        <img
          src={brand.logo_url || "/placeholder-brand.png"}
          alt="logo"
          className="w-12 h-12 rounded-md border"
        />
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">
            {brand.name}
          </h2>
          <p className="text-sm text-slate-500">
            IA asociada: <strong>Theo {brand.name}</strong> · Idioma base:{" "}
            <span className="uppercase">{brand.language || "es"}</span>
          </p>
        </div>
      </header>

      {msg && (
        <div
          className={`p-3 rounded text-sm ${
            msg.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : msg.startsWith("❌")
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {msg}
        </div>
      )}

      {/* Sección Configuración IA */}
      <section className="bg-white rounded-xl shadow p-5 space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">
          ⚙️ Configuración de IA
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Proveedor */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Proveedor
            </label>
            <select
              value={aiConfig?.provider || "google"}
              onChange={(e) =>
                setAiConfig({ ...aiConfig, provider: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-slate-800"
            >
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p === "google"
                    ? "Google Gemini"
                    : p === "openai"
                    ? "OpenAI"
                    : "Anthropic Claude"}
                </option>
              ))}
            </select>
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">Modelo</label>
            <select
              value={aiConfig?.model || ""}
              onChange={(e) =>
                setAiConfig({ ...aiConfig, model: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-slate-800"
            >
              {(modelsByProvider[aiConfig?.provider || "google"] || []).map(
                (m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Temperatura */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Temperatura ({aiConfig?.temperature})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={aiConfig?.temperature || 0.7}
              onChange={(e) =>
                setAiConfig({
                  ...aiConfig,
                  temperature: parseFloat(e.target.value),
                })
              }
              className="w-full accent-slate-800"
            />
          </div>

          {/* Tokens máximos */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              Tokens máximos
            </label>
            <input
              type="number"
              value={aiConfig?.max_output_tokens || 2048}
              onChange={(e) =>
                setAiConfig({
                  ...aiConfig,
                  max_output_tokens: parseInt(e.target.value),
                })
              }
              className="w-full border rounded-lg px-3 py-2 text-slate-800"
            />
          </div>

          {/* Idioma */}
          <div>
            <label className="block text-sm text-slate-600 mb-1">Idioma</label>
            <select
              value={aiConfig?.language || "es"}
              onChange={(e) =>
                setAiConfig({ ...aiConfig, language: e.target.value })
              }
              className="w-full border rounded-lg px-3 py-2 text-slate-800"
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="fr">Francés</option>
              <option value="pt">Portugués</option>
              <option value="de">Alemán</option>
            </select>
          </div>
        </div>

        {/* Personalidad */}
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            Personalidad del asistente
          </label>
          <textarea
            value={aiConfig?.personality || ""}
            onChange={(e) =>
              setAiConfig({ ...aiConfig, personality: e.target.value })
            }
            className="w-full border rounded-lg px-3 py-2 h-28 text-slate-800"
            placeholder="Ej: Asistente de viajes empático, profesional y entusiasta."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            Guardar configuración
          </button>
        </div>
      </section>
      {/* Prueba IA */}
<section className="bg-white rounded-xl shadow p-5 space-y-4 mt-6">
  <h3 className="text-lg font-semibold text-slate-800">🧠 Probar IA configurada</h3>
  <p className="text-sm text-slate-500">
    Envía un mensaje para verificar la respuesta del modelo actual ({aiConfig?.provider} / {aiConfig?.model}).
  </p>

  <textarea
    value={aiConfig?.testPrompt || ""}
    onChange={(e) =>
      setAiConfig({ ...aiConfig, testPrompt: e.target.value })
    }
    className="w-full border rounded-lg px-3 py-2 h-24 text-slate-800"
    placeholder="Ej: Recomiéndame un destino romántico en Perú."
  />

  <div className="flex justify-end">
    <button
      onClick={async () => {
        setMsg("⌛ Consultando modelo...");
        try {
          const res = await fetch("/api/core/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: aiConfig.testPrompt }],
            provider: "google",
            model: "gemini-2.5-flash",
            brandId: id,
          }),
        });

        const text = await res.text();
        setMsg(`✅ Respuesta: ${text}`);
          setMsg(`✅ Respuesta: ${res}`);
        } catch (err: any) {
          setMsg(`❌ Error: ${err.message}`);
        }
      }}
      className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition"
    >
      Probar IA ahora
    </button>
  </div>
</section>

    </div>
  );
}
