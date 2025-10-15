"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type Brand = {
  id: string;
  name: string;
  status: string;
  country: string | null;
  logo_url: string | null;
  created_at: string;
};

type Agency = {
  id: string;
  name: string;
  status: string;
  country: string | null;
  logo_url: string | null;
  created_at: string;
};

export default function CoreDashboard() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // Fetch marcas y agencias paralelamente
        const [brandsRes, agenciesRes] = await Promise.all([
          supabase
            .from("core_brands")
            .select("id, name, status, country, logo_url, created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("core_agencies")
            .select("id, name, status, country, logo_url, created_at")
            .order("created_at", { ascending: false }),
        ]);

        if (brandsRes.error) throw brandsRes.error;
        if (agenciesRes.error) throw agenciesRes.error;

        if (mounted) {
          setBrands(brandsRes.data || []);
          setAgencies(agenciesRes.data || []);
        }
      } catch (err: any) {
        console.error(err);
        setMsg(`❌ Error al cargar datos: ${err.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const activeBrands = brands.filter((b) => b.status === "Activo").length;
  const inactiveBrands = brands.filter((b) => b.status !== "Activo").length;
  const activeAgencies = agencies.filter((a) => a.status === "Activo").length;
  const inactiveAgencies = agencies.filter((a) => a.status !== "Activo").length;

  if (loading) return <div className="p-6">Cargando datos...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            🧠 Panel Theo Core
          </h1>
          <p className="text-slate-500 mt-1">
            Resumen general del ecosistema
          </p>
        </div>
      </div>

      {/* Mensaje */}
      {msg && (
        <div
          className={`p-3 rounded text-sm ${
            msg.startsWith("❌")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {msg}
        </div>
      )}

      {/* Totales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow text-center">
          <div className="text-4xl font-bold text-slate-900">{brands.length}</div>
          <div className="text-slate-500 text-sm mt-1">Marcas registradas</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow text-center">
          <div className="text-4xl font-bold text-emerald-700">
            {activeBrands}
          </div>
          <div className="text-slate-500 text-sm mt-1">Marcas activas</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow text-center">
          <div className="text-4xl font-bold text-slate-900">
            {agencies.length}
          </div>
          <div className="text-slate-500 text-sm mt-1">Agencias registradas</div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow text-center">
          <div className="text-4xl font-bold text-amber-700">
            {inactiveAgencies}
          </div>
          <div className="text-slate-500 text-sm mt-1">Agencias inactivas</div>
        </div>
      </div>

      {/* Últimas Marcas */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          🌐 Últimas marcas creadas
        </h2>
        <div className="bg-white rounded-xl shadow divide-y divide-slate-100">
          {brands.slice(0, 4).map((brand) => (
            <div
              key={brand.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={brand.logo_url || "/placeholder-brand.png"}
                  alt="logo brand"
                  className="w-10 h-10 rounded-md border"
                />
                <div>
                  <div className="font-medium text-slate-800">
                    {brand.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {brand.country || "—"} ·{" "}
                    {new Date(brand.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Link
                href={`/core/brands/${brand.id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Editar
              </Link>
            </div>
          ))}
          {brands.length === 0 && (
            <div className="p-4 text-slate-400 text-sm">
              No hay marcas registradas.
            </div>
          )}
        </div>
      </section>

      {/* Últimas Agencias */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          🏢 Últimas agencias creadas
        </h2>
        <div className="bg-white rounded-xl shadow divide-y divide-slate-100">
          {agencies.slice(0, 4).map((agency) => (
            <div
              key={agency.id}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <img
                  src={agency.logo_url || "/placeholder-agency.png"}
                  alt="logo agency"
                  className="w-10 h-10 rounded-full border"
                />
                <div>
                  <div className="font-medium text-slate-800">
                    {agency.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {agency.country || "—"} ·{" "}
                    {new Date(agency.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <Link
                href={`/core/agencies/${agency.id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Editar
              </Link>
            </div>
          ))}
          {agencies.length === 0 && (
            <div className="p-4 text-slate-400 text-sm">
              No hay agencias registradas.
            </div>
          )}
        </div>
      </section>

      {/* Próximamente IA */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          🧠 Estado de IA (Theo)
        </h2>
        <div className="bg-gradient-to-r from-indigo-50 to-sky-50 p-5 rounded-xl border border-slate-200">
          <p className="text-slate-600">
            Aquí se mostrarán las estadísticas de uso de IA: tokens,
            conversaciones, idiomas y rendimiento por marca.  
            <span className="block mt-1 text-slate-500 text-sm">
              (Integración prevista en la fase Theo Metrics)
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
