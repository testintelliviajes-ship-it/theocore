"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { getAIConfigs, deleteAIConfig } from "./actions/aiActions";
import AIFormModal from "./components/AIFormModal";
import AITestModal from "./components/AITestModal";

export default function AISettingsPage() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [brandName, setBrandName] = useState<string>("");

  async function loadData(brandParam?: string) {
    const { data: allBrands } = await supabase.from("core_brands").select("*");
    const data = await getAIConfigs();

    // Filtro si venimos desde /core/settings/ai?brand=...
    if (brandParam) {
      const filtered = data.filter((cfg) => cfg.brand_id === brandParam);
      const brand = allBrands?.find((b) => b.id === brandParam);
      setBrandName(brand?.name || "");
      setBrands(allBrands || []);
      setConfigs(filtered || []);
    } else {
      setBrands(allBrands || []);
      setConfigs(data || []);
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const brandParam = urlParams.get("brand");
    setBrandFilter(brandParam);
    loadData(brandParam || undefined);
  }, []);

  async function handleDelete(id: string) {
    if (confirm("¿Eliminar configuración?")) {
      await deleteAIConfig(id);
      loadData(brandFilter || undefined);
    }
  }

  return (
    <div className="p-6">
      {/* 🧠 Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Configuración de IA
          {brandName && (
            <span className="text-indigo-600 text-lg ml-2">— {brandName}</span>
          )}
        </h1>

        <button
          onClick={() => {
            setSelected(null);
            setShowForm(true);
          }}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          + Nueva IA
        </button>
      </div>

      {/* 🧩 Lista de configuraciones */}
      {configs.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No hay configuraciones IA registradas para esta marca.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {configs.map((cfg) => (
            <div
              key={cfg.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition p-5"
            >
              <h2 className="text-lg font-semibold text-gray-900">
                {cfg.core_brands?.name || brandName || "Theo Core"}
              </h2>
              <p className="text-sm text-gray-600">
                <strong>Proveedor:</strong>{" "}
                {cfg.provider === "google" ? "Gemini" : "OpenAI"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Modelo:</strong> {cfg.model}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Estado:</strong>{" "}
                {cfg.is_active ? (
                  <span className="text-green-600 font-medium">Activa</span>
                ) : (
                  <span className="text-red-500 font-medium">Inactiva</span>
                )}
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setSelected(cfg);
                    setShowTest(true);
                  }}
                  className="rounded-md bg-blue-100 text-blue-700 px-3 py-1.5 text-sm font-medium hover:bg-blue-200"
                >
                  Probar IA
                </button>
                <button
                  onClick={() => {
                    setSelected(cfg);
                    setShowForm(true);
                  }}
                  className="rounded-md bg-gray-100 text-gray-700 px-3 py-1.5 text-sm font-medium hover:bg-gray-200"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cfg.id)}
                  className="rounded-md bg-red-50 text-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-100"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🪄 Modales */}
      {showForm && (
        <AIFormModal
          key={selected?.id ?? "new"}
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          config={selected}
          brands={brands}
          onSaved={() => loadData(brandFilter || undefined)}
        />
      )}

      {showTest && selected && (
        <AITestModal
          key={`test-${selected.id}`}
          config={selected}
          onClose={() => setShowTest(false)}
        />
      )}
    </div>
  );
}
