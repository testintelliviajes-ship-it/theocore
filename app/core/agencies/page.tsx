"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Configura Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Brand {
  id: string;
  name: string;
}

interface AgencyForm {
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  const [formData, setFormData] = useState<AgencyForm>({
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

  // 🔹 Generar contraseña aleatoria (para el nuevo usuario)
  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    return Array.from({ length: 10 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  };

  // 🔹 Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let userId: string | null = null;

      // 1️⃣ Crear usuario si está marcado
      if (formData.createUser && formData.email) {
        const password = generatePassword();
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password,
        });

        if (authError) throw authError;
        userId = authData.user?.id || null;

        console.log("✅ Usuario creado:", formData.email, "(contraseña temporal:", password, ")");
      }

      // 2️⃣ Crear agencia
      const { data: agencyData, error: agencyError } = await supabase
        .from("core_agencies")
        .insert([
          {
            name: formData.name,
            country: formData.country,
            domain: formData.domain,
            currency: formData.currency,
            address: formData.address,
            type: formData.type,
            status: formData.status,
            brand_id: formData.brand_id,
            owner_id: userId,
          },
        ])
        .select()
        .single();

      if (agencyError) throw agencyError;

      // 3️⃣ Crear configuración IA
      const { error: settingsError } = await supabase
        .from("core_agency_settings")
        .insert([
          {
            agency_id: agencyData.id,
            assistant_name: formData.assistantName,
            personality: formData.personality,
            main_language: formData.mainLanguage,
            api_key: formData.apiKey,
          },
        ]);

      if (settingsError) throw settingsError;

      // 4️⃣ Crear relación usuario ↔ agencia
      if (userId) {
        const { error: relationError } = await supabase
          .from("core_agency_users")
          .insert([
            {
              agency_id: agencyData.id,
              user_id: userId,
              role: "admin",
            },
          ]);
        if (relationError) throw relationError;
      }

      setMessage("✅ Agencia creada exitosamente.");
      setFormVisible(false);
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
    } catch (error: any) {
      console.error(error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-700">
          Crear nueva Agencia / Partner
        </h2>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
        >
          {formVisible ? "Cancelar" : "➕ Nueva Agencia"}
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded text-sm ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

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
            <option value="">Selecciona una marca</option>
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
            type="email"
            placeholder="Email administrador"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="p-2 border rounded"
            required
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
            placeholder="Monedas (USD, EUR)"
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

          <textarea
            placeholder="Personalidad del asistente IA"
            value={formData.personality}
            onChange={(e) =>
              setFormData({ ...formData, personality: e.target.value })
            }
            className="p-2 border rounded col-span-2 h-20"
          />

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Agencia"}
          </button>
        </form>
      )}
    </div>
  );
}
