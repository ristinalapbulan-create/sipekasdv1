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
            <div className="flex bg-slate-50 h-screen overflow-hidden">
                <Sidebar items={navItems} />
                <div className="flex-1 flex flex-col w-full md:pl-64 transition-all">
                    <main className="flex-1 overflow-y-auto p-4 pt-20 pb-6 md:p-8 md:pt-8">
                        {children}
                    </main>
                    <footer className="shrink-0 px-4 py-2.5 md:px-8 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-medium text-slate-400">
                                &copy; {new Date().getFullYear()} SIMPEKA SD — Disdikbud Tabalong
                            </p>
                            <p className="text-[10px] font-medium text-slate-300">
                                v1.0 &middot; MfyTech
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </AuthProvider>
    );
}
