"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    country: "",
    domain: "",
    brand_id: "",
    logo_url: "",
  });

  // === LOAD AGENCIES ===
  const loadAgencies = async () => {
    const res = await fetch("/api/core/agencies");
    const data = await res.json();
    setAgencies(data);
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  // === CREATE AGENCY ===
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/core/agencies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Error al crear la agencia");

      setShowModal(false);
      setForm({
        name: "",
        email: "",
        country: "",
        domain: "",
        brand_id: "",
        logo_url: "",
      });
      await loadAgencies();
    } catch (error) {
      console.error(error);
      alert("❌ No se pudo crear la agencia");
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await fetch("/api/core/agencies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: { is_active: !current } }),
    });
    await loadAgencies();
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar agencia?")) {
      await fetch("/api/core/agencies", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await loadAgencies();
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch("/api/core/agencies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data: { status: newStatus } }),
    });
    await loadAgencies();
  };

  const handleInvite = async (id: string) => {
    const res = await fetch("/api/core/agencies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setInviteLink(data.inviteUrl);
    setShowInviteModal(true);
  };

  const copyToClipboard = () => navigator.clipboard.writeText(inviteLink);

  const statusColors: any = {
    Invitada: "bg-yellow-100 text-yellow-700 border-yellow-300",
    Pendiente: "bg-orange-100 text-orange-700 border-orange-300",
    Activa: "bg-green-100 text-green-700 border-green-300",
    Suspendida: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">🌍 Agencias</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl shadow-md transition"
        >
          + Nueva Agencia
        </button>
      </div>

      {/* === LISTADO === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agencies.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 border border-gray-100 transition"
          >
            <div className="flex items-center gap-3 mb-4">
              {a.logo_url ? (
                <img src={a.logo_url} alt={a.name} className="w-12 h-12 rounded-full border" />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 text-xl">🏢</div>
              )}
              <div>
                <h2 className="font-bold text-lg text-gray-800">{a.name}</h2>
                <p className="text-sm text-gray-500">{a.country}</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-1"><strong>Email:</strong> {a.email}</p>
            <p className="text-gray-600 text-sm mb-1"><strong>Dominio:</strong> {a.domain}</p>
            <p className="text-gray-600 text-sm mb-1"><strong>Brand:</strong> {a.brand_name || "—"}</p>

            <div className="mt-3 mb-2 flex items-center justify-between">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors[a.status]}`}>
                {a.status}
              </span>
              <motion.select
                whileHover={{ scale: 1.05 }}
                className="text-sm border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={a.status}
                onChange={(e) => handleStatusChange(a.id, e.target.value)}
              >
                <option>Invitada</option>
                <option>Pendiente</option>
                <option>Activa</option>
                <option>Suspendida</option>
              </motion.select>
            </div>

            <div className="flex justify-between items-center mt-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={a.is_active}
                  onChange={() => handleToggle(a.id, a.is_active)}
                />
                <div className="relative w-10 h-5 bg-gray-300 peer-checked:bg-green-500 rounded-full transition-all">
                  <span className="absolute left-1 top-1 bg-white w-3 h-3 rounded-full peer-checked:translate-x-5 transition-all"></span>
                </div>
                <span className="ml-2 text-sm text-gray-700">
                  {a.is_active ? "Activo" : "Inactivo"}
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => handleInvite(a.id)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold"
                >
                  🔗 Invitar
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-semibold"
                >
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* === MODAL INVITACIÓN === */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-3 text-gray-800">
              🔗 Enlace de invitación
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Copia este enlace y envíalo a la agencia para completar su registro.
            </p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteLink}
                className="w-full border px-3 py-2 rounded-lg text-sm bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                Copiar
              </button>
            </div>
            <div className="flex justify-end mt-5">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* === MODAL CREAR AGENCIA === */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800">🆕 Nueva Agencia</h3>
            <div className="space-y-3">
              {["name", "email", "country", "domain", "brand_id", "logo_url"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-600 capitalize">
                    {field.replace("_", " ")}
                  </label>
                  <input
                    type="text"
                    value={(form as any)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Guardar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
