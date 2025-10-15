"use client";
import { useState } from "react";

interface Agency {
  name: string;
  country: string;
  domain: string;
  currency: string;
  address: string;
  type: string;
  status: string;
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([
    {
      name: "IVI Spain",
      country: "España",
      domain: "ivi.es",
      currency: "EUR",
      address: "Calle Mayor 101, Madrid",
      type: "Sucursal",
      status: "Activo",
    },
    {
      name: "Waiki Perú",
      country: "Perú",
      domain: "waiki.pe",
      currency: "PEN, USD",
      address: "Av. Larco 250, Lima",
      type: "Franquicia",
      status: "Activo",
    },
  ]);

  const [formVisible, setFormVisible] = useState(false);
  const [formData, setFormData] = useState<Agency>({
    name: "",
    country: "",
    domain: "",
    currency: "",
    address: "",
    type: "Partner",
    status: "Activo",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAgencies([...agencies, formData]);
    setFormData({
      name: "",
      country: "",
      domain: "",
      currency: "",
      address: "",
      type: "Partner",
      status: "Activo",
    });
    setFormVisible(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-700">
          Configuración de Agencias / Partners
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
          </select>
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
            <th className="py-2 px-3">Nombre</th>
            <th>País</th>
            <th>Dominio</th>
            <th>Monedas</th>
            <th>Tipo</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {agencies.map((a, i) => (
            <tr key={i} className="border-b hover:bg-slate-50">
              <td className="py-2 px-3 font-medium">{a.name}</td>
              <td>{a.country}</td>
              <td>{a.domain}</td>
              <td>{a.currency}</td>
              <td>{a.type}</td>
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
