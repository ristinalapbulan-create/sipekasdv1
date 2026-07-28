"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, GraduationCap, X, KeyRound, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
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
    const [mode, setMode] = useState<"login" | "forgot">("login");
    const [resetEmail, setResetEmail] = useState("");
    const [resetSent, setResetSent] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
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
            setAuth({ uid: credential.user.uid, email: credential.user.email || "", role: profile.role, npsn: profile.npsn || null, namaInstansi: profile.nama_instansi, kecamatan: profile.kecamatan || null });
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

    async function onResetPassword() {
        if (!resetEmail.trim()) { toast.error("Masukkan email akun Anda."); return; }
        const emailToReset = resetEmail.trim().includes("@")
            ? resetEmail.trim()
            : `${resetEmail.trim()}@simpekasd.id`;
        setResetLoading(true);
        try {
            await sendPasswordResetEmail(auth, emailToReset);
            setResetSent(true);
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === "auth/user-not-found" || code === "auth/invalid-email") {
                toast.error("Email tidak ditemukan. Periksa kembali alamat email.");
            } else {
                toast.error("Gagal mengirim email reset. Coba lagi.");
            }
        } finally { setResetLoading(false); }
    }

    function handleOpenChange(val: boolean) {
        onOpenChange(val);
        if (!val) {
            // Reset state saat modal ditutup
            setMode("login");
            setResetEmail("");
            setResetSent(false);
            form.reset();
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md w-full overflow-visible [&>button]:hidden">
                <AnimatePresence>
                    {open && (
                        <motion.div
                            key={mode}
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
                                onClick={() => handleOpenChange(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="p-8">
                                {mode === "login" ? (
                                    <>
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
                                                            <div className="flex items-center justify-between">
                                                                <FormLabel className="text-sm font-semibold text-slate-700">Kata Sandi</FormLabel>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setMode("forgot")}
                                                                    className="text-xs font-semibold transition-colors"
                                                                    style={{ color: '#2D6A4F' }}
                                                                >
                                                                    Lupa Password?
                                                                </button>
                                                            </div>
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
                                    </>
                                ) : (
                                    <>
                                        {/* Forgot Password View */}
                                        <div className="flex flex-col items-center mb-7 relative">
                                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full blur-xl pointer-events-none" style={{ backgroundColor: 'rgba(250,200,74,0.12)' }} />
                                            <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, #92400E, #D97706)', boxShadow: '0 8px 24px rgba(217,119,6,0.3)' }}>
                                                <KeyRound className="h-7 w-7 text-white" />
                                            </div>
                                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Reset Password</h2>
                                            <p className="text-sm text-slate-500 mt-1 font-medium text-center">
                                                Masukkan email akun Anda. Kami akan kirim link reset.
                                            </p>
                                        </div>

                                        {resetSent ? (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="rounded-2xl p-5 text-center"
                                                style={{ backgroundColor: '#D1FAE5', border: '1px solid #6EE7B7' }}
                                            >
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#2D6A4F' }}>
                                                    <Check className="h-5 w-5 text-white" />
                                                </div>
                                                <p className="text-sm font-black" style={{ color: '#1A3C2B' }}>Email Terkirim!</p>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    Cek inbox email Anda dan klik link reset password. Periksa folder spam jika tidak ditemukan.
                                                </p>
                                                <button
                                                    onClick={() => { setMode("login"); setResetSent(false); setResetEmail(""); }}
                                                    className="mt-4 text-xs font-bold underline"
                                                    style={{ color: '#2D6A4F' }}
                                                >
                                                    Kembali ke Login
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email Akun / NPSN</label>
                                                    <Input
                                                        placeholder="contoh@disdik.id / NPSN sekolah"
                                                        value={resetEmail}
                                                        onChange={e => setResetEmail(e.target.value)}
                                                        className="h-11 rounded-xl border-slate-200 bg-slate-50 focus-visible:bg-white transition-all font-medium"
                                                        disabled={resetLoading}
                                                        onKeyDown={e => e.key === 'Enter' && onResetPassword()}
                                                    />
                                                    <p className="text-[11px] text-slate-400 mt-1.5">
                                                        Jika menggunakan NPSN, sistem otomatis menambahkan @simpekasd.id
                                                    </p>
                                                </div>
                                                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                                    <Button
                                                        onClick={onResetPassword}
                                                        disabled={resetLoading}
                                                        className="w-full h-11 text-white font-bold rounded-xl"
                                                        style={{ background: 'linear-gradient(135deg, #92400E, #D97706)', boxShadow: '0 4px 16px rgba(217,119,6,0.3)' }}
                                                    >
                                                        {resetLoading ? (
                                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengirim...</>
                                                        ) : (
                                                            "Kirim Link Reset"
                                                        )}
                                                    </Button>
                                                </motion.div>
                                                <button
                                                    onClick={() => setMode("login")}
                                                    className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors py-1"
                                                >
                                                    ← Kembali ke Login
                                                </button>
                                            </div>
                                        )}

                                        <p className="text-center text-xs text-slate-400 mt-6">
                                            SIMPEKA SD © {new Date().getFullYear()} · Disdikbud Tabalong
                                        </p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
