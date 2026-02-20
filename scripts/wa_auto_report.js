const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Global fetch is available in Node 18+ (We use Node 20)
// No need to require node-fetch

// Load environment variables if file exists (Dev mode)
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Prioritize process.env (Docker/Prod) over dotenv
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('[CRITICAL] MONGODB_URI is not defined in environment variables.');
    process.exit(1);
}

// Model Definitions with Explicit Collection Names
const Setting = mongoose.models.Setting || mongoose.model('Setting', new mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed
}), 'settings');

const Guru = mongoose.models.Guru || mongoose.model('Guru', new mongoose.Schema({
    nipy: String,
    nama: String,
    ket: String,
    noHp: String,
    waliKelas: String
}), 'gurus');

const Siswa = mongoose.models.Siswa || mongoose.model('Siswa', new mongoose.Schema({
    nis: String,
    nama: String,
    kelas: String
}), 'siswas');

const Jurnal = mongoose.models.Jurnal || mongoose.model('Jurnal', new mongoose.Schema({
    nis: String,
    tgl_jurnal: Number,
    jam_tidur: String
}, { timestamps: true }), 'jurnals');

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    try {
        const maskedUri = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
        console.log(`[DB] Connecting to: ${maskedUri}`);
        await mongoose.connect(MONGODB_URI);
        console.log('[DB] Connected successfully.');
    } catch (err) {
        console.error('[DB] Connection Error:', err.message);
        process.exit(1);
    }
}

async function sendWhatsApp(target, message) {
    const token = process.env.WHATSAPP_API_TOKEN || 'KQ1XKbd2ZHue4cn9e7hc';

    let formattedTarget = target.trim();
    if (formattedTarget.startsWith('0')) {
        formattedTarget = '62' + formattedTarget.substring(1);
    }
    formattedTarget = formattedTarget.replace(/\D/g, '');

    console.log(`[WA] Sending to ${formattedTarget} using token prefix: ${token.substring(0, 5)}...`);

    try {
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: { 'Authorization': token },
            body: new URLSearchParams({
                'target': formattedTarget,
                'message': message,
                'countryCode': '62'
            })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`[WA] Fetch Error:`, error.message);
        throw error;
    }
}

function getWIBDate() {
    // Robust UTC+7 calculation
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utcTime + (7 * 3600000));
}

function getRamadanDay(wibDate) {
    // Current Context Start Ramadan: 18 FEBRUARI 2026
    const ramadanStart = new Date('2026-02-18T00:00:00+07:00');

    // Reset time parts for accurate day diff
    const d1 = new Date(ramadanStart.getFullYear(), ramadanStart.getMonth(), ramadanStart.getDate());
    const d2 = new Date(wibDate.getFullYear(), wibDate.getMonth(), wibDate.getDate());

    const diffTime = d2 - d1;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // If before ramadan, return 1? Or 0? Let's stick to positive index logic of app
    return Math.max(1, diffDays + 1); // If 18th is day 1, then diff is 0, so +1
}

// State to track sent status in memory
let sentToday = new Set();
let lastDay = -1;

async function runReport() {
    const nowWIB = getWIBDate();
    const currentDay = nowWIB.getDate();

    console.log(`--- [START RUN: ${nowWIB.toLocaleString('id-ID')}] ---`);

    // Reset tracker if day changes
    if (currentDay !== lastDay) {
        console.log('[NEW DAY] Resetting sentToday list.');
        sentToday.clear();
        lastDay = currentDay;
    }

    await connectDB();

    // 1. Check Settings
    const settings = await Setting.findOne({ key: 'wa_auto_report' }).lean();
    if (!settings) {
        console.error('[SKIP] Setting "wa_auto_report" not found in database.');
        return;
    }
    console.log('[INFO] Settings found. Enabled:', settings.value.enabled);

    if (!settings.value.enabled) {
        console.log('[SKIP] Feature is disabled in admin dashboard.');
        return;
    }

    // 2. Find Wali Kelas
    // Get ALL first to see what's in DB
    const allTeachersRaw = await Guru.find({}).lean();
    console.log(`[DB] Total Gurus in DB: ${allTeachersRaw.length}`);

    const waliKelasList = allTeachersRaw.filter(t =>
        (t.ket === 'Wali Kelas' || t.ket === 'Keduanya' || t.waliKelas) &&
        t.noHp && t.noHp.length > 5
    );

    console.log(`[INFO] Found ${waliKelasList.length} total Wali Kelas.`);

    const pendingTeachers = waliKelasList.filter(t => !sentToday.has(t.nipy));
    console.log(`[INFO] Teachers pending today: ${pendingTeachers.length}`);

    if (pendingTeachers.length === 0) {
        console.log('[FINISH] All teachers processed for today.');
        return;
    }

    // 3. Pick Teacher
    const teacher = pendingTeachers[0]; // Take first for test
    console.log(`[PROCESS] Picking teacher: ${teacher.nama} (Kelas: ${teacher.waliKelas})`);

    // 4. Get Statistics
    const students = await Siswa.find({ kelas: teacher.waliKelas }).lean();
    console.log(`[DB] Students in class ${teacher.waliKelas}: ${students.length}`);

    if (students.length === 0) {
        console.log(`[WARN] No students for class ${teacher.waliKelas}. Marking teacher as done.`);
        sentToday.add(teacher.nipy);
        return;
    }

    const studentNisList = students.map(s => s.nis);
    const startOfDay = new Date(nowWIB);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(nowWIB);
    endOfDay.setHours(23, 59, 59, 999);

    const ramadanDay = getRamadanDay(nowWIB);
    console.log(`[INFO] Determined Ramadan Day: ${ramadanDay}`);

    const journals = await Jurnal.find({
        nis: { $in: studentNisList },
        $or: [
            { tgl_jurnal: ramadanDay },
            { createdAt: { $gte: startOfDay, $lte: endOfDay } }
        ]
    }).lean();

    console.log(`[DB] Journals found for today: ${journals.length}`);

    const filledCount = journals.length;
    const totalCount = students.length;
    const percent = Math.round((filledCount / totalCount) * 100);

    // 5. Build Message
    const greetings = settings.value.greetings || ["Assalamu'alaikum"];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    let body = settings.value.messageTemplate || "Berikut *Laporan Progres Jurnal Ramadan* kelas *[KELAS]* untuk Hari ke-[HARI]:\n\n📊 *Statistik:* \n- Sudah Mengisi: *[ISI] Siswa*\n- Belum Mengisi: *[KOSONG] Siswa*\n- Progres: *[PERSEN]%*";

    body = body.replace('[KELAS]', teacher.waliKelas)
        .replace('[HARI]', ramadanDay)
        .replace('[ISI]', filledCount)
        .replace('[KOSONG]', totalCount - filledCount)
        .replace('[PERSEN]', percent);

    const message = `${greeting} *Ustadz/ah ${teacher.nama}*,\n\n${body}\n\nMohon bantuannya untuk mengingatkan santri yang belum mengisi agar segera melengkapi jurnalnya hari ini.\n\nTerima kasih,\n_Admin Karomah BN666_`;

    // 6. Send!
    try {
        const result = await sendWhatsApp(teacher.noHp, message);
        console.log(`[WA] Result: ${JSON.stringify(result)}`);
        if (result && result.status) {
            console.log(`[SUCCESS] Report sent to ${teacher.nama}.`);
            sentToday.add(teacher.nipy);
        } else {
            console.error(`[FAIL] API reported failure.`);
        }
    } catch (err) {
        console.error(`[ERROR] Send failed:`, err.message);
    }
}

// Initial run
async function startWorker() {
    console.log('============================================');
    console.log('WA AUTO-REPORT: IMMEDIATE TEST MODE ACTIVATED');
    console.log('============================================');

    const loop = async () => {
        try {
            await runReport();
        } catch (error) {
            console.error('[CRASH] Loop Error:', error.message);
        }

        console.log('[WAIT] Next run in 1 minute.');
        setTimeout(loop, 60 * 1000);
    };

    loop();
}

startWorker();
