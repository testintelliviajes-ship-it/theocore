"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

interface Agency { id:string; name:string; country:string; domain:string; currency:string|null; address:string|null; type:string; status:string; brand_id:string; owner_id:string|null; }
interface Settings { assistant_name:string; personality:string; main_language:string; api_key:string|null; }
interface Brand { id:string; name:string; }

export default function AgencyDetailPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ (async ()=>{
    const { data: ag } = await supabase.from("core_agencies")
      .select("id,name,country,domain,currency,address,type,status,brand_id,owner_id")
      .eq("id", params.id).single();
    setAgency(ag ?? null);

    const { data: st } = await supabase.from("core_agency_settings")
      .select("assistant_name,personality,main_language,api_key")
      .eq("agency_id", params.id).single();
    setSettings(st ?? { assistant_name:"Theo", personality:"Profesional, empático y experto en viajes", main_language:"es", api_key:null });

    const { data: br } = await supabase.from("core_brands").select("id,name").order("name");
    setBrands(br ?? []);
  })(); }, [params.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency || !settings) return;
    setLoading(true); setMsg(null);
    try {
      const { error: e1 } = await supabase.from("core_agencies").update({
        name: agency.name, country: agency.country, domain: agency.domain,
        currency: agency.currency, address: agency.address, type: agency.type,
        status: agency.status, brand_id: agency.brand_id
      }).eq("id", agency.id);
      if (e1) throw e1;

      const { error: e2 } = await supabase.from("core_agency_settings").upsert({
        agency_id: agency.id,
        assistant_name: settings.assistant_name,
        personality: settings.personality,
        main_language: settings.main_language,
        api_key: settings.api_key
      }, { onConflict: "agency_id" });
      if (e2) throw e2;

      setMsg("✅ Cambios guardados");
    } catch (err:any) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const suggestSubenv = () => {
    if (!agency) return;
    const slug = agency.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
    const domain = agency.domain?.trim();
    const suggestion = domain ? `${slug}.${domain}` : `${slug}.theocore.app`;
    setAgency({...agency, domain: suggestion});
  };

  if (!agency || !settings) return <div className="p-6">Cargando agencia…</div>;

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Editar Agencia</h2>
        <button onClick={()=>router.push(`/core/brands/${agency.brand_id}`)} className="text-indigo-600 hover:underline">Volver a la marca</button>
      </div>

      {msg && <div className={`p-3 rounded text-sm ${msg.startsWith("✅")?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>{msg}</div>}

      <form onSubmit={save} className="grid gap-4 md:grid-cols-2">
        <select className="p-2 border rounded" value={agency.brand_id} onChange={e=>setAgency({...agency, brand_id:e.target.value})}>
          {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <input className="p-2 border rounded" placeholder="Nombre" value={agency.name} onChange={e=>setAgency({...agency, name:e.target.value})}/>
        <input className="p-2 border rounded" placeholder="País" value={agency.country} onChange={e=>setAgency({...agency, country:e.target.value})}/>
        <div className="flex gap-2">
          <input className="p-2 border rounded flex-1" placeholder="Dominio" value={agency.domain} onChange={e=>setAgency({...agency, domain:e.target.value})}/>
          <button type="button" onClick={suggestSubenv} className="px-3 rounded bg-slate-200 hover:bg-slate-300">Sugerir</button>
        </div>
        <input className="p-2 border rounded" placeholder="Moneda(s)" value={agency.currency||""} onChange={e=>setAgency({...agency, currency:e.target.value})}/>
        <input className="p-2 border rounded col-span-2" placeholder="Dirección" value={agency.address||""} onChange={e=>setAgency({...agency, address:e.target.value})}/>
        <select className="p-2 border rounded" value={agency.type} onChange={e=>setAgency({...agency, type:e.target.value})}>
          {["Partner","Sucursal","Franquicia"].map(t=><option key={t}>{t}</option>)}
        </select>
        <select className="p-2 border rounded" value={agency.status} onChange={e=>setAgency({...agency, status:e.target.value})}>
          {["Activo","En Configuración","Inactivo"].map(s=><option key={s}>{s}</option>)}
        </select>

        <div className="md:col-span-2 mt-4 p-4 border rounded-lg bg-slate-50">
          <h3 className="font-semibold mb-3">Asistente IA</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <input className="p-2 border rounded" placeholder="Nombre del asistente" value={settings.assistant_name} onChange={e=>setSettings({...settings, assistant_name:e.target.value})}/>
            <input className="p-2 border rounded" placeholder="Idioma principal (es, en, fr…)" value={settings.main_language} onChange={e=>setSettings({...settings, main_language:e.target.value})}/>
            <input className="p-2 border rounded md:col-span-2" placeholder="API Key (opcional)" type="password" value={settings.api_key||""} onChange={e=>setSettings({...settings, api_key:e.target.value})}/>
            <textarea className="p-2 border rounded md:col-span-2 h-24" placeholder="Personalidad" value={settings.personality} onChange={e=>setSettings({...settings, personality:e.target.value})}/>
          </div>
        </div>

        <button type="submit" disabled={loading} className="md:col-span-2 mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50">
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
