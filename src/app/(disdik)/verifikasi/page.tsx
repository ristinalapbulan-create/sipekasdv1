"use client";

import { useState, useEffect } from "react";
import { collection, query, getDocs, updateDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, Search, CheckCircle, XCircle, ExternalLink, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type ReportData = {
    id: string;
    npsn_sekolah: string;
    nama_sekolah: string;
    link_jurnal: string;
    link_daftar_hadir: string;
    link_dokumentasi: string;
    status: 'Menunggu' | 'Revisi' | 'Terverifikasi';
    catatan_revisi: string;
    bulan_laporan: string;
    created_at: string;
};

export default function VerifikasiPage() {
    const [reports, setReports] = useState<ReportData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notes, setNotes] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "reports"));
            const querySnapshot = await getDocs(q);
            const data: ReportData[] = [];
            querySnapshot.forEach((d) => {
                data.push({ id: d.id, ...d.data() } as ReportData);
            });
            // Sort newest first
            data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setReports(data);
        } catch (error) {
            console.error("Error fetching reports:", error);
            toast.error("Gagal mengambil data laporan");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleVerifikasi = async (status: 'Terverifikasi' | 'Revisi') => {
        if (!selectedReport) return;

        if (status === 'Revisi' && !notes.trim()) {
            toast.error("Catatan revisi wajib diisi jika laporan ditolak");
            return;
        }

        setIsProcessing(true);
        try {
            await updateDoc(doc(db, "reports", selectedReport.id), {
                status,
                catatan_revisi: notes
            });
            toast.success(`Laporan berhasil diubah menjadi ${status}`);
            setIsModalOpen(false);
            fetchReports();
        } catch (error) {
            toast.error("Gagal memproses verifikasi");
        } finally {
            setIsProcessing(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Menunggu':
                return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Menunggu</Badge>;
            case 'Revisi':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Revisi</Badge>;
            case 'Terverifikasi':
                return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Terverifikasi</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const filteredReports = reports.filter(r =>
        r.nama_sekolah.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.npsn_sekolah.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Verifikasi Laporan</h1>
                    <p className="text-slate-500 mt-2">Daftar laporan dari sekolah yang menunggu verifikasi.</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Cari sekolah (NPSN / Nama)..."
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border-0 sm:border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sekolah</TableHead>
                                    <TableHead>Bulan Laporan</TableHead>
                                    <TableHead>Tgl Dikirim</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                                            Memuat data...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredReports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                            Tidak ada laporan yang ditemukan.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell>
                                                <p className="font-medium text-slate-900">{report.nama_sekolah}</p>
                                                <p className="text-xs text-slate-500">NPSN: {report.npsn_sekolah}</p>
                                            </TableCell>
                                            <TableCell>{report.bulan_laporan}</TableCell>
                                            <TableCell>{new Date(report.created_at).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedReport(report);
                                                        setNotes(report.catatan_revisi || "");
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Cek Dokumen
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Verifikasi Modal Split Screen Style */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-50">
                    {selectedReport && (
                        <div className="flex flex-col md:flex-row h-[80vh] md:h-[600px]">
                            {/* Kiri: Daftar Link */}
                            <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-slate-200">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-xl">
                                        Verifikasi Laporan: {selectedReport.nama_sekolah}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Tautan Berkas</h3>

                                        <a href={selectedReport.link_jurnal} target="_blank" rel="noreferrer" className="flex items-center p-3 border rounded-lg bg-white hover:border-blue-500 hover:shadow-sm transition-all group">
                                            <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-blue-500 mr-3" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium text-slate-900">Buka Link Jurnal</p>
                                                <p className="text-xs text-slate-500 truncate">{selectedReport.link_jurnal}</p>
                                            </div>
                                        </a>

                                        <a href={selectedReport.link_daftar_hadir} target="_blank" rel="noreferrer" className="flex items-center p-3 border rounded-lg bg-white hover:border-blue-500 hover:shadow-sm transition-all group">
                                            <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-blue-500 mr-3" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium text-slate-900">Buka Link Daftar Hadir</p>
                                                <p className="text-xs text-slate-500 truncate">{selectedReport.link_daftar_hadir}</p>
                                            </div>
                                        </a>

                                        <a href={selectedReport.link_dokumentasi} target="_blank" rel="noreferrer" className="flex items-center p-3 border rounded-lg bg-white hover:border-blue-500 hover:shadow-sm transition-all group">
                                            <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-blue-500 mr-3" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium text-slate-900">Buka Link Dokumentasi</p>
                                                <p className="text-xs text-slate-500 truncate">{selectedReport.link_dokumentasi}</p>
                                            </div>
                                        </a>
                                    </div>

                                    <div className="pt-4 border-t border-slate-200">
                                        <p className="text-sm text-slate-600">Status Saat Ini: {getStatusBadge(selectedReport.status)}</p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Periode Laporan: <strong>{selectedReport.bulan_laporan}</strong>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Kanan: Form Aksi */}
                            <div className="w-full md:w-1/2 p-6 bg-white flex flex-col items-start justify-center">
                                <div className="w-full max-w-sm mx-auto space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-900">Keputusan Verifikasi</h3>
                                        <p className="text-sm text-slate-500">Pilih tindakan untuk laporan ini berdasarkan dokumen yang telah diperiksa.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Catatan Revisi / Pesan (Opsional jika Setuju)</label>
                                        <Textarea
                                            className="min-h-[120px] resize-none"
                                            placeholder="Masukkan catatan spesifik apa yang kurang atau perlu diperbaiki..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-6 w-full">
                                        <Button
                                            variant="outline"
                                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => handleVerifikasi('Revisi')}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                                            Tolak & Revisi
                                        </Button>
                                        <Button
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                            onClick={() => handleVerifikasi('Terverifikasi')}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                            Setujui Lengkap
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
