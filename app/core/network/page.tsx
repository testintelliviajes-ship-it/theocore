"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

export default function NetworkPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Traemos todas las marcas con sus agencias relacionadas
        const { data, error } = await supabase
          .from("core_brands")
          .select(
            `
            id,
            name,
            country,
            logo_url,
            status,
            core_agencies ( id, name, country, logo_url, status )
          `
          )
          .order("name", { ascending: true });

        if (error) throw error;
        setBrands(data || []);
      } catch (err: any) {
        console.error(err);
        setMsg(`❌ Error al cargar red: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading)
    return <div className="p-6 text-slate-600">Cargando red de marcas...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-slate-800 mb-4">
        🌐 Red de Marcas y Agencias — Theo Core
      </h2>

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

      {brands.length === 0 ? (
        <div className="p-4 text-slate-500">No hay marcas registradas.</div>
      ) : (
        <div className="space-y-6">
          {brands.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow p-5 border border-slate-100"
            >
              {/* Marca principal */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={b.logo_url || "/placeholder-brand.png"}
                    alt="logo marca"
                    className="w-10 h-10 rounded-md border"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {b.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {b.country || "—"} · Estado:{" "}
                      <span
                        className={`${
                          b.status === "Activo"
                            ? "text-green-600"
                            : "text-amber-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </p>
                  </div>
                </div>
                <Link
                  href={`/core/brands/${b.id}`}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Editar →
                </Link>
              </div>

              {/* Agencias asociadas */}
              <div className="mt-4 pl-8 border-l-2 border-slate-200 space-y-2">
                {b.core_agencies?.length > 0 ? (
                  b.core_agencies.map((a: any) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between bg-slate-50 rounded-lg p-2 hover:bg-slate-100 transition"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={a.logo_url || "/placeholder-agency.png"}
                          alt="logo agencia"
                          className="w-8 h-8 rounded border"
                        />
                        <div>
                          <div className="font-medium text-slate-700">
                            {a.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {a.country || "—"} ·{" "}
                            <span
                              className={`${
                                a.status === "Activo"
                                  ? "text-green-600"
                                  : "text-amber-600"
                              }`}
                            >
                              {a.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/core/agencies/${a.id}`}
                        className="text-xs text-slate-600 hover:text-slate-900"
                      >
                        Ver →
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No hay agencias registradas.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
