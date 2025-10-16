import { aiRouter } from "@/app/lib/aiRouter";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages, brandId, provider, model } = await req.json();

    // Selección dinámica del proveedor y modelo
    const stream = await aiRouter({
      messages,
      provider: provider || process.env.THEO_DEFAULT_PROVIDER || "google",
      model: model || process.env.THEO_DEFAULT_MODEL || "gemini-2.5-flash",
      brandId,
    });

    return stream;
  } catch (error: any) {
    console.error("Error en AI Router:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error desconocido" }),
      { status: 500 }
    );
  }
}
