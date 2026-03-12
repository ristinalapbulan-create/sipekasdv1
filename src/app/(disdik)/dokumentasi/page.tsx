"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, query, getDocs, orderBy, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Image as ImageIcon, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

type DocData = {
    id: string;
    judul_kegiatan: string;
    deskripsi: string;
    image_urls_firebase: string[];
    created_at: string;
};

export default function KelolaDokumentasiPage() {
    const [docsData, setDocsData] = useState<DocData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [judulKegiatan, setJudulKegiatan] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);

    const fetchDocs = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, "documentations"));
            const querySnapshot = await getDocs(q);
            const data: DocData[] = [];
            querySnapshot.forEach((d) => {
                data.push({ id: d.id, ...d.data() } as DocData);
            });
            data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setDocsData(data);
        } catch (error) {
            toast.error("Gagal mengambil data dokumentasi");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files || files.length === 0 || !judulKegiatan || !deskripsi) {
            toast.error("Mohon lengkapi semua kolom dan pilih minimal 1 foto");
            return;
        }

        // check file types
        for (let i = 0; i < files.length; i++) {
            if (!files[i].type.startsWith("image/")) {
                toast.error("Format file harus berupa gambar (JPG/PNG)");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const uploadedUrls: string[] = [];

            // 1. Upload semua gambar ke Storage
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const storageRef = ref(storage, `documentations/${Date.now()}_${file.name}`);
                const snapshot = await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(snapshot.ref);
                uploadedUrls.push(downloadURL);
            }

            // 2. Simpan array di Firestore
            await addDoc(collection(db, "documentations"), {
                judul_kegiatan: judulKegiatan,
                deskripsi: deskripsi,
                image_urls_firebase: uploadedUrls,
                created_at: new Date().toISOString()
            });

            toast.success("Dokumentasi Berhasil diunggah");
            setIsDialogOpen(false);
            setJudulKegiatan("");
            setDeskripsi("");
            setFiles(null);
            fetchDocs();
        } catch (error) {
            console.error(error);
            toast.error("Gagal mengunggah dokumentasi");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, imageUrls: string[]) => {
        if (!confirm("Hapus dokumentasi beserta semua gambarnya secara permanen?")) return;

        try {
            // Loop array and try deleting each from firebase storage
            for (const fileUrl of imageUrls) {
                if (fileUrl.includes("firebasestorage")) {
                    const fileRef = ref(storage, fileUrl);
                    await deleteObject(fileRef).catch(e => console.log("File possibly already deleted from storage"));
                }
            }

            await deleteDoc(doc(db, "documentations", id));
            toast.success("Dokumentasi berhasil dihapus");
            setDocsData(docsData.filter(d => d.id !== id));
        } catch (error) {
            toast.error("Gagal menghapus dokumentasi");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Album Dokumentasi</h1>
                    <p className="text-slate-500 mt-2">Kelola foto-foto kegiatan/dokumentasi Disdik.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Unggah Dokumentasi Baru
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Unggah Dokumentasi</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpload} className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Judul Kegiatan</label>
                                <Input
                                    value={judulKegiatan}
                                    onChange={(e) => setJudulKegiatan(e.target.value)}
                                    placeholder="Contoh: Sosialisasi Kurikulum Merdeka"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Deskripsi Singkat</label>
                                <Textarea
                                    value={deskripsi}
                                    onChange={(e) => setDeskripsi(e.target.value)}
                                    placeholder="Masukkan deskripsi kegiatan"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Pilih Foto Kegiatan (Bisa Lebih Dari 1)</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-2 text-slate-400" />
                                            <p className="text-sm text-slate-500 font-medium">
                                                {files && files.length > 0 ? `${files.length} Foto terpilih` : "Klik untuk pilih Foto (JPG/PNG)"}
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => setFiles(e.target.files)}
                                            required
                                        />
                                    </label>
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-blue-600 mt-4" disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mungunggah Foto...</> : "Simpan Album Dokumentasi"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden">
                            <div className="bg-slate-200 h-48 w-full animate-pulse"></div>
                            <CardContent className="p-4 space-y-2">
                                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                            </CardContent>
                        </Card>
                    ))
                ) : docsData.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white border rounded-xl border-dashed">
                        <ImageIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                        <p>Belum ada dokumentasi. Mulai unggah foto kegiatan pertama Anda.</p>
                    </div>
                ) : (
                    docsData.map((docItem) => (
                        <Card key={docItem.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="relative h-48 bg-slate-100 overflow-hidden">
                                <img
                                    src={docItem.image_urls_firebase[0] || "https://placehold.co/600x400?text=No+Image"}
                                    alt={docItem.judul_kegiatan}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {docItem.image_urls_firebase.length > 1 && (
                                    <Badge className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/60 backdrop-blur-sm border-0">
                                        +{docItem.image_urls_firebase.length - 1} Foto
                                    </Badge>
                                )}
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-lg text-slate-900 leading-tight mb-1 line-clamp-2">
                                    {docItem.judul_kegiatan}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    {docItem.deskripsi}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span>{new Date(docItem.created_at).toLocaleDateString('id-ID')}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                        onClick={() => handleDelete(docItem.id, docItem.image_urls_firebase)}
                                    >
                                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
