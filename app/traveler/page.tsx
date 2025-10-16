"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ChatCore from "@/app/components/traveler/ChatCore";

export default function TravelerHome() {
  const [openChat, setOpenChat] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero */}
      <section className="relative px-6 pt-20 pb-14 md:pt-28 md:pb-20 max-w-6xl mx-auto">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-3xl md:text-5xl font-semibold text-slate-900"
          >
            Tu asistente de viajes inteligente
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-3 text-slate-600 md:text-lg"
          >
            Inspira ✦ Planifica ✦ Confirma ✦ Comparte
          </motion.p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setOpenChat(true)}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Habla con Theo
            </button>
          </div>
        </div>
      </section>

      {openChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenChat(false)} />
          <div className="relative bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-xl border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="font-medium text-slate-800">Theo Traveler — Chat</div>
              <button onClick={() => setOpenChat(false)} className="text-slate-500 hover:text-slate-800">✕</button>
            </div>
            <div className="p-4">
              <ChatCore />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
