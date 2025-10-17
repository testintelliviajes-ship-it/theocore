"use client";
import { useEffect, useState } from "react";
import { saveAIConfig } from "../core/setting/ai/actions/aiActions";

export default function AIFormModal({ isOpen, onClose, onSaved, config, brandId }: any) {
  const [form, setForm] = useState({
    provider: "google",
    model: "gemini-2.5-flash",
    api_key: "",
    temperature: 0.7,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  if (!isOpen) return null;

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);
    try {
      await saveAIConfig({ ...form, brand_id: brandId });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al guardar configuración");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: any) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          {config ? "Editar configuración IA" : "Nueva configuración IA"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
            <select
              name="provider"
              value={form.provider}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="google">Google (Gemini)</option>
              <option value="openai">OpenAI (GPT)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input
              type="text"
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="gemini-2.5-flash o gpt-4o-mini"
              className="w-full border rounded-md p-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="password"
              name="api_key"
              value={form.api_key}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
              placeholder="••••••••••••••••"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
            />
            <label className="text-sm text-gray-700">IA activa</label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-500"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
