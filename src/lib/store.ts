import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type UserRole = 'sekolah' | 'disdik' | null;

interface AuthState {
    uid: string | null;
    email: string | null;
    role: UserRole;
    npsn: string | null;
    namaInstansi: string | null;
    isAuthenticated: boolean;
    setAuth: (data: Partial<AuthState>) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            uid: null,
            email: null,
            role: null,
            npsn: null,
            namaInstansi: null,
            isAuthenticated: false,
            setAuth: (data) => set((state) => ({ ...state, ...data, isAuthenticated: true })),
            clearAuth: () =>
                set({
                    uid: null,
                    email: null,
                    role: null,
                    npsn: null,
                    namaInstansi: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'auth-storage', // name of item in the storage (must be unique)
        }
    )
);
