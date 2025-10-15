import "./globals.css";
import type { Metadata } from "next";
import TheoBoot from "./components/TheoBoot";

export const metadata: Metadata = {
  title: "Theo Core",
  description: "El núcleo del ecosistema IntelliViajes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800 min-h-screen transition-all">
        <TheoBoot>{children}</TheoBoot>
      </body>
    </html>
  );
}
