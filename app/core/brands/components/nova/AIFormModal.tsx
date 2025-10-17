"use client";
import { useState, useEffect } from "react";
import { saveAIConfig } from "../actions/ai.actions";

export default function AIFormModal({ isOpen, onClose, config, onSaved }: any) {
  const [form, setForm] = useState(config || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (config) setForm(config);
  }, [config]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await saveAIConfig(form);
      if (onSaved) await onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error al guardar configuración de IA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {config ? "Editar configuración IA" : "Nueva configuración IA"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Proveedor</label>
            <select
              className="w-full border rounded-md px-3 py-2 mt-1"
              value={form.provider || ""}
              onChange={(e) => setForm({ ...form, provider: e.target.value })}
            >
              <option value="">Seleccionar...</option>
              <option value="google">Google Gemini</option>
              <option value="openai">OpenAI GPT</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Modelo</label>
            <input
              type="text"
              placeholder="p. ej. gemini-2.5-flash"
              value={form.model || ""}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <input
              type="password"
              placeholder="sk-xxxx"
              value={form.api_key || ""}
              onChange={(e) => setForm({ ...form, api_key: e.target.value })}
              className="w-full border rounded-md px-3 py-2 mt-1"
            />
          </div>

          <div className="flex items-center">
            <input
              id="is_active"
              type="checkbox"
              checked={form.is_active || false}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
              Activa
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-semibold hover:bg-indigo-500"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
