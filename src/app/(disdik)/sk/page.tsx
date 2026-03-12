"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, query, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    DialogTrigger,
} from "@/components/ui/dialog";

type SKData = {
    id: string;
    nomor_surat: string;
    judul: string;
    file_url_firebase: string;
    created_at: string;
};

export default function KelolaSKPage() {
    const [sks, setSks] = useState<SKData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [nomorSurat, setNomorSurat] = useState("");
    const [judul, setJudul] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const fetchSKs = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "decrees"));
            const querySnapshot = await getDocs(q);
            const data: SKData[] = [];
            querySnapshot.forEach((d) => {
                data.push({ id: d.id, ...d.data() } as SKData);
            });
            data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setSks(data);
        } catch (error) {
            toast.error("Gagal mengambil data SK");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSKs();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !nomorSurat || !judul) {
            toast.error("Mohon lengkapi semua kolom dan pilih file PDF");
            return;
        }

        if (file.type !== "application/pdf") {
            toast.error("Format file harus PDF");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload ke Storage
            const storageRef = ref(storage, `decrees/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 2. Simpan ke Firestore
            await addDoc(collection(db, "decrees"), {
                nomor_surat: nomorSurat,
                judul: judul,
                file_url_firebase: downloadURL,
                created_at: new Date().toISOString()
            });

            toast.success("SK Berhasil diunggah");
            setIsDialogOpen(false);
            setNomorSurat("");
            setJudul("");
            setFile(null);
            fetchSKs();
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengunggah SK");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, fileUrl: string) => {
        if (!confirm("Hapus SK ini secara permanen?")) return;

        try {
            // Attempt to delete from storage if it's a firebase URL
            if (fileUrl.includes("firebasestorage")) {
                const fileRef = ref(storage, fileUrl);
                await deleteObject(fileRef).catch(e => console.log("File possibly already deleted from storage"));
            }

            await deleteDoc(doc(db, "decrees", id));
            toast.success("SK berhasil dihapus");
            setSks(sks.filter(s => s.id !== id));
        } catch (error) {
            toast.error("Gagal menghapus SK");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Surat Keputusan (SK)</h1>
                    <p className="text-slate-500 mt-2">Kelola dan unggah SK Disdik untuk diakses oleh sekolah.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Unggah SK Baru
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Unggah SK Baru</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpload} className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Nomor Surat</label>
                                <Input
                                    value={nomorSurat}
                                    onChange={(e) => setNomorSurat(e.target.value)}
                                    placeholder="Contoh: SK/001/DISDIK/2026"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Judul/Perihal SK</label>
                                <Input
                                    value={judul}
                                    onChange={(e) => setJudul(e.target.value)}
                                    placeholder="Masukkan judul SK"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">File SK (PDF)</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                            <p className="text-sm text-slate-500 font-medium">
                                                {file ? file.name : "Klik untuk pilih file PDF"}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="application/pdf"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            required
                                        />
                                    </label>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 mt-4" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengunggah...</> : "Simpan Dokumen"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Surat</TableHead>
                                <TableHead>Judul</TableHead>
                                <TableHead>Tanggal Diunggah</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={4} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" /></TableCell></TableRow>
                            ) : sks.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center h-24 text-slate-500">Belum ada data SK.</TableCell></TableRow>
                            ) : (
                                sks.map((sk) => (
                                    <TableRow key={sk.id}>
                                        <TableCell className="font-medium">{sk.nomor_surat}</TableCell>
                                        <TableCell>{sk.judul}</TableCell>
                                        <TableCell>{new Date(sk.created_at).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <a href={sk.file_url_firebase} target="_blank" rel="noreferrer">
                                                <Button variant="outline" size="sm">
                                                    <FileText className="mr-2 h-4 w-4" /> Buka
                                                </Button>
                                            </a>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(sk.id, sk.file_url_firebase)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
