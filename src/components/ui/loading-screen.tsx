"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingScreen({ text = "Harap tunggu..." }: { text?: string }) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.06, 1], opacity: 1 }}
                transition={{
                    scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                    opacity: { duration: 0.3 },
                }}
                className="relative flex items-center justify-center w-16 h-16"
            >
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-2xl animate-pulse"
                    style={{ backgroundColor: 'rgba(45, 106, 79, 0.2)', filter: 'blur(12px)' }} />
                {/* Icon box — liquid glass style */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
                    style={{
                        background: 'linear-gradient(135deg, #1A3C2B, #2D6A4F)',
                        border: '1px solid rgba(250,200,74,0.45)',
                        boxShadow: '0 8px 24px rgba(45,106,79,0.45), inset 0 1px 0 rgba(255,255,255,0.15)',
                    }}>
                    <Loader2 className="w-7 h-7 animate-spin" style={{ color: '#FAC84A' }} />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center gap-1"
            >
                <h3 className="text-lg font-black"
                    style={{ background: 'linear-gradient(135deg, #1A3C2B, #2D6A4F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {text}
                </h3>
                <p className="text-sm font-medium text-slate-400">
                    Memuat data SIMPEKA SD
                </p>
            </motion.div>

            {/* Bouncing dots — emas */}
            <div className="flex gap-1.5 mt-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: i === 1 ? '#FAC84A' : '#2D6A4F' }}
                        animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                    />
                ))}
            </div>
        </div>
    );
}
