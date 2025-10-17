"use server";

import { supabaseServer as supabase } from "@/app/lib/supabaseServer";

/**
 * 💾 Guarda o actualiza la configuración IA de una marca
 */
export async function saveAIConfig(config: {
  brand_id: string;
  provider: string;
  model_id: string;
  api_key?: string | null;
  key_owner: string;
  domain?: string | null;
  personality: string | null;
  max_tokens?: number;
  is_active?: boolean;
}) {
  try {
    if (!config.brand_id || !config.provider || !config.model_id) {
      throw new Error("Faltan campos obligatorios: brand_id, provider o model_id");
    }

    const { data, error } = await supabase
      .from("core_ai_config")
      .upsert(
        {
          brand_id: config.brand_id,
          provider: config.provider,
          model_id: config.model_id,
          api_key: config.api_key || null,
          key_owner: config.key_owner,
          domain: config.domain || null,
          personality: config.personality || null,
          max_tokens: config.max_tokens || 500,
          is_active: config.is_active ?? true,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "brand_id",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err: any) {
    console.error("Error al guardar configuración IA:", err);
    throw new Error(err.message || "Error al guardar configuración IA");
  }
}

/**
 * 🔍 Listar configuraciones IA
 */
export async function getAIConfigs() {
  const { data, error } = await supabase.from("core_ai_config").select("*");
  if (error) throw error;
  return data;
}

/**
 * 🗑️ Eliminar configuración IA
 */
export async function deleteAIConfig(id: string) {
  const { error } = await supabase.from("core_ai_config").delete().eq("id", id);
  if (error) throw error;
  return true;
}
