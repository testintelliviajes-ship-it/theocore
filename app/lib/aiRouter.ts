import { supabase } from "./supabaseClient";

// Función universal
export async function callTheoAI(brandId: string, prompt: string) {
  // 1️⃣ Obtener configuración IA desde Supabase
  const { data: config, error } = await supabase
    .from("core_ai_status")
    .select("provider, model, temperature, max_output_tokens, personality, language, api_key")
    .eq("brand_id", brandId)
    .single();

  if (error || !config) throw new Error("Configuración IA no encontrada");

  const provider = config.provider || "google";
  const apiKey = config.api_key || getDefaultKey(provider);

  switch (provider) {
    case "google":
      return await callGemini(apiKey, config, prompt);
    case "openai":
      return await callOpenAI(apiKey, config, prompt);
    case "anthropic":
      return await callClaude(apiKey, config, prompt);
    default:
      throw new Error(`Proveedor IA desconocido: ${provider}`);
  }
}

function getDefaultKey(provider: string) {
  switch (provider) {
    case "google":
      return process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    case "openai":
      return process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    case "anthropic":
      return process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
    default:
      return "";
  }
}

// 🟢 Google Gemini
async function callGemini(apiKey: string, cfg: any, prompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${cfg.personality}\n\nUsuario: ${prompt}` }] }],
        generationConfig: {
          temperature: cfg.temperature,
          maxOutputTokens: cfg.max_output_tokens || 2048,
        },
      }),
    }
  );
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Sin respuesta (Gemini)";
}

// 🔵 OpenAI
async function callOpenAI(apiKey: string, cfg: any, prompt: string) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: cfg.temperature,
      messages: [
        { role: "system", content: cfg.personality },
        { role: "user", content: prompt },
      ],
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "⚠️ Sin respuesta (OpenAI)";
}

// 🟣 Anthropic
async function callClaude(apiKey: string, cfg: any, prompt: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: cfg.temperature,
      max_tokens: cfg.max_output_tokens || 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "⚠️ Sin respuesta (Claude)";
}
