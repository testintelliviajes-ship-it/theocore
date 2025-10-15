"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function CoreStatePage() {
  const [counts, setCounts] = useState({ brands:0, agencies:0, users:0 });
  const [health, setHealth] = useState<"OK"|"DOWN">("OK");

  useEffect(()=>{ (async ()=>{
    const { count: c1 } = await supabase.from("core_brands").select("*", { count:"exact", head:true });
    const { count: c2 } = await supabase.from("core_agencies").select("*", { count:"exact", head:true });
    const { count: c3 } = await supabase.from("core_agency_users").select("*", { count:"exact", head:true });
    setCounts({ brands: c1||0, agencies: c2||0, users: c3||0 });

    try {
      const res = await fetch("/api/health");
      setHealth(res.ok ? "OK":"DOWN");
    } catch { setHealth("DOWN"); }
  })(); }, []);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="p-6 rounded-xl bg-white shadow">
        <div className="text-slate-500 text-sm">Marcas</div>
        <div className="text-3xl font-bold">{counts.brands}</div>
      </div>
      <div className="p-6 rounded-xl bg-white shadow">
        <div className="text-slate-500 text-sm">Agencias</div>
        <div className="text-3xl font-bold">{counts.agencies}</div>
      </div>
      <div className="p-6 rounded-xl bg-white shadow">
        <div className="text-slate-500 text-sm">Usuarios vinculados</div>
        <div className="text-3xl font-bold">{counts.users}</div>
      </div>
      <div className="md:col-span-3 p-6 rounded-xl bg-white shadow">
        <div className="text-slate-500 text-sm">Salud del Core</div>
        <div className={`mt-1 inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${health==="OK"?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${health==="OK"?"bg-green-600":"bg-red-600"}`} />
          {health==="OK" ? "Operativo" : "Con incidencias"}
        </div>
      </div>
    </div>
  );
}
