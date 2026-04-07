"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getReportsByNpsn, addReport, updateReport, deleteReport, type Report } from "@/lib/firestore-service";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import {
    Loader2, Plus, Trash2, FolderOpen, Filter, Info, UploadCloud, Unlock,
    FileCheck, CheckCircle2, Clock, AlertTriangle, Pencil, Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

// Array agar urutan Jan-Des terjamin
const MONTHS: [string, string][] = [
    ['01', 'Januari'], ['02', 'Februari'], ['03', 'Maret'], ['04', 'April'],
    ['05', 'Mei'], ['06', 'Juni'], ['07', 'Juli'], ['08', 'Agustus'],
    ['09', 'September'], ['10', 'Oktober'], ['11', 'November'], ['12', 'Desember'],
];

const reportSchema = z.object({
    link_jurnal: z.string().url({ message: "Harus berupa URL yang valid (https://...)" }),
    link_daftar_hadir: z.string().url({ message: "Harus berupa URL yang valid (https://...)" }),
    link_dokumentasi: z.string().url({ message: "Harus berupa URL yang valid (https://...)" }),
});

// ─── Badge Status ─────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
    const cfg: Record<string, { bg: string; text: string; dot: string }> = {
        Terverifikasi: { bg: '#D1FAE5', text: '#2D6A4F', dot: '#10B981' },
        Menunggu: { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
        Revisi: { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
    };
    const s = cfg[status] || cfg.Menunggu;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black"
            style={{ backgroundColor: s.bg, color: s.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
            {status}
        </span>
    );
};

// ─── Cek apakah bulan sudah ada laporan ────────────────────────────────
function getBulanConflict(reports: Report[], bulanLaporan: string, excludeId?: string): Report | null {
    return reports.find(r => r.bulan_laporan === bulanLaporan && r.id !== excludeId) ?? null;
}

export default function LaporanPage() {
    const { npsn, namaInstansi, kecamatan, uid } = useAuthStore() as {
        npsn: string | null; namaInstansi: string | null; kecamatan?: string; uid: string | null;
    };
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<Report | null>(null); // untuk edit laporan Revisi
    const [selectedYear, setSelectedYear] = useState("Semua");
    const [selectedMonth, setSelectedMonth] = useState("Semua");

    // Pilih bulan laporan yang akan dikirim
    const currentYear = new Date().getFullYear().toString();
    const currentMonthPad = String(new Date().getMonth() + 1).padStart(2, '0');
    const [formBulan, setFormBulan] = useState(`${currentYear}-${currentMonthPad}`);

    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: { link_jurnal: "", link_daftar_hadir: "", link_dokumentasi: "" },
    });

    const fetchReports = async () => {
        if (!npsn) return;
        setIsLoading(true);
        try {
            const data = await getReportsByNpsn(npsn);
            setReports(data);
        } catch { toast.error("Gagal mengambil data laporan"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchReports(); }, [npsn]);

    // Buka form tambah baru
    const handleOpenNew = () => {
        setEditingReport(null);
        form.reset({ link_jurnal: "", link_daftar_hadir: "", link_dokumentasi: "" });
        setFormBulan(`${currentYear}-${currentMonthPad}`);
        setIsDialogOpen(true);
    };

    // Buka form edit laporan Revisi
    const handleOpenEdit = (r: Report) => {
        setEditingReport(r);
        form.reset({ link_jurnal: r.link_jurnal, link_daftar_hadir: r.link_daftar_hadir, link_dokumentasi: r.link_dokumentasi });
        setFormBulan(r.bulan_laporan);
        setIsDialogOpen(true);
    };

    // Cek konflik bulan untuk form aktif
    const bulanConflict = useMemo(() => getBulanConflict(reports, formBulan, editingReport?.id), [reports, formBulan, editingReport]);

    const availableYears = useMemo(() => {
        const years = new Set<string>();
        reports.forEach(r => { if (r.bulan_laporan) years.add(r.bulan_laporan.split('-')[0]); });
        return Array.from(years).sort().reverse();
    }, [reports]);

    const filteredReports = useMemo(() =>
        reports.filter(r => {
            const matchYear = selectedYear === "Semua" || r.bulan_laporan.startsWith(selectedYear);
            const matchMonth = selectedMonth === "Semua" || r.bulan_laporan.split('-')[1] === selectedMonth;
            return matchYear && matchMonth;
        }), [reports, selectedYear, selectedMonth]);

    const stats = useMemo(() => ({
        total: reports.length,
        terverifikasi: reports.filter(r => r.status === "Terverifikasi").length,
        menunggu: reports.filter(r => r.status === "Menunggu").length,
        revisi: reports.filter(r => r.status === "Revisi").length,
    }), [reports]);

    // Nama bulan dari value "YYYY-MM"
    const formatBulan = (raw: string) => {
        const [y, m] = raw.split('-');
        return `${MONTHS.find(([v]) => v === m)?.[1] ?? m} ${y}`;
    };

    async function onSubmit(values: z.infer<typeof reportSchema>) {
        if (!npsn || !namaInstansi) return;
        if (bulanConflict) { toast.error(`Laporan bulan ini sudah ada (Status: ${bulanConflict.status})`); return; }
        setIsSubmitting(true);
        try {
            if (editingReport) {
                // Edit laporan Revisi
                await updateReport(editingReport.id, values);
                toast.success("Laporan berhasil diperbaiki dan dikirim ulang!");
            } else {
                // Tambah baru
                await addReport({
                    ...values,
                    npsn_sekolah: npsn,
                    nama_sekolah: namaInstansi,
                    status: "Menunggu",
                    catatan_revisi: "",
                    bulan_laporan: formBulan,
                    kecamatan: kecamatan || "",
                });
                toast.success("Laporan berhasil dikirim!");
            }
            setIsDialogOpen(false);
            setEditingReport(null);
            form.reset();
            fetchReports();
        } catch (error: unknown) {
            toast.error((error as Error)?.message || "Gagal mengirim laporan.");
        } finally { setIsSubmitting(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;
        try { await deleteReport(id); toast.success("Laporan berhasil dihapus"); setReports(reports.filter(r => r.id !== id)); }
        catch { toast.error("Gagal menghapus laporan"); }
    }

    return (
        <div className="space-y-6">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                        style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Laporan Bulanan PEKA</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight"
                        style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Laporan PEKA
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Kelola dan kirimkan laporan bulanan sekolah Anda.</p>
                </div>
                <motion.button whileHover={{ scale: 1.04, boxShadow: `0 4px 16px ${P.gold}40` }} whileTap={{ scale: 0.96 }}
                    onClick={handleOpenNew}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-black rounded-xl shadow-lg transition-all whitespace-nowrap"
                    style={{ background: P.gold, color: P.forestDark }}>
                    <Plus className="h-4 w-4" /> Kirim Laporan Baru
                </motion.button>

                {/* Dialog Form Kirim/Edit */}
                <Dialog open={isDialogOpen} onOpenChange={v => { if (!v) { setEditingReport(null); form.reset(); } setIsDialogOpen(v); }}>
                    <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
                        {/* Gradient bar */}
                        <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${P.forest}, ${P.sage}, ${P.gold})` }} />

                        {/* Header tetap di atas */}
                        <div className="px-5 pt-4 pb-2 shrink-0">
                            <DialogHeader>
                                <DialogTitle className="text-base font-black text-slate-900">
                                    {editingReport ? "Perbaiki Laporan PEKA" : "Formulir Laporan PEKA"}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-slate-500 font-medium mt-0.5">
                                    {editingReport
                                        ? "Perbaiki tautan dokumen dan kirim ulang untuk diverifikasi."
                                        : "Pilih bulan dan masukkan tautan Google Drive berkas laporan."}
                                </DialogDescription>
                            </DialogHeader>
                        </div>

                        {/* Konten */}
                        <div className="px-5 pb-5 space-y-3">

                            {/* ── Pilih Bulan Laporan ── */}
                            <div className="rounded-xl overflow-hidden" style={{ border: `1.5px solid ${P.sage}30` }}>
                                <div className="px-3 py-2 flex items-center gap-1.5" style={{ backgroundColor: P.cream }}>
                                    <Calendar className="h-3 w-3 shrink-0" style={{ color: P.forest }} />
                                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: P.forest }}>Bulan Laporan</p>
                                </div>
                                <div className="p-3 bg-white space-y-2">
                                    {editingReport ? (
                                        <div className="px-3 py-2 rounded-lg text-sm font-black" style={{ backgroundColor: `${P.forest}10`, color: P.forestDark }}>
                                            📅 {formatBulan(formBulan)}
                                            <span className="ml-2 text-[11px] font-medium text-slate-400">(tidak dapat diubah)</span>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {/* Dropdown tahun */}
                                            <div className="flex items-center gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest shrink-0" style={{ color: P.sage }}>Tahun:</label>
                                                <select
                                                    value={formBulan.split('-')[0]}
                                                    onChange={e => setFormBulan(`${e.target.value}-${formBulan.split('-')[1]}`)}
                                                    className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-black outline-none border"
                                                    style={{ borderColor: `${P.sage}40`, backgroundColor: P.cream, color: P.forestDark }}>
                                                    {Array.from(new Set([new Date().getFullYear().toString(), ...availableYears]))
                                                        .sort().reverse()
                                                        .map(y => <option key={y} value={y}>{y}</option>)
                                                    }
                                                </select>
                                            </div>
                                            {/* Grid bulan 4 kolom */}
                                            <div className="grid grid-cols-4 gap-1">
                                                {MONTHS.map(([v, l]) => {
                                                    const key = `${formBulan.split('-')[0]}-${v}`;
                                                    const conflict = getBulanConflict(reports, key);
                                                    const isSelected = formBulan === key;
                                                    const isBlocked = !!conflict && conflict.status !== 'Revisi';
                                                    return (
                                                        <button key={v} onClick={() => !isBlocked && setFormBulan(key)}
                                                            disabled={isBlocked}
                                                            title={conflict ? `Status: ${conflict.status}` : ""}
                                                            className="py-1.5 rounded-lg text-[11px] font-black transition-all relative text-center"
                                                            style={{
                                                                backgroundColor: isSelected ? P.forest : isBlocked ? '#F1F5F9' : '#F8FAFC',
                                                                color: isSelected ? 'white' : isBlocked ? '#CBD5E1' : '#64748b',
                                                                border: `1.5px solid ${isSelected ? P.forest : '#E2E8F0'}`,
                                                                cursor: isBlocked ? 'not-allowed' : 'pointer',
                                                            }}>
                                                            {(l as string).slice(0, 3)}
                                                            {conflict && (
                                                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: conflict.status === 'Terverifikasi' ? '#10B981' : conflict.status === 'Revisi' ? '#EF4444' : '#F59E0B' }} />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {bulanConflict && (
                                                <p className="text-[11px] font-bold text-amber-700 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: '#FEF3C7' }}>
                                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                                    Laporan {formatBulan(formBulan)} sudah ada — Status: {bulanConflict.status}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Panduan singkat (hanya tambah baru) */}
                            {!editingReport && (
                                <div className="flex items-start gap-2.5 p-3 rounded-xl text-xs" style={{ backgroundColor: '#D1FAE540', border: `1px solid ${P.sage}25` }}>
                                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: P.forest }} />
                                    <div style={{ color: P.forestDark }}>
                                        Upload ke <strong>Google Drive</strong>, ubah akses ke <strong>&quot;Siapa saja&quot;</strong>, lalu tempel linknya di bawah.
                                    </div>
                                </div>
                            )}

                            {/* Catatan revisi */}
                            {editingReport?.catatan_revisi && (
                                <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-600" />
                                    <div>
                                        <p className="text-[10px] font-black text-red-700 mb-0.5">Catatan Revisi:</p>
                                        <p className="text-xs text-red-600 font-medium">{editingReport.catatan_revisi}</p>
                                    </div>
                                </div>
                            )}

                            {/* Form link */}
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
                                    {[
                                        { name: 'link_jurnal' as const, label: 'Link Jurnal Kegiatan (G-Drive)' },
                                        { name: 'link_daftar_hadir' as const, label: 'Link Daftar Hadir (G-Drive)' },
                                        { name: 'link_dokumentasi' as const, label: 'Link Dokumentasi Foto (G-Drive)' },
                                    ].map(field => (
                                        <FormField key={field.name} control={form.control} name={field.name}
                                            render={({ field: f }) => (
                                                <FormItem className="space-y-1">
                                                    <FormLabel className="text-xs font-black" style={{ color: P.forestDark }}>{field.label}</FormLabel>
                                                    <FormControl>
                                                        <Input {...f} placeholder="https://drive.google.com/..."
                                                            className="h-9 rounded-xl text-xs font-medium"
                                                            style={{ borderColor: `${P.sage}30`, backgroundColor: P.cream }} />
                                                    </FormControl>
                                                    <FormMessage className="text-[11px]" />
                                                </FormItem>
                                            )} />
                                    ))}

                                    {/* Tombol kirim — selalu terlihat */}
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        type="submit" disabled={isSubmitting || !form.formState.isValid || (!!bulanConflict && !editingReport)}
                                        className="w-full h-11 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 mt-1"
                                        style={{
                                            background: `linear-gradient(135deg, ${P.forest}, ${P.sage})`,
                                            opacity: (isSubmitting || (!!bulanConflict && !editingReport)) ? 0.5 : 1,
                                            cursor: (isSubmitting || (!!bulanConflict && !editingReport)) ? 'not-allowed' : 'pointer',
                                        }}>
                                        {isSubmitting
                                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
                                            : editingReport ? "✓ Kirim Ulang Laporan" : "✓ Kirim Laporan"}
                                    </motion.button>
                                </form>
                            </Form>
                        </div>
                    </DialogContent>
                </Dialog>

            </motion.div>

            {/* ── STAT ROW ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Total', value: stats.total, color: '#7C3AED', bg: '#EDE9FE', Icon: FolderOpen },
                    { label: 'Terverifikasi', value: stats.terverifikasi, color: P.forest, bg: '#D1FAE5', Icon: CheckCircle2 },
                    { label: 'Menunggu', value: stats.menunggu, color: '#D97706', bg: '#FEF3C7', Icon: Clock },
                    { label: 'Perlu Revisi', value: stats.revisi, color: '#DC2626', bg: '#FEE2E2', Icon: AlertTriangle },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-4 border border-slate-100 text-center"
                        style={{ borderLeft: `4px solid ${s.color}` }}>
                        <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                        <p className="text-[11px] font-bold text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* ── FILTER PERIODE ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${P.sage}30`, borderLeft: `4px solid ${P.forest}` }}>
                <div className="px-4 py-3 flex items-center gap-2" style={{ backgroundColor: P.cream, borderBottom: `1px solid ${P.sage}20` }}>
                    <Filter className="h-3.5 w-3.5 shrink-0" style={{ color: P.forest }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Filter Periode</span>
                    {(selectedYear !== 'Semua' || selectedMonth !== 'Semua') && (
                        <button onClick={() => { setSelectedYear('Semua'); setSelectedMonth('Semua'); }}
                            className="ml-auto text-[10px] font-black px-2.5 py-1 rounded-lg"
                            style={{ color: '#DC2626', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                            ✕ Reset
                        </button>
                    )}
                </div>
                <div className="p-4 space-y-3 bg-white">
                    {/* Tahun */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: P.sage }}>Tahun</p>
                        {availableYears.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">Belum ada data laporan</p>
                        ) : (
                            <div className="flex flex-wrap gap-1.5">
                                {['Semua', ...availableYears].map(y => (
                                    <button key={y} onClick={() => setSelectedYear(y)}
                                        className="px-4 py-1.5 rounded-full text-xs font-black transition-all"
                                        style={{ backgroundColor: selectedYear === y ? P.forest : 'transparent', color: selectedYear === y ? 'white' : '#64748b', border: `1.5px solid ${selectedYear === y ? P.forest : '#E2E8F0'}` }}>
                                        {y === 'Semua' ? 'Semua Tahun' : y}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Bulan */}
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: P.sage }}>Bulan</p>
                        <div className="grid grid-cols-4 sm:grid-cols-7 lg:grid-cols-13 gap-1.5">
                            <button onClick={() => setSelectedMonth('Semua')}
                                className="col-span-4 sm:col-span-1 py-2 rounded-xl text-[11px] font-black transition-all"
                                style={{ backgroundColor: selectedMonth === 'Semua' ? P.gold : '#F8FAFC', color: selectedMonth === 'Semua' ? P.forestDark : '#64748b', border: `1.5px solid ${selectedMonth === 'Semua' ? P.gold : '#E2E8F0'}`, boxShadow: selectedMonth === 'Semua' ? `0 2px 8px ${P.gold}40` : 'none' }}>
                                Semua
                            </button>
                            {MONTHS.map(([v, l]) => (
                                <button key={v} onClick={() => setSelectedMonth(v)}
                                    className="py-2 rounded-xl text-[11px] font-black transition-all text-center"
                                    style={{ backgroundColor: selectedMonth === v ? P.forest : '#F8FAFC', color: selectedMonth === v ? 'white' : '#64748b', border: `1.5px solid ${selectedMonth === v ? P.forest : '#E2E8F0'}`, boxShadow: selectedMonth === v ? `0 2px 8px ${P.forest}30` : 'none' }}>
                                    {(l as string).slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── TABLE ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ borderLeft: `4px solid ${P.forest}` }}>
                <div className="px-6 py-4 border-b" style={{ backgroundColor: P.cream, borderColor: `${P.sage}20` }}>
                    <h2 className="text-sm font-black" style={{ color: P.forestDark }}>Riwayat Pelaporan</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Menampilkan {filteredReports.length} dari {reports.length} laporan
                    </p>
                </div>

                {/* Header kolom desktop */}
                <div className="hidden sm:grid sm:grid-cols-[160px_110px_120px_1fr_auto] gap-3 px-6 py-3 border-b"
                    style={{ backgroundColor: `${P.cream}80`, borderColor: `${P.sage}15` }}>
                    {['Bulan Laporan', 'Tgl Kirim', 'Status', 'Catatan Disdik', 'Aksi'].map(h => (
                        <span key={h} className="text-[10px] font-black uppercase tracking-wider" style={{ color: P.forest }}>{h}</span>
                    ))}
                </div>

                {isLoading ? (
                    <div className="p-6 space-y-3">
                        <Skeleton className="h-12 w-full rounded-xl" /><Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                        <FolderOpen className="h-10 w-10 opacity-20" style={{ color: P.forest }} />
                        <p className="font-bold text-slate-400 text-sm">Belum ada laporan</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredReports.map((r, i) => (
                            <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="group border-b transition-colors hover:bg-slate-50/70"
                                style={{ borderColor: `${P.sage}12` }}>

                                {/* ── Desktop row ── */}
                                <div className="hidden sm:grid sm:grid-cols-[160px_110px_120px_1fr_auto] items-center gap-3 px-6 py-3.5">
                                    {/* Bulan */}
                                    <p className="text-sm font-black truncate" style={{ color: P.forestDark }}>📅 {formatBulan(r.bulan_laporan)}</p>
                                    {/* Tgl kirim */}
                                    <p className="text-xs font-medium text-slate-500">
                                        {new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                    {/* Status */}
                                    <div><StatusBadge status={r.status} /></div>
                                    {/* Catatan */}
                                    <div className="min-w-0">
                                        {r.catatan_revisi
                                            ? <p className="text-xs text-red-600 font-medium bg-red-50 px-2.5 py-1.5 rounded-lg break-words leading-relaxed">{r.catatan_revisi}</p>
                                            : <span className="text-xs text-slate-300">—</span>}
                                    </div>
                                    {/* Aksi */}
                                    <div className="flex items-center gap-1.5">
                                        {r.status === 'Revisi' && (
                                            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => handleOpenEdit(r)}
                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-black"
                                                style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D' }}
                                                title="Perbaiki & Kirim Ulang">
                                                <Pencil className="h-3 w-3" /> Edit
                                            </motion.button>
                                        )}
                                        {r.status !== 'Terverifikasi' && (
                                            <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                                                onClick={() => handleDelete(r.id)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}
                                                title="Hapus">
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </motion.button>
                                        )}
                                    </div>
                                </div>

                                {/* ── Mobile card ── */}
                                <div className="sm:hidden p-4 space-y-2.5">
                                    {/* Baris 1: Bulan + Status */}
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-black" style={{ color: P.forestDark }}>📅 {formatBulan(r.bulan_laporan)}</p>
                                        <StatusBadge status={r.status} />
                                    </div>
                                    {/* Baris 2: Tgl kirim */}
                                    <p className="text-xs font-medium text-slate-400">
                                        Dikirim: {new Date(r.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </p>
                                    {/* Catatan revisi */}
                                    {r.catatan_revisi && (
                                        <div className="p-2.5 rounded-xl" style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                                            <p className="text-[10px] font-black text-red-700 mb-1">Catatan Disdik:</p>
                                            <p className="text-xs text-red-600 font-medium leading-relaxed">{r.catatan_revisi}</p>
                                        </div>
                                    )}
                                    {/* Tombol aksi */}
                                    <div className="flex gap-2 pt-1">
                                        {r.status === 'Revisi' && (
                                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                                onClick={() => handleOpenEdit(r)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black"
                                                style={{ backgroundColor: '#FEF3C7', color: '#D97706', border: '1px solid #FCD34D' }}>
                                                <Pencil className="h-3.5 w-3.5" /> Perbaiki & Kirim Ulang
                                            </motion.button>
                                        )}
                                        {r.status !== 'Terverifikasi' && (
                                            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                                                onClick={() => handleDelete(r.id)}
                                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: '#FEF2F2', color: '#DC2626' }}>
                                                <Trash2 className="h-4 w-4" />
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </motion.div>
        </div>
    );
}
