"use client";

import { motion } from "framer-motion";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
            style={{ background: "linear-gradient(135deg, #1A3C2B, #2D6A4F)" }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: "rgba(250,200,74,0.2)", border: "1px solid rgba(250,200,74,0.4)" }}>
                    <WifiOff className="h-10 w-10" style={{ color: "#FAC84A" }} />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Tidak Ada Koneksi</h1>
                <p className="text-sm font-medium mb-8" style={{ color: "rgba(116,179,138,0.85)" }}>
                    Perangkat Anda sedang offline. Periksa koneksi internet dan coba kembali.
                </p>
                <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black mx-auto"
                    style={{ background: "#FAC84A", color: "#1A3C2B" }}>
                    <RefreshCw className="h-4 w-4" /> Coba Lagi
                </motion.button>
            </motion.div>
        </div>
    );
}
