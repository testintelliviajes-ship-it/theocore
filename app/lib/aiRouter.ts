import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

/**
 * 🔮 aiRouter: enrutador dinámico multi-proveedor de Theo Core.
 * Soporta Gemini, OpenAI, Anthropic y cualquier modelo registrado en core_ai_models.
 */

interface AIRouterProps {
  provider: string; // "google", "openai", "anthropic", etc.
  model: string; // código del modelo (ej: gemini-2.5-flash, gpt-4o, claude-3-opus)
  apiKey: string;
  messages: { role: string; content: string }[];
}

export async function aiRouter({ provider, model, apiKey, messages }: AIRouterProps) {
  switch (provider) {
    // 🧠 GEMINI (Google)
    case "google": {
      const genAI = new GoogleGenerativeAI(apiKey);
      const gemini = genAI.getGenerativeModel({ model });

      const prompt =
        messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n") +
        "\nASSISTANT:";

      const result = await gemini.generateContentStream(prompt);
      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of result.stream) {
            const text = chunk?.text();
            if (text) controller.enqueue(text);
          }
          controller.close();
        },
      });
      return stream;
    }

    // 🤖 OPENAI (GPT-4o, GPT-4o-mini, etc.)
    case "openai": {
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model,
        messages,
        stream: true,
      });

      const stream = new ReadableStream({
        async start(controller) {
          for await (const chunk of completion) {
            const delta = chunk.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(delta);
          }
          controller.close();
        },
      });

      return stream;
    }

    // 🧬 ANTHROPIC (Claude)
    case "anthropic": {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      });

      if (!response.ok) throw new Error("Claude API error");

      const json = await response.json();
      const content = json?.content?.[0]?.text || "Sin respuesta";
      return new Response(content).body;
    }

    default:
      throw new Error(`Proveedor desconocido: ${provider}`);
  }
}
