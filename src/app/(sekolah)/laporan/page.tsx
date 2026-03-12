"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Link as LinkIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    Table,
    Body as TableBody,
    Cell as TableCell,
    Head as TableHead,
    Header as TableHeader,
    Row as TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const reportSchema = z.object({
    link_jurnal: z.string().url({ message: "Harus berupa URL yang valid (https://...)" }),
    link_daftar_hadir: z.string().url({ message: "Harus berupa URL yang valid (https://...)" }),
    link_dokumentasi: z.string().url({ message: "Harus berupa URL yang valid (https://...)" }),
});

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

export default function LaporanPage() {
    const { npsn, namaInstansi } = useAuthStore();
    const [reports, setReports] = useState<ReportData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            link_jurnal: "",
            link_daftar_hadir: "",
            link_dokumentasi: "",
        },
    });

    const fetchReports = async () => {
        if (!npsn) return;
        setIsLoading(true);
        try {
            const q = query(
                collection(db, "reports"),
                where("npsn_sekolah", "==", npsn),
            );
            const querySnapshot = await getDocs(q);
            const data: ReportData[] = [];
            querySnapshot.forEach((doc) => {
                data.push({ id: doc.id, ...doc.data() } as ReportData);
            });
            // Sort in client side since we might need composite index for firestore orderby
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
    }, [npsn]);

    async function onSubmit(values: z.infer<typeof reportSchema>) {
        if (!npsn || !namaInstansi) return;
        setIsSubmitting(true);

        try {
            const now = new Date();
            await addDoc(collection(db, "reports"), {
                ...values,
                npsn_sekolah: npsn,
                nama_sekolah: namaInstansi,
                status: "Menunggu",
                catatan_revisi: "",
                bulan_laporan: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
                created_at: now.toISOString(),
            });

            toast.success("Laporan berhasil dikirim!");
            setIsDialogOpen(false);
            form.reset();
            fetchReports();
        } catch (error: any) {
            console.error("Error submitting:", error);
            toast.error(error.message || "Gagal mengirim laporan. Pastikan URL diawali dengan https://");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;

        try {
            await deleteDoc(doc(db, "reports", id));
            toast.success("Laporan berhasil dihapus");
            setReports(reports.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Gagal menghapus laporan");
        }
    }

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Laporan PEKA</h1>
                    <p className="text-slate-500 mt-2">Kelola dan kirimkan laporan bulanan sekolah Anda.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Kirim Laporan Baru
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Formulir Laporan PEKA</DialogTitle>
                            <DialogDescription>
                                Masukkan tautan Google Drive untuk berkas-berkas laporan bulan ini.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="link_jurnal"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link Jurnal (G-Drive)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://drive.google.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="link_daftar_hadir"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link Daftar Hadir (G-Drive)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://drive.google.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="link_dokumentasi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link Dokumentasi (G-Drive)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://drive.google.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 mt-4" disabled={isSubmitting || !form.formState.isValid}>
                                    {isSubmitting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                                    ) : (
                                        "Kirim Laporan"
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Riwayat Pelaporan</CardTitle>
                    <CardDescription>Daftar laporan yang pernah Anda kirimkan.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            <FolderOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                            <p>Belum ada laporan yang dikirimkan.</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bulan Laporan</TableHead>
                                        <TableHead>Tanggal Kirim</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Catatan Disdik</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell className="font-medium">{report.bulan_laporan}</TableCell>
                                            <TableCell>{new Date(report.created_at).toLocaleDateString('id-ID')}</TableCell>
                                            <TableCell>{getStatusBadge(report.status)}</TableCell>
                                            <TableCell className="max-w-[200px] truncate text-slate-500">
                                                {report.catatan_revisi || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {report.status === 'Menunggu' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDelete(report.id)}
                                                        title="Hapus Laporan"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
