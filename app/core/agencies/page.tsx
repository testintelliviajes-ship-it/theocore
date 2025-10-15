"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type AgencyRow = {
  id: string;
  name: string;
  country: string | null;
  domain: string | null;
  email: string | null;
  phone: string | null;
  currency: string | null;
  status: "Activo" | "Inactivo";
  logo_url: string | null; // logo corporativo
  brand: {
    id: string;
    name: string;
    domain: string | null;
    country: string | null;
    status: "Activo" | "Inactivo";
    logo_url: string | null; // logo de IA
  } | null;
};

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<AgencyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      try {
        const { data, error } = await supabase.from("core_agencies").select(`
          id,
          name,
          country,
          domain,
          email,
          phone,
          currency,
          status,
          logo_url,
          core_brands (
            id,
            name,
            domain,
            country,
            status,
            logo_url
          )
        `);
        if (error) throw error;

        if (mounted && data) {
          const mapped = data.map((a: any) => ({
            ...a,
            brand: a.core_brands ? { ...a.core_brands } : null,
          }));
          setAgencies(mapped);
        }
      } catch (err: any) {
        console.error(err);
        setMsg(`❌ Error al cargar agencias: ${err.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleStatus = async (agency: AgencyRow) => {
    const newStatus = agency.status === "Activo" ? "Inactivo" : "Activo";
    try {
      await supabase
        .from("core_agencies")
        .update({ status: newStatus })
        .eq("id", agency.id);

      if (agency.brand) {
        await supabase
          .from("core_brands")
          .update({ status: newStatus })
          .eq("id", agency.brand.id);
      }

      setMsg(
        newStatus === "Activo"
          ? `✅ Agencia ${agency.name} reactivada.`
          : `⚠️ Agencia ${agency.name} suspendida.`
      );
      setAgencies((prev) =>
        prev.map((a) =>
          a.id === agency.id ? { ...a, status: newStatus } : a
        )
      );
    } catch (err: any) {
      setMsg(`❌ Error al cambiar estado: ${err.message}`);
    }
  };

  const deleteAgency = async (agency: AgencyRow) => {
    const confirm1 = confirm(`¿Seguro que deseas eliminar "${agency.name}"?`);
    if (!confirm1) return;
    const confirm2 = confirm(
      `⚠️ Esto eliminará también su configuración IA y vínculo de marca. ¿Confirmas eliminación definitiva?`
    );
    if (!confirm2) return;

    try {
      const { error } = await supabase
        .from("core_agencies")
        .delete()
        .eq("id", agency.id);
      if (error) throw error;

      setAgencies((prev) => prev.filter((a) => a.id !== agency.id));
      setMsg(`🗑️ Agencia ${agency.name} eliminada correctamente.`);
    } catch (err: any) {
      setMsg(`❌ Error al eliminar agencia: ${err.message}`);
    }
  };

  if (loading) return <div className="p-6">Cargando agencias...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">
          🏢 Agencias operativas
        </h2>
        <Link
          href="/core/agencies/new"
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          + Nueva agencia
        </Link>
      </div>

      {msg && (
        <div
          className={`p-3 rounded text-sm ${
            msg.startsWith("✅") || msg.startsWith("🗑️")
              ? "bg-green-100 text-green-700"
              : msg.startsWith("⚠️")
              ? "bg-amber-100 text-amber-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {msg}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 text-left">
            <tr>
              <th className="p-3">Agencia</th>
              <th className="p-3">Marca asociada</th>
              <th className="p-3">País</th>
              <th className="p-3">Dominio</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {agencies.map((agency) => (
              <tr
                key={agency.id}
                className="border-b last:border-none hover:bg-slate-50 transition"
              >
                {/* Columna Agencia */}
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={agency.logo_url || "/placeholder-agency.png"}
                    alt="logo agencia"
                    className="w-10 h-10 rounded-md border"
                  />
                  <div>
                    <div className="font-medium text-slate-800">
                      {agency.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {agency.currency || "—"} ·{" "}
                      {agency.status === "Activo"
                        ? "Operativa"
                        : "Suspendida"}
                    </div>
                  </div>
                </td>

                {/* Columna Marca */}
                <td className="p-3">
                  {agency.brand ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={agency.brand.logo_url || "/placeholder-brand.png"}
                        alt="logo marca"
                        className="w-8 h-8 rounded-full border"
                      />
                      <div>
                        <div className="font-medium text-slate-800">
                          {agency.brand.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {agency.brand.country || "—"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">
                      Sin marca asociada
                    </span>
                  )}
                </td>

                {/* País */}
                <td className="p-3">{agency.country || "—"}</td>

                {/* Dominio */}
                <td className="p-3 text-slate-600">{agency.domain || "—"}</td>

                {/* Estado */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agency.status === "Activo"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {agency.status}
                  </span>
                </td>

                {/* Acciones */}
                <td className="p-3 text-right space-x-2">
                  <Link
                    href={`/core/agencies/${agency.id}`}
                    className="text-slate-700 hover:text-slate-900 font-medium"
                  >
                    Editar agencia
                  </Link>

                  {agency.brand ? (
                    <Link
                      href={`/core/brands/${agency.brand.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Ver marca
                    </Link>
                  ) : (
                    <Link
                      href={`/core/brands/new?agency=${agency.id}`}
                      className="text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                      Crear marca
                    </Link>
                  )}

                  <button
                    onClick={() => toggleStatus(agency)}
                    className="text-amber-600 hover:text-amber-800 font-medium"
                  >
                    {agency.status === "Activo" ? "Suspender" : "Activar"}
                  </button>

                  <button
                    onClick={() => deleteAgency(agency)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {agencies.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  No hay agencias registradas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
