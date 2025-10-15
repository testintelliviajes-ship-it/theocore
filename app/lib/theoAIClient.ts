import { supabase } from "./supabaseClient";

type Provider = "google" | "openai" | "anthropic";

export async function callTheoAI(brandId: string, prompt: string) {
  // 1️⃣ Cargar configuración de la IA desde Supabase
  const { data: aiConfig, error } = await supabase
    .from("core_ai_status")
    .select("*")
    .eq("brand_id", brandId)
    .single();

  if (error || !aiConfig) throw new Error("Configuración IA no encontrada");

  const provider: Provider = aiConfig.provider || "google";
  const model = aiConfig.api_model || process.env.GOOGLE_DEFAULT_MODEL;
  const temperature = aiConfig.temperature ?? 0.7;
  const apiKey =
    aiConfig.api_key ||
    (provider === "google"
      ? process.env.GOOGLE_API_KEY
      : provider === "openai"
      ? process.env.OPENAI_API_KEY
      : process.env.ANTHROPIC_API_KEY);

  const systemPrompt = `Eres ${aiConfig.personality}, hablas en ${aiConfig.language || "es"} y ayudas al usuario en sus planes de viaje.`;

  // 2️⃣ Enrutar según proveedor
  switch (provider) {
    case "google":
      return callGoogle(model, apiKey, systemPrompt, prompt, temperature);
    case "openai":
      return callOpenAI(model, apiKey, systemPrompt, prompt, temperature);
    case "anthropic":
      return callAnthropic(model, apiKey, systemPrompt, prompt, temperature);
    default:
      throw new Error("Proveedor IA no soportado");
  }
}

// === Implementaciones por proveedor ===

async function callGoogle(
  model: string,
  apiKey: string,
  system: string,
  userPrompt: string,
  temperature: number
) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${system}\n\n${userPrompt}` }] }],
        generationConfig: { temperature },
      }),
    }
  );
  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta IA.";
}

async function callOpenAI(
  model: string,
  apiKey: string,
  system: string,
  userPrompt: string,
  temperature: number
) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "Sin respuesta IA.";
}

async function callAnthropic(
  model: string,
  apiKey: string,
  system: string,
  userPrompt: string,
  temperature: number
) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      system,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data?.content?.[0]?.text || "Sin respuesta IA.";
}
