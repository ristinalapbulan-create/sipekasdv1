"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { Sidebar } from "@/components/sidebar";
import { LayoutDashboard, FileText, CheckSquare, FolderOpen } from "lucide-react";

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
            title: "Kelola SK",
            href: "/disdik/sk",
            icon: <FileText className="h-4 w-4" />,
        },
        {
            title: "Kelola Dokumentasi",
            href: "/disdik/dokumentasi",
            icon: <FolderOpen className="h-4 w-4" />,
        },
    ];

    return (
        <AuthProvider>
            <div className="flex bg-slate-50 min-h-screen">
                <Sidebar items={navItems} />
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </AuthProvider>
    );
}
