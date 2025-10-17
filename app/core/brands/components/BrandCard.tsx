"use client";
import { motion } from "framer-motion";
import { supabase } from "../../../lib/supabaseClient";

export default function BrandCard({ brand, onEdit, reload }: any) {
  const providerColor =
    brand.provider === "google"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";

  const providerLabel =
    brand.provider === "google" ? "Gemini (Google)" : "GPT-5 (OpenAI)";

  const toggleActive = async () => {
    const { error } = await supabase
      .from("core_brands")
      .update({ is_active: !brand.is_active })
      .eq("id", brand.id);
    if (error) alert(error.message);
    else reload();
  };

  const deleteBrand = async () => {
    if (!confirm(`¿Eliminar la marca "${brand.brand_name}"?`)) return;
    const { error } = await supabase.from("core_brands").delete().eq("id", brand.id);
    if (error) alert(error.message);
    else reload();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-md border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between"
    >
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold mb-1">{brand.brand_name}</h3>
            <p className="text-sm text-neutral-500 mb-2">{brand.domain}</p>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${providerColor}`}
            >
              {providerLabel}
            </span>
          </div>

          {/* Switch on/off */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={brand.is_active}
              onChange={toggleActive}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-3 line-clamp-3">
          {brand.personality_prompt}
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-neutral-500">
          🌐 {brand.language}-{brand.country}
        </span>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(brand)}
            className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            ✏️ Editar
          </button>
          <button
            onClick={deleteBrand}
            className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
