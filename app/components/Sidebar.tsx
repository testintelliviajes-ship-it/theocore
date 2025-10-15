"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const links = [
  { href: "/core", label: "Dashboard" },
  { href: "/core/brands", label: "Marcas" },
  { href: "/core/environments", label: "Entornos" },
  { href: "/core/modules", label: "Módulos" },
  { href: "/core/settings", label: "Configuración" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-6 py-4 text-xl font-bold tracking-wide border-b border-slate-800">
        Theo Core
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 transition ${
              pathname === link.href ? "bg-slate-800" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-slate-800 text-xs text-slate-500">
        v1.0.0
      </div>
    </aside>
  );
}
