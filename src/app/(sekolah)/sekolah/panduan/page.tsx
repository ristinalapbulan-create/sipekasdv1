"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen, LogIn, Users, FileText, RefreshCw, Settings,
    ChevronDown, CheckCircle2, AlertTriangle, Info, ArrowRight,
    Smartphone, Globe, Lock, Upload, Eye, Phone,
} from "lucide-react";
import Link from "next/link";

const P = { forest: '#2D6A4F', forestDark: '#1A3C2B', sage: '#74B38A', gold: '#FAC84A', cream: '#FEFAE0' };

// ── Data Panduan ──
type Step = { icon: React.ReactNode; title: string; desc: string };
type Section = {
    id: string; title: string; subtitle: string;
    icon: React.ReactNode; color: string; bg: string; border: string;
    steps: Step[];
    tips?: string[];
};

const SECTIONS: Section[] = [
    {
        id: "login", title: "Login ke Aplikasi", subtitle: "Cara masuk ke akun sekolah Anda",
        icon: <LogIn className="h-5 w-5" />, color: "#7C3AED", bg: "#EDE9FE", border: "#7C3AED",
        steps: [
            { icon: <Globe className="h-4 w-4" />, title: "Buka Aplikasi SIMPEKA SD", desc: "Akses melalui browser di HP atau laptop. Gunakan link yang diberikan oleh Disdikbud Tabalong." },
            { icon: <LogIn className="h-4 w-4" />, title: "Klik Tombol \"Masuk\"", desc: "Di halaman utama, klik tombol Masuk yang ada di pojok kanan atas." },
            { icon: <Lock className="h-4 w-4" />, title: "Masukkan NPSN & Password", desc: "Ketik NPSN sekolah Anda sebagai username (contoh: 30304xxx). Password default: pekasd. Segera ganti password setelah login pertama kali." },
            { icon: <CheckCircle2 className="h-4 w-4" />, title: "Berhasil Masuk", desc: "Anda akan diarahkan ke halaman Dashboard. Jika muncul notifikasi Data Guru PEKA belum diisi, segera lengkapi di menu Pengaturan." },
        ],
        tips: [
            "Gunakan browser Chrome atau Safari untuk pengalaman terbaik.",
            "Jika lupa password, hubungi admin Disdikbud untuk reset.",
            "Setelah login pertama, segera ubah password di menu Pengaturan.",
        ],
    },
    {
        id: "guru", title: "Isi Data Guru PEKA", subtitle: "Langkah wajib sebelum mengirim laporan",
        icon: <Users className="h-5 w-5" />, color: "#D97706", bg: "#FEF3C7", border: "#F59E0B",
        steps: [
            { icon: <Settings className="h-4 w-4" />, title: "Buka Menu \"Pengaturan\"", desc: "Klik menu Pengaturan di sidebar (desktop) atau di bar navigasi bawah (HP)." },
            { icon: <Users className="h-4 w-4" />, title: "Klik \"Tambah Guru\"", desc: "Pada bagian Data Guru PEKA, klik tombol hijau Tambah Guru." },
            { icon: <Phone className="h-4 w-4" />, title: "Isi Nama & Nomor HP", desc: "Masukkan nama lengkap guru PEKA dan nomor HP/WhatsApp aktif. Nomor HP wajib diisi karena digunakan Disdikbud untuk menghubungi via WhatsApp jika ada revisi." },
            { icon: <CheckCircle2 className="h-4 w-4" />, title: "Simpan Data", desc: "Klik tombol Tambah. Data guru akan tersimpan dan muncul di daftar. Anda bisa menambah lebih dari 1 guru PEKA." },
        ],
        tips: [
            "Pastikan nomor HP yang diisi adalah nomor WhatsApp aktif.",
            "Jika ada pergantian guru PEKA, segera update datanya lewat tombol Edit.",
            "Nomor HP guru pertama yang terdaftar akan menjadi kontak utama dari Disdikbud.",
        ],
    },
    {
        id: "laporan", title: "Mengirim Laporan Bulanan", subtitle: "Cara mengirimkan laporan PEKA setiap bulan",
        icon: <FileText className="h-5 w-5" />, color: P.forest, bg: "#D1FAE5", border: P.sage,
        steps: [
            { icon: <FileText className="h-4 w-4" />, title: "Buka Menu \"Laporan PEKA\"", desc: "Klik menu Laporan PEKA di sidebar atau navigasi bawah." },
            { icon: <Upload className="h-4 w-4" />, title: "Siapkan Berkas di Google Drive", desc: "Upload 3 berkas ke Google Drive Anda:\n1. Jurnal Kegiatan PEKA\n2. Daftar Hadir kegiatan\n3. Dokumentasi foto kegiatan\n\nPastikan akses file diubah ke \"Siapa saja yang memiliki link\"." },
            { icon: <ArrowRight className="h-4 w-4" />, title: "Klik \"Kirim Laporan Baru\"", desc: "Tombol kuning di kanan atas. Pilih bulan dan tahun laporan yang sesuai." },
            { icon: <Globe className="h-4 w-4" />, title: "Tempel Link Google Drive", desc: "Salin (copy) link dari Google Drive, lalu tempel (paste) ke masing-masing kolom: Link Jurnal, Link Daftar Hadir, dan Link Dokumentasi." },
            { icon: <CheckCircle2 className="h-4 w-4" />, title: "Klik \"Kirim Laporan\"", desc: "Laporan akan terkirim dengan status \"Menunggu\" dan akan ditinjau oleh Disdikbud. Anda bisa memantau status di dashboard." },
        ],
        tips: [
            "Setiap bulan hanya bisa mengirim 1 laporan. Bulan yang sudah terkirim akan ditandai di kalender.",
            "Pastikan link Google Drive bisa diakses oleh siapa saja (bukan private).",
            "Kirimkan laporan sebelum tanggal 10 bulan berikutnya.",
        ],
    },
    {
        id: "revisi", title: "Menangani Revisi", subtitle: "Langkah jika laporan diminta untuk diperbaiki",
        icon: <RefreshCw className="h-5 w-5" />, color: "#DC2626", bg: "#FEE2E2", border: "#DC2626",
        steps: [
            { icon: <AlertTriangle className="h-4 w-4" />, title: "Cek Notifikasi di Dashboard", desc: "Jika ada laporan berstatus Revisi, akan muncul peringatan di dashboard. Anda juga akan dihubungi via WhatsApp oleh Disdikbud." },
            { icon: <Eye className="h-4 w-4" />, title: "Baca Catatan Revisi", desc: "Buka menu Laporan PEKA, lihat catatan revisi dari Disdikbud pada laporan yang berstatus Revisi (berwarna merah)." },
            { icon: <Upload className="h-4 w-4" />, title: "Perbaiki Berkas", desc: "Perbaiki berkas yang diminta, upload ulang ke Google Drive, lalu klik tombol \"Edit\" pada laporan tersebut." },
            { icon: <ArrowRight className="h-4 w-4" />, title: "Kirim Ulang", desc: "Ganti link dengan link terbaru, lalu klik \"Kirim Ulang Laporan\". Status akan kembali ke \"Menunggu\" untuk ditinjau lagi." },
        ],
        tips: [
            "Segera perbaiki laporan yang diminta revisi agar proses verifikasi tidak tertunda.",
            "Baca catatan revisi dengan teliti agar tidak perlu diperbaiki berulang kali.",
        ],
    },
    {
        id: "pengaturan", title: "Pengaturan Akun", subtitle: "Kelola profil dan keamanan akun sekolah",
        icon: <Settings className="h-5 w-5" />, color: "#0EA5E9", bg: "#E0F2FE", border: "#0EA5E9",
        steps: [
            { icon: <Eye className="h-4 w-4" />, title: "Lihat Info Sekolah", desc: "Di halaman Pengaturan, Anda bisa melihat Nama Sekolah, NPSN, dan Kecamatan. Jika ada kesalahan data, hubungi admin Disdikbud." },
            { icon: <Users className="h-4 w-4" />, title: "Kelola Guru PEKA", desc: "Tambah, edit, atau hapus data guru PEKA. Pastikan selalu ada minimal 1 guru dengan nomor HP aktif." },
            { icon: <Lock className="h-4 w-4" />, title: "Ubah Password", desc: "Masukkan password lama, lalu buat password baru minimal 8 karakter. Simpan password di tempat yang aman." },
        ],
        tips: [
            "Gunakan password yang kuat: kombinasi huruf besar, kecil, dan angka.",
            "Jangan bagikan password ke orang lain.",
        ],
    },
];

// ── Accordion Item ──
function AccordionSection({ section, isOpen, onToggle }: { section: Section; isOpen: boolean; onToggle: () => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
            style={{ borderLeft: `4px solid ${section.border}` }}>
            {/* Header — clickable */}
            <button onClick={onToggle}
                className="w-full flex items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-slate-50/60">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: section.bg }}>
                    <span style={{ color: section.color }}>{section.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900">{section.title}</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{section.subtitle}</p>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}
                    className="shrink-0">
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </motion.div>
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden">
                        <div className="px-5 pb-5 space-y-4">
                            {/* Steps */}
                            <div className="space-y-0">
                                {section.steps.map((step, i) => (
                                    <div key={i} className="flex gap-3 relative">
                                        {/* Timeline line */}
                                        {i < section.steps.length - 1 && (
                                            <div className="absolute left-[15px] top-[36px] bottom-0 w-px"
                                                style={{ backgroundColor: `${section.color}20` }} />
                                        )}
                                        {/* Step number circle */}
                                        <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center shrink-0 mt-1 z-10 text-xs font-black text-white"
                                            style={{ background: `linear-gradient(135deg, ${section.color}, ${section.color}CC)` }}>
                                            {i + 1}
                                        </div>
                                        {/* Step content */}
                                        <div className="flex-1 pb-4 min-w-0">
                                            <p className="text-sm font-black text-slate-800 mb-1">{step.title}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tips */}
                            {section.tips && section.tips.length > 0 && (
                                <div className="rounded-xl p-3.5"
                                    style={{ backgroundColor: `${section.color}08`, border: `1px solid ${section.color}20` }}>
                                    <div className="flex items-center gap-1.5 mb-2">
                                        <Info className="h-3.5 w-3.5" style={{ color: section.color }} />
                                        <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: section.color }}>Tips</span>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {section.tips.map((tip, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                                                <span className="text-[10px] mt-0.5 shrink-0" style={{ color: section.color }}>💡</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ── Halaman Utama ──
export default function PanduanPage() {
    const [openId, setOpenId] = useState<string | null>("login");

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-2"
                    style={{ backgroundColor: `${P.forest}10`, border: `1px solid ${P.forest}20` }}>
                    <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: P.forest }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: P.forest }}>Panduan Pengguna</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight"
                    style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Panduan Penggunaan
                </h1>
                <p className="text-slate-500 mt-1 font-medium text-sm">
                    Petunjuk lengkap penggunaan aplikasi SIMPEKA SD untuk operator sekolah.
                </p>
            </motion.div>

            {/* Quick start banner */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${P.forestDark}, ${P.forest})`, boxShadow: `0 8px 32px ${P.forest}30` }}>
                <div className="p-5 sm:p-6 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${P.gold}20`, border: `1px solid ${P.gold}30` }}>
                        <Smartphone className="h-6 w-6" style={{ color: P.gold }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base font-black text-white mb-1">Mulai dari Mana?</h2>
                        <p className="text-xs text-white/70 leading-relaxed mb-3">
                            Ikuti langkah-langkah di bawah ini secara berurutan. Pastikan Anda sudah mengisi
                            <strong className="text-white"> Data Guru PEKA</strong> sebelum mengirim laporan bulanan.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <Link href="/sekolah/pengaturan">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer"
                                    style={{ backgroundColor: P.gold, color: P.forestDark }}>
                                    <Settings className="h-3 w-3" /> Isi Data Guru
                                </span>
                            </Link>
                            <Link href="/sekolah/laporan">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                                    <FileText className="h-3 w-3" /> Kirim Laporan
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Alur Singkat */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-slate-100 p-5"
                style={{ borderLeft: `4px solid ${P.gold}` }}>
                <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                    <BookOpen className="h-4 w-4" style={{ color: P.gold }} />
                    Alur Penggunaan Aplikasi
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                    {[
                        { label: "Login", color: "#7C3AED", bg: "#EDE9FE" },
                        { label: "Isi Guru PEKA", color: "#D97706", bg: "#FEF3C7" },
                        { label: "Kirim Laporan", color: P.forest, bg: "#D1FAE5" },
                        { label: "Tunggu Verifikasi", color: "#0EA5E9", bg: "#E0F2FE" },
                        { label: "Perbaiki jika Revisi", color: "#DC2626", bg: "#FEE2E2" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black"
                                style={{ backgroundColor: item.bg, color: item.color }}>
                                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] text-white"
                                    style={{ backgroundColor: item.color }}>{i + 1}</span>
                                {item.label}
                            </span>
                            {i < 4 && <ArrowRight className="h-3 w-3 text-slate-300 shrink-0 hidden sm:block" />}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Accordion Sections */}
            <div className="space-y-3">
                {SECTIONS.map((section, i) => (
                    <motion.div key={section.id} initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                        <AccordionSection
                            section={section}
                            isOpen={openId === section.id}
                            onToggle={() => setOpenId(openId === section.id ? null : section.id)}
                        />
                    </motion.div>
                ))}
            </div>

            {/* FAQ / Bantuan */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl border border-slate-100 p-5"
                style={{ borderLeft: `4px solid ${P.sage}` }}>
                <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" style={{ color: P.sage }} />
                    Pertanyaan Umum (FAQ)
                </h3>
                <div className="space-y-3">
                    {[
                        { q: "Bagaimana cara mengubah akses Google Drive?", a: "Klik kanan file → \"Bagikan\" → ubah ke \"Siapa saja yang memiliki link\" → salin link." },
                        { q: "Kenapa tidak bisa mengirim laporan?", a: "Pastikan Anda sudah mengisi data Guru PEKA dan semua link valid (diawali https://). Cek juga apakah bulan tersebut sudah ada laporannya." },
                        { q: "Bagaimana jika guru PEKA berganti?", a: "Buka menu Pengaturan → klik tombol Edit di samping nama guru → perbarui nama dan nomor HP baru." },
                        { q: "Siapa yang harus dihubungi jika ada masalah?", a: "Hubungi admin Disdikbud Tabalong melalui kontak yang tersedia." },
                        { q: "Apakah bisa diakses lewat HP?", a: "Ya! Aplikasi ini responsif dan bisa diakses dari browser HP. Untuk kemudahan, tambahkan ke Home Screen." },
                    ].map((faq, i) => (
                        <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
                            <p className="text-xs font-black text-slate-800 mb-1">❓ {faq.q}</p>
                            <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Footer bantuan */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="text-center py-4">
                <p className="text-xs text-slate-400 font-medium">
                    Masih butuh bantuan? Hubungi <strong style={{ color: P.forest }}>Admin Disdikbud Tabalong</strong>
                </p>
            </motion.div>
        </div>
    );
}
