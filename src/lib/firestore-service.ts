/**
 * firestore-service.ts
 * Semua operasi database Firestore untuk SIMPEKA SD
 */

import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, Timestamp, setDoc
} from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";

// ── Types ─────────────────────────────────────────────────────────────

export type UserProfile = {
  uid: string;
  email: string;
  role: "disdik" | "sekolah";
  npsn?: string;
  nama_instansi: string;
  kecamatan?: string;
};

export type Report = {
  id: string;
  npsn_sekolah: string;
  nama_sekolah: string;
  link_jurnal: string;
  link_daftar_hadir: string;
  link_dokumentasi: string;
  status: "Menunggu" | "Revisi" | "Terverifikasi";
  catatan_revisi: string;
  bulan_laporan: string;   // format: "YYYY-MM"
  kecamatan: string;
  created_at: string;      // ISO string
};

export type SK = {
  id: string;
  nomor_surat: string;
  judul: string;
  file_url: string;
  created_at: string;
};

export type Dokumentasi = {
  id: string;
  judul_kegiatan: string;
  deskripsi: string;
  thumbnail_url: string;
  link_tautan: string;
  created_at: string;
};

export type GuruPeka = {
  id: string;
  nama: string;
  nomor_hp: string;
};

// ── Helper: Firestore Timestamp → ISO string ───────────────────────────

function tsToIso(ts: unknown): string {
  if (!ts) return new Date().toISOString();
  if (ts instanceof Timestamp) return ts.toDate().toISOString();
  if (typeof ts === "string") return ts;
  return new Date().toISOString();
}

// ── User Profile (Firestore collection: "users") ───────────────────────

export async function getUserProfile(uid: string, fallbackEmail?: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (snap.exists()) {
      const d = snap.data();
      return {
        uid: snap.id,
        email: d.email || "",
        role: d.role,
        npsn: d.npsn || undefined,
        nama_instansi: d.nama_instansi || "",
        kecamatan: d.kecamatan || undefined,
      };
    }
    
    // Jika tidak ditemukan dari UID, cari berdasarkan email (karena UID bisa berubah jika user dihapus manual di console)
    if (fallbackEmail) {
      const q = query(collection(db, "users"), where("email", "==", fallbackEmail));
      const emSnap = await getDocs(q);
      if (!emSnap.empty) {
        const d = emSnap.docs[0].data();
        // Coba migrasi paksa / simpan ke UID baru supaya rapi
        await setDoc(doc(db, "users", uid), d, { merge: true });
        return {
          uid: uid,
          email: d.email || "",
          role: d.role,
          npsn: d.npsn || undefined,
          nama_instansi: d.nama_instansi || "",
          kecamatan: d.kecamatan || undefined,
        };
      }
    }
    return null;
  } catch (err) {
    console.error("getUserProfile error:", err);
    return null;
  }
}

export async function createUserProfile(uid: string, data: Omit<UserProfile, "uid">): Promise<void> {
  await setDoc(doc(db, "users", uid), { ...data }, { merge: true });
}

export async function getAllSchoolProfiles(): Promise<UserProfile[]> {
  const q = query(collection(db, "users"), where("role", "==", "sekolah"), orderBy("nama_instansi"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    uid: d.id,
    email: d.data().email || "",
    role: "sekolah" as const,
    npsn: d.data().npsn || undefined,
    nama_instansi: d.data().nama_instansi || "",
    kecamatan: d.data().kecamatan || undefined,
  }));
}

// ── Reports (Firestore collection: "reports") ─────────────────────────

export async function getAllReports(): Promise<Report[]> {
  const q = query(collection(db, "reports"), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    npsn_sekolah: d.data().npsn_sekolah || "",
    nama_sekolah: d.data().nama_sekolah || "",
    link_jurnal: d.data().link_jurnal || "",
    link_daftar_hadir: d.data().link_daftar_hadir || "",
    link_dokumentasi: d.data().link_dokumentasi || "",
    status: d.data().status || "Menunggu",
    catatan_revisi: d.data().catatan_revisi || "",
    bulan_laporan: d.data().bulan_laporan || "",
    kecamatan: d.data().kecamatan || "",
    created_at: tsToIso(d.data().created_at),
  }));
}

export async function getReportsByNpsn(npsn: string): Promise<Report[]> {
  const q = query(
    collection(db, "reports"),
    where("npsn_sekolah", "==", npsn),
    orderBy("created_at", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    npsn_sekolah: d.data().npsn_sekolah || "",
    nama_sekolah: d.data().nama_sekolah || "",
    link_jurnal: d.data().link_jurnal || "",
    link_daftar_hadir: d.data().link_daftar_hadir || "",
    link_dokumentasi: d.data().link_dokumentasi || "",
    status: d.data().status || "Menunggu",
    catatan_revisi: d.data().catatan_revisi || "",
    bulan_laporan: d.data().bulan_laporan || "",
    kecamatan: d.data().kecamatan || "",
    created_at: tsToIso(d.data().created_at),
  }));
}

export async function addReport(data: Omit<Report, "id" | "created_at">): Promise<string> {
  const ref2 = await addDoc(collection(db, "reports"), {
    ...data,
    created_at: serverTimestamp(),
  });
  return ref2.id;
}

export async function deleteReport(id: string): Promise<void> {
  await deleteDoc(doc(db, "reports", id));
}

export async function updateReport(
  id: string,
  data: { link_jurnal: string; link_daftar_hadir: string; link_dokumentasi: string }
): Promise<void> {
  await updateDoc(doc(db, "reports", id), {
    ...data,
    status: "Menunggu",          // reset ke Menunggu setelah sekolah edit
    catatan_revisi: "",
    updated_at: serverTimestamp(),
  });
}

export async function updateReportStatus(
  id: string,
  status: Report["status"],
  catatan: string
): Promise<void> {
  await updateDoc(doc(db, "reports", id), { status, catatan_revisi: catatan });
}

// ── SK (Firestore collection: "sk_documents") ─────────────────────────

export async function getAllSKs(): Promise<SK[]> {
  const q = query(collection(db, "sk_documents"), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    nomor_surat: d.data().nomor_surat || "",
    judul: d.data().judul || "",
    file_url: d.data().file_url || "",
    created_at: tsToIso(d.data().created_at),
  }));
}

export async function addSK(
  data: { nomor_surat: string; judul: string },
  file: File
): Promise<SK> {
  // Upload PDF ke Firebase Storage
  const storageRef = ref(storage, `sk_documents/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const fileUrl = await getDownloadURL(snapshot.ref);

  const docRef = await addDoc(collection(db, "sk_documents"), {
    nomor_surat: data.nomor_surat,
    judul: data.judul,
    file_url: fileUrl,
    file_path: snapshot.ref.fullPath,
    created_at: serverTimestamp(),
  });

  return {
    id: docRef.id,
    nomor_surat: data.nomor_surat,
    judul: data.judul,
    file_url: fileUrl,
    created_at: new Date().toISOString(),
  };
}

export async function deleteSK(id: string, fileUrl: string): Promise<void> {
  // Hapus file dari Storage jika ada
  if (fileUrl && fileUrl.startsWith("https://")) {
    try {
      const fileRef = ref(storage, fileUrl);
      await deleteObject(fileRef);
    } catch {
      // File mungkin tidak ada di storage, lanjutkan saja
    }
  }
  await deleteDoc(doc(db, "sk_documents", id));
}

// ── Dokumentasi (Firestore collection: "dokumentasi") ─────────────────

export async function getAllDokumentasi(): Promise<Dokumentasi[]> {
  const q = query(collection(db, "dokumentasi"), orderBy("created_at", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    judul_kegiatan: d.data().judul_kegiatan || "",
    deskripsi: d.data().deskripsi || "",
    thumbnail_url: d.data().thumbnail_url || "",
    link_tautan: d.data().link_tautan || "",
    created_at: tsToIso(d.data().created_at),
  }));
}

export async function addDokumentasi(
  data: { judul_kegiatan: string; deskripsi: string; link_tautan: string },
  file: File
): Promise<Dokumentasi> {
  // Upload thumbnail ke Firebase Storage
  const storageRef = ref(storage, `dokumentasi/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const thumbnailUrl = await getDownloadURL(snapshot.ref);

  const docRef = await addDoc(collection(db, "dokumentasi"), {
    judul_kegiatan: data.judul_kegiatan,
    deskripsi: data.deskripsi,
    link_tautan: data.link_tautan,
    thumbnail_url: thumbnailUrl,
    thumbnail_path: snapshot.ref.fullPath,
    created_at: serverTimestamp(),
  });

  return {
    id: docRef.id,
    judul_kegiatan: data.judul_kegiatan,
    deskripsi: data.deskripsi,
    link_tautan: data.link_tautan,
    thumbnail_url: thumbnailUrl,
    created_at: new Date().toISOString(),
  };
}

export async function deleteDokumentasi(id: string): Promise<void> {
  // Ambil data dulu untuk mendapatkan thumbnail_path
  const snap = await getDoc(doc(db, "dokumentasi", id));
  if (snap.exists() && snap.data().thumbnail_path) {
    try {
      const fileRef = ref(storage, snap.data().thumbnail_path);
      await deleteObject(fileRef);
    } catch {
      // Lanjutkan meski gagal hapus storage
    }
  }
  await deleteDoc(doc(db, "dokumentasi", id));
}

// ── Portal: ambil tahun dari laporan yang ada ─────────────────────────

export async function getAvailableYears(): Promise<string[]> {
  try {
    const q = query(collection(db, "reports"), orderBy("bulan_laporan", "desc"));
    const snap = await getDocs(q);
    const years = new Set<string>();
    snap.docs.forEach(d => {
      const bl = d.data().bulan_laporan as string;
      if (bl) years.add(bl.split("-")[0]);
    });
    return Array.from(years).sort().reverse();
  } catch {
    return [];
  }
}

// ── Reset password sekolah (Firestore saja, bukan Auth) ───────────────
// Untuk reset password Auth, perlu Admin SDK atau custom token
// Di sini kita hanya menyimpan flag "perlu reset" di Firestore
export async function markPasswordReset(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { password_reset_requested: true });
}

// ── Guru PEKA (sub-collection: users/{uid}/guru_peka) ─────────────────

export async function getGuruPeka(uid: string): Promise<GuruPeka[]> {
  const snap = await getDocs(collection(db, "users", uid, "guru_peka"));
  return snap.docs.map(d => ({ id: d.id, nama: d.data().nama || "", nomor_hp: d.data().nomor_hp || "" }));
}

export async function addGuruPeka(uid: string, data: { nama: string; nomor_hp: string }): Promise<string> {
  const r = await addDoc(collection(db, "users", uid, "guru_peka"), {
    ...data, created_at: serverTimestamp()
  });
  return r.id;
}

export async function updateGuruPeka(uid: string, guruId: string, data: { nama: string; nomor_hp: string }): Promise<void> {
  await updateDoc(doc(db, "users", uid, "guru_peka", guruId), data);
}

export async function deleteGuruPeka(uid: string, guruId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "guru_peka", guruId));
}
