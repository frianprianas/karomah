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
        console.log('[DB] Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('[DB] Connected successfully.');

        // Brief check of data
        const gCount = await Guru.countDocuments({});
        const sCount = await Siswa.countDocuments({});
        console.log(`[DB] Data Snapshot: ${gCount} Gurus, ${sCount} Siswas.`);
    } catch (err) {
        console.error('[DB] Connection Error:', err.message);
        process.exit(1);
    }
}

async function sendWhatsApp(target, message) {
    // If token is in env use it, otherwise fallback (User provided token before)
    const token = process.env.WHATSAPP_API_TOKEN || 'KQ1XKbd2ZHue4cn9e7hc';

    let formattedTarget = target.trim();
    if (formattedTarget.startsWith('0')) {
        formattedTarget = '62' + formattedTarget.substring(1);
    }
    formattedTarget = formattedTarget.replace(/\D/g, '');

    try {
        // Using global fetch (Node 20)
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
        console.error(`[WA] Fetch Error for ${target}:`, error.message);
        throw error;
    }
}

function getWIBDate() {
    const now = new Date();
    // Adjust to WIB (UTC+7)
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (3600000 * 7)); // UTC + 7 (WIB)
}

function getRamadanDay(wibDate) {
    // Current Context Start Ramadan: 18 FEBRUARI 2026
    const ramadanStart = new Date('2026-02-18T00:00:00+07:00');

    // Reset time parts for accurate day diff
    const d1 = new Date(ramadanStart.getFullYear(), ramadanStart.getMonth(), ramadanStart.getDate());
    const d2 = new Date(wibDate.getFullYear(), wibDate.getMonth(), wibDate.getDate());

    const diffTime = d2 - d1;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If before ramadan, return 1? Or 0? Let's stick to positive index logic of app
    return Math.max(1, diffDays + 1); // If 18th is day 1, then diff is 0, so +1
}

// State to track sent status in memory
let sentToday = new Set();
let lastDay = -1;

async function runReport() {
    const nowWIB = getWIBDate();
    const currentDay = nowWIB.getDate();

    console.log(`[LOG ${nowWIB.toLocaleTimeString('id-ID')}] Checking triggers...`);

    // Reset tracker if day changes
    if (currentDay !== lastDay) {
        console.log('--- NEW DAY DETECTED (WIB). CLEARING SENT LIST ---');
        sentToday.clear();
        lastDay = currentDay;
    }

    const currentHour = nowWIB.getHours();
    const currentMinute = nowWIB.getMinutes();
    const timeInMinutes = currentHour * 60 + currentMinute;

    // TARGET: 09:00 to 13:00 WIB
    const startMinutes = 9 * 60 + 0;   // 09:00
    const endMinutes = 13 * 60 + 0;   // 13:00

    if (timeInMinutes < startMinutes || timeInMinutes > endMinutes) {
        console.log(`[INFO] Idle Mode. Schedule: 09:00-13:00. Current WIB: ${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute}`);
        return;
    }

    await connectDB();

    const settings = await Setting.findOne({ key: 'wa_auto_report' }).lean();
    if (!settings || !settings.value.enabled) {
        console.log('[WARN] Feature DISABLED in Admin Settings.');
        return;
    }

    // Query Wali Kelas with explicit filter
    const allTeachers = await Guru.find({
        ket: { $in: ['Wali Kelas', 'Keduanya'] },
        noHp: { $exists: true, $ne: '' },
        waliKelas: { $exists: true, $ne: null, $ne: '' }
    }).lean();

    const pendingTeachers = allTeachers.filter(t => !sentToday.has(t.nipy));

    if (pendingTeachers.length === 0) {
        console.log('[INFO] Finished. All Wali Kelas notified for today.');
        return;
    }

    console.log(`[INFO] Pending: ${pendingTeachers.length}/${allTeachers.length} teachers.`);

    // Pick ONE random teacher to send to
    const teacher = pendingTeachers[Math.floor(Math.random() * pendingTeachers.length)];

    console.log(`[ACTION] Preparing report for: ${teacher.nama} (${teacher.waliKelas})`);

    // Process Report for this teacher
    const students = await Siswa.find({ kelas: teacher.waliKelas }).lean();
    if (students.length === 0) {
        console.log(`[WARN] No students found for ${teacher.waliKelas}. Skipping teacher.`);
        sentToday.add(teacher.nipy);
        return;
    }

    const studentNisList = students.map(s => s.nis);

    // Get journals for TODAY (WIB)
    const startOfDay = new Date(nowWIB);
    startOfDay.setHours(0, 0, 0, 0);

    // Determine Ramadan Day for template text
    const ramadanDay = getRamadanDay(nowWIB);

    // Query journals created today OR with tgl_jurnal matching today's ramadan day
    // This covers both cases (filled today, or filled explicitly for today's index)
    const journals = await Jurnal.find({
        nis: { $in: studentNisList },
        $or: [
            { tgl_jurnal: ramadanDay },
            { createdAt: { $gte: startOfDay } }
        ]
    }).lean();

    const filledCount = journals.length;
    const totalCount = students.length;
    const percent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

    const greetings = settings.value.greetings || ["Assalamu'alaikum"];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    let body = settings.value.messageTemplate || "Berikut *Laporan Progres Jurnal Ramadan* kelas *[KELAS]* untuk Hari ke-[HARI]:\n\n📊 *Statistik:* \n- Sudah Mengisi: *[ISI] Siswa*\n- Belum Mengisi: *[KOSONG] Siswa*\n- Progres: *[PERSEN]%*";

    body = body.replace('[KELAS]', teacher.waliKelas)
        .replace('[HARI]', ramadanDay)
        .replace('[ISI]', filledCount)
        .replace('[KOSONG]', totalCount - filledCount)
        .replace('[PERSEN]', percent);

    const message = `${greeting} *Ustadz/ah ${teacher.nama}*,\n\n${body}\n\nMohon bantuannya untuk mengingatkan santri yang belum mengisi agar segera melengkapi jurnalnya hari ini.\n\nTerima kasih,\n_Admin Karomah BN666_`;

    console.log(`[ACTION] Dispatching to Fonnte -> ${teacher.nama} (${teacher.noHp})...`);

    try {
        const result = await sendWhatsApp(teacher.noHp, message);
        if (result && result.status === true) {
            console.log(`[SUCCESS] Sent to ${teacher.nama}.`);
            sentToday.add(teacher.nipy);
        } else {
            console.error(`[FAIL] Fonnte Error: ${JSON.stringify(result)}`);
        }
    } catch (err) {
        console.error(`[CRITICAL] Error in sendWhatsApp execution:`, err.message);
    }
}

// Initial run
async function startWorker() {
    console.log('============================================');
    console.log('WA AUTO-REPORT WORKER STARTING (NODE 20)');
    console.log('Schedule: 09:00 - 13:00 WIB');
    console.log('============================================');

    const loop = async () => {
        try {
            await runReport();
        } catch (error) {
            console.error('[FATAL] Loop Crash:', error.message);
        }

        const nowWIB = getWIBDate();
        const timeInMinutes = nowWIB.getHours() * 60 + nowWIB.getMinutes();
        const startMinutes = 9 * 60 + 0;

        let delay;
        // High frequency check near start time
        if (timeInMinutes >= startMinutes - 10 && timeInMinutes < startMinutes) {
            delay = 0.5; // Every 30 seconds to be precise
        } else if (timeInMinutes >= startMinutes && timeInMinutes <= startMinutes + 30) {
            delay = 2;   // Fast burst at start
        } else {
            delay = 10;  // Normal interval
        }

        console.log(`[WAIT] Re-checking in ${delay} minutes.`);
        setTimeout(loop, delay * 60 * 1000);
    };

    loop();
}

startWorker();
