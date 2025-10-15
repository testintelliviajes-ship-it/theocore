"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

interface Brand { id:string; name:string; base_country:string; domain:string|null; status:string; color_scheme:string; }
interface Agency { id:string; name:string; country:string; domain:string; status:string; type:string; main_language?:string; }

export default function BrandDetailPage() {
  const params = useParams() as { id: string };
  const [brand, setBrand] = useState<Brand| null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  useEffect(() => {
    (async () => {
      const { data: brandData } = await supabase
        .from("core_brands")
        .select("id,name,base_country,domain,status,color_scheme")
        .eq("id", params.id)
        .single();
      setBrand(brandData ?? null);

      const { data: ag } = await supabase
        .from("core_agencies")
        .select("id,name,country,domain,status,type")
        .eq("brand_id", params.id)
        .order("name");
      setAgencies(ag ?? []);
    })();
  }, [params.id]);

  const metrics = useMemo(() => {
    const total = agencies.length;
    const byStatus = {
      activo: agencies.filter(a=>a.status==="Activo").length,
      conf: agencies.filter(a=>a.status==="En Configuración").length,
      inactivo: agencies.filter(a=>a.status==="Inactivo").length,
    };
    const countries = new Set(agencies.map(a=>a.country)).size;
    return { total, byStatus, countries };
  }, [agencies]);

  const filtered = useMemo(() => {
    if (filterStatus==="All") return agencies;
    return agencies.filter(a=>a.status===filterStatus);
  }, [agencies, filterStatus]);

  if (!brand) return <div className="p-6">Cargando marca…</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold text-slate-800">{brand.name}</h2>
        <p className="text-slate-500">País base: {brand.base_country} · Dominio: {brand.domain||"—"}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="text-sm text-slate-500">Agencias totales</div>
            <div className="text-2xl font-bold">{metrics.total}</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="text-sm text-slate-500">Países</div>
            <div className="text-2xl font-bold">{metrics.countries}</div>
          </div>
          <div className="p-4 rounded-lg bg-slate-50">
            <div className="text-sm text-slate-500">Activas</div>
            <div className="text-2xl font-bold text-green-600">{metrics.byStatus.activo}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Agencias</h3>
          <select className="p-2 border rounded" value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}>
            <option value="All">Todas</option>
            <option value="Activo">Activas</option>
            <option value="En Configuración">En Configuración</option>
            <option value="Inactivo">Inactivas</option>
          </select>
        </div>
        <table className="w-full text-sm text-left border">
          <thead className="bg-slate-100 border-b text-slate-600">
            <tr>
              <th className="py-2 px-3">Nombre</th>
              <th>País</th>
              <th>Dominio</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a=>(
              <tr key={a.id} className="border-b hover:bg-slate-50">
                <td className="py-2 px-3 font-medium">{a.name}</td>
                <td>{a.country}</td>
                <td>{a.domain}</td>
                <td>{a.type}</td>
                <td className={a.status==="Activo"?"text-green-600 font-semibold": a.status==="Inactivo"?"text-red-500 font-semibold":"text-amber-600 font-semibold"}>{a.status}</td>
                <td><a href={`/core/agencies/${a.id}`} className="text-indigo-600 hover:underline">Abrir</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
