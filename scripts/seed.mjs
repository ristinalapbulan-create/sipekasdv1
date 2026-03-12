import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';

// Initialize with a service account file
// Make sure you place serviceAccountKey.json in the project root directory
let serviceAccount;
try {
    serviceAccount = JSON.parse(
        readFileSync('./serviceAccountKey.json', 'utf8')
    );
} catch (e) {
    console.error("Please provide a serviceAccountKey.json in the project root to seed data.");
    process.exit(1);
}

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

const disdikEmail = "admin@disdikbudtabalong.id";
const disdikPass = "minda1234";

const schools = [
    { npsn: "10101010", nama_instansi: "SDN 1", email: "sdn1@disdikbudtabalong.id", pass: "sdn123456" },
    { npsn: "20202020", nama_instansi: "SDN 2", email: "sdn2@disdikbudtabalong.id", pass: "sdn123456" },
    { npsn: "30303030", nama_instansi: "SDN 3", email: "sdn3@disdikbudtabalong.id", pass: "sdn123456" },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function seed() {
    console.log("Seeding data dummy...");

    try {
        // 1. Akun Disdik
        let disdikUser;
        try {
            disdikUser = await auth.getUserByEmail(disdikEmail);
        } catch (e) {
            if (e.code === 'auth/user-not-found') {
                disdikUser = await auth.createUser({
                    email: disdikEmail,
                    password: disdikPass,
                    displayName: "Admin Disdik"
                });
                console.log("Created Disdik Auth User.");
            }
        }

        await db.collection("users").doc(disdikUser.uid).set({
            uid: disdikUser.uid,
            npsn: "",
            nama_instansi: "Dinas Pendidikan dan Kebudayaan Tabalong",
            role: 'disdik',
            email: disdikEmail,
            is_active: true
        }, { merge: true });
        console.log("Seeded Disdik User Document.");

        // 2. Akun Sekolah
        for (const s of schools) {
            let schoolUser;
            try {
                schoolUser = await auth.getUserByEmail(s.email);
            } catch (e) {
                if (e.code === 'auth/user-not-found') {
                    schoolUser = await auth.createUser({
                        email: s.email,
                        password: s.pass,
                        displayName: s.nama_instansi
                    });
                    console.log(`Created Auth User for ${s.nama_instansi}.`);
                }
            }

            await db.collection("users").doc(schoolUser.uid).set({
                uid: schoolUser.uid,
                npsn: s.npsn,
                nama_instansi: s.nama_instansi,
                role: 'sekolah',
                email: s.email,
                is_active: true
            }, { merge: true });
            console.log(`Seeded User Document for ${s.nama_instansi}.`);
        }

        // 3. 10 Data Laporan dummy
        const statuses = ['Menunggu', 'Revisi', 'Terverifikasi'];
        const reportsRef = db.collection("reports");

        for (let i = 1; i <= 10; i++) {
            const school = schools[i % 3];
            const status = statuses[i % 3];
            const reportData = {
                npsn_sekolah: school.npsn,
                nama_sekolah: school.nama_instansi,
                link_jurnal: "https://google.com",
                link_daftar_hadir: "https://google.com",
                link_dokumentasi: "https://google.com",
                status: status,
                catatan_revisi: status === 'Revisi' ? "Perbaiki link dokumentasi" : "",
                bulan_laporan: `2024-${i.toString().padStart(2, '0')}`,
                created_at: new Date().toISOString()
            };
            await reportsRef.add(reportData);
            console.log(`Seeded Report ${i} untuk ${school.nama_instansi}`);
            await sleep(200);
        }

        // 4. 2 Data SK Dummy
        const skRef = db.collection("decrees");
        await skRef.add({
            nomor_surat: "SK/001/DISDIK/2024",
            judul: "Surat Keputusan Pembagian Tugas Guru",
            file_url_firebase: "https://google.com",
            created_at: new Date().toISOString()
        });
        console.log("Seeded SK Dummy 1.");

        await skRef.add({
            nomor_surat: "SK/002/DISDIK/2024",
            judul: "Surat Edaran Jadwal Ujian Tengah Semester",
            file_url_firebase: "https://google.com",
            created_at: new Date().toISOString()
        });
        console.log("Seeded SK Dummy 2.");

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Error during seeding: ", error);
        process.exit(1);
    }
}

seed();
