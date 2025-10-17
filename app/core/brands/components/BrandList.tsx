"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { motion } from "framer-motion";
import BrandModal from "./BrandModal";
import BrandCard from "./BrandCard";

export default function BrandList() {
  const [brands, setBrands] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);

  const loadBrands = async () => {
    const { data } = await supabase.from("core_ai_config").select("*");
    setBrands(data || []);
  };

  useEffect(() => {
    loadBrands();
  }, []);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">🌍 Marcas configuradas</h1>
        <button
          onClick={() => {
            setSelectedBrand(null);
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          ➕ Nueva Marca
        </button>
      </div>

      <motion.div
        layout
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {brands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
            onEdit={(b: any) => {
              setSelectedBrand(b);
              setShowModal(true);
            }}
          />
        ))}
      </motion.div>

      <BrandModal
        open={showModal}
        onClose={() => setShowModal(false)}
        brand={selectedBrand}
        reload={loadBrands}
      />
    </div>
  );
}
