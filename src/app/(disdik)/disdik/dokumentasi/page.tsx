"use client";

import { useState, useEffect } from "react";
import { getAllDokumentasi, addDokumentasi, deleteDokumentasi, type Dokumentasi } from "@/lib/firestore-service";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Image as ImageIcon, Upload, ExternalLink, Calendar } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants: Variants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

export default function KelolaDokumentasiPage() {
    const [docsData, setDocsData] = useState<Dokumentasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [judulKegiatan, setJudulKegiatan] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [tautan, setTautan] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const fetchDocs = async () => {
        setIsLoading(true);
        try { setDocsData(await getAllDokumentasi()); }
        catch { toast.error("Gagal mengambil data dokumentasi"); }
        finally { setIsLoading(false); }
    };
    useEffect(() => { fetchDocs(); }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !judulKegiatan || !deskripsi || !tautan) { toast.error("Mohon lengkapi semua kolom dan pilih 1 foto thumbnail"); return; }
        if (!file.type.startsWith("image/")) { toast.error("Format file harus berupa gambar (JPG/PNG)"); return; }
        setIsSubmitting(true);
        try {
            await addDokumentasi({ judul_kegiatan: judulKegiatan, deskripsi, link_tautan: tautan }, file);
            toast.success("Dokumentasi berhasil diunggah ke Firebase Storage");
            setIsDialogOpen(false);
            setJudulKegiatan(""); setDeskripsi(""); setTautan(""); setFile(null);
            fetchDocs();
        } catch { toast.error("Gagal mengunggah dokumentasi. Periksa koneksi internet."); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus dokumentasi ini secara permanen?")) return;
        try { await deleteDokumentasi(id); toast.success("Dokumentasi berhasil dihapus"); setDocsData(d => d.filter(x => x.id !== id)); }
        catch { toast.error("Gagal menghapus dokumentasi"); }
    };

    return (
        <div className="space-y-6">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                        style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Galeri Kegiatan</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight"
                        style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Kelola Dokumentasi
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Kelola foto-foto kegiatan dan album dokumentasi Disdik.</p>
                </div>
                <motion.button whileHover={{ scale: 1.04, boxShadow: `0 4px 16px ${P.gold}40` }} whileTap={{ scale: 0.96 }}
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-xl shadow-lg whitespace-nowrap"
                    style={{ background: P.gold, color: P.forestDark }}>
                    <Plus className="h-4 w-4" /> Unggah Dokumentasi
                </motion.button>

                {/* Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl">
                        <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${P.forest}, ${P.sage}, ${P.gold})` }} />
                        <div className="p-6">
                            <DialogHeader className="mb-5">
                                <DialogTitle className="text-xl font-black text-slate-900">Unggah Dokumentasi</DialogTitle>
                                <p className="text-sm text-slate-500 font-medium mt-1">Masukkan detail dan pilih foto kegiatan.</p>
                            </DialogHeader>
                            <form onSubmit={handleUpload} className="space-y-4">
                                <div>
                                    <label className="text-sm font-bold mb-1.5 block" style={{ color: P.forestDark }}>Judul Kegiatan</label>
                                    <input value={judulKegiatan} onChange={e => setJudulKegiatan(e.target.value)}
                                        placeholder="Contoh: Sosialisasi Kurikulum Merdeka"
                                        className="w-full h-11 px-4 rounded-xl text-sm font-medium outline-none border"
                                        style={{ borderColor: `${P.sage}30`, backgroundColor: P.cream }} required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold mb-1.5 block" style={{ color: P.forestDark }}>Deskripsi Singkat</label>
                                    <Textarea value={deskripsi} onChange={e => setDeskripsi(e.target.value)}
                                        placeholder="Masukkan deskripsi kegiatan"
                                        className="min-h-[90px] resize-none rounded-xl text-sm font-medium"
                                        style={{ borderColor: `${P.sage}30`, backgroundColor: P.cream }} required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold mb-1.5 block" style={{ color: P.forestDark }}>Tautan Dokumentasi (G-Drive)</label>
                                    <input value={tautan} onChange={e => setTautan(e.target.value)}
                                        placeholder="https://drive.google.com/..."
                                        className="w-full h-11 px-4 rounded-xl text-sm font-medium outline-none border"
                                        style={{ borderColor: `${P.sage}30`, backgroundColor: P.cream }} required />
                                </div>
                                <div>
                                    <label className="text-sm font-bold mb-1.5 block" style={{ color: P.forestDark }}>Foto Thumbnail</label>
                                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all"
                                        style={{ borderColor: file ? P.forest : `${P.sage}40`, backgroundColor: file ? '#D1FAE530' : P.cream }}>
                                        <Upload className="w-7 h-7 mb-1.5" style={{ color: file ? P.forest : P.sage }} />
                                        <p className="text-xs font-medium" style={{ color: file ? P.forest : '#64748b' }}>
                                            {file ? file.name : "Klik untuk pilih Foto (JPG/PNG)"}
                                        </p>
                                        <input type="file" className="hidden" accept="image/*"
                                            onChange={e => setFile(e.target.files?.[0] || null)} required />
                                    </label>
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    type="submit" disabled={isSubmitting}
                                    className="w-full h-12 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2"
                                    style={{ background: `linear-gradient(135deg, ${P.forest}, ${P.sage})` }}>
                                    {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Mengunggah ke Firebase...</> : "Simpan Dokumentasi"}
                                </motion.button>
                            </form>
                        </div>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* ── GALLERY GRID ── */}
            <motion.div variants={containerVariants} initial="hidden" animate="show"
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden border border-slate-100 bg-white animate-pulse">
                            <div className="h-52 bg-slate-100" />
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
                                <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                            </div>
                        </div>
                    ))
                ) : docsData.length === 0 ? (
                    <motion.div variants={itemVariants} className="col-span-full flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed"
                        style={{ borderColor: `${P.sage}40`, backgroundColor: `${P.cream}80` }}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#D1FAE5' }}>
                            <ImageIcon className="h-7 w-7" style={{ color: P.forest }} />
                        </div>
                        <p className="font-bold text-slate-500 text-sm">Belum ada dokumentasi. Mulai unggah foto kegiatan pertama.</p>
                    </motion.div>
                ) : docsData.map(item => (
                    <motion.div key={item.id} variants={itemVariants} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }}>
                        <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all h-full flex flex-col"
                            style={{ borderLeft: `4px solid ${P.forest}` }}>
                            {/* Image */}
                            <div className="relative h-52 bg-slate-100 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                <img src={item.thumbnail_url || "https://placehold.co/600x400?text=No+Image"}
                                    alt={item.judul_kegiatan}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                {/* Date */}
                                <div className="absolute top-3 left-3 z-20">
                                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                        style={{ backgroundColor: `${P.forestDark}CC`, color: 'white' }}>
                                        <Calendar className="h-3 w-3" />
                                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                {/* Link button */}
                                <a href={item.link_tautan} target="_blank" rel="noreferrer"
                                    className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black"
                                        style={{ backgroundColor: P.gold, color: P.forestDark }}>
                                        <ExternalLink className="h-3 w-3" /> Buka Tautan
                                    </span>
                                </a>
                            </div>
                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-black text-base text-slate-900 leading-tight mb-2 line-clamp-2">{item.judul_kegiatan}</h3>
                                <p className="text-sm text-slate-500 line-clamp-2 flex-1 font-medium leading-relaxed">{item.deskripsi}</p>
                                <div className="flex items-center justify-between pt-4 mt-4 border-t"
                                    style={{ borderColor: `${P.sage}20` }}>
                                    <a href={item.link_tautan} target="_blank" rel="noreferrer"
                                        className="text-xs font-black transition-colors"
                                        style={{ color: P.forest }}>
                                        Lihat Dokumentasi →
                                    </a>
                                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={() => handleDelete(item.id)}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                                        style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
