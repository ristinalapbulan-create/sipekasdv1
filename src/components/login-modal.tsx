"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, GraduationCap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/firestore-service";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

const loginSchema = z.object({
    email: z.string().min(3, { message: "ID / Email tidak valid" }),
    password: z.string().min(4, { message: "Kata sandi minimal 4 karakter" }),
});

interface LoginModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LoginModal({ open, onOpenChange }: LoginModalProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const setAuth = useAuthStore((state) => state.setAuth);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        try {
            const emailInput = values.email.trim();
            const loginEmail = emailInput.includes('@') ? emailInput : `${emailInput}@simpekasd.id`;

            const credential = await signInWithEmailAndPassword(auth, loginEmail, values.password);
            const profile = await getUserProfile(credential.user.uid, loginEmail);
            if (!profile) { toast.error("Akun tidak ditemukan. Hubungi administrator."); await auth.signOut(); return; }
            setAuth({ uid: credential.user.uid, email: credential.user.email || "", role: profile.role, npsn: profile.npsn || null, namaInstansi: profile.nama_instansi });
            const token = await credential.user.getIdToken();
            document.cookie = `auth_token=${token}; path=/; max-age=3600; SameSite=Strict`;
            document.cookie = `user_role=${profile.role}; path=/; max-age=3600; SameSite=Strict`;
            toast.success(`Selamat datang, ${profile.nama_instansi}!`);
            onOpenChange(false);
            router.push(profile.role === 'disdik' ? '/disdik/dashboard' : '/sekolah/dashboard');
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') toast.error('Email atau kata sandi salah.');
            else if (code === 'auth/too-many-requests') toast.error('Terlalu banyak percobaan. Coba lagi nanti.');
            else toast.error('Terjadi kesalahan saat login.');
        } finally { setIsLoading(false); }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md w-full overflow-visible [&>button]:hidden">
                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="relative bg-white rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.18)] overflow-hidden"
                        >
                            {/* Top gradient strip */}
                            <div className="h-2.5 w-full" style={{ background: 'linear-gradient(90deg, #1A3C2B, #2D6A4F, #74B38A)' }} />

                            {/* Close button */}
                            <button
                                onClick={() => onOpenChange(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="p-8">
                                {/* Header */}
                                <div className="flex flex-col items-center mb-8 relative">
                                    {/* Decorative rings */}
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ backgroundColor: 'rgba(45,106,79,0.15)' }} />
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full blur-lg pointer-events-none" style={{ backgroundColor: 'rgba(116,179,138,0.12)' }} />
                                    <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #1A3C2B, #2D6A4F)', boxShadow: '0 8px 24px rgba(45,106,79,0.35)' }}>
                                        <GraduationCap className="h-7 w-7 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Masuk ke SIMPEKA SD</h2>
                                    <p className="text-sm text-slate-500 mt-1 font-medium">Gunakan akun yang telah didaftarkan</p>
                                </div>

                                {/* Form */}
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-slate-700">Email Akun / NPSN</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="contoh@disdik.id / NPSN"
                                                            {...field}
                                                            className="h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:bg-white focus-visible:ring-blue-400 transition-all font-medium"
                                                            disabled={isLoading}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-semibold text-slate-700">Kata Sandi</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                type={showPassword ? "text" : "password"}
                                                                placeholder="••••••••"
                                                                {...field}
                                                                className="h-11 rounded-xl border-slate-200 bg-slate-50 transition-all pr-10 font-medium"
                                                                disabled={isLoading}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                                            >
                                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                            <Button
                                                type="submit"
                                                className="w-full h-12 text-white font-bold rounded-xl transition-all mt-2"
                                                style={{ background: 'linear-gradient(135deg, #1A3C2B, #2D6A4F)', boxShadow: '0 4px 20px rgba(45,106,79,0.35)' }}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Memverifikasi...
                                                    </>
                                                ) : (
                                                    "Masuk"
                                                )}
                                            </Button>
                                        </motion.div>
                                    </form>
                                </Form>

                                <p className="text-center text-xs text-slate-400 mt-6">
                                    SIMPEKA SD © {new Date().getFullYear()} · Disdikbud Tabalong
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
