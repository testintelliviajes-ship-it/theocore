"use client";
import { useEffect, useState } from "react";
import { saveAIConfig } from "../actions/aiActions";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config?: any;
  brands: any[];
  onSaved?: () => void;
}

export default function AIFormModal({ isOpen, onClose, config, brands, onSaved }: Props) {
  const [form, setForm] = useState({
    brand_id: "",
    provider: "google",
    model: "gemini-2.5-flash",
    api_key: "",
    temperature: 0.7,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (config) {
      setForm({
        brand_id: config.brand_id ?? "",
        provider: config.provider ?? "google",
        model: config.model ?? "gemini-2.5-flash",
        api_key: config.api_key ?? "",
        temperature:
          typeof config.temperature === "number" ? config.temperature : 0.7,
        is_active: config.is_active ?? true,
      });
    } else {
      setForm({
        brand_id: "",
        provider: "google",
        model: "gemini-2.5-flash",
        api_key: "",
        temperature: 0.7,
        is_active: true,
      });
    }
  }, [config, isOpen]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  }

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setLoading(true);
      try {
        const brandToSave = config ? { id: config.id, ...form } : form;
        await saveAIConfig(brandToSave);
        if (onSaved) await onSaved();   // 👈 aseguramos ejecución antes de cerrar
        onClose();
      } catch (err) {
        console.error("Error al guardar IA:", err);
        alert("Error al guardar configuración de IA");
      } finally {
        setLoading(false);
      }
    }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {config ? "Editar configuración IA" : "Nueva configuración IA"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <select
              name="brand_id"
              value={form.brand_id}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Selecciona una marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Proveedor + modelo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor</label>
              <select
                name="provider"
                value={form.provider}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="google">Gemini</option>
                <option value="openai">OpenAI</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
              <input
                type="text"
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="gemini-2.5-flash"
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input
              type="text"
              name="api_key"
              value={form.api_key}
              onChange={handleChange}
              placeholder="sk-..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>

          {/* Estado */}
          <div className="flex items-center gap-3">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
                className="mr-2"
              />
              Activa
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
