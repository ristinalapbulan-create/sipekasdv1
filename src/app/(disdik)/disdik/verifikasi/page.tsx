"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllReports, updateReportStatus } from "@/lib/firestore-service";
import { toast } from "sonner";
import {
    Loader2, Search, FileText, Filter, Eye,
    CheckCircle, XCircle, Users, Image, Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// ─── Palet Warna ───────────────────────────────────────────────
const P = {
    forest: "#2D6A4F",
    forestDark: "#1A3C2B",
    sage: "#74B38A",
    gold: "#FAC84A",
    cream: "#FEFAE0",
};

// ─── Types ─────────────────────────────────────────────────────
type ReportData = {
    id: string;
    npsn_sekolah: string;
    nama_sekolah: string;
    kecamatan: string;
    link_jurnal: string;
    link_daftar_hadir: string;
    link_dokumentasi: string;
    status: "Menunggu" | "Revisi" | "Terverifikasi";
    catatan_revisi: string;
    bulan_laporan: string;
    created_at: string;
};
type Tab = "Semua" | "Menunggu" | "Revisi" | "Terverifikasi";
const TABS: Tab[] = ["Semua", "Menunggu", "Revisi", "Terverifikasi"];

// ─── Konfigurasi Status ────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    Terverifikasi: { bg: "#D1FAE5", text: "#2D6A4F", border: "#6EE7B7", dot: "#10B981" },
    Menunggu: { bg: "#FEF3C7", text: "#D97706", border: "#FCD34D", dot: "#F59E0B" },
    Revisi: { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5", dot: "#EF4444" },
    Semua: { bg: "#F0FDF4", text: P.forest, border: "#86EFAC", dot: P.forest },
};

// Array agar urutan Jan-Des terjamin (Object numeric key bisa tidak berurutan di JS)
const MONTHS: [string, string][] = [
    ['01','Januari'],['02','Februari'],['03','Maret'],['04','April'],
    ['05','Mei'],['06','Juni'],['07','Juli'],['08','Agustus'],
    ['09','September'],['10','Oktober'],['11','November'],['12','Desember'],
];

// Helper: cari nama bulan dari value
function getMonthName(m: string): string {
    return MONTHS.find(([v]) => v === m)?.[1] ?? m;
}

// Input: "2026-03" → "Maret 2026"
function formatBulanLaporan(raw: string): string {
    const [year, month] = raw?.split("-") ?? [];
    const namaMonth = getMonthName(month);
    return namaMonth && year ? `${namaMonth} ${year}` : raw ?? "–";
}

// ─── Badge Status (Tabel) ──────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const s = STATUS_CFG[status] || STATUS_CFG.Menunggu;
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black whitespace-nowrap"
            style={{ backgroundColor: s.bg, color: s.text }}
        >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }} />
            {status}
        </span>
    );
};

// ─── Badge Status (Modal) ──────────────────────────────────────
const ModalStatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { bg: string; color: string; border: string; dot: string; label: string }> = {
        Menunggu: { bg: "#fef9c3", color: "#854d0e", border: "#fde68a", dot: "#d97706", label: "Menunggu Verifikasi" },
        Terverifikasi: { bg: "#dcfce7", color: "#14532d", border: "#bbf7d0", dot: "#16a34a", label: "Terverifikasi" },
        Revisi: { bg: "#fee2e2", color: "#991b1b", border: "#fecaca", dot: "#dc2626", label: "Perlu Revisi" },
    };
    const s = map[status] ?? map["Menunggu"];
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 12, fontWeight: 500, padding: "4px 10px",
            borderRadius: 20, background: s.bg, color: s.color,
            border: `0.5px solid ${s.border}`, whiteSpace: "nowrap",
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
            {s.label}
        </span>
    );
};

// ─── Modal Verifikasi ──────────────────────────────────────────
function ModalVerifikasi({
    isModalOpen, setIsModalOpen,
    selectedReport, notes, setNotes,
    handleVerifikasi, isProcessing,
}: {
    isModalOpen: boolean;
    setIsModalOpen: (v: boolean) => void;
    selectedReport: ReportData | null;
    notes: string;
    setNotes: (v: string) => void;
    handleVerifikasi: (status: "Terverifikasi" | "Revisi") => void;
    isProcessing: boolean;
}) {
    if (!selectedReport) return null;

    const dokumen = [
        { label: "Jurnal Kegiatan", url: selectedReport.link_jurnal, iconColor: "#059669", iconBg: "#d1fae5", Icon: FileText },
        { label: "Daftar Hadir", url: selectedReport.link_daftar_hadir, iconColor: "#d97706", iconBg: "#fef3c7", Icon: Users },
        { label: "Dokumentasi", url: selectedReport.link_dokumentasi, iconColor: "#7c3aed", iconBg: "#ede9fe", Icon: Image },
    ];

    return (
        <AnimatePresence>
            {isModalOpen && (
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent
                        className="w-[calc(100vw-24px)] sm:w-full max-w-[660px] p-0 rounded-2xl overflow-hidden flex flex-col max-h-[92dvh]"
                        style={{
                            border: "none",
                            background: "#fff",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
                        }}
                    >
                        {/* Garis Aksen */}
                        <div style={{ height: 4, background: `linear-gradient(90deg, ${P.forest}, ${P.sage})`, flexShrink: 0 }} />

                        {/* ── Header ── */}
                        <div
                            className="px-4 sm:px-6 pt-5 pb-4 flex flex-col items-center gap-2 text-center"
                            style={{ borderBottom: "0.5px solid #f1f5f9", background: "#fff", flexShrink: 0 }}
                        >
                            {/* Judul: Laporan Bulan ... */}
                            <div className="flex items-center gap-1.5">
                                <Calendar size={12} color="#92400e" />
                                <DialogTitle
                                    className="text-[15px] sm:text-[16px] font-bold"
                                    style={{ color: "#92400e", margin: 0, letterSpacing: "0.01em" }}
                                >
                                    Laporan Bulan {formatBulanLaporan(selectedReport.bulan_laporan)}
                                </DialogTitle>
                            </div>

                            {/* Status Badge — tepat di bawah judul */}
                            <ModalStatusBadge status={selectedReport.status} />

                            {/* Divider tipis */}
                            <div className="w-12 rounded-full mt-0.5" style={{ height: 2, background: `linear-gradient(90deg, ${P.forest}, ${P.sage})` }} />

                            {/* Info sekolah */}
                            <div className="w-full mt-0.5">
                                <p
                                    className="text-[14px] sm:text-[15px] font-semibold leading-snug"
                                    style={{ color: "#0f172a", wordBreak: "break-word" }}
                                >
                                    {selectedReport.nama_sekolah}
                                </p>

                                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-1.5">
                                    <span className="text-[11px]" style={{ color: "#94a3b8" }}>
                                        NPSN: {selectedReport.npsn_sekolah}
                                    </span>
                                    {selectedReport.kecamatan && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md"
                                            style={{ background: `${P.forest}10`, color: P.forest }}>
                                            <svg width="9" height="9" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M8 14s-6-4.686-6-8a6 6 0 1 1 12 0c0 3.314-6 8-6 8z" /><circle cx="8" cy="6" r="2" />
                                            </svg>
                                            Kec. {selectedReport.kecamatan}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── Body (scrollable) ── */}
                        <div
                            className="px-4 sm:px-6 py-4 flex flex-col gap-4 overflow-y-auto flex-1"
                            style={{ background: "#f8fafc" }}
                        >
                            {/* Berkas Lampiran */}
                            <div>
                                <div className="flex items-center gap-2 pb-2.5 mb-3"
                                    style={{ borderBottom: "0.5px solid #e2e8f0" }}>
                                    <FileText size={14} color={P.forest} />
                                    <span className="text-[13px] font-semibold" style={{ color: "#1e293b" }}>
                                        Berkas Lampiran
                                    </span>
                                </div>

                                {/* 1 kolom di HP, 3 kolom di desktop */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    {dokumen.map((doc) => (
                                        <motion.a
                                            key={doc.label}
                                            href={doc.url} target="_blank" rel="noreferrer"
                                            whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
                                            className="flex sm:flex-col flex-row items-center sm:items-start gap-3 sm:gap-2 p-3 rounded-xl bg-white border"
                                            style={{ borderColor: "#e2e8f0", textDecoration: "none", transition: "border-color 0.15s" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#cbd5e1")}
                                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
                                        >
                                            <div className="shrink-0" style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: doc.iconBg,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                            }}>
                                                <doc.Icon size={14} color={doc.iconColor} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[12px] font-semibold" style={{ color: "#1e293b", margin: 0 }}>
                                                    {doc.label}
                                                </p>
                                            </div>
                                            {/* Panah kecil di HP agar terasa klikable */}
                                            <span className="sm:hidden text-xs ml-auto shrink-0" style={{ color: "#94a3b8" }}>↗</span>
                                        </motion.a>
                                    ))}
                                </div>
                            </div>

                            {/* Catatan & Evaluasi */}
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={14} color={P.forest} />
                                        <span className="text-[13px] font-semibold" style={{ color: "#1e293b" }}>
                                            Catatan &amp; Evaluasi
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-medium px-2 py-1 rounded"
                                        style={{ background: "#fee2e2", color: "#991b1b", border: "0.5px solid #fecaca" }}>
                                        Wajib jika Revisi
                                    </span>
                                </div>

                                <Textarea
                                    className="focus:ring-2 focus:border-transparent text-[13px]"
                                    style={{
                                        minHeight: 80, resize: "vertical",
                                        borderRadius: 10, padding: "10px 12px",
                                        border: "0.5px solid #cbd5e1",
                                        background: "#fff", lineHeight: 1.6,
                                    }}
                                    placeholder="Sampaikan pesan ke sekolah, misal: 'Tolong perbaiki foto dokumentasi minggu ke-2'..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* ── Footer ── */}
                        <div
                            className="px-4 sm:px-6 py-3 flex flex-row justify-end gap-2"
                            style={{ borderTop: "0.5px solid #f1f5f9", background: "#fff", flexShrink: 0 }}
                        >
                            {/* Tombol Revisi */}
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => handleVerifikasi("Revisi")}
                                disabled={isProcessing}
                                className="flex items-center justify-center gap-1.5 text-[12px] font-semibold rounded-lg transition-all"
                                style={{
                                    padding: "7px 14px",
                                    border: "0.5px solid #e2e8f0",
                                    background: "#fff", color: "#64748b",
                                    opacity: isProcessing ? 0.6 : 1,
                                    cursor: isProcessing ? "not-allowed" : "pointer",
                                    whiteSpace: "nowrap",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isProcessing) {
                                        e.currentTarget.style.background = "#fef2f2";
                                        e.currentTarget.style.color = "#b91c1c";
                                        e.currentTarget.style.borderColor = "#fca5a5";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "#fff";
                                    e.currentTarget.style.color = "#64748b";
                                    e.currentTarget.style.borderColor = "#e2e8f0";
                                }}
                            >
                                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                                Kembalikan Revisi
                            </motion.button>

                            {/* Tombol Setujui */}
                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: `0 4px 14px ${P.forest}35` }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleVerifikasi("Terverifikasi")}
                                disabled={isProcessing}
                                className="flex items-center justify-center gap-1.5 text-[12px] font-semibold rounded-lg transition-all"
                                style={{
                                    padding: "7px 16px",
                                    border: `1px solid ${P.forest}`,
                                    background: P.forest, color: "#fff",
                                    opacity: isProcessing ? 0.6 : 1,
                                    cursor: isProcessing ? "not-allowed" : "pointer",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                                Setujui Laporan
                            </motion.button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AnimatePresence>
    );
}

// ─── Halaman Utama ─────────────────────────────────────────────
export default function VerifikasiPage() {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedYear, setSelectedYear] = useState("Semua");
    const [selectedMonth, setSelectedMonth] = useState("Semua");
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>("Semua");
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notes, setNotes] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const data = await getAllReports();
            const years = new Set<string>();
            data.forEach((r) => { if (r.bulan_laporan) years.add(r.bulan_laporan.split("-")[0]); });
            // Hanya dari database, tanpa dummy tahun
            setAvailableYears(Array.from(years).sort().reverse());
            setReports(data as ReportData[]);
        } catch { toast.error("Gagal mengambil data laporan"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchReports(); }, []);

    const counts = useMemo(() => ({
        Semua: reports.length,
        Menunggu: reports.filter((r) => r.status === "Menunggu").length,
        Revisi: reports.filter((r) => r.status === "Revisi").length,
        Terverifikasi: reports.filter((r) => r.status === "Terverifikasi").length,
    }), [reports]);

    const filtered = useMemo(() =>
        reports.filter((r) => {
            const matchTab = activeTab === "Semua" || r.status === activeTab;
            const matchSearch = r.nama_sekolah.toLowerCase().includes(searchTerm.toLowerCase()) || r.npsn_sekolah.includes(searchTerm);
            const matchYear = selectedYear === "Semua" || r.bulan_laporan.startsWith(selectedYear);
            const matchMonth = selectedMonth === "Semua" || r.bulan_laporan.endsWith(`-${selectedMonth}`);
            return matchTab && matchSearch && matchYear && matchMonth;
        }),
        [reports, activeTab, searchTerm, selectedYear, selectedMonth]);

    const handleVerifikasi = async (status: "Terverifikasi" | "Revisi") => {
        if (!selectedReport) return;
        if (status === "Revisi" && !notes.trim()) { toast.error("Catatan revisi wajib diisi jika laporan ditolak"); return; }
        setIsProcessing(true);
        try {
            await updateReportStatus(selectedReport.id, status, notes);
            toast.success(`Laporan berhasil diubah menjadi ${status}`);
            setIsModalOpen(false);
            fetchReports();
        } catch { toast.error("Gagal memproses verifikasi"); }
        finally { setIsProcessing(false); }
    };

    return (
        <div className="space-y-5">

            {/* ── Header ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                    style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>
                        Manajemen Verifikasi
                    </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
                    style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Verifikasi Laporan
                </h1>
                <p className="text-slate-500 mt-1 font-medium text-xs sm:text-sm">
                    Tinjau dan tentukan status laporan dari seluruh sekolah
                </p>
            </motion.div>

            {/* ── Filter Bar ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${P.sage}30`, borderLeft: `4px solid ${P.forest}` }}>

                {/* Header */}
                <div className="px-4 py-3 flex items-center gap-2"
                    style={{ backgroundColor: P.cream, borderBottom: `1px solid ${P.sage}20` }}>
                    <Filter className="h-3.5 w-3.5 shrink-0" style={{ color: P.forest }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Filter Periode &amp; Pencarian</span>
                    {(selectedYear !== "Semua" || selectedMonth !== "Semua") && (
                        <button onClick={() => { setSelectedYear("Semua"); setSelectedMonth("Semua"); }}
                            className="ml-auto text-[10px] font-black px-2.5 py-1 rounded-lg transition-all"
                            style={{ color: '#DC2626', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                            ✕ Reset
                        </button>
                    )}
                </div>

                <div className="p-4 space-y-4 bg-white">
                    {/* Tahun — hanya dari database */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: P.sage }}>Tahun</p>
                        {availableYears.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Belum ada data laporan masuk</p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {["Semua", ...availableYears].map((y) => (
                                    <button key={y} onClick={() => setSelectedYear(y)}
                                        className="px-4 py-1.5 rounded-full text-xs font-black transition-all"
                                        style={{
                                            backgroundColor: selectedYear === y ? P.forest : 'transparent',
                                            color: selectedYear === y ? 'white' : '#64748b',
                                            border: `1.5px solid ${selectedYear === y ? P.forest : '#E2E8F0'}`,
                                        }}>
                                        {y === "Semua" ? "Semua Tahun" : y}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Bulan — grid 4 kolom HP, 1 baris desktop */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: P.sage }}>Bulan</p>
                        <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-13 gap-1.5">
                            <button onClick={() => setSelectedMonth("Semua")}
                                className="col-span-4 sm:col-span-1 py-2 rounded-xl text-[11px] font-black transition-all"
                                style={{
                                    backgroundColor: selectedMonth === "Semua" ? P.gold : '#F8FAFC',
                                    color: selectedMonth === "Semua" ? P.forestDark : '#64748b',
                                    border: `1.5px solid ${selectedMonth === "Semua" ? P.gold : '#E2E8F0'}`,
                                    boxShadow: selectedMonth === "Semua" ? `0 2px 8px ${P.gold}40` : 'none',
                                }}>
                                Semua
                            </button>
                            {MONTHS.map(([v, l]) => (
                                <button key={v} onClick={() => setSelectedMonth(v)}
                                    className="py-2 rounded-xl text-[11px] font-black transition-all text-center"
                                    style={{
                                        backgroundColor: selectedMonth === v ? P.forest : '#F8FAFC',
                                        color: selectedMonth === v ? 'white' : '#64748b',
                                        border: `1.5px solid ${selectedMonth === v ? P.forest : '#E2E8F0'}`,
                                        boxShadow: selectedMonth === v ? `0 2px 8px ${P.forest}30` : 'none',
                                    }}>
                                    {(l as string).slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: P.sage }} />
                        <input type="search" placeholder="Cari nama sekolah / NPSN..."
                            className="pl-9 pr-3 py-2.5 w-full rounded-xl text-xs font-medium outline-none border"
                            style={{ borderColor: `${P.sage}30`, backgroundColor: '#F8FAFC' }}
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>
            </motion.div>

            {/* ── Status Tabs ── */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="flex flex-wrap gap-2">
                {TABS.map((tab) => {
                    const s = STATUS_CFG[tab];
                    const isActive = activeTab === tab;
                    return (
                        <motion.button key={tab} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setActiveTab(tab)}
                            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all"
                            style={{
                                backgroundColor: isActive ? s.bg : "white",
                                color: isActive ? s.text : "#64748b",
                                border: `1.5px solid ${isActive ? s.border : "#E2E8F0"}`,
                                boxShadow: isActive ? `0 4px 16px ${s.dot}20` : "none",
                            }}>
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0"
                                style={{ backgroundColor: isActive ? s.dot : "#CBD5E1" }} />
                            {tab}
                            <span className="text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-full font-black"
                                style={{
                                    backgroundColor: isActive ? `${s.dot}20` : "#F1F5F9",
                                    color: isActive ? s.text : "#94A3B8",
                                }}>
                                {counts[tab]}
                            </span>
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* ── Tabel / Card List ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-x-hidden"
                style={{ borderLeft: `4px solid ${P.forest}` }}>

                {/* Header kolom — hanya tampil sm ke atas */}
                <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3.5 border-b"
                    style={{ backgroundColor: P.cream, borderColor: `${P.sage}20` }}>
                    {["Sekolah", "Bulan Laporan", "Tgl Dikirim", "Status", "Aksi"].map((h) => (
                        <span key={h} className="text-[11px] font-black uppercase tracking-wider" style={{ color: P.forest }}>{h}</span>
                    ))}
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <Loader2 className="h-7 w-7 animate-spin" style={{ color: P.sage }} />
                        <p className="text-slate-500 font-medium text-sm">Memuat data laporan...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "#D1FAE5" }}>
                            <FileText className="h-6 w-6" style={{ color: P.forest }} />
                        </div>
                        <p className="font-bold text-slate-500 text-sm">Tidak ada laporan yang sesuai</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filtered.map((report, i) => (
                            <motion.div key={report.id}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.04 }}
                                className="border-b last:border-0 transition-colors hover:bg-slate-50/60"
                                style={{ borderColor: `${P.sage}15` }}>

                                {/* Desktop: grid tabel */}
                                <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 items-center px-6 py-4">
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{report.nama_sekolah}</p>
                                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <p className="text-[10px] text-slate-400 font-mono">NPSN: {report.npsn_sekolah}</p>
                                            {report.kecamatan && (
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                                    style={{ background: `${P.forest}10`, color: P.forest }}>
                                                    Kec. {report.kecamatan}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">{formatBulanLaporan(report.bulan_laporan)}</p>
                                    <p className="text-xs text-slate-400 font-medium">
                                        {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                    <StatusBadge status={report.status} />
                                    <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl"
                                        style={{ backgroundColor: "#D1FAE5", color: P.forest }}
                                        onClick={() => { setSelectedReport(report); setNotes(report.catatan_revisi || ""); setIsModalOpen(true); }}>
                                        <Eye className="h-3.5 w-3.5" /> Cek
                                    </motion.button>
                                </div>

                                {/* Mobile: card layout */}
                                <div className="sm:hidden px-4 py-3.5 flex flex-col gap-2.5">
                                    {/* Nama + Status */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-slate-900 text-[13px] leading-snug">{report.nama_sekolah}</p>
                                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                <p className="text-[10px] text-slate-400 font-mono">NPSN: {report.npsn_sekolah}</p>
                                                {report.kecamatan && (
                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                                                        style={{ background: `${P.forest}10`, color: P.forest }}>
                                                        Kec. {report.kecamatan}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <StatusBadge status={report.status} />
                                    </div>

                                    {/* Meta + Tombol Cek */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[11px] font-semibold text-slate-500 px-2 py-0.5 rounded-md"
                                                style={{ background: "#f1f5f9" }}>
                                                {formatBulanLaporan(report.bulan_laporan)}
                                            </span>
                                            <span className="text-[11px] text-slate-400">
                                                {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                        <motion.button whileTap={{ scale: 0.94 }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black rounded-xl shrink-0"
                                            style={{ backgroundColor: "#D1FAE5", color: P.forest }}
                                            onClick={() => { setSelectedReport(report); setNotes(report.catatan_revisi || ""); setIsModalOpen(true); }}>
                                            <Eye className="h-3.5 w-3.5" /> Cek
                                        </motion.button>
                                    </div>
                                </div>

                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {!isLoading && filtered.length > 0 && (
                    <div className="px-4 sm:px-6 py-3 border-t" style={{ backgroundColor: P.cream, borderColor: `${P.sage}20` }}>
                        <p className="text-xs font-medium" style={{ color: P.sage }}>
                            Menampilkan {filtered.length} dari {reports.length} laporan
                        </p>
                    </div>
                )}
            </motion.div>

            {/* ── Modal ── */}
            <ModalVerifikasi
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
                selectedReport={selectedReport}
                notes={notes}
                setNotes={setNotes}
                handleVerifikasi={handleVerifikasi}
                isProcessing={isProcessing}
            />
        </div>
    );
}