"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [ecoOpen, setEcoOpen] = useState(true);

  const linkClass = (path: string) =>
    `block px-4 py-2 rounded-md transition ${
      pathname.startsWith(path)
        ? "bg-slate-800 text-white"
        : "text-slate-700 hover:bg-slate-100"
    }`;

  return (
    <aside className="w-64 h-screen border-r border-slate-200 bg-white flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="px-5 py-4 border-b border-slate-100">
          <h1 className="text-lg font-semibold text-slate-900">
            🧠 Theo Core
          </h1>
          <p className="text-xs text-slate-500 mt-1">Panel de control IA</p>
        </div>

        {/* Main Nav */}
        <nav className="px-3 py-4 space-y-2">
          <Link href="/core/dashboard" className={linkClass("/core/dashboard")}>
            📊 Dashboard
          </Link>

          {/* Grupo Ecosistema */}
          <div>
            <button
              onClick={() => setEcoOpen(!ecoOpen)}
              className="w-full flex items-center justify-between px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md"
            >
              <span>🌍 Ecosistema</span>
              <span className="text-xs">
                {ecoOpen ? "▾" : "▸"}
              </span>
            </button>

            {ecoOpen && (
              <div className="ml-4 mt-1 space-y-1">
                <Link
                  href="/core/brands"
                  className={linkClass("/core/brands")}
                >
                  🌐 Marcas (IA)
                </Link>
                <Link
                  href="/core/agencies"
                  className={linkClass("/core/agencies")}
                >
                  🏢 Agencias
                </Link>
              </div>
            )}
          </div>

          <Link href="/core/state" className={linkClass("/core/state")}>
            🧩 Estado del sistema
          </Link>
          <Link href="/core/ai-status" className={linkClass("/core/ai-status")}>
            🤖 Theo IA
          </Link>

          <Link href="/core/settings" className={linkClass("/core/settings")}>
            ⚙️ Configuración
          </Link>
        </nav>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
        © {new Date().getFullYear()} Theo Core<br />
        <span className="text-slate-400">IA Ecosystem Management</span>
      </div>
    </aside>
  );
}
