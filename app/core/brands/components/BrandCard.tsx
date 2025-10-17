"use client";
import { motion } from "framer-motion";

export default function BrandCard({ brand, onEdit }: any) {
  const providerColor =
    brand.provider === "google"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-blue-100 text-blue-700";

  const providerLabel =
    brand.provider === "google" ? "Gemini (Google)" : "GPT-5 (OpenAI)";

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 200 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-md border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-xl font-bold mb-1">{brand.brand_name}</h3>
        <p className="text-sm text-neutral-500 mb-2">{brand.domain}</p>

        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${providerColor}`}
        >
          {providerLabel}
        </span>

        <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-3 line-clamp-3">
          {brand.personality_prompt}
        </p>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-neutral-500">
          🌐 {brand.language}-{brand.country}
        </span>
        <button
          onClick={() => onEdit(brand)}
          className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          ⚙️ Editar
        </button>
      </div>
    </motion.div>
  );
}
