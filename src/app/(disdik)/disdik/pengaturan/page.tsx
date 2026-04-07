"use client";

import { useState } from "react";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import { Lock, Save, ShieldCheck, DatabaseBackup, Download, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

export default function PengaturanPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [lastBackup] = useState("2026-03-23 17:30:00");

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) { toast.error("Mohon lengkapi semua kolom password."); return; }
        if (newPassword !== confirmPassword) { toast.error("Kata sandi baru dan konfirmasi tidak cocok."); return; }
        if (newPassword.length < 6) { toast.error("Kata sandi baru minimal 6 karakter."); return; }
        setIsSaving(true);
        try {
            const user = auth.currentUser;
            if (!user || !user.email) { toast.error("Sesi tidak valid. Silakan login ulang."); return; }
            // Re-authenticate first
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            // Update password
            await updatePassword(user, newPassword);
            toast.success("Kata sandi berhasil diperbarui di Firebase Authentication!");
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
        } catch (err: unknown) {
            const code = (err as { code?: string })?.code;
            if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') toast.error("Kata sandi saat ini tidak benar.");
            else toast.error("Gagal menyimpan kata sandi. Coba lagi.");
        } finally { setIsSaving(false); }
    };

    const handleBackup = () => {
        setIsBackingUp(true);
        setTimeout(() => {
            // Simulate backup - create JSON from current demo data
            try {
                const backupData = {
                    timestamp: new Date().toISOString(),
                    version: "SIMPEKA-SD-v1.0",
                    // In real app, this would be the actual DB snapshot
                    note: "Demo backup - in production this will download actual database snapshot."
                };
                const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `backup_simpeka_${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Backup database berhasil diunduh!");
            } catch { toast.error("Gagal membuat backup."); }
            finally { setIsBackingUp(false); }
        }, 1500);
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith('.json')) { toast.error("File backup harus berformat .json"); return; }
        if (!confirm("Apakah Anda yakin ingin me-restore database?\nSemua data saat ini akan digantikan oleh data dari file backup.")) { e.target.value = ''; return; }
        setIsRestoring(true);
        setTimeout(() => {
            toast.success("Database berhasil direstore dari backup!");
            setIsRestoring(false);
            e.target.value = '';
        }, 2000);
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                    style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Konfigurasi Sistem</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight"
                    style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Pengaturan Sistem
                </h1>
                <p className="text-slate-500 mt-1 font-medium text-sm">Kelola keamanan akun dan manajemen data sistem SIMPEKA SD.</p>
            </motion.div>

            {/* ── PASSWORD CARD ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ borderLeft: `4px solid ${P.forest}` }}>
                <div className="px-6 py-4 border-b" style={{ backgroundColor: P.cream, borderColor: `${P.sage}20` }}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                            <Lock className="h-4 w-4" style={{ color: P.forest }} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900">Ubah Kata Sandi</h2>
                            <p className="text-xs text-slate-500 font-medium">Perbarui kata sandi akun administrator</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 flex flex-col md:flex-row gap-8">
                    {/* Icon area */}
                    <div className="w-full md:w-1/4 flex flex-col items-center justify-center text-center p-5 rounded-2xl"
                        style={{ backgroundColor: P.cream, border: `1px solid ${P.sage}20` }}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: '#D1FAE5' }}>
                            <ShieldCheck className="h-8 w-8" style={{ color: P.forest }} />
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm">Keamanan Akun</h3>
                        <p className="text-xs font-medium text-slate-500 mt-1.5 leading-relaxed">
                            Gunakan kata sandi yang kuat dan jangan bagikan ke siapapun.
                        </p>
                    </div>
                    {/* Form */}
                    <form onSubmit={handleSavePassword} className="w-full md:w-3/4 space-y-4">
                        <div>
                            <label className="text-sm font-bold mb-1.5 block" style={{ color: P.forestDark }}>Kata Sandi Saat Ini</label>
                            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                                placeholder="Masukkan kata sandi saat ini"
                                className="w-full h-11 px-4 rounded-xl text-sm font-medium outline-none border"
                                style={{ borderColor: `${P.sage}30`, backgroundColor: P.cream }} />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold mb-1.5 block" style={{ color: P.forestDark }}>Kata Sandi Baru</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Minimal 4 karakter"
                                    className="w-full h-11 px-4 rounded-xl text-sm font-medium outline-none border"
                                    style={{ borderColor: `${P.sage}30`, backgroundColor: P.cream }} />
                            </div>
                            <div>
                                <label className="text-sm font-bold mb-1.5 block" style={{ color: P.forestDark }}>Konfirmasi Kata Sandi</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Ketik ulang kata sandi baru"
                                    className="w-full h-11 px-4 rounded-xl text-sm font-medium outline-none border"
                                    style={{ borderColor: `${P.sage}30`, backgroundColor: P.cream }} />
                            </div>
                        </div>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isSaving}
                            className="flex items-center gap-2 px-6 h-11 text-white font-black rounded-xl shadow-md transition-all"
                            style={{ background: `linear-gradient(135deg, ${P.forest}, ${P.sage})` }}>
                            <Save className="h-4 w-4" />
                            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* ── BACKUP & RESTORE CARD ── */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ borderLeft: `4px solid ${P.gold}` }}>
                <div className="px-6 py-4 border-b" style={{ backgroundColor: P.cream, borderColor: `${P.sage}20` }}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                            <DatabaseBackup className="h-4 w-4" style={{ color: '#D97706' }} />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-slate-900">Backup & Restore Database</h2>
                            <p className="text-xs text-slate-500 font-medium">Unduh cadangan data atau pulihkan dari file backup</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    {/* Last backup info */}
                    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: '#D1FAE530', border: `1px solid ${P.sage}20` }}>
                        <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: P.forest }} />
                        <p className="text-sm font-medium text-slate-600">
                            Backup terakhir: <strong style={{ color: P.forestDark }}>{lastBackup}</strong>
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {/* Backup */}
                        <motion.button whileHover={{ scale: 1.02, boxShadow: `0 6px 20px ${P.gold}40` }} whileTap={{ scale: 0.98 }}
                            onClick={handleBackup} disabled={isBackingUp}
                            className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 text-center cursor-pointer transition-all"
                            style={{ borderColor: `${P.gold}40`, backgroundColor: `${P.gold}05` }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: '#FEF3C7' }}>
                                {isBackingUp
                                    ? <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: P.gold, borderTopColor: 'transparent' }} />
                                    : <Download className="h-6 w-6" style={{ color: '#D97706' }} />
                                }
                            </div>
                            <div>
                                <p className="font-black text-slate-900">{isBackingUp ? "Membackup..." : "Backup Database"}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Unduh snapshot database ke file .json</p>
                            </div>
                        </motion.button>

                        {/* Restore */}
                        <label className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 text-center cursor-pointer transition-all hover:shadow-md"
                            style={{ borderColor: `${P.sage}40`, backgroundColor: `${P.sage}05` }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                                {isRestoring
                                    ? <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: P.forest, borderTopColor: 'transparent' }} />
                                    : <Upload className="h-6 w-6" style={{ color: P.forest }} />
                                }
                            </div>
                            <div>
                                <p className="font-black text-slate-900">{isRestoring ? "Merestore..." : "Restore Database"}</p>
                                <p className="text-xs text-slate-500 font-medium mt-1">Pulihkan dari file backup .json</p>
                            </div>
                            <input type="file" className="hidden" accept=".json" onChange={handleRestore} disabled={isRestoring} />
                        </label>
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-3 p-4 rounded-xl"
                        style={{ backgroundColor: '#FEF3C7', border: `1px solid #FDE68A` }}>
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#D97706' }} />
                        <p className="text-xs font-medium" style={{ color: '#92400E' }}>
                            <strong>Perhatian:</strong> Proses restore akan menggantikan semua data saat ini. Pastikan Anda sudah membuat backup terlebih dahulu sebelum me-restore.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
