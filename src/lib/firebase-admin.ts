/**
 * firebase-admin.ts
 * Inisialisasi Firebase Admin SDK untuk operasi server-side (lazy).
 * Mendukung pembacaan dari Environment Variables maupun fallback serviceAccountKey.json.
 */

import * as admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  // 1. Coba inisialisasi dari Environment Variables
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    // Bersihkan quotes di awal/akhir jika ada dan konversi escaped newline (\n)
    privateKey = privateKey.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
  }

  if (projectId && clientEmail && privateKey) {
    try {
      return admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (envErr) {
      console.warn('[firebase-admin] Inisialisasi via ENV gagal, mencoba fallback serviceAccountKey.json...', envErr);
    }
  }

  // 2. Fallback: Cari file serviceAccountKey.json di berbagai path umum
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
        console.log(`[firebase-admin] Menggunakan service account dari file: ${filePath}`);
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }
    } catch (fileErr) {
      console.warn(`[firebase-admin] Gagal membaca key dari ${filePath}:`, fileErr);
    }
  }

  // 3. Fallback terakhir: Default application credentials
  try {
    return admin.initializeApp();
  } catch (err) {
    console.error('[firebase-admin] Gagal inisialisasi Firebase Admin:', err);
    throw err;
  }
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}

export function getAdminFirestore(): admin.firestore.Firestore {
  return getAdminApp().firestore();
}

export default getAdminApp;
