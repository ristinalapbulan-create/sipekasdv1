const fs = require('fs');
const schools = JSON.parse(fs.readFileSync('src/lib/schools.json', 'utf8'));

let demoDataTs = fs.readFileSync('src/lib/demo-data.ts', 'utf8');

// Build the new DEMO_USERS declaration
let newDemoUsersStr = `export type DemoUser = {
    uid: string;
    email: string;
    role: "disdik" | "sekolah";
    npsn?: string;
    nama_instansi: string;
    kecamatan?: string;
    password?: string;
};

export let DEMO_USERS: Record<string, DemoUser> = {
    disdik: {
        uid: "demo-disdik-uid-001",
        email: "admin@disdik.id",
        password: "admin", // default disdik pass
        role: "disdik",
        nama_instansi: "Dinas Pendidikan Tabalong",
    },
`;

schools.forEach(s => {
    newDemoUsersStr += `    "${s.npsn}": ${JSON.stringify(s)},\n`;
});

newDemoUsersStr += `};\n\n`;
newDemoUsersStr += `// Function to update password
export function updateDemoUserPassword(npsnOrUid: string, newPass: string) {
    if (DEMO_USERS[npsnOrUid]) {
        DEMO_USERS[npsnOrUid].password = newPass;
    } else {
        // search by uid
        const userKey = Object.keys(DEMO_USERS).find(k => DEMO_USERS[k].uid === npsnOrUid);
        if (userKey) DEMO_USERS[userKey].password = newPass;
    }
}

export function resetSekolahPassword(npsn: string) {
    if (DEMO_USERS[npsn]) {
        DEMO_USERS[npsn].password = DEMO_USERS[npsn].npsn;
    }
}
\n`;

// Replace everything from `export const DEMO_USERS = {` down to `// ── Report Data`
const startMarker = 'export const DEMO_USERS = {';
const endMarker = '// ── Report Data';

if (demoDataTs.includes(startMarker) && demoDataTs.includes(endMarker)) {
    const startIdx = demoDataTs.indexOf(startMarker);
    const endIdx = demoDataTs.indexOf(endMarker);
    const leftText = demoDataTs.substring(0, startIdx);
    const rightText = demoDataTs.substring(endIdx);
    demoDataTs = leftText + newDemoUsersStr + rightText;
    
    // Also, I need to update the default reports so they reference a school that actually exists in our data
    // Let's grab the first school from our data
    const firstSchool = schools[0];
    demoDataTs = demoDataTs.replace(/SDN 1 Tanjung/g, firstSchool.nama_instansi);
    demoDataTs = demoDataTs.replace(/3010101/g, firstSchool.npsn);
    demoDataTs = demoDataTs.replace(/Tanjung/g, firstSchool.kecamatan);

    fs.writeFileSync('src/lib/demo-data.ts', demoDataTs);
    console.log("Successfully injected 222 schools into demo-data.ts!");
} else {
    console.log("Failed to find markers in demo-data.ts");
}
