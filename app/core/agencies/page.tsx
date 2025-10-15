"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ⚙️ Configura tu Supabase Client (usando variables públicas de entorno)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Brand {
  id: string;
  name: string;
}

interface Agency {
  name: string;
  country: string;
  domain: string;
  currency: string;
  address: string;
  type: string;
  status: string;
  brand_id: string;
  email: string;
  createUser: boolean;
  assistantName: string;
  personality: string;
  mainLanguage: string;
  apiKey: string;
}

export default function AgenciesPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<Agency>({
    name: "",
    country: "",
    domain: "",
    currency: "",
    address: "",
    type: "Partner",
    status: "Activo",
    brand_id: "",
    email: "",
    createUser: true,
    assistantName: "Theo",
    personality: "Profesional, empático y experto en viajes",
    mainLanguage: "es",
    apiKey: "",
  });

  // 🔹 Cargar marcas desde Supabase
  useEffect(() => {
    const fetchBrands = async () => {
      const { data, error } = await supabase
        .from("core_brands")
        .select("id, name")
        .order("name");
      if (!error && data) setBrands(data);
    };
    fetchBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulación: más adelante conectaremos al insert real de Supabase
    setAgencies([...agencies, formData]);

    setFormData({
      name: "",
      country: "",
      domain: "",
      currency: "",
      address: "",
      type: "Partner",
      status: "Activo",
      brand_id: "",
      email: "",
      createUser: true,
      assistantName: "Theo",
      personality: "Profesional, empático y experto en viajes",
      mainLanguage: "es",
      apiKey: "",
    });
    setFormVisible(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-700">
          Gestión y Configuración de Agencias / Partners
        </h2>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {formVisible ? "Cancelar" : "➕ Nueva Agencia"}
        </button>
      </div>

      {formVisible && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 mb-6 md:grid-cols-2 border p-4 rounded-lg bg-slate-50"
        >
          <select
            value={formData.brand_id}
            onChange={(e) =>
              setFormData({ ...formData, brand_id: e.target.value })
            }
            className="p-2 border rounded"
            required
          >
            <option value="">Selecciona una marca asociada</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nombre de la agencia"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="p-2 border rounded"
            required
          />

          <input
            type="text"
            placeholder="País"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Dominio (ej: waiki.pe)"
            value={formData.domain}
            onChange={(e) =>
              setFormData({ ...formData, domain: e.target.value })
            }
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Monedas (ej: USD, EUR)"
            value={formData.currency}
            onChange={(e) =>
              setFormData({ ...formData, currency: e.target.value })
            }
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Dirección"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="p-2 border rounded col-span-2"
          />

          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="p-2 border rounded"
          >
            <option>Partner</option>
            <option>Sucursal</option>
            <option>Franquicia</option>
          </select>

          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="p-2 border rounded"
          >
            <option>Activo</option>
            <option>Inactivo</option>
            <option>En Configuración</option>
          </select>

          <input
            type="email"
            placeholder="Email de acceso principal"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="p-2 border rounded col-span-2"
          />

          <label className="flex items-center gap-2 col-span-2">
            <input
              type="checkbox"
              checked={formData.createUser}
              onChange={(e) =>
                setFormData({ ...formData, createUser: e.target.checked })
              }
            />
            Crear usuario administrador automáticamente
          </label>

          <input
            type="text"
            placeholder="Nombre del asistente (IA)"
            value={formData.assistantName}
            onChange={(e) =>
              setFormData({ ...formData, assistantName: e.target.value })
            }
            className="p-2 border rounded"
          />

          <input
            type="text"
            placeholder="Idioma principal (ej: es, en, fr)"
            value={formData.mainLanguage}
            onChange={(e) =>
              setFormData({ ...formData, mainLanguage: e.target.value })
            }
            className="p-2 border rounded"
          />

          <input
            type="password"
            placeholder="API Key o token de integración"
            value={formData.apiKey}
            onChange={(e) =>
              setFormData({ ...formData, apiKey: e.target.value })
            }
            className="p-2 border rounded col-span-2"
          />

          <textarea
            placeholder="Personalidad del asistente (tono y estilo)"
            value={formData.personality}
            onChange={(e) =>
              setFormData({ ...formData, personality: e.target.value })
            }
            className="p-2 border rounded col-span-2 h-24"
          />

          <button
            type="submit"
            className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg"
          >
            Guardar Agencia
          </button>
        </form>
      )}

      <table className="w-full text-sm text-left border">
        <thead className="bg-slate-100 border-b text-slate-600">
          <tr>
            <th className="py-2 px-3">Marca</th>
            <th>Nombre</th>
            <th>País</th>
            <th>Dominio</th>
            <th>Tipo</th>
            <th>IA</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {agencies.map((a, i) => (
            <tr key={i} className="border-b hover:bg-slate-50">
              <td>{brands.find((b) => b.id === a.brand_id)?.name || "-"}</td>
              <td>{a.name}</td>
              <td>{a.country}</td>
              <td>{a.domain}</td>
              <td>{a.type}</td>
              <td>{a.assistantName}</td>
              <td
                className={`font-semibold ${
                  a.status === "Activo" ? "text-green-600" : "text-red-500"
                }`}
              >
                {a.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
