"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Cek apakah aplikasi sudah diinstall (berjalan di mode standalone)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && (navigator as any).standalone);
        // Cek apakah user pernah menekan "Nanti" / dismiss
        const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';

        if (isStandalone || isDismissed) {
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Tampilkan setelah 3 detik
            setTimeout(() => setShow(true), 3000);
        };

        const installHandler = () => {
            setShow(false);
            setDeferredPrompt(null);
            // Beri tanda sudah diinstall agar saat dibuka via browser tidak muncul lagi
            localStorage.setItem('pwa_prompt_dismissed', 'true');
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", installHandler);

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
            window.removeEventListener("appinstalled", installHandler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        if (result.outcome === "accepted") {
            setShow(false);
            localStorage.setItem('pwa_prompt_dismissed', 'true');
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShow(false);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-[300] rounded-2xl shadow-2xl overflow-hidden"
                    style={{ background: "white", border: "1px solid rgba(45,106,79,0.2)", boxShadow: "0 8px 32px rgba(26,60,43,0.2)" }}>
                    {/* Green accent top bar */}
                    <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #1A3C2B, #2D6A4F, #FAC84A)" }} />
                    <div className="p-4 flex items-start gap-3">
                        <img src="/icon-96.png" alt="SIMPEKA SD" className="w-12 h-12 rounded-xl shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-slate-900">Pasang SIMPEKA SD</p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                                Install aplikasi untuk akses lebih cepat tanpa buka browser.
                            </p>
                            <div className="flex gap-2 mt-3">
                                <motion.button whileTap={{ scale: 0.97 }} onClick={handleInstall}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black text-white"
                                    style={{ background: "linear-gradient(135deg, #1A3C2B, #2D6A4F)" }}>
                                    <Download className="h-3.5 w-3.5" /> Install
                                </motion.button>
                                <button onClick={handleDismiss}
                                    className="px-3 py-2 rounded-xl text-xs font-bold border transition-all"
                                    style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                                    Nanti
                                </button>
                            </div>
                        </div>
                        <button onClick={handleDismiss} className="text-slate-300 hover:text-slate-500 shrink-0">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
