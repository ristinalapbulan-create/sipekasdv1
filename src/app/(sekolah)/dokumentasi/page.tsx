"use client";

import { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type DocData = {
    id: string;
    judul_kegiatan: string;
    deskripsi: string;
    image_urls_firebase: string[];
    created_at: string;
};

export default function SekolahDokumentasiPage() {
    const [docsData, setDocsData] = useState<DocData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Album Dokumentasi Disdik</h1>
                    <p className="text-slate-500 mt-2">Galeri foto kegiatan dan acara Dinas Pendidikan.</p>
                </div>
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
                        <p>Belum ada dokumentasi tersedia dari Dinas Pendidikan.</p>
                    </div>
                ) : (
                    docsData.map((docItem) => (
                        <Card key={docItem.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                            <div className="relative h-48 bg-slate-100 overflow-hidden cursor-pointer" onClick={() => window.open(docItem.image_urls_firebase[0], '_blank')}>
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
                                    <span>{new Date(docItem.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
