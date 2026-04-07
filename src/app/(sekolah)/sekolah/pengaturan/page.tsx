"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { getGuruPeka, addGuruPeka, updateGuruPeka, deleteGuruPeka, type GuruPeka } from "@/lib/firestore-service";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Settings, School, MapPin, Hash, Users, Phone, Plus,
    Pencil, Trash2, Loader2, KeyRound, Eye, EyeOff, X, Check,
} from "lucide-react";

const P = { forest: "#2D6A4F", forestDark: "#1A3C2B", sage: "#74B38A", gold: "#FAC84A", cream: "#FEFAE0" };

// ─── Komponen Card Section ─────────────────────────────────────────────
function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
            style={{ borderLeft: `4px solid ${P.forest}` }}>
            <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ backgroundColor: P.cream, borderColor: `${P.sage}20` }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${P.forest}15` }}>
                    <span style={{ color: P.forest }}>{icon}</span>
                </div>
                <h2 className="text-sm font-black" style={{ color: P.forestDark }}>{title}</h2>
            </div>
            <div className="p-5">{children}</div>
        </motion.div>
    );
}

// ─── Modal Tambah/Edit Guru ────────────────────────────────────────────
function GuruModal({ open, guru, onClose, onSave }: {
    open: boolean; guru: GuruPeka | null;
    onClose: () => void; onSave: (data: { nama: string; nomor_hp: string }) => Promise<void>;
}) {
    const [nama, setNama] = useState(guru?.nama ?? "");
    const [hp, setHp] = useState(guru?.nomor_hp ?? "");
    const [saving, setSaving] = useState(false);

    useEffect(() => { setNama(guru?.nama ?? ""); setHp(guru?.nomor_hp ?? ""); }, [guru]);

    const handleSave = async () => {
        if (!nama.trim()) { toast.error("Nama guru wajib diisi"); return; }
        if (!hp.trim()) { toast.error("Nomor HP wajib diisi"); return; }
        setSaving(true);
        await onSave({ nama: nama.trim(), nomor_hp: hp.trim() });
        setSaving(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}>
                    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                        className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="h-1" style={{ background: `linear-gradient(90deg,${P.forest},${P.gold})` }} />
                        <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-black" style={{ color: P.forestDark }}>
                                    {guru ? "Edit Data Guru" : "Tambah Guru PEKA"}
                                </h3>
                                <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider mb-1 block" style={{ color: P.sage }}>Nama Guru</label>
                                    <input value={nama} onChange={e => setNama(e.target.value)}
                                        placeholder="Nama lengkap guru PEKA"
                                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium border outline-none"
                                        style={{ borderColor: `${P.sage}40`, backgroundColor: P.cream }} />
                                </div>
                                <div>
                                    <label className="text-xs font-black uppercase tracking-wider mb-1 block" style={{ color: P.sage }}>No. HP / WhatsApp</label>
                                    <input value={hp} onChange={e => setHp(e.target.value)} type="tel"
                                        placeholder="cth: 0812xxxxxxxx"
                                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium border outline-none"
                                        style={{ borderColor: `${P.sage}40`, backgroundColor: P.cream }} />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-5">
                                <button onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-black border transition-all"
                                    style={{ borderColor: "#E2E8F0", color: "#64748B" }}>
                                    Batal
                                </button>
                                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all"
                                    style={{ background: `linear-gradient(135deg,${P.forest},${P.sage})`, opacity: saving ? 0.7 : 1 }}>
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    {guru ? "Simpan" : "Tambah"}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

// ─── Halaman Utama ─────────────────────────────────────────────────────
export default function PengaturanSekolahPage() {
    const { uid, namaInstansi, npsn, kecamatan } = useAuthStore() as {
        uid: string | null; namaInstansi: string | null; npsn: string | null; kecamatan?: string;
    };

    // Guru PEKA state
    const [guruList, setGuruList] = useState<GuruPeka[]>([]);
    const [loadingGuru, setLoadingGuru] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editGuru, setEditGuru] = useState<GuruPeka | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Password state
    const [pwOld, setPwOld] = useState("");
    const [pwNew, setPwNew] = useState("");
    const [pwConfirm, setPwConfirm] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    // Fetch guru
    useEffect(() => {
        if (!uid) return;
        setLoadingGuru(true);
        getGuruPeka(uid).then(setGuruList).catch(() => toast.error("Gagal memuat data guru")).finally(() => setLoadingGuru(false));
    }, [uid]);

    // Guru handlers
    const handleSaveGuru = async (data: { nama: string; nomor_hp: string }) => {
        if (!uid) return;
        try {
            if (editGuru) {
                await updateGuruPeka(uid, editGuru.id, data);
                setGuruList(prev => prev.map(g => g.id === editGuru.id ? { ...g, ...data } : g));
                toast.success("Data guru berhasil diperbarui");
            } else {
                const id = await addGuruPeka(uid, data);
                setGuruList(prev => [...prev, { id, ...data }]);
                toast.success("Guru PEKA berhasil ditambahkan");
            }
            setModalOpen(false); setEditGuru(null);
        } catch { toast.error("Gagal menyimpan data guru"); }
    };

    const handleDeleteGuru = async (guru: GuruPeka) => {
        if (!uid || !confirm(`Hapus guru ${guru.nama}?`)) return;
        setDeletingId(guru.id);
        try {
            await deleteGuruPeka(uid, guru.id);
            setGuruList(prev => prev.filter(g => g.id !== guru.id));
            toast.success("Data guru berhasil dihapus");
        } catch { toast.error("Gagal menghapus data guru"); }
        finally { setDeletingId(null); }
    };

    // Password handler
    const handleChangePassword = async () => {
        if (!pwOld) { toast.error("Masukkan password lama"); return; }
        if (pwNew.length < 8) { toast.error("Password baru minimal 8 karakter"); return; }
        if (pwNew !== pwConfirm) { toast.error("Konfirmasi password tidak cocok"); return; }
        setSavingPw(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user || !user.email) throw new Error("User tidak ditemukan");
            const cred = EmailAuthProvider.credential(user.email, pwOld);
            await reauthenticateWithCredential(user, cred);
            await updatePassword(user, pwNew);
            toast.success("Password berhasil diubah! Silakan login ulang.");
            setPwOld(""); setPwNew(""); setPwConfirm("");
        } catch (err: unknown) {
            const msg = (err as { code?: string })?.code === "auth/wrong-password"
                ? "Password lama tidak benar" : "Gagal mengubah password";
            toast.error(msg);
        }
        finally { setSavingPw(false); }
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                    style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Akun Sekolah</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight"
                    style={{ background: `linear-gradient(135deg,${P.forestDark},${P.forest})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Pengaturan
                </h1>
                <p className="text-slate-500 mt-1 text-sm font-medium">Kelola informasi, guru PEKA, dan keamanan akun sekolah.</p>
            </motion.div>

            {/* Info Sekolah */}
            <SectionCard title="Informasi Sekolah" icon={<School className="h-4 w-4" />}>
                <div className="space-y-3">
                    {[
                        { label: "Nama Sekolah", value: namaInstansi ?? "-", icon: <School className="h-3.5 w-3.5" /> },
                        { label: "NPSN", value: npsn ?? "-", icon: <Hash className="h-3.5 w-3.5" /> },
                        { label: "Kecamatan", value: kecamatan ?? "-", icon: <MapPin className="h-3.5 w-3.5" /> },
                    ].map(item => (
                        <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: `${P.sage}08`, border: `1px solid ${P.sage}20` }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${P.forest}15`, color: P.forest }}>{item.icon}</div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: P.sage }}>{item.label}</p>
                                <p className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-3 italic">Informasi ini dikelola oleh Disdikbud Tabalong. Hubungi admin jika ada kesalahan.</p>
            </SectionCard>

            {/* Guru PEKA */}
            <SectionCard title="Data Guru PEKA" icon={<Users className="h-4 w-4" />}>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-slate-500 font-medium">{guruList.length} guru terdaftar</p>
                    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => { setEditGuru(null); setModalOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-white"
                        style={{ background: `linear-gradient(135deg,${P.forest},${P.sage})` }}>
                        <Plus className="h-3.5 w-3.5" /> Tambah Guru
                    </motion.button>
                </div>

                {loadingGuru ? (
                    <div className="flex items-center justify-center h-20"><Loader2 className="h-5 w-5 animate-spin" style={{ color: P.sage }} /></div>
                ) : guruList.length === 0 ? (
                    <div className="text-center py-8 rounded-xl" style={{ backgroundColor: `${P.sage}08`, border: `1px dashed ${P.sage}40` }}>
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-30" style={{ color: P.forest }} />
                        <p className="text-sm font-bold text-slate-400">Belum ada guru PEKA</p>
                        <p className="text-xs text-slate-300 mt-1">Klik "Tambah Guru" untuk menambahkan</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {guruList.map((guru, i) => (
                            <motion.div key={guru.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-xl group"
                                style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                                <div className="w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: `${P.forest}15`, color: P.forest }}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-slate-800 truncate">{guru.nama}</p>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <Phone className="h-3 w-3" style={{ color: P.sage }} />
                                        <p className="text-xs font-medium text-slate-500">{guru.nomor_hp}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setEditGuru(guru); setModalOpen(true); }}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                        style={{ backgroundColor: `${P.forest}10`, color: P.forest }}
                                        title="Edit">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteGuru(guru)}
                                        disabled={deletingId === guru.id}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                                        style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
                                        title="Hapus">
                                        {deletingId === guru.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* Ubah Password */}
            <SectionCard title="Ubah Password" icon={<KeyRound className="h-4 w-4" />}>
                <div className="space-y-3">
                    {/* Password Lama */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider mb-1 block" style={{ color: P.sage }}>Password Lama</label>
                        <div className="relative">
                            <input type={showPw ? "text" : "password"} value={pwOld} onChange={e => setPwOld(e.target.value)}
                                placeholder="Masukkan password saat ini"
                                className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-medium border outline-none"
                                style={{ borderColor: `${P.sage}40`, backgroundColor: P.cream }} />
                            <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    {/* Password Baru */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider mb-1 block" style={{ color: P.sage }}>Password Baru</label>
                        <input type={showPw ? "text" : "password"} value={pwNew} onChange={e => setPwNew(e.target.value)}
                            placeholder="Min. 8 karakter"
                            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium border outline-none"
                            style={{ borderColor: `${P.sage}40`, backgroundColor: P.cream }} />
                    </div>
                    {/* Konfirmasi */}
                    <div>
                        <label className="text-xs font-black uppercase tracking-wider mb-1 block" style={{ color: P.sage }}>Konfirmasi Password Baru</label>
                        <input type={showPw ? "text" : "password"} value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                            placeholder="Ulangi password baru"
                            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium border outline-none"
                            style={{
                                borderColor: pwConfirm && pwConfirm !== pwNew ? "#EF4444" : `${P.sage}40`,
                                backgroundColor: P.cream
                            }} />
                        {pwConfirm && pwConfirm !== pwNew && (
                            <p className="text-xs text-red-500 mt-1 font-medium">Password tidak cocok</p>
                        )}
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={handleChangePassword} disabled={savingPw}
                        className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 mt-2"
                        style={{ background: savingPw ? P.sage : `linear-gradient(135deg,${P.forestDark},${P.forest})`, opacity: savingPw ? 0.8 : 1 }}>
                        {savingPw ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</> : <><KeyRound className="h-4 w-4" /> Ubah Password</>}
                    </motion.button>
                </div>
            </SectionCard>

            {/* Modal Guru */}
            <GuruModal open={modalOpen} guru={editGuru}
                onClose={() => { setModalOpen(false); setEditGuru(null); }}
                onSave={handleSaveGuru} />
        </div>
    );
}
