"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function NewBrandPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    country: "",
    language: "es",
    logo_url: "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMsg("Creando nueva marca...");

      const { data, error } = await supabase
        .from("core_brands")
        .insert([
          {
            name: form.name,
            country: form.country,
            language: form.language,
            logo_url: form.logo_url || null,
            status: "Activo",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMsg("✅ Marca creada correctamente");
      setTimeout(() => router.push(`/core/brands/${data.id}`), 1200);
    } catch (err: any) {
      setMsg(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">
        🌐 Nueva Marca
      </h2>

      {msg && (
        <div
          className={`p-3 rounded text-sm mb-4 ${
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

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-xl shadow">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Nombre de la marca</label>
          <input
            required
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">País</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Idioma principal</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
          >
            <option value="es">Español</option>
            <option value="en">Inglés</option>
            <option value="fr">Francés</option>
            <option value="pt">Portugués</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Logo (URL)</label>
          <input
            type="url"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="https://..."
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
          />
        </div>

        <div className="flex justify-end">
          <button
            disabled={loading}
            type="submit"
            className="bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition"
          >
            {loading ? "Creando..." : "Crear Marca"}
          </button>
        </div>
      </form>
    </div>
  );
}
