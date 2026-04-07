"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function SetupPage() {
    const [log, setLog] = useState<string[]>([]);
    const [done, setDone] = useState(false);
    const [adminUid, setAdminUid] = useState("");

    const addLog = (msg: string) => setLog(prev => [...prev, msg]);

    const handleSetup = async () => {
        setLog([]);
        addLog("🔥 Menghubungkan ke Firebase...");
        const email = "admin@disdikbudtabalong.id";
        const password = "@SmartDisdikbud";

        let uid = "";

        // Coba buat akun dulu
        try {
            addLog(`📧 Membuat akun: ${email}`);
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            uid = cred.user.uid;
            addLog(`✅ Auth user dibuat, UID: ${uid}`);
        } catch (err: unknown) {
            const e = err as { code?: string };
            if (e.code === 'auth/email-already-in-use') {
                addLog("⚠️  Akun sudah ada, mencoba login untuk mendapat UID...");
                try {
                    const cred = await signInWithEmailAndPassword(auth, email, password);
                    uid = cred.user.uid;
                    addLog(`✅ Login berhasil, UID: ${uid}`);
                } catch (loginErr: unknown) {
                    const le = loginErr as { code?: string; message?: string };
                    addLog(`❌ Login gagal: ${le.message}`);
                    addLog("⚠️  Jika password berbeda, reset password admin lewat Firebase Console.");
                    setDone(true);
                    return;
                }
            } else {
                addLog(`❌ Error: ${(err as Error).message}`);
                setDone(true);
                return;
            }
        }

        setAdminUid(uid);

        // Simpan profil di Firestore
        try {
            addLog("📝 Menyimpan profil di Firestore...");
            await setDoc(doc(db, "users", uid), {
                email,
                role: "disdik",
                nama_instansi: "Dinas Pendidikan dan Kebudayaan Kab. Tabalong",
                npsn: null,
                kecamatan: null,
            }, { merge: true });
            addLog("✅ Profil Firestore berhasil disimpan!");
        } catch (err: unknown) {
            addLog(`❌ Gagal simpan Firestore: ${(err as Error).message}`);
        }

        addLog("");
        addLog("🎉 Setup selesai! Admin siap digunakan.");
        setDone(true);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
            <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                <h1 className="text-2xl font-black text-slate-900 mb-1">🔥 Firebase Setup</h1>
                <p className="text-xs text-red-600 font-bold mb-4">
                    ⚠️ HAPUS HALAMAN INI SETELAH SETUP SELESAI!
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-4 text-sm">
                    <p className="font-black text-slate-900 mb-1">Akun yang akan dibuat/diverifikasi:</p>
                    <p>📧 <span className="font-mono">admin@disdikbudtabalong.id</span></p>
                    <p>🔑 <span className="font-mono">@SmartDisdikbud</span></p>
                    <p>👤 Role: <strong>disdik</strong> (admin)</p>
                </div>

                {log.length > 0 && (
                    <div className="bg-slate-900 rounded-xl p-4 mb-4 font-mono text-xs text-green-400 space-y-0.5 max-h-52 overflow-y-auto">
                        {log.map((l, i) => <div key={i}>{l || " "}</div>)}
                    </div>
                )}

                {adminUid && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-xs font-mono break-all">
                        <p className="font-black text-green-800 mb-1">Admin UID:</p>
                        <p className="text-green-700">{adminUid}</p>
                    </div>
                )}

                {!done ? (
                    <button onClick={handleSetup}
                        className="w-full py-3 bg-green-600 text-white font-black rounded-xl hover:bg-green-700 transition-colors text-sm">
                        🚀 Buat / Verifikasi Admin Firebase
                    </button>
                ) : (
                    <div className="space-y-3">
                        <div className="text-center text-green-600 font-black py-2">✅ Setup selesai!</div>
                        <a href="/"
                            className="block w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-700 transition-colors text-sm text-center">
                            Kembali ke Halaman Utama
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
