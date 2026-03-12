"use client";

import { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Loader2, FileText, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type SKData = {
    id: string;
    nomor_surat: string;
    judul: string;
    file_url_firebase: string;
    created_at: string;
};

export default function SKSekolahPage() {
    const [sks, setSks] = useState<SKData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

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

    const filteredSks = sks.filter(sk =>
        sk.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sk.nomor_surat.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Surat Keputusan (SK) Disdik</h1>
                    <p className="text-slate-500 mt-2">Arsip dan daftar SK resmi dari Dinas Pendidikan.</p>
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        type="search"
                        placeholder="Cari nomor/judul SK..."
                        className="pl-9 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
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
                            ) : filteredSks.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center h-24 text-slate-500">Tidak ada pengumuman SK.</TableCell></TableRow>
                            ) : (
                                filteredSks.map((sk) => (
                                    <TableRow key={sk.id}>
                                        <TableCell className="font-medium text-slate-900">{sk.nomor_surat}</TableCell>
                                        <TableCell className="text-slate-600">{sk.judul}</TableCell>
                                        <TableCell className="text-slate-500">{new Date(sk.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</TableCell>
                                        <TableCell className="text-right">
                                            <a href={sk.file_url_firebase} target="_blank" rel="noreferrer">
                                                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                    <FileText className="mr-2 h-4 w-4" /> Buka SK
                                                </Button>
                                            </a>
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
