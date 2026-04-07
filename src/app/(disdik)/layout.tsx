"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { Sidebar } from "@/components/sidebar";
import { LayoutDashboard, FileText, CheckSquare, FolderOpen, Database, School, Settings } from "lucide-react";

export default function DisdikLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const navItems = [
        {
            title: "Dashboard",
            href: "/disdik/dashboard",
            icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
            title: "Verifikasi Laporan",
            href: "/disdik/verifikasi",
            icon: <CheckSquare className="h-4 w-4" />,
        },
        {
            title: "Arsip Laporan",
            href: "/disdik/arsip",
            icon: <Database className="h-4 w-4" />,
        },
        {
            title: "Kelola SK",
            href: "/disdik/sk",
            icon: <FileText className="h-4 w-4" />,
        },
        {
            title: "Kelola Dokumentasi",
            href: "/disdik/dokumentasi",
            icon: <FolderOpen className="h-4 w-4" />,
        },
        {
            title: "Data Sekolah",
            href: "/disdik/sekolah",
            icon: <School className="h-4 w-4" />,
        },
        {
            title: "Pengaturan",
            href: "/disdik/pengaturan",
            icon: <Settings className="h-4 w-4" />,
        },
    ];

    return (
        <AuthProvider>
            <div className="flex bg-slate-50 min-h-screen">
                <Sidebar items={navItems} />
                <main className="flex-1 w-full overflow-auto p-4 pt-20 pb-24 md:p-8 md:pl-72 transition-all">
                    {children}
                </main>
            </div>
        </AuthProvider>
    );
}
