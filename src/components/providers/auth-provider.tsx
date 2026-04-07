"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { getUserProfile } from "@/lib/firestore-service";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useRouter } from "next/navigation";

const SESSION_KEY = "simpeka_last_active";
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 jam

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const { setAuth, clearAuth } = useAuthStore();
    const router = useRouter();

    const forceLogout = async () => {
        try { await signOut(auth); } catch { /* ignore */ }
        clearAuth();
        document.cookie = "auth_token=; path=/; max-age=0";
        document.cookie = "user_role=; path=/; max-age=0";
        localStorage.removeItem(SESSION_KEY);
        router.push("/");
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // ── Cek apakah sesi sudah kadaluwarsa (dibuka kembali setelah tutup) ──
                const lastActive = localStorage.getItem(SESSION_KEY);
                if (lastActive) {
                    const elapsed = Date.now() - parseInt(lastActive, 10);
                    if (elapsed > SESSION_TIMEOUT_MS) {
                        // Sesi expired → paksa logout
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
                        // Sync cookie untuk middleware
                        document.cookie = `auth_token=${await user.getIdToken()}; path=/; max-age=3600; SameSite=Strict`;
                        document.cookie = `user_role=${profile.role}; path=/; max-age=3600; SameSite=Strict`;
                    } else {
                        clearAuth();
                        document.cookie = "auth_token=; path=/; max-age=0";
                        document.cookie = "user_role=; path=/; max-age=0";
                    }
                } catch (err) {
                    console.error("Auth provider error:", err);
                    clearAuth();
                }
            } else {
                clearAuth();
                document.cookie = "auth_token=; path=/; max-age=0";
                document.cookie = "user_role=; path=/; max-age=0";
                localStorage.removeItem(SESSION_KEY);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [setAuth, clearAuth]); // eslint-disable-line

    if (loading) {
        return <LoadingScreen text="Memverifikasi sesi..." />;
    }

    return <>{children}</>;
}
