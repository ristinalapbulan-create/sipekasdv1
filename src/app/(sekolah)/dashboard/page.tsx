"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, FileWarning, FolderOpen } from "lucide-react";

export default function SekolahDashboardPage() {
    const { npsn, namaInstansi } = useAuthStore();
    const [stats, setStats] = useState({
        total: 0,
        menunggu: 0,
        revisi: 0,
        terverifikasi: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (!npsn) return;

            try {
                const reportsRef = collection(db, "reports");
                const q = query(reportsRef, where("npsn_sekolah", "==", npsn));
                const snapshot = await getDocs(q);

                let total = 0;
                let menunggu = 0;
                let revisi = 0;
                let terverifikasi = 0;

                snapshot.forEach((doc) => {
                    total++;
                    const data = doc.data();
                    if (data.status === "Menunggu") menunggu++;
                    if (data.status === "Revisi") revisi++;
                    if (data.status === "Terverifikasi") terverifikasi++;
                });

                setStats({ total, menunggu, revisi, terverifikasi });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchStats();
    }, [npsn]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-slate-900">Dashboard Sekolah</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-4 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-[60px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Selamat Datang, {namaInstansi}</h1>
                <p className="text-slate-500 mt-2">Pantau status laporan kegiatan PEKA sekolah Anda di sini.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Total Laporan (Bulan Ini)
                        </CardTitle>
                        <FolderOpen className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-200/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-800">
                            Menunggu Verifikasi
                        </CardTitle>
                        <Clock className="h-4 w-4 text-amber-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-900">{stats.menunggu}</div>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">
                            Perlu Revisi
                        </CardTitle>
                        <FileWarning className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">{stats.revisi}</div>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-50 border-emerald-200/60 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-800">
                            Terverifikasi
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">{stats.terverifikasi}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
