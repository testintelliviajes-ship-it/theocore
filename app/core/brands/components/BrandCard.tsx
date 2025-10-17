"use client";
import { motion } from "framer-motion";

export default function BrandCard({ brand, onEdit }: any) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800 p-5 flex flex-col justify-between"
    >
      <div>
        <h3 className="text-lg font-bold mb-1">{brand.domain}</h3>
        <p className="text-sm text-neutral-500 mb-2">
          {brand.provider === "google" ? "🟢 Gemini" : "🔵 GPT-5"}
        </p>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3">
          {brand.personality_prompt}
        </p>
      </div>
      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-neutral-500">{brand.language}-{brand.country}</span>
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
