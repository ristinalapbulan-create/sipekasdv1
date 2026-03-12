"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { auth, db } from "@/lib/firebase";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const loginSchema = z.object({
    email: z.string().email({ message: "Email tidak valid" }),
    password: z.string().min(6, { message: "Kata sandi minimal 6 karakter" }),
});

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
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
            // 1. Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            // 2. Fetch user role and details from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                throw new Error("Data pengguna tidak ditemukan di database");
            }

            const userData = userDoc.data();

            if (!userData.is_active) {
                throw new Error("Akun Anda tidak aktif. Silakan hubungi admin.");
            }

            // 3. Save to global store
            setAuth({
                uid: user.uid,
                email: user.email,
                role: userData.role,
                npsn: userData.npsn,
                namaInstansi: userData.nama_instansi,
            });

            // 4. Set secure cookie for middleware via an API route pattern (for now we use simple document.cookie hack on client if not using NextAuth)
            // Since it's client-side Firebase Auth, Next.js middleware needs the token in cookies.
            const idToken = await user.getIdToken();
            document.cookie = `auth_token=${idToken}; path=/; max-age=86400; SameSite=Strict; Secure`;
            document.cookie = `user_role=${userData.role}; path=/; max-age=86400; SameSite=Strict; Secure`;

            toast.success("Login berhasil!");

            // 5. Redirect based on role
            if (userData.role === "disdik") {
                router.push("/disdik/dashboard");
            } else {
                router.push("/sekolah/dashboard");
            }

        } catch (error: any) {
            console.error(error);
            let errorMessage = "Terjadi kesalahan saat login";
            if (error.code === 'auth/invalid-credential') {
                errorMessage = "Email atau kata sandi salah";
            } else if (error.message) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-slate-200">
                <CardHeader className="space-y-2 text-center pb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-2 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">SIMPEKA SD</CardTitle>
                    <CardDescription className="text-slate-500">
                        Sistem Manajemen PEKA Sekolah Dasar
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700">Email Utama</FormLabel>
                                        <FormControl>
                                            <Input placeholder="admin@disdikbudtabalong.id" {...field} className="bg-white/50" disabled={isLoading} />
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
                                        <FormLabel className="text-slate-700">Kata Sandi</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} className="bg-white/50" disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    "Masuk ke Sistem"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
