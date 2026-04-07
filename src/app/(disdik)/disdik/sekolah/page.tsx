"use client";

import { useState, useEffect, useRef } from "react";
import { getAllSchoolProfiles, type UserProfile } from "@/lib/firestore-service";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, School, KeyRound, AlertTriangle, MapPin, Plus, Trash2,
    FileDown, FileSpreadsheet, FileText, ChevronDown, X, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
    collection, addDoc, deleteDoc, doc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

// ── Daftar kecamatan Tabalong ──
const KECAMATAN_LIST = [
    "Banua Lawas","Bintang Ara","Haruai","Jaro","Kelua","Muara Harus",
    "Muara Uya","Murung Pudak","Pugaan","Tanta","Tanjung","Upau",
];

// ── Tambah Sekolah Modal ──
function TambahSekolahModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [form, setForm] = useState({ nama_instansi: '', npsn: '', kecamatan: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.nama_instansi || !form.npsn || !form.kecamatan) {
            toast.error("Semua field wajib diisi");
            return;
        }
        setLoading(true);
        try {
            const auth = getAuth();
            const email = `${form.npsn}@simpekasd.id`;
            const password = 'pekasd';
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await addDoc(collection(db, 'users'), {
                uid: cred.user.uid,
                email,
                role: 'sekolah',
                npsn: form.npsn,
                nama_instansi: form.nama_instansi,
                kecamatan: form.kecamatan,
                created_at: serverTimestamp(),
            });
            toast.success(`Sekolah ${form.nama_instansi} berhasil ditambahkan!`);
            onSuccess();
            onClose();
        } catch (err: any) {
            if (err.code === 'auth/email-already-in-use') toast.error("NPSN sudah terdaftar");
            else toast.error("Gagal menambahkan sekolah: " + err.message);
        } finally { setLoading(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            style={{ backgroundColor: 'rgba(26,60,43,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl mx-0 sm:mx-4">
                {/* Header */}
                <div className="px-5 py-4 flex items-center justify-between"
                    style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})` }}>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${P.gold}25` }}>
                            <Plus className="h-4 w-4" style={{ color: P.gold }} />
                        </div>
                        <h3 className="text-base font-black text-white">Tambah Sekolah</h3>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-xl flex items-center justify-center text-white/60 hover:text-white"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4" style={{ backgroundColor: 'white' }}>
                    <div>
                        <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">Nama Instansi</label>
                        <input
                            value={form.nama_instansi}
                            onChange={e => setForm(f => ({ ...f, nama_instansi: e.target.value }))}
                            placeholder="SD NEGERI ..."
                            className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border outline-none focus:ring-2 transition-all"
                            style={{ borderColor: `${P.sage}40`, focusRingColor: P.forest } as any}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">NPSN <span className="normal-case text-slate-400 font-normal">(digunakan sebagai username)</span></label>
                        <input
                            value={form.npsn}
                            onChange={e => setForm(f => ({ ...f, npsn: e.target.value.replace(/\D/g, '') }))}
                            placeholder="8 digit NPSN"
                            maxLength={8}
                            className="w-full px-3 py-2.5 rounded-xl text-sm font-mono font-bold border outline-none focus:ring-2 transition-all"
                            style={{ borderColor: `${P.sage}40` } as any}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-600 mb-1.5 uppercase tracking-wider">Kecamatan</label>
                        <select
                            value={form.kecamatan}
                            onChange={e => setForm(f => ({ ...f, kecamatan: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-xl text-sm font-medium border outline-none focus:ring-2 transition-all appearance-none bg-white"
                            style={{ borderColor: `${P.sage}40` } as any}>
                            <option value="">-- Pilih Kecamatan --</option>
                            {KECAMATAN_LIST.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                    <div className="pt-1 flex gap-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all"
                            style={{ borderColor: '#E2E8F0', color: '#64748b' }}>
                            Batal
                        </button>
                        <motion.button type="submit" disabled={loading}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all"
                            style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, color: 'white' }}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            {loading ? 'Menyimpan...' : 'Tambah'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}

// ── Hapus Sekolah Confirm ──
function HapusModal({ school, onClose, onSuccess }: { school: UserProfile; onClose: () => void; onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            // Hapus dari Firestore (cari doc by npsn)
            const { getDocs, query, where, collection: col } = await import('firebase/firestore');
            const q = query(col(db, 'users'), where('npsn', '==', school.npsn));
            const snap = await getDocs(q);
            for (const d of snap.docs) await deleteDoc(doc(db, 'users', d.id));
            toast.success(`${school.nama_instansi} berhasil dihapus dari database.`);
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error("Gagal menghapus: " + err.message);
        } finally { setLoading(false); }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
            style={{ backgroundColor: 'rgba(26,60,43,0.7)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl mx-0 sm:mx-4 bg-white">
                <div className="px-5 py-4 flex items-center gap-3" style={{ backgroundColor: '#FEF2F2', borderBottom: '1px solid #FEE2E2' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#FEE2E2' }}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-red-700">Hapus Sekolah</h3>
                        <p className="text-xs text-red-500">Tindakan ini tidak dapat dibatalkan</p>
                    </div>
                </div>
                <div className="p-5">
                    <p className="text-sm text-slate-600 mb-1">Anda akan menghapus data:</p>
                    <p className="font-black text-slate-900 text-sm">{school.nama_instansi}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">NPSN: {school.npsn}</p>
                    <div className="flex gap-2 mt-4">
                        <button onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
                            style={{ borderColor: '#E2E8F0', color: '#64748b' }}>
                            Batal
                        </button>
                        <motion.button onClick={handleDelete} disabled={loading}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black text-white"
                            style={{ backgroundColor: '#DC2626' }}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            {loading ? 'Menghapus...' : 'Hapus'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function DataSekolahPage() {
    const [schools, setSchools] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [kecamatanFilter, setKecamatanFilter] = useState("Semua");
    const [showTambah, setShowTambah] = useState(false);
    const [hapusTarget, setHapusTarget] = useState<UserProfile | null>(null);
    const [showPrintMenu, setShowPrintMenu] = useState(false);
    const printMenuRef = useRef<HTMLDivElement>(null);

    const fetchSchools = async () => {
        setIsLoading(true);
        try {
            const data = await getAllSchoolProfiles();
            setSchools(data);
        } catch { /* silently fail */ }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchSchools(); }, []);

    // Close print menu on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (printMenuRef.current && !printMenuRef.current.contains(e.target as Node)) setShowPrintMenu(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const kecamatanList = ["Semua", ...Array.from(new Set(schools.map(s => s.kecamatan || ''))).filter(Boolean).sort()];

    const filteredSchools = schools.filter(s => {
        const term = searchTerm.toLowerCase();
        const matchSearch = (s.nama_instansi || "").toLowerCase().includes(term) ||
            (s.kecamatan || "").toLowerCase().includes(term) ||
            (s.npsn || "").includes(term);
        const matchKec = kecamatanFilter === "Semua" || s.kecamatan === kecamatanFilter;
        return matchSearch && matchKec;
    });

    // ── CETAK PDF ──
    const cetakPDF = async (perKecamatan?: string) => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');
        const doc = new jsPDF();
        const data = perKecamatan ? schools.filter(s => s.kecamatan === perKecamatan) : filteredSchools;
        const judul = perKecamatan ? `Data Sekolah Kecamatan ${perKecamatan}` : 'Data Sekolah SD - Kab. Tabalong';

        // Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DINAS PENDIDIKAN DAN KEBUDAYAAN', 105, 15, { align: 'center' });
        doc.setFontSize(11);
        doc.text('KABUPATEN TABALONG', 105, 22, { align: 'center' });
        doc.setFontSize(12);
        doc.text(judul.toUpperCase(), 105, 30, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(14, 34, 196, 34);

        if (perKecamatan) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`Kecamatan: ${perKecamatan}`, 14, 40);
            doc.text(`Jumlah Sekolah: ${data.length}`, 14, 46);
        }

        const tableY = perKecamatan ? 50 : 38;
        autoTable(doc, {
            startY: tableY,
            head: [['No', 'Nama Sekolah', 'NPSN', 'Kecamatan']],
            body: data.map((s, i) => [i + 1, s.nama_instansi || '-', s.npsn || '-', s.kecamatan || '-']),
            headStyles: { fillColor: [45, 106, 79], fontStyle: 'bold', fontSize: 9 },
            bodyStyles: { fontSize: 8.5 },
            columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 90 }, 2: { cellWidth: 30 }, 3: { cellWidth: 50 } },
            alternateRowStyles: { fillColor: [254, 250, 224] },
            margin: { left: 14, right: 14 },
        });

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`, 14, 290);
            doc.text(`Halaman ${i} dari ${pageCount}`, 196, 290, { align: 'right' });
        }

        const namaFile = perKecamatan ? `Data_Sekolah_Kec_${perKecamatan.replace(/ /g, '_')}` : 'Data_Sekolah_Tabalong';
        doc.save(`${namaFile}.pdf`);
        toast.success("PDF berhasil diunduh!");
        setShowPrintMenu(false);
    };

    // ── CETAK EXCEL (CSV) ──
    const cetakExcel = (perKecamatan?: string) => {
        const data = perKecamatan ? schools.filter(s => s.kecamatan === perKecamatan) : filteredSchools;
        const judul = perKecamatan ? `Data Sekolah Kecamatan ${perKecamatan}` : 'Data Sekolah SD Kab. Tabalong';
        const rows = [
            ['DINAS PENDIDIKAN DAN KEBUDAYAAN KABUPATEN TABALONG'],
            [judul.toUpperCase()],
            [],
            ['No', 'Nama Sekolah', 'NPSN', 'Kecamatan'],
            ...data.map((s, i) => [i + 1, s.nama_instansi || '-', s.npsn || '-', s.kecamatan || '-']),
            [],
            [`Dicetak: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`],
        ];
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const bom = '\uFEFF';
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const namaFile = perKecamatan ? `Data_Sekolah_Kec_${perKecamatan.replace(/ /g, '_')}` : 'Data_Sekolah_Tabalong';
        a.download = `${namaFile}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("File Excel/CSV berhasil diunduh!");
        setShowPrintMenu(false);
    };

    if (isLoading) return <LoadingScreen text="Memuat data sekolah..." />;

    return (
        <div className="space-y-5">
            {/* ── HEADER ── */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                    style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Data Sekolah</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight"
                            style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Manajemen Sekolah
                        </h1>
                        <p className="text-slate-500 mt-1 font-medium text-sm">Kelola dan cetak data sekolah SD Kab. Tabalong.</p>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        {/* Print dropdown */}
                        <div ref={printMenuRef} className="relative">
                            <motion.button whileTap={{ scale: 0.96 }} onClick={() => setShowPrintMenu(v => !v)}
                                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-black transition-all border"
                                style={{ border: `1px solid ${P.sage}40`, color: P.forest, backgroundColor: '#D1FAE5' }}>
                                <FileDown className="h-4 w-4" /> Cetak <ChevronDown className="h-3.5 w-3.5" />
                            </motion.button>
                            <AnimatePresence>
                                {showPrintMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl shadow-xl overflow-hidden z-50 bg-white border"
                                        style={{ borderColor: `${P.sage}30` }}>
                                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider" style={{ backgroundColor: P.cream, color: P.forest }}>
                                            Semua / Hasil Filter
                                        </div>
                                        <button onClick={() => cetakPDF()}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold hover:bg-red-50 transition-colors text-left">
                                            <FileText className="h-4 w-4 text-red-500" /> Unduh PDF
                                        </button>
                                        <button onClick={() => cetakExcel()}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold hover:bg-green-50 transition-colors text-left border-t" style={{ borderColor: '#F1F5F9' }}>
                                            <FileSpreadsheet className="h-4 w-4 text-green-600" /> Unduh Excel/CSV
                                        </button>

                                        <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider border-t" style={{ backgroundColor: P.cream, color: P.forest, borderColor: '#F1F5F9' }}>
                                            Per Kecamatan
                                        </div>
                                        <div className="max-h-40 overflow-y-auto">
                                            {kecamatanList.filter(k => k !== 'Semua').map(kec => (
                                                <div key={kec} className="flex items-center border-b last:border-0" style={{ borderColor: '#F1F5F9' }}>
                                                    <button onClick={() => cetakPDF(kec)}
                                                        className="flex-1 flex items-center gap-2 px-4 py-2 text-xs font-bold hover:bg-red-50 transition-colors text-left">
                                                        <FileText className="h-3.5 w-3.5 text-red-400 shrink-0" />{kec}
                                                    </button>
                                                    <button onClick={() => cetakExcel(kec)}
                                                        className="px-3 py-2 hover:bg-green-50 transition-colors">
                                                        <FileSpreadsheet className="h-3.5 w-3.5 text-green-500" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Tambah */}
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                            onClick={() => setShowTambah(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-black shadow-sm transition-all"
                            style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, color: 'white' }}>
                            <Plus className="h-4 w-4" /> Tambah
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* ── STATS SUMMARY ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Total Sekolah', value: schools.length, color: P.forest, bg: '#D1FAE5' },
                    { label: 'Hasil Filter', value: filteredSchools.length, color: '#D97706', bg: '#FEF3C7' },
                    { label: 'Kecamatan', value: kecamatanList.length - 1, color: '#7C3AED', bg: '#EDE9FE' },
                ].map(s => (
                    <div key={s.label} className="bg-white rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 border border-slate-100"
                        style={{ borderLeft: `4px solid ${s.color}` }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: s.bg }}>
                            <span className="text-lg sm:text-xl font-black" style={{ color: s.color }}>{s.value}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 leading-tight">{s.label}</p>
                    </div>
                ))}
            </motion.div>

            {/* ── FILTER BAR ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="rounded-2xl overflow-hidden shadow-sm"
                style={{ border: `1px solid ${P.sage}30` }}>
                {/* Search */}
                <div className="p-3 sm:p-4" style={{ backgroundColor: 'white' }}>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: searchTerm ? P.forest : P.sage }} />
                        <input
                            type="search"
                            placeholder="Cari nama sekolah, NPSN, atau kecamatan..."
                            className="pl-10 pr-4 py-2.5 w-full rounded-xl text-sm font-medium outline-none border transition-all"
                            style={{ borderColor: `${P.sage}30`, backgroundColor: P.cream }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Kecamatan filter — chip grid, semua tampil */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4" style={{ backgroundColor: 'white', borderTop: `1px solid ${P.sage}15` }}>
                    <div className="flex items-center gap-1.5 mb-2 pt-3">
                        <MapPin className="h-3.5 w-3.5" style={{ color: P.forest }} />
                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: P.forest }}>Filter Kecamatan</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {kecamatanList.map(k => (
                            <button key={k} onClick={() => setKecamatanFilter(k)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 whitespace-nowrap"
                                style={{
                                    backgroundColor: kecamatanFilter === k ? P.forest : '#F1F5F9',
                                    color: kecamatanFilter === k ? 'white' : '#475569',
                                    boxShadow: kecamatanFilter === k ? `0 2px 8px ${P.forest}30` : 'none',
                                }}>
                                {k}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── TABLE / CARD LIST ── */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ borderLeft: `4px solid ${P.forest}` }}>
                {/* Table header — desktop only */}
                <div className="hidden sm:grid grid-cols-[auto_2fr_140px_1fr_auto] gap-4 px-5 py-3 border-b"
                    style={{ backgroundColor: P.cream, borderColor: `${P.sage}20` }}>
                    {['No', 'Nama Sekolah', 'NPSN', 'Kecamatan', 'Aksi'].map(h => (
                        <span key={h} className="text-[10px] font-black uppercase tracking-wider" style={{ color: P.forest }}>{h}</span>
                    ))}
                </div>

                {filteredSchools.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-10 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: '#D1FAE5' }}>
                            <AlertTriangle className="h-7 w-7" style={{ color: P.forest }} />
                        </div>
                        <h3 className="text-base font-black text-slate-700 mb-1">Sekolah tidak ditemukan</h3>
                        <p className="text-sm text-slate-400">Coba gunakan kata kunci pencarian yang lain.</p>
                    </div>
                ) : (
                    <div className="divide-y max-h-[55vh] overflow-y-auto">
                        {filteredSchools.map((school, i) => (
                            <motion.div key={school.npsn}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.007, 0.3) }}
                                className="hover:bg-slate-50/60 transition-colors">
                                {/* Desktop row */}
                                <div className="hidden sm:grid grid-cols-[auto_2fr_140px_1fr_auto] gap-4 items-center px-5 py-3.5">
                                    <span className="w-6 text-center text-[11px] font-black text-slate-400">{i + 1}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
                                            <School className="h-4 w-4" style={{ color: P.forest }} />
                                        </div>
                                        <p className="font-bold text-slate-900 text-sm leading-tight">{school.nama_instansi}</p>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
                                        style={{ backgroundColor: `${P.sage}15`, color: P.forestDark }}>
                                        {school.npsn}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                                        <MapPin className="h-3 w-3 text-slate-400" />{school.kecamatan}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-black rounded-lg transition-all"
                                            style={{ backgroundColor: P.gold, color: P.forestDark }}>
                                            <KeyRound className="h-3 w-3" /> Reset
                                        </motion.button>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => setHapusTarget(school)}
                                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-black rounded-lg transition-all"
                                            style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                                            <Trash2 className="h-3 w-3" /> Hapus
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Mobile card */}
                                <div className="sm:hidden flex items-center gap-3 px-4 py-3">
                                    <span className="text-[11px] font-black text-slate-300 w-5 shrink-0 text-center">{i + 1}</span>
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#D1FAE5' }}>
                                        <School className="h-4 w-4" style={{ color: P.forest }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900 text-sm leading-tight truncate">{school.nama_instansi}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-mono font-bold" style={{ color: P.forest }}>{school.npsn}</span>
                                            <span className="text-[10px] text-slate-400">·</span>
                                            <span className="text-[10px] text-slate-500 truncate">{school.kecamatan}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${P.gold}20` }}>
                                            <KeyRound className="h-3.5 w-3.5" style={{ color: '#D97706' }} />
                                        </button>
                                        <button onClick={() => setHapusTarget(school)}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEE2E2' }}>
                                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className="px-5 py-3 border-t flex items-center justify-between" style={{ backgroundColor: P.cream, borderColor: `${P.sage}20` }}>
                    <p className="text-xs font-medium" style={{ color: P.sage }}>
                        Tampil <span className="font-black" style={{ color: P.forest }}>{filteredSchools.length}</span> dari{' '}
                        <span className="font-black" style={{ color: P.forest }}>{schools.length}</span> sekolah
                    </p>
                    {kecamatanFilter !== 'Semua' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${P.forest}15`, color: P.forest }}>
                            Kec. {kecamatanFilter}
                        </span>
                    )}
                </div>
            </motion.div>

            {/* ── MODALS ── */}
            <AnimatePresence>
                {showTambah && <TambahSekolahModal onClose={() => setShowTambah(false)} onSuccess={fetchSchools} />}
                {hapusTarget && <HapusModal school={hapusTarget} onClose={() => setHapusTarget(null)} onSuccess={fetchSchools} />}
            </AnimatePresence>
        </div>
    );
}
