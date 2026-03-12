"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const { setAuth, clearAuth } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setAuth({
                            uid: user.uid,
                            email: user.email,
                            role: userData.role,
                            npsn: userData.npsn,
                            namaInstansi: userData.nama_instansi,
                        });

                        // Sync cookie just in case
                        const idToken = await user.getIdToken();
                        document.cookie = `auth_token=${idToken}; path=/; max-age=86400; SameSite=Strict; Secure`;
                        document.cookie = `user_role=${userData.role}; path=/; max-age=86400; SameSite=Strict; Secure`;
                    } else {
                        clearAuth();
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    clearAuth();
                }
            } else {
                clearAuth();
                document.cookie = 'auth_token=; Max-Age=0; path=/;';
                document.cookie = 'user_role=; Max-Age=0; path=/;';
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [setAuth, clearAuth]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-medium">Memuat SIMPEKA SD...</p>
            </div>
        );
    }

    return <>{children}</>;
}
