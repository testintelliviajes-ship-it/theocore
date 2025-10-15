"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type Brand = {
  id: string;
  name: string;
  domain: string | null;
  country: string | null;
  language: string | null;
  currency: string | null;
  logo_url: string | null;
  color_scheme: string | null;
  ai_personality: string | null;
  status: "Activo" | "Inactivo";
  created_at: string;
};

type Agency = {
  id: string;
  brand_id: string;
  name: string;
  country: string | null;
  address: string | null;
  domain: string | null;
  currency: string | null;
  phone: string | null;
  email: string | null;
  api_key: string | null;
  status: "Activo" | "Inactivo";
  created_at: string;
};

type Settings = {
  id: string;
  agency_id: string;
  assistant_name: string | null;
  personality: string | null;
  main_language: string | null;
  model: string | null;
  temperature: number | null;
  api_key: string | null;
  created_at: string;
};

export default function BrandAgencyUnifiedPage() {
  const params = useParams() as { id: string };
  const [tab, setTab] = useState<"brand" | "ai" | "agency" | "state">("brand");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<null | "brand" | "ai" | "agency">(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [brand, setBrand] = useState<Brand | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  // Fetch combinado (brand -> agency -> settings)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setMsg(null);
      try {
        // 1) Brand
        const { data: b, error: e1 } = await supabase
          .from("core_brands")
          .select(
            "id,name,domain,country,language,currency,logo_url,color_scheme,ai_personality,status,created_at"
          )
          .eq("id", params.id)
          .single();
        if (e1) throw e1;

        // 2) Agency (1:1 por brand_id)
        const { data: a, error: e2 } = await supabase
          .from("core_agencies")
          .select(
            "id,brand_id,name,country,address,domain,currency,phone,email,api_key,status,created_at"
          )
          .eq("brand_id", b.id)
          .single();
        if (e2) throw e2;

        // 3) Settings (por agency_id)
        const { data: s, error: e3 } = await supabase
          .from("core_agency_settings")
          .select(
            "id,agency_id,assistant_name,personality,main_language,model,temperature,api_key,created_at"
          )
          .eq("agency_id", a.id)
          .single();
        if (e3) throw e3;

        if (!mounted) return;
        setBrand(b);
        setAgency(a);
        setSettings(s);
      } catch (err: any) {
        console.error(err);
        if (!mounted) return;
        setMsg(`❌ Error al cargar los datos: ${err.message}`);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  // Handlers de guardado por sección
  const saveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand) return;
    setSaving("brand");
    setMsg(null);
    try {
      const { error } = await supabase
        .from("core_brands")
        .update({
          name: brand.name,
          domain: brand.domain,
          country: brand.country,
          language: brand.language,
          currency: brand.currency,
          logo_url: brand.logo_url,
          color_scheme: brand.color_scheme,
          ai_personality: brand.ai_personality,
          status: brand.status,
        })
        .eq("id", brand.id);
      if (error) throw error;
      setMsg("✅ Marca actualizada correctamente.");
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  const saveAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !agency) return;
    setSaving("ai");
    setMsg(null);
    try {
      const { error } = await supabase
        .from("core_agency_settings")
        .update({
          assistant_name: settings.assistant_name,
          personality: settings.personality,
          main_language: settings.main_language,
          model: settings.model,
          temperature:
            typeof settings.temperature === "number"
              ? settings.temperature
              : 0.7,
          // Nota: api_key (IA) puede diferir de api_key operativa de agency; se deja editable si lo decides.
          api_key: settings.api_key,
        })
        .eq("agency_id", agency.id);
      if (error) throw error;
      setMsg("✅ Configuración de IA actualizada.");
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  const saveAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency) return;
    setSaving("agency");
    setMsg(null);
    try {
      const { error } = await supabase
        .from("core_agencies")
        .update({
          // brand_id es readonly por modelo 1:1
          name: agency.name,
          country: agency.country,
          address: agency.address,
          domain: agency.domain,
          currency: agency.currency,
          phone: agency.phone,
          email: agency.email,
          // api_key operativa (de Theo Core) puede ser readonly si prefieres
          api_key: agency.api_key,
          status: agency.status,
        })
        .eq("id", agency.id);
      if (error) throw error;
      setMsg("✅ Datos de la agencia guardados.");
    } catch (err: any) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setSaving(null);
    }
  };

  const health = useMemo<"OK" | "DOWN">(() => {
    // Heurística simple para "Estado / diagnóstico"
    if (!brand || !agency || !settings) return "DOWN";
    if (!brand.name || !agency.name || !settings.assistant_name) return "DOWN";
    return "OK";
  }, [brand, agency, settings]);

  if (loading) {
    return <div className="p-6">Cargando panel de marca/agencia…</div>;
  }

  if (!brand || !agency || !settings) {
    return (
      <div className="p-6">
        {msg || "No se pudieron cargar los datos de esta marca/agencia."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800">
            {brand.name}
          </h2>
          <p className="text-slate-500">
            Marca ↔ Agencia (1:1) · País base: {brand.country || "—"} · Dominio:{" "}
            {brand.domain || "—"}
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            health === "OK"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              health === "OK" ? "bg-green-600" : "bg-amber-600"
            }`}
          />
          {health === "OK" ? "Operativo" : "Revisar configuración"}
        </div>
      </div>

      {/* Mensajes */}
      {msg && (
        <div
          className={`p-3 rounded text-sm ${
            msg.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white p-2 rounded-xl shadow">
        <div className="flex gap-2 border-b">
          {[
            { key: "brand", label: "Identidad" },
            { key: "ai", label: "Asistente IA" },
            { key: "agency", label: "Datos físicos" },
            { key: "state", label: "Estado / diagnóstico" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                tab === t.key
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenido de tabs */}
        <div className="p-4">
          {tab === "brand" && (
            <form onSubmit={saveBrand} className="grid gap-4 md:grid-cols-2">
              <input
                className="p-2 border rounded"
                placeholder="Nombre de la marca"
                value={brand.name}
                onChange={(e) => setBrand({ ...brand, name: e.target.value })}
                required
              />
              <input
                className="p-2 border rounded"
                placeholder="País base"
                value={brand.country || ""}
                onChange={(e) => setBrand({ ...brand, country: e.target.value })}
              />
              <input
                className="p-2 border rounded"
                placeholder="Dominio"
                value={brand.domain || ""}
                onChange={(e) => setBrand({ ...brand, domain: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="p-2 border rounded"
                  placeholder="Idioma (es, en, fr)"
                  value={brand.language || ""}
                  onChange={(e) =>
                    setBrand({ ...brand, language: e.target.value })
                  }
                />
                <input
                  className="p-2 border rounded"
                  placeholder="Moneda (EUR, PEN...)"
                  value={brand.currency || ""}
                  onChange={(e) =>
                    setBrand({ ...brand, currency: e.target.value })
                  }
                />
              </div>
              <input
                className="p-2 border rounded"
                placeholder="URL del logo"
                value={brand.logo_url || ""}
                onChange={(e) =>
                  setBrand({ ...brand, logo_url: e.target.value })
                }
              />
              <select
                className="p-2 border rounded"
                value={brand.color_scheme || "indigo"}
                onChange={(e) =>
                  setBrand({ ...brand, color_scheme: e.target.value })
                }
              >
                {["indigo", "blue", "emerald", "rose", "amber"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <textarea
                className="p-2 border rounded md:col-span-2"
                placeholder="Personalidad IA base (descripción corta)"
                value={brand.ai_personality || ""}
                onChange={(e) =>
                  setBrand({ ...brand, ai_personality: e.target.value })
                }
              />
              <select
                className="p-2 border rounded"
                value={brand.status}
                onChange={(e) =>
                  setBrand({
                    ...brand,
                    status: e.target.value as Brand["status"],
                  })
                }
              >
                <option>Activo</option>
                <option>Inactivo</option>
              </select>

              <button
                type="submit"
                disabled={saving === "brand"}
                className="md:col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
              >
                {saving === "brand" ? "Guardando…" : "Guardar identidad"}
              </button>
            </form>
          )}

          {tab === "ai" && (
            <form onSubmit={saveAI} className="grid gap-4 md:grid-cols-2">
              <input
                className="p-2 border rounded"
                placeholder="Nombre del asistente"
                value={settings.assistant_name || ""}
                onChange={(e) =>
                  setSettings({ ...settings, assistant_name: e.target.value })
                }
              />
              <input
                className="p-2 border rounded"
                placeholder="Idioma principal (es, en, fr)"
                value={settings.main_language || brand.language || ""}
                onChange={(e) =>
                  setSettings({ ...settings, main_language: e.target.value })
                }
              />
              <input
                className="p-2 border rounded"
                placeholder="Modelo (gpt-5-turbo, ...)"
                value={settings.model || "gpt-5-turbo"}
                onChange={(e) =>
                  setSettings({ ...settings, model: e.target.value })
                }
              />
              <input
                className="p-2 border rounded"
                type="number"
                step="0.1"
                min={0}
                max={1}
                placeholder="Temperatura (0–1)"
                value={
                  typeof settings.temperature === "number"
                    ? settings.temperature
                    : 0.7
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    temperature: Number(e.target.value),
                  })
                }
              />
              <textarea
                className="p-2 border rounded md:col-span-2 h-24"
                placeholder="Personalidad / tono del asistente"
                value={settings.personality || brand.ai_personality || ""}
                onChange={(e) =>
                  setSettings({ ...settings, personality: e.target.value })
                }
              />
              <input
                className="p-2 border rounded md:col-span-2"
                type="password"
                placeholder="API Key IA (opcional, puede gestionarse desde Core)"
                value={settings.api_key || ""}
                onChange={(e) =>
                  setSettings({ ...settings, api_key: e.target.value })
                }
              />
              <button
                type="submit"
                disabled={saving === "ai"}
                className="md:col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
              >
                {saving === "ai" ? "Guardando…" : "Guardar IA"}
              </button>
            </form>
          )}

          {tab === "agency" && (
            <form onSubmit={saveAgency} className="grid gap-4 md:grid-cols-2">
              <div className="p-2 border rounded bg-slate-50">
                <div className="text-xs text-slate-500 mb-1">
                  Marca asociada (solo lectura)
                </div>
                <div className="font-medium">{brand.name}</div>
              </div>

              <input
                className="p-2 border rounded"
                placeholder="Nombre de la agencia"
                value={agency.name}
                onChange={(e) =>
                  setAgency({ ...agency, name: e.target.value })
                }
                required
              />
              <input
                className="p-2 border rounded"
                placeholder="País / región"
                value={agency.country || ""}
                onChange={(e) =>
                  setAgency({ ...agency, country: e.target.value })
                }
              />
              <input
                className="p-2 border rounded"
                placeholder="Ciudad / dirección"
                value={agency.address || ""}
                onChange={(e) =>
                  setAgency({ ...agency, address: e.target.value })
                }
              />
              <input
                className="p-2 border rounded"
                placeholder="Dominio operativo"
                value={agency.domain || ""}
                onChange={(e) =>
                  setAgency({ ...agency, domain: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="p-2 border rounded"
                  placeholder="Moneda(s)"
                  value={agency.currency || brand.currency || ""}
                  onChange={(e) =>
                    setAgency({ ...agency, currency: e.target.value })
                  }
                />
                <input
                  className="p-2 border rounded"
                  placeholder="Teléfono"
                  value={agency.phone || ""}
                  onChange={(e) =>
                    setAgency({ ...agency, phone: e.target.value })
                  }
                />
              </div>
              <input
                className="p-2 border rounded"
                type="email"
                placeholder="Email de contacto"
                value={agency.email || ""}
                onChange={(e) =>
                  setAgency({ ...agency, email: e.target.value })
                }
              />
              <input
                className="p-2 border rounded"
                type="password"
                placeholder="API Key operativa (readonly si la gestiona Core)"
                value={agency.api_key || ""}
                onChange={(e) =>
                  setAgency({ ...agency, api_key: e.target.value })
                }
              />
              <select
                className="p-2 border rounded"
                value={agency.status}
                onChange={(e) =>
                  setAgency({
                    ...agency,
                    status: e.target.value as Agency["status"],
                  })
                }
              >
                <option>Activo</option>
                <option>Inactivo</option>
              </select>

              <button
                type="submit"
                disabled={saving === "agency"}
                className="md:col-span-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
              >
                {saving === "agency" ? "Guardando…" : "Guardar datos físicos"}
              </button>
            </form>
          )}

          {tab === "state" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-xl border bg-slate-50">
                <div className="text-sm text-slate-500">Identidad</div>
                <div className="mt-1">
                  {brand.name} · {brand.country || "—"} · {brand.domain || "—"}
                </div>
                <div className="mt-2 text-sm">
                  Idioma: {brand.language || "—"} · Moneda:{" "}
                  {brand.currency || "—"}
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-slate-50">
                <div className="text-sm text-slate-500">IA</div>
                <div className="mt-1">
                  {settings.assistant_name || "Theo"} ({settings.model || "—"})
                </div>
                <div className="mt-2 text-sm">
                  Temperatura:{" "}
                  {typeof settings.temperature === "number"
                    ? settings.temperature
                    : 0.7}
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-slate-50">
                <div className="text-sm text-slate-500">Agencia</div>
                <div className="mt-1">
                  {agency.name} · {agency.country || "—"} ·{" "}
                  {agency.domain || "—"}
                </div>
                <div className="mt-2 text-sm">
                  Email: {agency.email || "—"} · Tel: {agency.phone || "—"}
                </div>
              </div>
              <div className="p-4 rounded-xl border bg-slate-50">
                <div className="text-sm text-slate-500">Estado</div>
                <div
                  className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    health === "OK"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      health === "OK" ? "bg-green-600" : "bg-amber-600"
                    }`}
                  />
                  {health === "OK" ? "Operativo" : "Revisar configuración"}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
