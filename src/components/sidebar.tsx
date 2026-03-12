"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface SidebarProps {
    items: {
        title: string;
        href: string;
        icon: React.ReactNode;
    }[];
}

export function Sidebar({ items }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { namaInstansi, role } = useAuthStore();

    const handleLogout = async () => {
        await auth.signOut();
        document.cookie = 'auth_token=; Max-Age=0; path=/;';
        document.cookie = 'user_role=; Max-Age=0; path=/;';
        router.push("/login");
    };

    return (
        <div className="flex h-screen w-64 flex-col bg-slate-900 border-r border-slate-800 text-slate-100 flex-shrink-0">
            <div className="p-6">
                <h2 className="text-xl font-bold tracking-tight text-white">SIMPEKA SD</h2>
                <p className="text-sm text-slate-400 mt-1 capitalize leading-tight">
                    Panel {role}
                </p>
            </div>

            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-4">
                    {items.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors my-0.5",
                                    isActive
                                        ? "bg-blue-600 text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                {item.icon}
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800">
                <div className="mb-4 px-2">
                    <p className="text-sm font-medium text-white truncate">{namaInstansi}</p>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                </Button>
            </div>
        </div>
    );
}
