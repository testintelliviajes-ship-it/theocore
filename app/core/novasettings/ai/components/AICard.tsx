"use client";

interface Props {
  config: any;
  onEdit: (c: any) => void;
  onTest: (c: any) => void;
  onDelete: (id: string) => void;
}

export default function AICard({ config, onEdit, onTest, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {config.brand_id || "Theo Core"}
          </h3>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              config.is_active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {config.is_active ? "Activo" : "Inactivo"}
          </span>
        </div>

        <div className="mt-3 text-sm text-gray-600 space-y-1">
          <p>
            <strong>Proveedor:</strong> {config.provider}
          </p>
          <p>
            <strong>Modelo:</strong> {config.model}
          </p>
          <p>
            <strong>Modo:</strong> {config.mode || "asistente"}
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit(config)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Editar
          </button>
          <button
            onClick={() => onTest(config)}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Probar
          </button>
          <button
            onClick={() => onDelete(config.id)}
            className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
