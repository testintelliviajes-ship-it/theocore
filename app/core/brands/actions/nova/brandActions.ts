"use server";
import { supabase } from "@/app/lib/supabaseClient";

export async function getBrands() {
  const { data, error } = await supabase
    .from("core_brands")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveBrand(brand: any) {
  const { id, ...data } = brand;

  if (id) {
    const { data: updated, error } = await supabase
      .from("core_brands")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } else {
    const { data: inserted, error } = await supabase
      .from("core_brands")
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  }
}

export async function deleteBrand(id: string) {
  const { error } = await supabase.from("core_brands").delete().eq("id", id);
  if (error) throw error;
}
