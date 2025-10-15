ChatGPT Plus

Perfecto, Alfredo 👀 — eso confirma que Vercel sigue usando el layout original del template, no el que acabas de modificar.
O sea: el archivo app/layout.tsx que contiene las fuentes Geist todavía está allí (o Vercel no detectó el cambio).

Vamos a eliminar ese problema de raíz y de forma garantizada, paso a paso 👇

🧩 PASO 1 — Abre tu terminal en el proyecto
cd C:\theocore

🧩 PASO 2 — Abre el archivo app/layout.tsx

Bórralo por completo y reemplázalo por esto exacto:

// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Theo Core",
  description: "El núcleo del ecosistema IntelliViajes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 min-h-screen">
        {children}
      </body>
    </html>
  );
}