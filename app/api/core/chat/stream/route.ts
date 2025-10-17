import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { domain, prompt } = await req.json();

    if (!domain) throw new Error("Dominio obligatorio");
    if (!prompt) throw new Error("Prompt vacío");

    const { data: brand, error } = await supabase
      .from("core_brands")
      .select("*")
      .eq("domain", domain)
      .eq("is_active", true)
      .single();

    if (error || !brand) throw new Error("Configuración de marca no encontrada");

    const systemPrompt = brand.personality_prompt;
    const finalPrompt = `${systemPrompt}\n\nUsuario: ${prompt}`;

    if (brand.provider === "google") {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${brand.model_code}:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
      });
      const json = await res.json();
      const output =
        json?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta (Gemini)";
      return NextResponse.json({ output });
    }

    if (brand.provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: brand.model_code,
          messages: [{ role: "user", content: finalPrompt }],
          temperature: 0.7,
        }),
      });
      const json = await res.json();
      const output = json?.choices?.[0]?.message?.content || "Sin respuesta (GPT-5)";
      return NextResponse.json({ output });
    }

    throw new Error(`Proveedor no soportado: ${brand.provider}`);
  } catch (error: any) {
    console.error("⚠️ Error Theo Core Handler:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
