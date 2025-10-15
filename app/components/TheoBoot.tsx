"use client";

import { useEffect, useState } from "react";

export default function TheoBoot({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2500); // 2.5 segundos
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white text-center transition-all">
        <h1 className="text-3xl font-semibold animate-pulse tracking-wide">
          🧠 Encendiendo sistemas...
        </h1>
        <p className="mt-4 text-slate-400">Inicializando núcleo Theo Core</p>
      </main>
    );
  }

  return <>{children}</>;
}
