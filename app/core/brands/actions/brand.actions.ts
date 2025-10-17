"use server";
import { supabaseServer as supabase } from "@/app/lib/supabaseServer";


/** 🔹 Obtener marcas */
export async function getBrands() {
  const { data, error } = await supabase
    .from("core_brands")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

/** 🔹 Crear o actualizar marca */
export async function saveBrand(brand: any) {
  if (brand.id) {
    const { data, error } = await supabase
      .from("core_brands")
      .update(brand)
      .eq("id", brand.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("core_brands")
      .insert([brand])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

/** 🔹 Eliminar marca */
export async function deleteBrand(id: string) {
  const { error } = await supabase.from("core_brands").delete().eq("id", id);
  if (error) throw error;
}
