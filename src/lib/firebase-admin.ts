/**
 * firebase-admin.ts
 * Inisialisasi Firebase Admin SDK untuk operasi server-side (lazy).
 * Mendukung pembacaan dari Environment Variables (individual atau full JSON) maupun file serviceAccountKey.json.
 */

import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

function cleanPrivateKey(rawKey: string): string {
  if (!rawKey) return '';
  let cleaned = rawKey.trim();

  // Bersihkan quotes pembungkus (" atau ')
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Konversi escaped newline (\n) menjadi newline asli
  cleaned = cleaned.replace(/\\n/g, '\n');

  // Normalisasi line ending Windows (\r\n) menjadi \n
  cleaned = cleaned.replace(/\r\n/g, '\n');

  return cleaned;
}

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const errors: string[] = [];

  // 1. Opsi A: Cek jika ada kredensial service account full JSON di ENV (raw atau Base64)
  const fullJsonEnv =
    process.env.FIREBASE_SERVICE_ACCOUNT ||
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (fullJsonEnv) {
    try {
      let jsonStr = fullJsonEnv.trim();
      if (!jsonStr.startsWith('{')) {
        // Coba decode dari base64 jika bukan JSON mentah
        try {
          jsonStr = Buffer.from(jsonStr, 'base64').toString('utf-8');
        } catch {
          // ignore
        }
      }
      const sa = JSON.parse(jsonStr);
      if (sa.private_key) {
        sa.private_key = cleanPrivateKey(sa.private_key);
      }
      return admin.initializeApp({
        credential: admin.credential.cert(sa),
      });
    } catch (err: any) {
      errors.push(`Gagal membaca FIREBASE_SERVICE_ACCOUNT JSON: ${err?.message || err}`);
    }
  }

  // 1. Opsi B: Inisialisasi dari Environment Variables individual
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (projectId && clientEmail && privateKeyRaw) {
    try {
      const privateKey = cleanPrivateKey(privateKeyRaw);

      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (envErr: any) {
      errors.push(`Gagal inisialisasi credential.cert dari ENV: ${envErr?.message || envErr}`);
    }
  } else {
    const missing: string[] = [];
    if (!projectId) missing.push('FIREBASE_ADMIN_PROJECT_ID');
    if (!clientEmail) missing.push('FIREBASE_ADMIN_CLIENT_EMAIL');
    if (!privateKeyRaw) missing.push('FIREBASE_ADMIN_PRIVATE_KEY');
    errors.push(`Variabel lingkungan belum lengkap di server ini: [${missing.join(', ')}]`);
  }

  // 2. Fallback: Cari file serviceAccountKey.json di berbagai path umum (lokal dev)
  const potentialPaths = [
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve(process.cwd(), 'simpeka-sd', 'serviceAccountKey.json'),
    path.resolve(process.cwd(), '..', 'serviceAccountKey.json'),
  ];

  for (const filePath of potentialPaths) {
    try {
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const serviceAccount = JSON.parse(fileContent);
        if (serviceAccount.private_key) {
          serviceAccount.private_key = cleanPrivateKey(serviceAccount.private_key);
        }
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
    } catch (fileErr: any) {
      errors.push(`Gagal membaca ${filePath}: ${fileErr?.message || fileErr}`);
    }
  }

  // JANGAN panggil admin.initializeApp() tanpa kredensial di luar GCP,
  // karena akan menyebabkan crash getaddrinfo metadata.google.internal.
  const diagMsg =
    `Kredensial Firebase Admin SDK tidak ditemukan di server ini.\n` +
    `Detail diagnostik:\n- ${errors.join('\n- ')}\n\n` +
    `Jika berjalan di Vercel: Pastikan Environment Variables (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY) ` +
    `sudah ditambahkan untuk environment 'Production' dan 'Preview', lalu lakukan Redeploy tanpa cache.`;

  console.error('[firebase-admin]', diagMsg);
  throw new Error(diagMsg);
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

export default getAdminApp;
