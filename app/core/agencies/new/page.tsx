"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function NewAgencyPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "",
    country: "",
    brand_id: "",
    logo_url: "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBrands = async () => {
      const { data } = await supabase.from("core_brands").select("id, name");
      setBrands(data || []);
    };
    loadBrands();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMsg("Creando nueva agencia...");

      const { data, error } = await supabase
        .from("core_agencies")
        .insert([
          {
            name: form.name,
            country: form.country,
            brand_id: form.brand_id,
            logo_url: form.logo_url || null,
            status: "Activo",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMsg("✅ Agencia creada correctamente");
      setTimeout(() => router.push(`/core/agencies/${data.id}`), 1200);
    } catch (err: any) {
      setMsg(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">
        🏢 Nueva Agencia
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
          <label className="block text-sm text-slate-600 mb-1">Nombre de la agencia</label>
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
          <label className="block text-sm text-slate-600 mb-1">Marca vinculada</label>
          <select
            required
            className="w-full border rounded-lg px-3 py-2"
            value={form.brand_id}
            onChange={(e) => setForm({ ...form, brand_id: e.target.value })}
          >
            <option value="">Seleccionar marca</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
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
            {loading ? "Creando..." : "Crear Agencia"}
          </button>
        </div>
      </form>
    </div>
  );
}
