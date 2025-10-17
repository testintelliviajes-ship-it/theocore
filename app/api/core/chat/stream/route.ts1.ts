import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { brand_id, prompt, messages } = body;

    // 🧩 1️⃣ Validaciones básicas
    if (!brand_id) {
      return NextResponse.json(
        { error: "brand_id es obligatorio" },
        { status: 400 }
      );
    }

    const finalPrompt =
      prompt ||
      (Array.isArray(messages)
        ? messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")
        : null);

    if (!finalPrompt) {
      return NextResponse.json(
        { error: "prompt o messages son obligatorios" },
        { status: 400 }
      );
    }

    // 🧠 2️⃣ Buscar configuración IA activa
    const { data: aiConfig, error: configError } = await supabase
      .from("core_ai_config")
      .select("*")
      .eq("brand_id", brand_id)
      .eq("is_active", true)
      .single();

    if (configError || !aiConfig) {
      console.error("❌ Configuración IA no encontrada:", configError);
      return NextResponse.json(
        { error: "Configuración IA no encontrada" },
        { status: 404 }
      );
    }

    // 🔍 3️⃣ Buscar modelo asociado
    const { data: model, error: modelError } = await supabase
      .from("core_ai_models")
      .select("*")
      .eq("id", aiConfig.model_id)
      .single();

    if (modelError || !model) {
      console.error("❌ Modelo no encontrado:", modelError);
      return NextResponse.json(
        { error: "Modelo IA no encontrado" },
        { status: 404 }
      );
    }

    const provider = aiConfig.provider?.toLowerCase();
    const apiKey =
      aiConfig.key_owner?.toLowerCase() === "theo core"
        ? process.env.GLOBAL_THEO_API_KEY
        : aiConfig.api_key;

    if (!apiKey) {
      console.error("❌ Sin API Key disponible para:", brand_id);
      return NextResponse.json(
        { error: "No hay API Key disponible para esta configuración" },
        { status: 400 }
      );
    }

    console.log(
      `🚀 Ejecutando IA (${provider}) → modelo: ${model.code}, brand: ${brand_id}`
    );

    // 🧮 4️⃣ Procesar según proveedor
    if (provider === "google") {
      const url = `https://generativelanguage.googleapis.com/v1/models/${model.code}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: finalPrompt }] }],
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("❌ Error en API Gemini:", json);
        throw new Error(json.error?.message || "Error en la API de Gemini");
      }

      const output =
        json?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";
      return NextResponse.json({ output });
    }

    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model.code,
          messages: [{ role: "user", content: finalPrompt }],
          temperature: 0.7,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("❌ Error en API OpenAI:", json);
        throw new Error(json.error?.message || "Error en la API de OpenAI");
      }

      const output = json.choices?.[0]?.message?.content || "Sin respuesta";
      return NextResponse.json({ output });
    }

    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model.code,
          max_tokens: 500,
          messages: [{ role: "user", content: finalPrompt }],
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        console.error("❌ Error en API Claude:", json);
        throw new Error(json.error?.message || "Error en la API de Claude");
      }

      const output = json.content?.[0]?.text || "Sin respuesta";
      return NextResponse.json({ output });
    }

    // 🚫 Proveedor desconocido
    return NextResponse.json(
      { error: `Proveedor no soportado: ${provider}` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("⚠️ Error en Theo Core Chat Stream:", error);
    return NextResponse.json(
      { error: "Error en Theo Core", details: error.message || error },
      { status: 500 }
    );
  }
}
