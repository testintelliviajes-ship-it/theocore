"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabaseClient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  brand?: any | null;
}

export default function BrandFormModal({ isOpen, onClose, onSaved, brand }: Props) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("es");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (brand) {
      setName(brand.name || "");
      setCountry(brand.country || "");
      setLanguage(brand.language || "es");
      setIsActive(brand.is_active ?? true);
    } else {
      setName("");
      setCountry("");
      setLanguage("es");
      setIsActive(true);
    }
  }, [brand]);

  async function handleSave() {
    if (!name.trim()) {
      alert("El nombre de la marca es obligatorio.");
      return;
    }

    setLoading(true);

    const payload = {
      name,
      country,
      language,
      is_active: isActive,
    };

    const { error } = brand
      ? await supabase.from("core_brands").update(payload).eq("id", brand.id)
      : await supabase.from("core_brands").insert([payload]);

    setLoading(false);

    if (error) {
      alert("Error al guardar la marca: " + error.message);
      return;
    }

    onSaved();
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {brand ? "Editar marca" : "Nueva marca"}
        </h2>

        {/* Nombre */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            placeholder="Ej: IVI Spain"
          />
        </div>

        {/* País */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            País
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            placeholder="Ej: España"
          />
        </div>

        {/* Idioma */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Idioma
          </label>
          <div className="flex gap-2 flex-wrap">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={language.includes("es")}
                onChange={() => setLanguage("es")}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Español
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={language.includes("en")}
                onChange={() => setLanguage("en")}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Inglés
            </label>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={language.includes("pt")}
                onChange={() => setLanguage("pt")}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              Portugués
            </label>
          </div>
        </div>

        {/* Estado */}
        <div className="mb-6">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            Activa
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
