"use client";

import { useState, useEffect } from "react";
import { getAllSKs, addSK, deleteSK, type SK } from "@/lib/firestore-service";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, FileText, Upload, Search, ScrollText } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

const stagger: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 22 } } };

export default function KelolaSKPage() {
    const [sks, setSks] = useState<SK[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [nomorSurat, setNomorSurat] = useState("");
    const [judul, setJudul] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const fetchSKs = async () => {
        setIsLoading(true);
        try { setSks(await getAllSKs()); }
        catch { toast.error("Gagal mengambil data SK"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchSKs(); }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !nomorSurat || !judul) { toast.error("Mohon lengkapi semua kolom dan pilih file PDF"); return; }
        if (file.type !== "application/pdf") { toast.error("Format file harus PDF"); return; }
        setIsSubmitting(true);
        try {
            await addSK({ nomor_surat: nomorSurat, judul }, file);
            toast.success("SK Berhasil diunggah ke Firebase Storage");
            setIsDialogOpen(false);
            setNomorSurat(""); setJudul(""); setFile(null);
            fetchSKs();
        } catch { toast.error("Gagal mengunggah SK. Periksa koneksi internet."); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id: string, fileUrl: string) => {
        if (!confirm("Hapus SK ini secara permanen? File PDF juga akan dihapus.")) return;
        try { await deleteSK(id, fileUrl); toast.success("SK berhasil dihapus"); setSks(sks.filter(s => s.id !== id)); }
        catch { toast.error("Gagal menghapus SK"); }
    };

    const filteredSks = sks.filter(sk =>
        sk.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sk.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                        style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Dokumen Resmi</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight"
                        style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Surat Keputusan (SK)
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Kelola dan unggah SK Disdik untuk diakses oleh sekolah.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: P.sage }} />
                        <input type="search" placeholder="Cari nomor/judul SK..."
                            className="pl-10 pr-4 py-2.5 w-full rounded-xl text-sm font-medium outline-none border"
                            style={{ borderColor: `${P.sage}30`, backgroundColor: 'white' }}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <motion.button whileHover={{ scale: 1.04, boxShadow: `0 4px 16px ${P.gold}40` }} whileTap={{ scale: 0.96 }}
                        onClick={() => setIsDialogOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-xl shadow-lg transition-all whitespace-nowrap"
                        style={{ background: P.gold, color: P.forestDark }}>
                        <Plus className="h-4 w-4" /> Unggah SK Baru
                    </motion.button>
                </div>

                {/* Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
                        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${P.forest}, ${P.sage}, ${P.gold})` }} />
                        <div className="p-6">
                            <DialogHeader className="mb-5">
                                <DialogTitle className="text-xl font-black text-slate-900">Unggah SK Baru</DialogTitle>
                                <p className="text-sm text-slate-500 font-medium mt-1">Lengkapi informasi dan unggah file PDF ke Firebase Storage.</p>
                            </DialogHeader>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold mb-1.5 block" style={{ color: P.forestDark }}>Nomor Surat</label>
                                    <input value={nomorSurat} onChange={e => setNomorSurat(e.target.value)}
                                        placeholder="Contoh: SK/001/DISDIK/2026"
                                        className="w-full h-11 px-4 rounded-xl text-sm font-medium outline-none border"
                                        style={{ borderColor: `${P.sage}30`, backgroundColor: P.cream }}
                                        required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold mb-1.5 block" style={{ color: P.forestDark }}>Judul/Perihal SK</label>
                                    <input value={judul} onChange={e => setJudul(e.target.value)}
                                        placeholder="Masukkan judul SK"
                                        className="w-full h-11 px-4 rounded-xl text-sm font-medium outline-none border"
                                        style={{ borderColor: `${P.sage}30`, backgroundColor: P.cream }}
                                        required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold mb-1.5 block" style={{ color: P.forestDark }}>File SK (PDF)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:shadow-sm"
                                        style={{ borderColor: file ? P.forest : `${P.sage}40`, backgroundColor: file ? '#D1FAE550' : P.cream }}>
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-7 h-7 mb-2" style={{ color: file ? P.forest : P.sage }} />
                                            <p className="text-sm font-medium" style={{ color: file ? P.forest : '#64748b' }}>
                                                {file ? file.name : "Klik untuk pilih file PDF"}
                                            </p>
                                        </div>
                                        <input type="file" className="hidden" accept="application/pdf"
                                            onChange={e => setFile(e.target.files?.[0] || null)} required />
                                    </label>
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    type="submit" disabled={isSubmitting}
                                    className="w-full h-12 text-white font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                                    style={{ background: `linear-gradient(135deg, ${P.forest}, ${P.sage})` }}>
                                    {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah ke Firebase...</> : "Simpan Dokumen"}
                                </motion.button>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* ── TABLE ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ borderLeft: `4px solid ${P.gold}` }}>
                <div className="grid grid-cols-[1.5fr_2fr_1fr_auto] gap-4 px-6 py-3.5 border-b"
                    style={{ backgroundColor: P.cream, borderColor: `${P.sage}20` }}>
                    {['No. Surat', 'Judul', 'Tanggal', 'Aksi'].map(h => (
                        <span key={h} className="text-[11px] font-black uppercase tracking-wider" style={{ color: P.forest }}>{h}</span>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <Loader2 className="h-7 w-7 animate-spin" style={{ color: P.sage }} />
                        <p className="text-slate-500 font-medium text-sm">Memuat data dari Firebase...</p>
                    </div>
                ) : filteredSks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                            <FileText className="h-6 w-6" style={{ color: P.gold }} />
                        </div>
                        <p className="font-bold text-slate-500 text-sm">Tidak ada SK yang ditemukan</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredSks.map((sk, i) => (
                            <motion.div key={sk.id}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.04 }}
                                className="grid grid-cols-[1.5fr_2fr_1fr_auto] gap-4 items-center px-6 py-4 border-b last:border-0 hover:bg-slate-50/60 transition-colors"
                                style={{ borderColor: `${P.sage}15` }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#FEF3C7' }}>
                                        <ScrollText className="h-4 w-4" style={{ color: '#D97706' }} />
                                    </div>
                                    <span className="text-xs font-black font-mono" style={{ color: P.forestDark }}>{sk.nomor_surat}</span>
                                </div>
                                <p className="text-sm font-medium text-slate-700 leading-snug">{sk.judul}</p>
                                <p className="text-xs text-slate-400 font-medium">
                                    {new Date(sk.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                <div className="flex items-center gap-2">
                                    <motion.a href={sk.file_url} target="_blank" rel="noreferrer"
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl transition-all"
                                        style={{ backgroundColor: '#D1FAE5', color: P.forest }}>
                                        <FileText className="h-3.5 w-3.5" /> Buka
                                    </motion.a>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDelete(sk.id, sk.file_url)}
                                        className="flex items-center justify-center w-8 h-8 rounded-xl transition-all"
                                        style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!isLoading && filteredSks.length > 0 && (
                    <div className="px-6 py-3 border-t" style={{ backgroundColor: P.cream, borderColor: `${P.sage}20` }}>
                        <p className="text-xs font-medium" style={{ color: P.sage }}>
                            Menampilkan {filteredSks.length} dari {sks.length} SK
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
