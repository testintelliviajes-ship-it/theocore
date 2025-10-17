// app/api/core/chat/stream/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, prompt, brand_id } = await req.json();

    // 🔹 Construimos el texto final (acepta prompt o messages)
    const finalPrompt =
      prompt ||
      (Array.isArray(messages)
        ? messages.map((m: any) => `${m.role}: ${m.content}`).join("\n")
        : "");

    if (!finalPrompt)
      return NextResponse.json(
        { error: "prompt o messages son obligatorios" },
        { status: 400 }
      );

    // 🔹 Usa la API key directamente desde .env.local

  const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey)
      return NextResponse.json(
        { error: "Falta GEMINI_API_KEY en el entorno" },
        { status: 500 }
      );

    // 🔹 Petición directa a Gemini 2.5-flash
    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Error Gemini:", data);
      return NextResponse.json(
        { error: data.error?.message || "Error en la API de Gemini" },
        { status: 500 }
      );
    }

    const output =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sin respuesta";

    return NextResponse.json({ output }, { status: 200 });
  } catch (error: any) {
    console.error("⚠️ Error general en /api/core/chat/stream:", error);
    return NextResponse.json(
      { error: error.message || "Error interno en Theo Core" },
      { status: 500 }
    );
  }
}
