"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";

const aiModels = [
  { label: "Gemini 2.5 Flash (Google)", value: "gemini-2.5-flash", provider: "google" },
  { label: "GPT-5 Turbo (OpenAI)", value: "gpt-5-turbo", provider: "openai" },
];

export default function BrandModal({ open, onClose, brand, reload }: any) {
  const [form, setForm] = useState({
    brand_name: "",
    domain: "",
    provider: "google",
    model_code: "gemini-2.5-flash",
    personality_prompt: "",
    language: "es",
    country: "ES",
    timezone: "Europe/Madrid",
  });

  useEffect(() => {
    if (brand) setForm(brand);
  }, [brand]);

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { error } = brand
      ? await supabase.from("core_brands").update(form).eq("id", brand.id)
      : await supabase.from("core_brands").insert(form);

    if (error) alert(error.message);
    else {
      onClose();
      reload();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-neutral-900 rounded-2xl p-6 w-full max-w-lg shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-xl font-bold mb-4">
              {brand ? "Editar Marca" : "Nueva Marca"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Nombre de la Marca</label>
                <input
                  name="brand_name"
                  value={form.brand_name}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md bg-neutral-50 dark:bg-neutral-800"
                  placeholder="Ej: Waiki Perú"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Dominio</label>
                <input
                  name="domain"
                  value={form.domain}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md bg-neutral-50 dark:bg-neutral-800"
                  placeholder="waiki.pe"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">Modelo IA</label>
                <select
                  name="model_code"
                  value={form.model_code}
                  onChange={(e) => {
                    const selected = aiModels.find((m) => m.value === e.target.value);
                    setForm({
                      ...form,
                      model_code: selected?.value || "",
                      provider: selected?.provider || "google",
                    });
                  }}
                  className="w-full mt-1 p-2 border rounded-md bg-neutral-50 dark:bg-neutral-800"
                >
                  {aiModels.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">Personalidad del Asistente</label>
                <textarea
                  name="personality_prompt"
                  value={form.personality_prompt}
                  onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded-md bg-neutral-50 dark:bg-neutral-800"
                  rows={4}
                  placeholder="Ej: Eres Waiki, un guía turístico alegre que ayuda a planificar aventuras..."
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm font-semibold">Idioma</label>
                  <input
                    name="language"
                    value={form.language}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-md bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">País</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-md bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Zona</label>
                  <input
                    name="timezone"
                    value={form.timezone}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded-md bg-neutral-50 dark:bg-neutral-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  {brand ? "💾 Actualizar" : "➕ Crear"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
