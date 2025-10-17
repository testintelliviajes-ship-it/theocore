"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { saveAIConfig } from "../actions/aiConfig.actions";
import BrandAITestModal from "./BrandAITestModal";

export default function BrandAIConfigModal({ isOpen, onClose, brand, onSaved }: any) {
  const [providers, setProviders] = useState<string[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [keyOwner, setKeyOwner] = useState("Theo Core");
  const [domain, setDomain] = useState("");
  const [personality, setPersonality] = useState("");
  const [maxTokens, setMaxTokens] = useState(500);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // 🧩 Cargar proveedores disponibles
  useEffect(() => {
    loadProviders();
  }, []);

  async function loadProviders() {
    const { data, error } = await supabase.from("core_ai_models").select("provider");
    if (error) console.error(error);
    if (data) {
      const uniqueProviders = Array.from(new Set(data.map((d) => d.provider)));
      setProviders(uniqueProviders);
    }
  }

  async function loadModels(provider: string) {
    const { data, error } = await supabase
      .from("core_ai_models")
      .select("*")
      .eq("provider", provider);
    if (error) console.error(error);
    setModels(data || []);
  }

  async function handleSave() {
    if (!selectedProvider || !selectedModel) {
      alert("Selecciona un proveedor y un modelo IA.");
      return;
    }

    if (keyOwner !== "Theo Core" && !apiKey) {
      alert("Debes ingresar una API key si la clave pertenece a la franquicia/agencia.");
      return;
    }

    setSaving(true);

    try {
      await saveAIConfig({
        brand_id: brand.id,
        provider: selectedProvider,
        model_id: selectedModel,
        api_key: keyOwner === "Theo Core" ? null : apiKey,
        key_owner: keyOwner,
        domain: domain || null,
        personality: personality || null,
        max_tokens: Number(maxTokens) || 500,
        is_active: true,
      });

      alert("✅ Configuración IA guardada correctamente.");
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      alert("❌ Error al guardar configuración: " + err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl p-6 relative">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          ⚙️ Configurar IA — {brand?.name}
        </h2>

        {/* 🔹 Proveedor */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
          <select
            value={selectedProvider}
            onChange={(e) => {
              const prov = e.target.value;
              setSelectedProvider(prov);
              loadModels(prov);
              setSelectedModel("");
            }}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecciona un proveedor</option>
            {providers.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 Modelos */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedProvider}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Selecciona un modelo</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code})
              </option>
            ))}
          </select>
        </div>

        {/* 🔹 Propietario de la clave */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Propietario de la clave
          </label>
          <select
            value={keyOwner}
            onChange={(e) => setKeyOwner(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="Theo Core">Theo Core (Global)</option>
            <option value="franchise">Franquicia / Agencia</option>
          </select>
        </div>

        {/* 🔹 API Key */}
        {keyOwner !== "Theo Core" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Ingresa tu API key"
              className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        {/* 🔹 Dominio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dominio (opcional)</label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="https://tumarca.com"
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 🔹 Personalidad */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Personalidad IA (prompt base)</label>
          <textarea
            value={personality}
            onChange={(e) => setPersonality(e.target.value)}
            rows={2}
            placeholder="Ejemplo: Asistente experto en viajes de lujo en España..."
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 🔹 Máximo de tokens */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tokens máximos</label>
          <input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(e.target.valueAsNumber)}
            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* 🔹 Botones */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {saving ? "Guardando..." : "Guardar configuración"}
            </button>
          </div>
        </div>

        {/* 🔹 Modal de testeo IA */}
        {testing && (
          <BrandAITestModal
            isOpen={testing}
            onClose={() => setTesting(false)}
            brand={{
              id: brand.id,
              model_id: selectedModel,
              api_key: apiKey,
              name: brand.name,
            }}
          />
        )}
      </div>
    </div>
  );
}
