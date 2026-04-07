import { AuthProvider } from "@/components/providers/auth-provider";
import { Sidebar } from "@/components/sidebar";
import { LayoutDashboard, FileText, CheckSquare, FolderOpen, Settings } from "lucide-react";

export default function SekolahLayout({ children }: { children: React.ReactNode }) {
    const navItems = [
        { title: "Dashboard",    href: "/sekolah/dashboard",   icon: <LayoutDashboard className="h-4 w-4" /> },
        { title: "Laporan PEKA", href: "/sekolah/laporan",     icon: <CheckSquare className="h-4 w-4" /> },
        { title: "SK Disdik",    href: "/sekolah/sk",          icon: <FileText className="h-4 w-4" /> },
        { title: "Dokumentasi",  href: "/sekolah/dokumentasi", icon: <FolderOpen className="h-4 w-4" /> },
        { title: "Pengaturan",   href: "/sekolah/pengaturan",  icon: <Settings className="h-4 w-4" /> },
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
