import { supabase } from "../supabaseClient";

export async function callTheoAI(brandId: string, prompt: string) {
  // 1️⃣ Obtener configuración IA desde Supabase
  const { data: aiConfig } = await supabase
    .from("core_ai_status")
    .select("ai_provider, ai_model, api_key, temperature, personality, language")
    .eq("brand_id", brandId)
    .single();

  const provider = aiConfig?.ai_provider || process.env.AI_PROVIDER || "google";
  const model = aiConfig?.ai_model || process.env.AI_MODEL || "gemini-2.5-flash";
  const apiKey = aiConfig?.api_key || process.env.AI_API_KEY;
  const temperature = aiConfig?.temperature || Number(process.env.AI_TEMPERATURE || 0.7);
  const language = aiConfig?.language || process.env.AI_LANGUAGE || "es";
  const personality = aiConfig?.personality || "Asistente de viajes amable e inspirador";

  if (!apiKey) throw new Error("API key no configurada.");

  // 2️⃣ Llamada según proveedor
  switch (provider) {
    case "google": {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Eres ${personality}, hablas en ${language}. ${prompt}`,
                },
              ],
            },
          ],
          generationConfig: { temperature },
        }),
      });
      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Sin respuesta de Gemini.";
    }

    case "openai": {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature,
          messages: [
            { role: "system", content: `Eres ${personality}, hablas en ${language}` },
            { role: "user", content: prompt },
          ],
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content || "⚠️ Sin respuesta de OpenAI.";
    }

    case "anthropic": {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature,
          messages: [
            { role: "system", content: personality },
            { role: "user", content: prompt },
          ],
        }),
      });
      const data = await res.json();
      return data.content?.[0]?.text || "⚠️ Sin respuesta de Claude.";
    }

    default:
      throw new Error(`Proveedor IA desconocido: ${provider}`);
  }
}
