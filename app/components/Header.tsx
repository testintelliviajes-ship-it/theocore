"use client";
export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 border-b bg-white">
      <h1 className="text-lg font-semibold text-slate-700">
        Panel de Gestión Theo Core
      </h1>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-500">Administrador</span>
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
          A
        </div>
      </div>
    </header>
  );
}
