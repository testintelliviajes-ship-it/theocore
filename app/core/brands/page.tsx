"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

type BrandRow = {
  id: string;
  name: string;
  country: string | null;
  domain: string | null;
  language: string | null;
  status: "Activo" | "Inactivo";
  logo_url: string | null; // logo IA
  agency: {
    id: string;
    name: string;
    country: string | null;
    email: string | null;
    status: "Activo" | "Inactivo";
    logo_url: string | null; // logo corporativo
  } | null;
};

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      try {
        const { data, error } = await supabase.from("core_brands").select(`
            id,
            name,
            country,
            domain,
            language,
            status,
            logo_url,
            core_agencies (
              id,
              name,
              country,
              email,
              status,
              logo_url
            )
        `);
        if (error) throw error;

        if (mounted && data) {
          const mapped = data.map((b: any) => ({
            ...b,
            agency: b.core_agencies ? { ...b.core_agencies } : null,
          }));
          setBrands(mapped);
        }
      } catch (err: any) {
        console.error(err);
        setMsg(`❌ Error al cargar marcas: ${err.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleStatus = async (brand: BrandRow) => {
    const newStatus = brand.status === "Activo" ? "Inactivo" : "Activo";
    try {
      await supabase
        .from("core_brands")
        .update({ status: newStatus })
        .eq("id", brand.id);

      if (brand.agency) {
        await supabase
          .from("core_agencies")
          .update({ status: newStatus })
          .eq("id", brand.agency.id);
      }

      setMsg(
        newStatus === "Activo"
          ? `✅ Marca ${brand.name} reactivada.`
          : `⚠️ Marca ${brand.name} suspendida.`
      );
      setBrands((prev) =>
        prev.map((b) =>
          b.id === brand.id ? { ...b, status: newStatus } : b
        )
      );
    } catch (err: any) {
      setMsg(`❌ Error al cambiar estado: ${err.message}`);
    }
  };

  const deleteBrand = async (brand: BrandRow) => {
    const confirm1 = confirm(`¿Seguro que deseas eliminar "${brand.name}"?`);
    if (!confirm1) return;
    const confirm2 = confirm(
      `⚠️ Esto eliminará también su agencia y configuraciones. ¿Confirmas eliminación definitiva?`
    );
    if (!confirm2) return;

    try {
      const { error } = await supabase
        .from("core_brands")
        .delete()
        .eq("id", brand.id);
      if (error) throw error;

      setBrands((prev) => prev.filter((b) => b.id !== brand.id));
      setMsg(`🗑️ Marca ${brand.name} eliminada correctamente.`);
    } catch (err: any) {
      setMsg(`❌ Error al eliminar marca: ${err.message}`);
    }
  };

  if (loading) return <div className="p-6">Cargando marcas...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-slate-800">
          🌐 Marcas registradas
        </h2>
        <Link
          href="/core/brands/new"
          className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          + Nueva marca
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
              <th className="p-3">Marca</th>
              <th className="p-3">Agencia</th>
              <th className="p-3">País</th>
              <th className="p-3">Dominio</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr
                key={brand.id}
                className="border-b last:border-none hover:bg-slate-50 transition"
              >
                {/* Columna Marca */}
                <td className="p-3 flex items-center gap-3">
                  <img
                    src={brand.logo_url || "/placeholder-brand.png"}
                    alt="logo marca"
                    className="w-10 h-10 rounded-md border"
                  />
                  <div>
                    <div className="font-medium text-slate-800">
                      {brand.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {brand.language?.toUpperCase() || "ES"} ·{" "}
                      {brand.status === "Activo" ? "IA activa" : "IA detenida"}
                    </div>
                  </div>
                </td>

                {/* Columna Agencia */}
                <td className="p-3">
                  {brand.agency ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={brand.agency.logo_url || "/placeholder-agency.png"}
                        alt="logo agencia"
                        className="w-8 h-8 rounded-full border"
                      />
                      <div>
                        <div className="font-medium text-slate-800">
                          {brand.agency.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {brand.agency.country || "—"}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Sin agencia</span>
                  )}
                </td>

                {/* País */}
                <td className="p-3">{brand.country || "—"}</td>

                {/* Dominio */}
                <td className="p-3 text-slate-600">{brand.domain || "—"}</td>

                {/* Estado */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      brand.status === "Activo"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {brand.status}
                  </span>
                </td>

                {/* Acciones */}
                <td className="p-3 text-right space-x-2">
                  <Link
                    href={`/core/brands/${brand.id}`}
                    className="text-slate-700 hover:text-slate-900 font-medium"
                  >
                    Editar marca
                  </Link>

                  {brand.agency ? (
                    <Link
                      href={`/core/agencies/${brand.agency.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Editar agencia
                    </Link>
                  ) : (
                    <Link
                      href={`/core/agencies/new?brand=${brand.id}`}
                      className="text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                      Crear agencia
                    </Link>
                  )}

                  <button
                    onClick={() => toggleStatus(brand)}
                    className="text-amber-600 hover:text-amber-800 font-medium"
                  >
                    {brand.status === "Activo" ? "Suspender" : "Activar"}
                  </button>

                  <button
                    onClick={() => deleteBrand(brand)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-slate-400">
                  No hay marcas registradas todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
