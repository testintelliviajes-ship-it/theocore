import { GoogleGenerativeAI } from "@google/generative-ai";

export async function aiRouter({
  messages,
  provider,
  model,
  brandId,
}: {
  messages: { role: string; content: string }[];
  provider: string;
  model: string;
  brandId?: string;
}) {
  switch (provider) {
    case "google": {
      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GOOGLE_API_KEY!
      );
      const gemini = genAI.getGenerativeModel({ model });

      // 🧠 Adaptador de roles
      const result = await gemini.generateContentStream({
        contents: messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      });

      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(new TextEncoder().encode(text));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    default:
      throw new Error(`Proveedor IA no soportado: ${provider}`);
  }
}
