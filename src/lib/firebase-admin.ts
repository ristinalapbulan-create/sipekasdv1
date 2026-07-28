/**
 * firebase-admin.ts
 * Inisialisasi Firebase Admin SDK untuk operasi server-side (lazy).
 * Hanya digunakan di API Routes (server), TIDAK di client.
 * Lazy init: SDK hanya diinisialisasi saat pertama kali dipanggil (runtime),
 * bukan saat build — mencegah error env vars tidak tersedia di Vercel build.
 */

import * as admin from 'firebase-admin';

function getAdminApp(): admin.app.App {
  if (admin.apps.length > 0) return admin.apps[0]!;

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}

export default getAdminApp;
