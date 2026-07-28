/**
 * firebase-admin.ts
 * Inisialisasi Firebase Admin SDK untuk operasi server-side.
 * Hanya digunakan di API Routes (server), TIDAK di client.
 */

import * as admin from 'firebase-admin';

// Hindari inisialisasi ulang saat hot-reload Next.js
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

export const adminAuth = admin.auth();
export default admin;
