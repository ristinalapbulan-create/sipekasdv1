"use client";

import { useState, useEffect } from "react";
import { getAllDokumentasi, type Dokumentasi } from "@/lib/firestore-service";
import { toast } from "sonner";
import { Image as ImageIcon, ExternalLink, Calendar } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };


const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants: Variants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

export default function SekolahDokumentasiPage() {
    const [docsData, setDocsData] = useState<Dokumentasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchDocs() {
            setIsLoading(true);
            try { setDocsData(await getAllDokumentasi()); }
            catch { toast.error("Gagal mengambil data dokumentasi"); }
            finally { setIsLoading(false); }
        }
        fetchDocs();
    }, []);

    return (
        <div className="space-y-6">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                    style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Galeri Kegiatan</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight"
                    style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Album Dokumentasi
                </h1>
                <p className="text-slate-500 mt-1 font-medium text-sm">Galeri foto kegiatan dan acara Dinas Pendidikan Kabupaten Tabalong.</p>
            </motion.div>

            {/* ── GRID ── */}
            <motion.div variants={containerVariants} initial="hidden" animate="show"
                className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="rounded-2xl overflow-hidden border border-slate-100 bg-white">
                            <div className="h-52 bg-slate-100 animate-pulse" />
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-slate-100 rounded-lg w-3/4 animate-pulse" />
                                <div className="h-3 bg-slate-100 rounded-lg w-1/2 animate-pulse" />
                            </div>
                        </div>
                    ))
                ) : docsData.length === 0 ? (
                    <motion.div variants={itemVariants} className="col-span-full flex flex-col items-center justify-center py-20 text-center rounded-2xl border-2 border-dashed"
                        style={{ borderColor: `${P.sage}40`, backgroundColor: `${P.cream}80` }}>
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: '#D1FAE5' }}>
                            <ImageIcon className="h-8 w-8" style={{ color: P.forest }} />
                        </div>
                        <p className="font-bold text-slate-500">Belum ada dokumentasi tersedia dari Dinas Pendidikan.</p>
                    </motion.div>
                ) : (
                    docsData.map(docItem => (
                        <motion.div key={docItem.id} variants={itemVariants} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300 }}>
                            <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 hover:shadow-xl transition-all h-full flex flex-col"
                                style={{ borderLeft: `4px solid ${P.forest}` }}>
                                {/* Image */}
                                <div className="relative h-52 bg-slate-100 overflow-hidden cursor-pointer"
                                    onClick={() => window.open(docItem.link_tautan, '_blank')}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                    <img src={docItem.thumbnail_url || "https://placehold.co/600x400?text=No+Image"}
                                        alt={docItem.judul_kegiatan}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    {/* Overlay button */}
                                    <div className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black"
                                            style={{ backgroundColor: P.gold, color: P.forestDark }}>
                                            <ExternalLink className="h-3 w-3" /> Buka Tautan
                                        </span>
                                    </div>
                                    {/* Date badge */}
                                    <div className="absolute top-3 left-3 z-20">
                                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
                                            style={{ backgroundColor: `${P.forestDark}CC`, color: 'white' }}>
                                            <Calendar className="h-3 w-3" />
                                            {new Date(docItem.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                                {/* Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h3 className="font-black text-base text-slate-900 leading-tight mb-2 line-clamp-2">
                                        {docItem.judul_kegiatan}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-3 flex-1 font-medium leading-relaxed">
                                        {docItem.deskripsi}
                                    </p>
                                    <div className="pt-4 mt-4 border-t" style={{ borderColor: `${P.sage}20` }}>
                                        <button onClick={() => window.open(docItem.link_tautan, '_blank')}
                                            className="w-full h-9 rounded-xl text-xs font-black transition-all hover:shadow-md"
                                            style={{ backgroundColor: '#D1FAE5', color: P.forest }}>
                                            Lihat Dokumentasi →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        </div>
    );
}
