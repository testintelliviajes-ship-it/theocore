"use server";
import { supabase } from "@/app/lib/supabaseClient";

/** 🔹 Obtener configuraciones IA */
export async function getAIConfigs() {
  const { data, error } = await supabase
    .from("core_ai_config")
    .select("*, core_brands(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/** 🔹 Crear o actualizar IA */
export async function saveAIConfig(cfg: any) {
  const { id, core_brands, created_at, ...data } = cfg;

  if (id) {
    const { data: updated, error } = await supabase
      .from("core_ai_config")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  } else {
    const { data: inserted, error } = await supabase
      .from("core_ai_config")
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return inserted;
  }
}

/** 🔹 Eliminar configuración IA */
export async function deleteAIConfig(id: string) {
  const { error } = await supabase.from("core_ai_config").delete().eq("id", id);
  if (error) throw error;
}
