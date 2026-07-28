/**
 * API Route: POST /api/reset-password
 * Me-reset password akun sekolah ke default "pekasd" menggunakan Firebase Admin SDK.
 * Hanya bisa dipanggil dari server atau oleh akun yang terautentikasi (disdik).
 */

import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_PASSWORD = 'pekasd';

export async function POST(req: NextRequest) {
  // Cek env vars tersedia sebelum import Admin SDK
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    console.error('[reset-password] Missing env vars:', {
      FIREBASE_ADMIN_PROJECT_ID: !!projectId,
      FIREBASE_ADMIN_CLIENT_EMAIL: !!clientEmail,
      FIREBASE_ADMIN_PRIVATE_KEY: !!privateKeyRaw,
    });
    return NextResponse.json(
      { error: 'Konfigurasi server tidak lengkap. Hubungi administrator.' },
      { status: 500 }
    );
  }

  try {
    // Import dinamis agar tidak error saat build
    const { getAdminAuth } = await import('@/lib/firebase-admin');

    const body = await req.json();
    const { uid, npsn } = body as { uid?: string; npsn?: string };

    if (!uid && !npsn) {
      return NextResponse.json(
        { error: 'UID atau NPSN diperlukan' },
        { status: 400 }
      );
    }

    let targetUid = uid;

    // Jika tidak ada UID, cari berdasarkan email (NPSN@simpekasd.id)
    if (!targetUid && npsn) {
      const email = `${npsn}@simpekasd.id`;
      try {
        const userRecord = await getAdminAuth().getUserByEmail(email);
        targetUid = userRecord.uid;
      } catch {
        return NextResponse.json(
          { error: `Akun dengan NPSN ${npsn} tidak ditemukan di Firebase Auth` },
          { status: 404 }
        );
      }
    }

    // Reset password ke default
    await getAdminAuth().updateUser(targetUid!, {
      password: DEFAULT_PASSWORD,
    });

    return NextResponse.json({
      success: true,
      message: `Password berhasil direset ke "${DEFAULT_PASSWORD}"`,
    });
  } catch (error: unknown) {
    console.error('[reset-password] Error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
