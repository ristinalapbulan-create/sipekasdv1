"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { getUserProfile } from "@/lib/firestore-service";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useRouter } from "next/navigation";

const SESSION_KEY = "simpeka_last_active";
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 jam
const COOKIE_MAX_AGE = 86400; // 24 jam (cookie lebih panjang agar tidak expired saat navigasi)

function setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearCookie(name: string) {
    document.cookie = `${name}=; path=/; max-age=0`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const { setAuth, clearAuth } = useAuthStore();
    const router = useRouter();

    const forceLogout = useCallback(async () => {
        try { await signOut(auth); } catch { /* ignore */ }
        clearAuth();
        clearCookie("auth_token");
        clearCookie("user_role");
        localStorage.removeItem(SESSION_KEY);
        router.push("/");
    }, [clearAuth, router]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // ── Cek apakah sesi sudah kadaluwarsa ──
                const lastActive = localStorage.getItem(SESSION_KEY);
                if (lastActive) {
                    const elapsed = Date.now() - parseInt(lastActive, 10);
                    if (elapsed > SESSION_TIMEOUT_MS) {
                        await forceLogout();
                        setLoading(false);
                        return;
                    }
                }

                // Sesi masih valid -> set profil
                try {
                    const profile = await getUserProfile(user.uid);
                    if (profile) {
                        setAuth({
                            uid: user.uid,
                            email: user.email || "",
                            role: profile.role,
                            npsn: profile.npsn || null,
                            namaInstansi: profile.nama_instansi,
                        });
                        // Perbarui timestamp sesi
                        localStorage.setItem(SESSION_KEY, Date.now().toString());
                        // Sync cookie untuk middleware — pakai token sederhana, bukan Firebase token
                        // Firebase token expired tiap ~1 jam, jadi pakai flag saja
                        setCookie("auth_token", "authenticated");
                        setCookie("user_role", profile.role);
                    } else {
                        clearAuth();
                        clearCookie("auth_token");
                        clearCookie("user_role");
                    }
                } catch (err) {
                    console.error("Auth provider error:", err);
                    clearAuth();
                }
            } else {
                clearAuth();
                clearCookie("auth_token");
                clearCookie("user_role");
                localStorage.removeItem(SESSION_KEY);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [setAuth, clearAuth, forceLogout]);

    // ── Refresh session timestamp setiap navigasi/fokus ──
    useEffect(() => {
        const refresh = () => {
            if (auth.currentUser) {
                localStorage.setItem(SESSION_KEY, Date.now().toString());
            }
        };
        window.addEventListener("focus", refresh);
        window.addEventListener("click", refresh);
        return () => {
            window.removeEventListener("focus", refresh);
            window.removeEventListener("click", refresh);
        };
    }, []);

    if (loading) {
        return <LoadingScreen text="Memverifikasi sesi..." />;
    }

    return <>{children}</>;
}
