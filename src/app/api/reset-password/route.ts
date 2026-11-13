/**
 * API Route: POST /api/reset-password
 * Me-reset password akun sekolah ke default "pekasd" (atau password kustom) menggunakan Firebase Admin SDK.
 * Memiliki mekanisme pemulihan cerdas:
 * 1. Cari user di Auth berdasarkan UID.
 * 2. Jika tidak ada, cari berdasarkan email (NPSN@simpekasd.id).
 * 3. Jika akun Auth belum pernah dibuat/terhapus, secara otomatis membuat akun Auth baru.
 * 4. Melakukan sinkronisasi data UID & email ke Firestore.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

const DEFAULT_PASSWORD = 'pekasd';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, npsn, newPassword, namaInstansi } = body as {
      uid?: string;
      npsn?: string;
      newPassword?: string;
      namaInstansi?: string;
    };

    const cleanNpsn = (npsn || '').toString().trim();
    const targetPassword = newPassword?.trim() || DEFAULT_PASSWORD;

    if (!uid && !cleanNpsn) {
      return NextResponse.json(
        { error: 'UID atau NPSN sekolah diperlukan untuk mereset kata sandi.' },
        { status: 400 }
      );
    }

    const email = cleanNpsn ? `${cleanNpsn}@simpekasd.id` : '';
    const adminAuth = getAdminAuth();
    let userRecord: import('firebase-admin/auth').UserRecord | null = null;

    // 1. Coba cari berdasarkan UID jika ada
    if (uid) {
      try {
        userRecord = await adminAuth.getUser(uid);
      } catch (err: any) {
        if (err.code !== 'auth/user-not-found') {
          console.warn('[reset-password] Warning saat getUser(uid):', err.message);
        }
      }
    }

    // 2. Jika belum ditemukan dan ada NPSN, cari berdasarkan email
    if (!userRecord && email) {
      try {
        userRecord = await adminAuth.getUserByEmail(email);
      } catch (err: any) {
        if (err.code !== 'auth/user-not-found') {
          console.warn('[reset-password] Warning saat getUserByEmail:', err.message);
        }
      }
    }

    // 3. Jika user belum ada di Firebase Auth sama sekali, buatkan akun baru
    if (!userRecord) {
      if (!email) {
        return NextResponse.json(
          { error: `Akun tidak ditemukan di Firebase Auth dan NPSN tidak valid untuk membuat akun baru.` },
          { status: 404 }
        );
      }

      console.log(`[reset-password] Membuat akun Firebase Auth baru untuk ${email}...`);
      try {
        userRecord = await adminAuth.createUser({
          uid: uid || undefined,
          email,
          password: targetPassword,
          displayName: namaInstansi || `SD NPSN ${cleanNpsn}`,
        });
      } catch (createErr: any) {
        // Jika error email already in use, ambil kembali user-nya
        if (createErr.code === 'auth/email-already-exists') {
          userRecord = await adminAuth.getUserByEmail(email);
          await adminAuth.updateUser(userRecord.uid, { password: targetPassword });
        } else {
          throw createErr;
        }
      }
    } else {
      // 4. Update password user yang ditemukan
      await adminAuth.updateUser(userRecord.uid, {
        password: targetPassword,
      });
    }

    // 5. Sinkronisasi ke Firestore agar doc user selalu valid dan siap login
    try {
      const adminDb = getAdminFirestore();
      const finalUid = userRecord.uid;
      const userDocRef = adminDb.collection('users').doc(finalUid);
      
      const updatePayload: Record<string, any> = {
        uid: finalUid,
        email: userRecord.email || email,
        role: 'sekolah',
        password_reset_at: new Date().toISOString(),
        password_reset_requested: false,
      };
      if (cleanNpsn) updatePayload.npsn = cleanNpsn;
      if (namaInstansi) updatePayload.nama_instansi = namaInstansi;

      await userDocRef.set(updatePayload, { merge: true });

      // Jika UID di Firestore lama berbeda dengan UID Firebase Auth, sinkronkan doc lama
      if (uid && uid !== finalUid) {
        try {
          await adminDb.collection('users').doc(uid).set({
            auth_uid_synced: finalUid,
            password_reset_at: new Date().toISOString(),
            password_reset_requested: false,
          }, { merge: true });
        } catch {
          // ignore
        }
      }
    } catch (dbErr) {
      console.warn('[reset-password] Peringatan sinkronisasi Firestore:', dbErr);
    }

    return NextResponse.json({
      success: true,
      message: `Kata sandi berhasil direset ke "${targetPassword}"`,
      password: targetPassword,
      uid: userRecord.uid,
      email: userRecord.email,
      npsn: cleanNpsn,
    });
  } catch (error: unknown) {
    console.error('[reset-password] Error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan pada server saat mereset kata sandi.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
