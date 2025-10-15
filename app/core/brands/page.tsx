"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

interface Brand {
  id: string;
  name: string;
  base_country: string;
  domain: string | null;
  color_scheme: string;
  status: string;
  logo_url: string | null;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<Partial<Brand>>({
    name: "",
    base_country: "",
    domain: "",
    color_scheme: "indigo",
    status: "Activo",
    logo_url: "",
  });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("core_brands")
        .select("id,name,base_country,domain,color_scheme,status,logo_url")
        .order("name");
      setBrands(data ?? []);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("core_brands").insert([
      {
        name: formData.name,
        base_country: formData.base_country,
        domain: formData.domain || null,
        color_scheme: formData.color_scheme || "indigo",
        status: formData.status || "Activo",
        logo_url: formData.logo_url || null,
      },
    ]);
    if (!error) {
      setFormVisible(false);
      setFormData({
        name: "",
        base_country: "",
        domain: "",
        color_scheme: "indigo",
        status: "Activo",
        logo_url: "",
      });
      const { data } = await supabase
        .from("core_brands")
        .select("id,name,base_country,domain,color_scheme,status,logo_url")
        .order("name");
      setBrands(data ?? []);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-700">Marcas</h2>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {formVisible ? "Cancelar" : "➕ Nueva Marca"}
        </button>
      </div>

      {formVisible && (
        <form onSubmit={handleSubmit} className="grid gap-4 mb-6 md:grid-cols-2 border p-4 rounded-lg bg-slate-50">
          <input className="p-2 border rounded" placeholder="Nombre" required
            value={formData.name||""} onChange={e=>setFormData({...formData, name:e.target.value})}/>
          <input className="p-2 border rounded" placeholder="País base" required
            value={formData.base_country||""} onChange={e=>setFormData({...formData, base_country:e.target.value})}/>
          <input className="p-2 border rounded" placeholder="Dominio"
            value={formData.domain||""} onChange={e=>setFormData({...formData, domain:e.target.value})}/>
          <input className="p-2 border rounded" placeholder="URL logo"
            value={formData.logo_url||""} onChange={e=>setFormData({...formData, logo_url:e.target.value})}/>
          <select className="p-2 border rounded" value={formData.color_scheme}
            onChange={e=>setFormData({...formData, color_scheme:e.target.value})}>
            {["indigo","blue","emerald","rose","amber"].map(c=><option key={c}>{c}</option>)}
          </select>
          <select className="p-2 border rounded" value={formData.status}
            onChange={e=>setFormData({...formData, status:e.target.value})}>
            {["Activo","Inactivo"].map(s=><option key={s}>{s}</option>)}
          </select>
          <button type="submit" className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg">
            Guardar Marca
          </button>
        </form>
      )}

      <table className="w-full text-sm text-left border">
        <thead className="bg-slate-100 border-b text-slate-600">
          <tr>
            <th className="py-2 px-3">Logo</th>
            <th>Nombre</th>
            <th>País</th>
            <th>Dominio</th>
            <th>Color</th>
            <th>Estado</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((b)=>(
            <tr key={b.id} className="border-b hover:bg-slate-50">
              <td className="py-2 px-3">{b.logo_url ? <img src={b.logo_url} alt={b.name} className="h-6"/> : <span className="text-slate-400 italic">—</span>}</td>
              <td className="font-medium">{b.name}</td>
              <td>{b.base_country}</td>
              <td>{b.domain||"—"}</td>
              <td>{b.color_scheme}</td>
              <td className={b.status==="Activo"?"text-green-600 font-semibold":"text-red-500 font-semibold"}>{b.status}</td>
              <td><Link href={`/core/brands/${b.id}`} className="text-indigo-600 hover:underline">Ver</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
