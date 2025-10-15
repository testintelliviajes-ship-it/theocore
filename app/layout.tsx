import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Theo Core",
  description: "El núcleo del ecosistema IntelliViajes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-800">
        {children}
      </body>
    </html>
  );
}