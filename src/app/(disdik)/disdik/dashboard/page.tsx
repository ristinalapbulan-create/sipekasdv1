"use client";

import { useEffect, useState } from "react";
import { getAllReports } from "@/lib/firestore-service";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
    CheckCircle2, Clock, FileWarning, School, TrendingUp, BarChart3, AlertCircle, RefreshCw,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

// ── PALETTE ──
const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

const MONTHS_MAP: Record<string, string> = {
    '01':'Januari','02':'Februari','03':'Maret','04':'April','05':'Mei','06':'Juni',
    '07':'Juli','08':'Agustus','09':'September','10':'Oktober','11':'November','12':'Desember'
};
const MONTHS_SHORT: Record<string, string> = {
    '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'Mei','06':'Jun',
    '07':'Jul','08':'Ags','09':'Sep','10':'Okt','11':'Nov','12':'Des'
};

const stagger: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp: Variants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 280, damping: 22 } } };

function AnimatedCounter({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
        if (value === 0) { setDisplay(0); return; }
        let cur = 0;
        const step = Math.max(1, Math.ceil(value / 40));
        const t = setInterval(() => { cur += step; if (cur >= value) { setDisplay(value); clearInterval(t); } else setDisplay(cur); }, 28);
        return () => clearInterval(t);
    }, [value]);
    return <span>{display}</span>;
}

type Stats = { total: number; menunggu: number; revisi: number; terverifikasi: number; sekolahMelapor: number };
type RecentReport = { id: string; nama_sekolah: string; bulan_laporan: string; status: string; created_at: string };

const StatusBadge = ({ status }: { status: string }) => {
    const cfg: Record<string, { bg: string; text: string }> = {
        Terverifikasi: { bg: '#D1FAE5', text: P.forest },
        Menunggu:      { bg: '#FEF3C7', text: '#D97706' },
        Revisi:        { bg: '#FEE2E2', text: '#DC2626' },
    };
    const s = cfg[status] || cfg.Menunggu;
    return (
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full shrink-0"
            style={{ backgroundColor: s.bg, color: s.text }}>{status}</span>
    );
};

const MONTH_KEYS = ['01','02','03','04','05','06','07','08','09','10','11','12'];

export default function DisdikDashboardPage() {
    const [stats, setStats] = useState<Stats>({ total: 0, menunggu: 0, revisi: 0, terverifikasi: 0, sekolahMelapor: 0 });
    const [recent, setRecent] = useState<RecentReport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState<string>("2026");
    const [selectedMonth, setSelectedMonth] = useState<string>("Semua");
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    async function fetchStats() {
        setIsLoading(true);
        try {
            const allReports = await getAllReports();
            const years = new Set<string>();
            allReports.forEach(r => { if (r.bulan_laporan) years.add(r.bulan_laporan.split("-")[0]); });
            setAvailableYears(Array.from(years).sort().reverse());

            let filtered = [...allReports];
            if (selectedYear !== "Semua") filtered = filtered.filter(r => r.bulan_laporan?.startsWith(selectedYear));
            if (selectedMonth !== "Semua") filtered = filtered.filter(r => r.bulan_laporan?.endsWith(`-${selectedMonth}`));

            let total = 0, menunggu = 0, revisi = 0, terverifikasi = 0;
            const sekolahSet = new Set<string>();
            const all: RecentReport[] = [];
            filtered.forEach(r => {
                total++;
                if (r.status === "Menunggu") menunggu++;
                if (r.status === "Revisi") revisi++;
                if (r.status === "Terverifikasi") terverifikasi++;
                sekolahSet.add(r.npsn_sekolah);
                all.push({ id: r.id, nama_sekolah: r.nama_sekolah, bulan_laporan: r.bulan_laporan, status: r.status, created_at: r.created_at });
            });
            all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setStats({ total, menunggu, revisi, terverifikasi, sekolahMelapor: sekolahSet.size });
            setRecent(all.slice(0, 6));
        } catch (error) { console.error(error); }
        finally { setIsLoading(false); }
    }

    useEffect(() => { fetchStats(); }, [selectedYear, selectedMonth]);

    const pctVerified = stats.total > 0 ? Math.round((stats.terverifikasi / stats.total) * 100) : 0;

    const statCards = [
        { label: 'Sekolah Melapor', value: stats.sekolahMelapor, sub: 'Sekolah aktif', icon: <School className="h-5 w-5" />, color: P.forest, bg: '#D1FAE5', border: P.forest },
        { label: 'Total Laporan',   value: stats.total,           sub: 'Semua periode', icon: <BarChart3 className="h-5 w-5" />, color: '#7C3AED', bg: '#EDE9FE', border: '#7C3AED' },
        { label: 'Menunggu',        value: stats.menunggu,        sub: 'Perlu ditinjau', icon: <Clock className="h-5 w-5" />, color: '#D97706', bg: '#FEF3C7', border: P.gold },
        { label: 'Perlu Revisi',    value: stats.revisi,          sub: 'Butuh perbaikan', icon: <FileWarning className="h-5 w-5" />, color: '#DC2626', bg: '#FEE2E2', border: '#DC2626' },
        { label: 'Terverifikasi',   value: stats.terverifikasi,   sub: 'Laporan disetujui', icon: <CheckCircle2 className="h-5 w-5" />, color: P.forest, bg: '#D1FAE5', border: P.sage },
    ];

    if (isLoading) return <LoadingScreen text="Menyiapkan data dashboard..." />;

    const displayMonth = selectedMonth === 'Semua' ? 'Semua Bulan' : MONTHS_MAP[selectedMonth] || selectedMonth;

    return (
        <div className="space-y-6">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                        style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Dashboard Disdik</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight"
                        style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Ringkasan Pelaporan
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Monitoring kegiatan PEKA Sekolah Dasar Kab. Tabalong</p>
                </div>
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-black rounded-xl shadow-sm transition-all self-start sm:self-auto"
                    style={{ background: P.gold, color: P.forestDark }}>
                    <RefreshCw className="h-4 w-4" /> Refresh
                </motion.button>
            </motion.div>

            {/* ── FILTER PERIODE ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ border: `1px solid ${P.sage}30` }}>
                {/* Header filter */}
                <div className="flex items-center justify-between px-4 py-3"
                    style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})` }}>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${P.gold}30` }}>
                            <Clock className="h-3.5 w-3.5" style={{ color: P.gold }} />
                        </div>
                        <span className="text-sm font-black text-white">Filter Periode</span>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: `${P.gold}25`, color: P.gold }}>
                        {selectedYear} · {displayMonth}
                    </span>
                </div>

                <div className="p-3 space-y-3" style={{ backgroundColor: P.cream }}>
                    {/* Tahun — compact chip row */}
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1.5 px-1" style={{ color: P.forest }}>Tahun</p>
                        <div className="flex flex-wrap gap-1.5">
                            {['Semua', ...availableYears].map(y => (
                                <button key={y} onClick={() => setSelectedYear(y)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-200"
                                    style={{
                                        backgroundColor: selectedYear === y ? P.forest : 'white',
                                        color: selectedYear === y ? 'white' : '#64748b',
                                        border: `1px solid ${selectedYear === y ? P.forest : '#E2E8F0'}`,
                                    }}>
                                    {y}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bulan — grid 4 kolom semua tampil */}
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1.5 px-1" style={{ color: P.forest }}>Bulan</p>
                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                            <button onClick={() => setSelectedMonth('Semua')}
                                className="col-span-1 py-2 rounded-lg text-[10px] font-black transition-all duration-200 text-center"
                                style={{
                                    backgroundColor: selectedMonth === 'Semua' ? P.gold : 'white',
                                    color: selectedMonth === 'Semua' ? P.forestDark : '#64748b',
                                    border: `1px solid ${selectedMonth === 'Semua' ? P.gold : '#E2E8F0'}`,
                                }}>
                                Semua
                            </button>
                            {MONTH_KEYS.map(m => (
                                <button key={m} onClick={() => setSelectedMonth(m)}
                                    className="py-2 rounded-lg text-[10px] font-black transition-all duration-200 text-center"
                                    style={{
                                        backgroundColor: selectedMonth === m ? P.gold : 'white',
                                        color: selectedMonth === m ? P.forestDark : '#64748b',
                                        border: `1px solid ${selectedMonth === m ? P.gold : '#E2E8F0'}`,
                                    }}>
                                    {MONTHS_SHORT[m]}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── STAT CARDS ── */}
            <motion.div variants={stagger} initial="hidden" animate="show"
                className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                {statCards.map((card) => (
                    <motion.div key={card.label} variants={fadeUp} whileHover={{ y: -4, boxShadow: `0 12px 32px ${card.color}18` }}
                        className="bg-white rounded-2xl p-4 border border-slate-100 transition-all"
                        style={{ borderLeft: `4px solid ${card.border}` }}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                            style={{ backgroundColor: card.bg }}>
                            <span style={{ color: card.color }}>{card.icon}</span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-500 leading-tight">{card.label}</p>
                        <p className="text-2xl sm:text-3xl font-black mt-0.5" style={{ color: card.color }}>
                            <AnimatedCounter value={card.value} />
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">{card.sub}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── BOTTOM ROW ── */}
            <div className="grid md:grid-cols-2 gap-5">
                {/* Progress Overview */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100"
                    style={{ borderLeft: `4px solid ${P.sage}` }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                            <TrendingUp className="h-4 w-4" style={{ color: P.forest }} />
                        </div>
                        <h2 className="text-sm font-black text-slate-900">Progress Verifikasi</h2>
                    </div>
                    <p className="text-xs text-slate-400 mb-5">Persentase laporan yang sudah disetujui</p>

                    <div className="flex items-center gap-5">
                        <div className="relative w-24 h-24 shrink-0">
                            <svg className="-rotate-90 w-full h-full">
                                <circle cx="48" cy="48" r="38" fill="none" stroke="#E2E8F0" strokeWidth="9" />
                                <motion.circle cx="48" cy="48" r="38" fill="none" stroke={P.forest}
                                    strokeWidth="9" strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 38}
                                    strokeDashoffset={2 * Math.PI * 38}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - pctVerified / 100) }}
                                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black" style={{ color: P.forest }}>{pctVerified}%</span>
                                <span className="text-[8px] font-bold text-slate-400">Verified</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            {[
                                { label: 'Terverifikasi', value: stats.terverifikasi, color: P.forest },
                                { label: 'Menunggu',      value: stats.menunggu,      color: P.gold },
                                { label: 'Revisi',        value: stats.revisi,        color: '#EF4444' },
                            ].map(item => (
                                <div key={item.label}>
                                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                        <span>{item.label}</span><span>{item.value}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                        <motion.div className="h-full rounded-full" style={{ backgroundColor: item.color }}
                                            initial={{ width: 0 }}
                                            animate={{ width: stats.total > 0 ? `${(item.value / stats.total) * 100}%` : '0%' }}
                                            transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {stats.menunggu > 0 && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                            className="mt-4 flex items-start gap-3 p-3 rounded-xl"
                            style={{ backgroundColor: '#FEF3C7', border: `1px solid ${P.gold}40` }}>
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#D97706' }} />
                            <p className="text-xs font-semibold" style={{ color: '#92400E' }}>
                                Ada <strong>{stats.menunggu}</strong> laporan menunggu verifikasi.
                            </p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Recent Activity */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100"
                    style={{ borderLeft: `4px solid ${P.gold}` }}>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEF3C7' }}>
                            <Clock className="h-4 w-4" style={{ color: '#D97706' }} />
                        </div>
                        <h2 className="text-sm font-black text-slate-900">Aktivitas Terbaru</h2>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Laporan terbaru yang masuk</p>

                    {recent.length === 0 ? (
                        <div className="h-40 flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#D1FAE5' }}>
                                <School className="h-6 w-6" style={{ color: P.forest }} />
                            </div>
                            <p className="text-sm font-bold text-slate-400">Belum ada laporan</p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {recent.map((r, i) => (
                                <motion.div key={r.id}
                                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 + i * 0.06 }}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                                    style={{ border: '1px solid #F1F5F9' }}>
                                    <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: '#D1FAE5' }}>
                                        <School className="h-3.5 w-3.5" style={{ color: P.forest }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">{r.nama_sekolah}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{r.bulan_laporan}</p>
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
