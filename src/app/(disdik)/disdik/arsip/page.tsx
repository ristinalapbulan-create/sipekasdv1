"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllReports, type Report } from "@/lib/firestore-service";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { motion } from "framer-motion";
import { Database, Download, Search, FileSpreadsheet, Building2, MapPin, CalendarDays, FilterX } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

const MONTHS = [
    { value: "01", label: "Januari" }, { value: "02", label: "Februari" }, { value: "03", label: "Maret" },
    { value: "04", label: "April" }, { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
    { value: "07", label: "Juli" }, { value: "08", label: "Agustus" }, { value: "09", label: "September" },
    { value: "10", label: "Oktober" }, { value: "11", label: "November" }, { value: "12", label: "Desember" },
];

const KECAMATAN_LIST = ["Tanjung","Murung Pudak","Kelua","Haruai","Tanta","Upau","Jaro","Muara Uya","Bintang Ara","Muara Harus","Pugaan","Banua Lawas"];

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string }> = {
    Terverifikasi: { bg: '#D1FAE5', text: '#2D6A4F', dot: '#10B981' },
    Menunggu:      { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
    Revisi:        { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
};

export default function ArsipPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterKecamatan, setFilterKecamatan] = useState("all");
    const [filterBulan, setFilterBulan] = useState("all");
    const [filterTahun, setFilterTahun] = useState("all");

    const availableYears = useMemo(() => {
        const s = new Set<string>();
        reports.forEach(r => { if (r.bulan_laporan) s.add(r.bulan_laporan.split('-')[0]); });
        // Hanya dari database, tanpa dummy
        return Array.from(s).sort().reverse();
    }, [reports]);


    useEffect(() => {
        async function fetchReports() {
            try { setReports(await getAllReports()); }
            catch { /* silently fail */ }
            finally { setLoading(false); }
        }
        fetchReports();
    }, []);

    const filteredReports = useMemo(() => reports.filter(r => {
        const matchSearch = r.nama_sekolah.toLowerCase().includes(search.toLowerCase()) || r.npsn_sekolah.includes(search);
        const matchKecamatan = filterKecamatan === "all" || r.kecamatan === filterKecamatan;
        if (!r.bulan_laporan) return filterBulan === "all" && filterTahun === "all" && matchSearch && matchKecamatan;
        const [y, m] = r.bulan_laporan.split("-");
        return matchSearch && matchKecamatan && (filterBulan === "all" || m === filterBulan) && (filterTahun === "all" || y === filterTahun);
    }), [reports, search, filterKecamatan, filterBulan, filterTahun]);

    const isFiltered = search || filterKecamatan !== "all" || filterBulan !== "all" || filterTahun !== "all";

    const resetFilters = () => { setSearch(""); setFilterKecamatan("all"); setFilterBulan("all"); setFilterTahun("all"); };

    const handleExportExcel = () => {
        if (filteredReports.length === 0) { toast.error("Tidak ada data untuk dicetak"); return; }
        try {
            const data = filteredReports.map((r, i) => ({
                "No": i + 1, "NPSN": r.npsn_sekolah, "Nama Sekolah": r.nama_sekolah,
                "Kecamatan": r.kecamatan, "Periode/Bulan": r.bulan_laporan, "Status": r.status,
                "Link Jurnal": r.link_jurnal, "Link Daftar Hadir": r.link_daftar_hadir,
                "Link Dokumentasi": r.link_dokumentasi,
                "Waktu Submit": new Date(r.created_at).toLocaleString('id-ID'),
            }));
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Arsip Laporan PEKA");
            let fn = "Arsip_Laporan_PEKA_SD";
            if (filterKecamatan !== "all") fn += `_Kec_${filterKecamatan}`;
            if (filterBulan !== "all" && filterTahun !== "all") fn += `_${filterBulan}_${filterTahun}`;
            XLSX.writeFile(wb, `${fn}.xlsx`);
            toast.success("Berhasil mengunduh dokumen Excel");
        } catch { toast.error("Gagal mengunduh file Excel"); }
    };

    if (loading) return <LoadingScreen text="Memuat Data Arsip..." />;

    return (
        <div className="space-y-6">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                        style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Rekap Laporan</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight"
                        style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Arsip Laporan PEKA
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Daftar lengkap laporan yang telah dikumpulkan beserta rekapan data.</p>
                </div>
                <motion.button whileHover={{ scale: 1.04, boxShadow: `0 4px 16px ${P.gold}40` }} whileTap={{ scale: 0.96 }}
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black shadow-lg whitespace-nowrap"
                    style={{ background: P.gold, color: P.forestDark }}>
                    <FileSpreadsheet className="h-4 w-4" /> Ekspor Excel
                </motion.button>
            </motion.div>

            {/* ── FILTER BAR ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl p-4 space-y-3"
                style={{ backgroundColor: P.cream, border: `1px solid ${P.sage}30`, borderLeft: `4px solid ${P.forest}` }}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: P.sage }} />
                        <input placeholder="Cari NPSN atau Nama Sekolah..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2.5 w-full rounded-xl text-sm font-medium outline-none border"
                            style={{ borderColor: `${P.sage}30`, backgroundColor: 'white' }} />
                    </div>
                    {/* Kecamatan */}
                    <select value={filterKecamatan} onChange={e => setFilterKecamatan(e.target.value)}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold outline-none border"
                        style={{ borderColor: `${P.sage}30`, backgroundColor: 'white', color: P.forestDark }}>
                        <option value="all">📍 Semua Kecamatan</option>
                        {KECAMATAN_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                    {/* Bulan + Tahun inline */}
                    <div className="flex gap-2">
                        <select value={filterBulan} onChange={e => setFilterBulan(e.target.value)}
                            className="flex-1 px-3 py-2.5 rounded-xl text-sm font-bold outline-none border"
                            style={{ borderColor: `${P.sage}30`, backgroundColor: 'white', color: P.forestDark }}>
                            <option value="all">Bulan</option>
                            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                        <select value={filterTahun} onChange={e => setFilterTahun(e.target.value)}
                            className="flex-1 px-3 py-2.5 rounded-xl text-sm font-bold outline-none border"
                            style={{ borderColor: `${P.sage}30`, backgroundColor: 'white', color: P.forestDark }}>
                            <option value="all">Tahun</option>
                            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {isFiltered && (
                    <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: `${P.sage}20` }}>
                        <span className="text-xs font-bold" style={{ color: P.forest }}>
                            ✓ Menampilkan <strong>{filteredReports.length}</strong> hasil dari {reports.length} laporan
                        </span>
                        <button onClick={resetFilters}
                            className="flex items-center gap-1 text-xs font-black text-red-500 hover:text-red-700 transition-colors">
                            <FilterX className="h-3.5 w-3.5" /> Hapus Filter
                        </button>
                    </div>
                )}
            </motion.div>

            {/* ── TABLE ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100"
                style={{ borderLeft: `4px solid ${P.forest}` }}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead style={{ backgroundColor: P.cream }}>
                            <tr>
                                {['Nama Sekolah', 'Kecamatan', 'Periode', 'Status', 'Waktu Submit'].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-[11px] font-black uppercase tracking-wider"
                                        style={{ color: P.forest }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.length > 0 ? filteredReports.map(r => {
                                const s = STATUS_CFG[r.status] || STATUS_CFG.Menunggu;
                                return (
                                    <tr key={r.id} className="border-t hover:bg-slate-50/60 transition-colors group"
                                        style={{ borderColor: `${P.sage}10` }}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: '#D1FAE5' }}>
                                                    <Building2 className="h-4 w-4" style={{ color: P.forest }} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 group-hover:text-green-800 transition-colors text-sm">{r.nama_sekolah}</p>
                                                    <p className="text-[10px] font-mono text-slate-400">NPSN: {r.npsn_sekolah}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                                                style={{ backgroundColor: `${P.sage}15`, color: P.forestDark }}>
                                                <MapPin className="h-3 w-3" />{r.kecamatan}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-700 text-sm">{r.bulan_laporan}</td>
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black"
                                                style={{ backgroundColor: s.bg, color: s.text }}>
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                                                {r.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-400 font-medium">
                                            {new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                                style={{ backgroundColor: '#D1FAE5' }}>
                                                <Search className="h-7 w-7" style={{ color: P.forest }} />
                                            </div>
                                            <p className="font-bold text-slate-500">Tidak ada laporan yang cocok dengan filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-5 py-3 border-t" style={{ backgroundColor: P.cream, borderColor: `${P.sage}15` }}>
                    <p className="text-xs font-medium" style={{ color: P.sage }}>
                        Total {filteredReports.length} laporan ditemukan
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
