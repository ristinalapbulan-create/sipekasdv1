"use client";

import { useEffect, useState } from "react";
import { getReportsByNpsn } from "@/lib/firestore-service";
import { useAuthStore } from "@/lib/store";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { CheckCircle2, Clock, FileWarning, BookOpen, PlusCircle, TrendingUp, Calendar } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Link from "next/link";

const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

const stagger: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 22 } } };

type Report = { id: string; bulan_laporan: string; status: string; created_at: string; catatan_revisi?: string };

const StatusBadge = ({ status }: { status: string }) => {
    const cfg: Record<string, { bg: string; text: string }> = {
        Terverifikasi: { bg: '#D1FAE5', text: '#2D6A4F' },
        Menunggu:      { bg: '#FEF3C7', text: '#D97706' },
        Revisi:        { bg: '#FEE2E2', text: '#DC2626' },
    };
    const s = cfg[status] || cfg.Menunggu;
    return <span className="text-[10px] font-black px-2.5 py-1 rounded-full shrink-0" style={{ backgroundColor: s.bg, color: s.text }}>{status}</span>;
};

export default function SekolahDashboardPage() {
    const { npsn, namaInstansi } = useAuthStore();
    const [stats, setStats] = useState({ total: 0, menunggu: 0, revisi: 0, terverifikasi: 0 });
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!npsn) return;
        async function fetchStats() {
            try {
                const allReports = await getReportsByNpsn(npsn!);
                let total = 0, menunggu = 0, revisi = 0, terverifikasi = 0;
                const all: Report[] = [];
                allReports.forEach(r => {
                    total++;
                    if (r.status === "Menunggu") menunggu++;
                    if (r.status === "Revisi") revisi++;
                    if (r.status === "Terverifikasi") terverifikasi++;
                    all.push({ id: r.id, bulan_laporan: r.bulan_laporan, status: r.status, created_at: r.created_at, catatan_revisi: r.catatan_revisi });
                });
                all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setStats({ total, menunggu, revisi, terverifikasi });
                setReports(all);
            } catch (error) { console.error(error); }
            finally { setIsLoading(false); }
        }
        fetchStats();
    }, [npsn]);

    const pctVerified = stats.total > 0 ? Math.round((stats.terverifikasi / stats.total) * 100) : 0;
    const recentReports = reports.slice(0, 6);

    if (isLoading) return <LoadingScreen text="Menyiapkan data dashboard..." />;

    const statCards = [
        { label: 'Total Laporan',       value: stats.total,          sub: 'Semua periode',    icon: <BookOpen className="h-5 w-5" />,    color: '#7C3AED', bg: '#EDE9FE', border: '#7C3AED' },
        { label: 'Menunggu Verifikasi', value: stats.menunggu,       sub: 'Sedang diproses',  icon: <Clock className="h-5 w-5" />,      color: '#D97706', bg: '#FEF3C7', border: P.gold },
        { label: 'Perlu Revisi',        value: stats.revisi,         sub: 'Butuh perbaikan',  icon: <FileWarning className="h-5 w-5" />, color: '#DC2626', bg: '#FEE2E2', border: '#DC2626' },
        { label: 'Terverifikasi',       value: stats.terverifikasi,  sub: 'Laporan disetujui',icon: <CheckCircle2 className="h-5 w-5" />,color: P.forest,  bg: '#D1FAE5', border: P.sage },
    ];

    return (
        <div className="space-y-7">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                        style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Dashboard Sekolah</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                        Selamat Datang,{' '}
                        <span style={{ background: `linear-gradient(135deg, ${P.forest}, ${P.sage})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            {namaInstansi}
                        </span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Pantau status laporan kegiatan PEKA sekolah Anda</p>
                </div>
                <Link href="/sekolah/laporan">
                    <motion.div whileHover={{ scale: 1.04, boxShadow: `0 6px 20px ${P.gold}40` }} whileTap={{ scale: 0.96 }}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-xl shadow-lg cursor-pointer whitespace-nowrap transition-all"
                        style={{ background: P.gold, color: P.forestDark }}>
                        <PlusCircle className="h-4 w-4" /> Kirim Laporan Baru
                    </motion.div>
                </Link>
            </motion.div>

            {/* ── STAT CARDS ── */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {statCards.map(card => (
                    <motion.div key={card.label} variants={fadeUp} whileHover={{ y: -4, boxShadow: `0 12px 32px ${card.color}18` }}
                        className="bg-white rounded-2xl p-5 border border-slate-100 transition-all"
                        style={{ borderLeft: `4px solid ${card.border}` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                            style={{ backgroundColor: card.bg }}>
                            <span style={{ color: card.color }}>{card.icon}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-500">{card.label}</p>
                        <p className="text-3xl font-black mt-0.5" style={{ color: card.color }}>{card.value}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{card.sub}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── BOTTOM ROW ── */}
            <div className="grid md:grid-cols-2 gap-5">
                {/* Progress Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100"
                    style={{ borderLeft: `4px solid ${P.sage}` }}>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                            <TrendingUp className="h-4 w-4" style={{ color: P.forest }} />
                        </div>
                        <h2 className="text-sm font-black text-slate-900">Progress Kepatuhan</h2>
                    </div>

                    <div className="mb-5">
                        <div className="flex justify-between text-sm font-bold mb-2" style={{ color: P.forestDark }}>
                            <span>Laporan Terverifikasi</span>
                            <span style={{ color: P.forest }}>{pctVerified}%</span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${P.forest}15` }}>
                            <motion.div className="h-full rounded-full"
                                style={{ background: `linear-gradient(90deg, ${P.forest}, ${P.sage})` }}
                                initial={{ width: 0 }} animate={{ width: `${pctVerified}%` }}
                                transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }} />
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">{stats.terverifikasi} dari {stats.total} laporan disetujui</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                        {[
                            { label: 'Menunggu', value: stats.menunggu, bg: '#FEF3C7', color: '#D97706' },
                            { label: 'Revisi',   value: stats.revisi,   bg: '#FEE2E2', color: '#DC2626' },
                            { label: 'Terverif', value: stats.terverifikasi, bg: '#D1FAE5', color: P.forest },
                        ].map(item => (
                            <div key={item.label} className="rounded-xl p-3 text-center" style={{ backgroundColor: item.bg }}>
                                <p className="text-xl font-black" style={{ color: item.color }}>{item.value}</p>
                                <p className="text-[10px] font-bold mt-0.5" style={{ color: item.color }}>{item.label}</p>
                            </div>
                        ))}
                    </div>

                    {stats.revisi > 0 && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                            className="mt-4 p-3.5 rounded-xl" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }}>
                            <p className="text-xs font-semibold text-red-700">
                                ⚠️ Anda memiliki <strong>{stats.revisi}</strong> laporan yang perlu diperbaiki. Segera upload ulang!
                            </p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Recent Reports */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="bg-white rounded-2xl p-6 border border-slate-100"
                    style={{ borderLeft: `4px solid ${P.gold}` }}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                                <Calendar className="h-4 w-4" style={{ color: '#D97706' }} />
                            </div>
                            <h2 className="text-sm font-black text-slate-900">Riwayat Laporan</h2>
                        </div>
                        <Link href="/sekolah/laporan"
                            className="text-xs font-bold transition-colors" style={{ color: P.forest }}>
                            Lihat semua →
                        </Link>
                    </div>

                    {recentReports.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                                <BookOpen className="h-6 w-6" style={{ color: P.forest }} />
                            </div>
                            <p className="text-sm font-bold text-slate-400">Belum ada laporan yang dikirim</p>
                            <Link href="/sekolah/laporan">
                                <span className="text-xs font-bold" style={{ color: P.forest }}>Kirim laporan pertama →</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {recentReports.map((r, i) => (
                                <motion.div key={r.id}
                                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.06 }}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                    style={{ border: '1px solid #F1F5F9' }}>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900">{r.bulan_laporan}</p>
                                        {r.catatan_revisi && r.status === "Revisi" && (
                                            <p className="text-[10px] text-red-500 font-medium truncate mt-0.5">↩ {r.catatan_revisi}</p>
                                        )}
                                    </div>
                                    <StatusBadge status={r.status} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
