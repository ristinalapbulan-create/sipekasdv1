"use client";

import { useState, useEffect } from "react";
import { getAllSKs, type SK } from "@/lib/firestore-service";
import { toast } from "sonner";
import { FileText, Search, Download, ScrollText, Calendar } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

const stagger: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 22 } } };


export default function SKSekolahPage() {
    const [sks, setSks] = useState<SK[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        async function fetchSKs() {
            setIsLoading(true);
            try { setSks(await getAllSKs()); }
            catch { toast.error("Gagal mengambil data SK"); }
            finally { setIsLoading(false); }
        }
        fetchSKs();
    }, []);

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
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Dokumen Resmi</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight"
                        style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Surat Keputusan Disdik
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Arsip dan daftar SK resmi dari Dinas Pendidikan untuk sekolah.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: P.sage }} />
                    <input type="search" placeholder="Cari nomor/judul SK..."
                        className="pl-10 pr-4 py-2.5 w-full rounded-xl text-sm font-medium outline-none border"
                        style={{ borderColor: `${P.sage}30`, backgroundColor: 'white' }}
                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
            </motion.div>

            {/* ── COUNT ── */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="flex items-center gap-3 text-sm font-medium text-slate-500">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                    <FileText className="h-3.5 w-3.5" style={{ color: P.forest }} />
                </div>
                Menampilkan <strong style={{ color: P.forest }}>{filteredSks.length}</strong> dari {sks.length} SK
            </motion.div>

            {/* ── CARDS GRID ── */}
            {isLoading ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 animate-pulse">
                            <div className="h-5 bg-slate-100 rounded-lg w-1/3 mb-3" />
                            <div className="h-4 bg-slate-100 rounded-lg w-3/4 mb-2" />
                            <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
                        </div>
                    ))}
                </div>
            ) : filteredSks.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed"
                    style={{ borderColor: `${P.sage}40`, backgroundColor: `${P.cream}80` }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: '#D1FAE5' }}>
                        <FileText className="h-7 w-7" style={{ color: P.forest }} />
                    </div>
                    <p className="font-bold text-slate-500">Tidak ada SK yang ditemukan</p>
                </motion.div>
            ) : (
                <motion.div variants={stagger} initial="hidden" animate="show"
                    className="grid md:grid-cols-2 gap-4">
                    {filteredSks.map(sk => (
                        <motion.div key={sk.id} variants={fadeUp} whileHover={{ y: -3, boxShadow: `0 12px 32px ${P.forest}12` }}
                            className="bg-white rounded-2xl p-5 border border-slate-100 transition-all group flex flex-col"
                            style={{ borderLeft: `4px solid ${P.forest}` }}>
                            {/* Top */}
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: '#FEF3C7' }}>
                                    <ScrollText className="h-5 w-5" style={{ color: '#D97706' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: P.sage }}>Nomor Surat</p>
                                    <p className="text-sm font-black font-mono" style={{ color: P.forestDark }}>{sk.nomor_surat}</p>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-base font-black text-slate-900 leading-snug mb-3 flex-1">{sk.judul}</h3>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: `${P.sage}20` }}>
                                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {new Date(sk.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <motion.a href={sk.file_url} target="_blank" rel="noreferrer"
                                    whileHover={{ scale: 1.05, boxShadow: `0 4px 12px ${P.gold}40` }} whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all"
                                    style={{ backgroundColor: P.gold, color: P.forestDark }}>
                                    <Download className="h-3.5 w-3.5" /> Unduh SK
                                </motion.a>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
}
