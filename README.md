# SIMPEKA SD - Sistem Informasi Manajemen Pelaporan Sekolah Dasar

Aplikasi portal pelaporan bulanan dan manajemen data untuk Sekolah Dasar.
Website ini menyediakan dua jalur akses utama:
1. **Dinas Pendidikan (Disdik)**: Memantau dan verifikasi laporan bulanan seluruh sekolah.
2. **Sekolah Dasar (SD)**: Mengirimkan dokumen laporan (via link G-Drive), menyimpan dokumentasi, dan surat keputusan.

## Dibuat Oleh
**Masfy - MfyTech**
🌐 [www.mfytech.my.id](https://www.mfytech.my.id)

---

## Teknologi yang Digunakan
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS & Framer Motion
- **Database / Auth:** Firebase
- **Fitur Spesial:** Auto PWA (Progressive Web App) dengan manifest dan service worker penuh

## Instalasi Lokal
1. `npm install` atau `pnpm install`
2. Atur kredensial Firebase di `src/lib/firebase.ts` (atau environment variables)
3. Jalankan server lokal: `npm run dev`
