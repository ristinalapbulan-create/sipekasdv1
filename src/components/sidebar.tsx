"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, GraduationCap, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";

// ── Palette sesuai portal ──
const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

const IDLE_TIMEOUT_MS = 60 * 60 * 1000; // 1 jam
const SESSION_KEY = "simpeka_last_active"; // sama dengan auth-provider

interface SidebarProps {
    items: {
        title: string;
        href: string;
        icon: React.ReactNode;
    }[];
}

// ── Confirm Logout Modal ──
function LogoutModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center px-4"
            style={{ backgroundColor: 'rgba(26,60,43,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={onCancel}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-white">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 text-center">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                        style={{ background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)' }}>
                        <AlertTriangle className="h-7 w-7 text-red-500" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">Keluar dari Sistem?</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Sesi Anda akan diakhiri. Pastikan semua data sudah tersimpan sebelum keluar.
                    </p>
                </div>
                {/* Actions */}
                <div className="flex gap-3 px-6 pb-6">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={onCancel}
                        className="flex-1 py-3 rounded-2xl text-sm font-bold border transition-all"
                        style={{ borderColor: '#E2E8F0', color: '#64748B', backgroundColor: '#F8FAFC' }}>
                        Batal
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={onConfirm}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)', boxShadow: '0 4px 16px rgba(220,38,38,0.3)' }}>
                        <LogOut className="h-4 w-4" /> Ya, Keluar
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Auto-logout countdown notice ──
function AutoLogoutNotice({ secondsLeft, onStay, onLogout }: { secondsLeft: number; onStay: () => void; onLogout: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] w-[90vw] max-w-xs"
            style={{
                background: P.cream,
                border: `1px solid ${P.gold}60`,
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(26,60,43,0.25)',
                padding: '16px 18px',
            }}>
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${P.gold}30` }}>
                    <AlertTriangle className="h-5 w-5" style={{ color: '#D97706' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800">Sesi akan berakhir</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Otomatis logout dalam <strong style={{ color: P.forest }}>{secondsLeft}s</strong>
                    </p>
                    <div className="flex gap-2 mt-3">
                        <button onClick={onStay}
                            className="flex-1 py-1.5 rounded-xl text-xs font-black text-white"
                            style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})` }}>
                            Tetap Login
                        </button>
                        <button onClick={onLogout}
                            className="flex-1 py-1.5 rounded-xl text-xs font-bold border"
                            style={{ borderColor: '#FCA5A5', color: '#DC2626' }}>
                            Keluar
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export function Sidebar({ items }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { namaInstansi, role, clearAuth } = useAuthStore();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showAutoLogout, setShowAutoLogout] = useState(false);
    const [autoLogoutCountdown, setAutoLogoutCountdown] = useState(30);

    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // ── Perform actual logout ──
    const doLogout = useCallback(() => {
        clearAuth();
        document.cookie = "auth_token=; Max-Age=0; path=/;";
        document.cookie = "user_role=; Max-Age=0; path=/;";
        localStorage.removeItem(SESSION_KEY);
        router.push("/");
    }, [clearAuth, router]);

    // ── Reset idle timer on user activity ──
    const resetIdleTimer = useCallback(() => {
        if (showAutoLogout) return;
        // Perbarui timestamp sesi di localStorage
        localStorage.setItem(SESSION_KEY, Date.now().toString());
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            setAutoLogoutCountdown(30);
            setShowAutoLogout(true);
        }, IDLE_TIMEOUT_MS);
    }, [showAutoLogout]);

    // ── Start countdown when auto-logout warning shown ──
    useEffect(() => {
        if (!showAutoLogout) return;
        countdownRef.current = setInterval(() => {
            setAutoLogoutCountdown(n => {
                if (n <= 1) {
                    clearInterval(countdownRef.current!);
                    doLogout();
                    return 0;
                }
                return n - 1;
            });
        }, 1000);
        return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }, [showAutoLogout, doLogout]);

    // ── Attach activity listeners ──
    useEffect(() => {
        const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll', 'click'];
        const handler = () => resetIdleTimer();
        events.forEach(e => window.addEventListener(e, handler, { passive: true }));
        resetIdleTimer(); // start on mount
        return () => {
            events.forEach(e => window.removeEventListener(e, handler));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
    }, [resetIdleTimer]);

    const handleStayLoggedIn = () => {
        setShowAutoLogout(false);
        if (countdownRef.current) clearInterval(countdownRef.current);
        resetIdleTimer();
    };

    const roleLabel = role === "disdik" ? "Dinas Pendidikan" : "Operator Sekolah";

    return (
        <>
            {/* ── DESKTOP SIDEBAR — tema hijau-emas portal ── */}
            <div className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 z-40"
                style={{ background: `linear-gradient(180deg, ${P.forestDark} 0%, #122B1D 100%)`, borderRight: `1px solid rgba(116,179,138,0.2)` }}>
                {/* Logo */}
                <div className="p-6 border-b" style={{ borderColor: 'rgba(116,179,138,0.15)' }}>
                    <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                        className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${P.forest}, ${P.forestDark})`,
                                border: `1px solid rgba(250,200,74,0.45)`,
                                boxShadow: `0 4px 16px rgba(45,106,79,0.5), inset 0 1px 0 rgba(255,255,255,0.15)`,
                            }}>
                            <GraduationCap className="h-5 w-5" style={{ color: P.gold }} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white tracking-tight leading-tight">SIMPEKA SD</h2>
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: P.sage }}>{roleLabel}</p>
                        </div>
                    </motion.div>
                </div>

                {/* Nav */}
                <div className="flex-1 overflow-auto py-5 px-3">
                    <nav className="space-y-1">
                        {items.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link key={index} href={item.href}>
                                    <motion.div
                                        whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
                                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 relative overflow-hidden"
                                        style={{
                                            backgroundColor: isActive ? 'rgba(250,200,74,0.12)' : 'transparent',
                                            color: isActive ? 'white' : 'rgba(116,179,138,0.7)',
                                            border: isActive ? `1px solid rgba(250,200,74,0.25)` : '1px solid transparent',
                                        }}>
                                        {isActive && (
                                            <>
                                                <motion.div layoutId="activeGlow"
                                                    className="absolute left-0 top-0 bottom-0 w-12 pointer-events-none"
                                                    style={{ background: `${P.gold}08`, filter: 'blur(8px)' }} />
                                                <motion.div layoutId="activeBar"
                                                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                                                    style={{ backgroundColor: P.gold, boxShadow: `0 0 8px ${P.gold}80` }} />
                                            </>
                                        )}
                                        <span className="transition-colors"
                                            style={{ color: isActive ? P.gold : 'rgba(116,179,138,0.6)' }}>
                                            {item.icon}
                                        </span>
                                        <span>{item.title}</span>
                                        {isActive && (
                                            <motion.div layoutId="activeDot"
                                                className="ml-auto w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: P.gold }} />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* User Footer */}
                <div className="p-4 border-t" style={{ borderColor: 'rgba(116,179,138,0.15)' }}>
                    <div className="flex items-center gap-3 px-2 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${P.gold}20`, border: `1px solid ${P.gold}30` }}>
                            <span className="text-xs font-black" style={{ color: P.gold }}>
                                {namaInstansi?.charAt(0) ?? "?"}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium" style={{ color: 'rgba(116,179,138,0.6)' }}>Masuk sebagai:</p>
                            <p className="text-xs font-bold text-white truncate">{namaInstansi}</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm font-semibold"
                        style={{
                            background: 'rgba(220,38,38,0.1)',
                            border: '1px solid rgba(220,38,38,0.2)',
                            color: '#FCA5A5',
                        }}>
                        <LogOut className="h-4 w-4" />
                        Keluar dari Sistem
                    </motion.button>
                </div>
            </div>

            {/* ── MOBILE BOTTOM NAV ── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50"
                style={{
                    background: 'white',
                    borderTop: '2px solid rgba(45, 106, 79, 0.12)',
                    boxShadow: '0 -6px 32px rgba(0,0,0,0.14), 0 -1px 8px rgba(45,106,79,0.08)',
                }}>
                <div className="flex items-center justify-around px-2 py-2" style={{ minHeight: '64px' }}>
                    {items.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={index} href={item.href} className="flex-1">
                                <motion.div
                                    whileTap={{ scale: 0.85 }}
                                    className="flex flex-col items-center justify-center gap-1 py-0.5 relative">
                                    <div className="relative">
                                        {isActive ? (
                                            <motion.div
                                                layoutId="mobileActiveBubble"
                                                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                                style={{
                                                    background: `linear-gradient(135deg, rgba(45,106,79,0.9), rgba(26,60,43,0.95))`,
                                                    backdropFilter: 'blur(12px) saturate(160%)',
                                                    WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                                                    border: '1px solid rgba(250,200,74,0.5)',
                                                    boxShadow: '0 4px 16px rgba(45,106,79,0.35), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 0 3px rgba(45,106,79,0.08)',
                                                }}
                                                transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
                                                <span style={{ color: P.gold, filter: 'drop-shadow(0 0 4px rgba(250,200,74,0.6))' }}>
                                                    {item.icon}
                                                </span>
                                            </motion.div>
                                        ) : (
                                            <div className="w-10 h-10 flex items-center justify-center rounded-2xl transition-all"
                                                style={{ color: '#94A3B8' }}>
                                                {item.icon}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-black leading-none transition-all"
                                        style={{ color: isActive ? P.forest : '#94A3B8' }}>
                                        {item.title.split(" ")[0]}
                                    </span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* ── MOBILE TOP HEADER ── */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 z-40 px-4 flex items-center justify-between"
                style={{
                    background: 'white',
                    borderBottom: '2px solid rgba(45, 106, 79, 0.14)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 6px rgba(45,106,79,0.08)',
                }}>
                {/* Brand */}
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`,
                            border: `1px solid rgba(250,200,74,0.4)`,
                            boxShadow: '0 3px 12px rgba(45,106,79,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                        }}>
                        <GraduationCap className="h-4 w-4" style={{ color: P.gold }} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black leading-tight text-slate-900">SIMPEKA SD</h2>
                        <p className="text-[9px] font-semibold uppercase tracking-wider truncate max-w-[160px]"
                            style={{ color: P.forest }}>
                            {namaInstansi}
                        </p>
                    </div>
                </div>

                {/* Logout button — jelas, merah solid */}
                <motion.button whileTap={{ scale: 0.93 }} onClick={() => setShowLogoutModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all"
                    style={{
                        background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                        color: 'white',
                        boxShadow: '0 2px 10px rgba(220,38,38,0.35)',
                    }}>
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Keluar</span>
                </motion.button>
            </div>

            {/* ── MODALS ── */}
            <AnimatePresence>
                {showLogoutModal && (
                    <LogoutModal
                        onConfirm={doLogout}
                        onCancel={() => setShowLogoutModal(false)}
                    />
                )}
                {showAutoLogout && (
                    <AutoLogoutNotice
                        secondsLeft={autoLogoutCountdown}
                        onStay={handleStayLoggedIn}
                        onLogout={doLogout}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
