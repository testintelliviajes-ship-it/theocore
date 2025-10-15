"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

type AIStatusRow = {
  id: string;
  assistant_name: string;
  model: string;
  language: string;
  status: "Activo" | "Inactivo" | "Pausado";
  tokens_used: number;
  tokens_last_24h: number;
  updated_at: string;
  brand: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
};

export default function TheoAIStatusPage() {
  const [records, setRecords] = useState<AIStatusRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchAIStatus = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("core_ai_status")
          .select(
            `
            id,
            assistant_name,
            model,
            language,
            status,
            tokens_used,
            tokens_last_24h,
            updated_at,
            core_brands (
              id,
              name,
              logo_url
            )
          `
          )
          .order("updated_at", { ascending: false });

        if (error) throw error;

        const mapped = data.map((a: any) => ({
          ...a,
          brand: a.core_brands ? { ...a.core_brands } : null,
        }));

        setRecords(mapped);
      } catch (err: any) {
        setMsg(`❌ Error al obtener estado IA: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAIStatus();
  }, []);

  const toggleStatus = async (id: string, current: string) => {
    const newStatus =
      current === "Activo" ? "Pausado" : current === "Pausado" ? "Activo" : "Activo";
    try {
      await supabase
        .from("core_ai_status")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", id);
      setRecords((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus } : r
        )
      );
      setMsg(`⚙️ Estado de IA actualizado a ${newStatus}`);
    } catch (err: any) {
      setMsg(`❌ Error al actualizar estado: ${err.message}`);
    }
  };

  if (loading) return <div className="p-6">Cargando estado de Theo IA...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">
          🤖 Estado de las IAs (Theo Core)
        </h2>
      </div>

      {msg && (
        <div
          className={`p-3 rounded text-sm ${
            msg.startsWith("❌")
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 text-left">
            <tr>
              <th className="p-3">Marca</th>
              <th className="p-3">Asistente</th>
              <th className="p-3">Modelo</th>
              <th className="p-3">Idioma</th>
              <th className="p-3">Tokens totales</th>
              <th className="p-3">Últimas 24h</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr
                key={r.id}
                className="border-b last:border-none hover:bg-slate-50 transition"
              >
                {/* Marca */}
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={r.brand?.logo_url || "/placeholder-brand.png"}
                    alt="logo"
                    className="w-8 h-8 rounded-md border"
                  />
                  <div>
                    <div className="font-medium text-slate-800">
                      {r.brand?.name || "Sin marca"}
                    </div>
                  </div>
                </td>

                {/* Asistente */}
                <td className="p-3">{r.assistant_name}</td>

                {/* Modelo */}
                <td className="p-3">{r.model}</td>

                {/* Idioma */}
                <td className="p-3 uppercase">{r.language}</td>

                {/* Tokens totales */}
                <td className="p-3 text-slate-600">
                  {r.tokens_used.toLocaleString()}
                </td>

                {/* Tokens últimas 24h */}
                <td className="p-3 text-slate-600">
                  {r.tokens_last_24h.toLocaleString()}
                </td>

                {/* Estado */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === "Activo"
                        ? "bg-green-100 text-green-700"
                        : r.status === "Pausado"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>

                {/* Acciones */}
                <td className="p-3 text-right">
                  <button
                    onClick={() => toggleStatus(r.id, r.status)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {r.status === "Activo"
                      ? "Pausar"
                      : r.status === "Pausado"
                      ? "Reanudar"
                      : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-400">
                  No hay IAs registradas aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
