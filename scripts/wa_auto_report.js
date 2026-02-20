
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in .env.local');
    process.exit(1);
}

// Model Definitions with Explicit Collection Names (To match Next.js Mongoose models)
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
    return mongoose.connect(MONGODB_URI);
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
        console.error(`Error sending to ${target}:`, error);
        throw error;
    }
}

function getWIBDate() {
    const now = new Date();
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

    console.log(`[LOG ${nowWIB.toLocaleTimeString('id-ID')}] Checking report trigger...`);

    // Reset tracker if day changes
    if (currentDay !== lastDay) {
        console.log('--- New day detected (WIB). Resetting sentToday list ---');
        sentToday.clear();
        lastDay = currentDay;
    }

    const currentHour = nowWIB.getHours();
    const currentMinute = nowWIB.getMinutes();
    const timeInMinutes = currentHour * 60 + currentMinute;

    // Schedule: 08:45 to 13:00 WIB
    const startMinutes = 8 * 60 + 45;  // 08:45
    const endMinutes = 13 * 60 + 0;   // 13:00

    if (timeInMinutes < startMinutes || timeInMinutes > endMinutes) {
        console.log(`[INFO] Outside scheduled range (08:45-13:00). Current: ${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute}`);
        return;
    }

    await connectDB();

    const settings = await Setting.findOne({ key: 'wa_auto_report' }).lean();
    if (!settings || !settings.value.enabled) {
        console.log('[WARN] Feature wa_auto_report is DISABLED in settings.');
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
        console.log('[INFO] No pending teachers for today.');
        return;
    }

    console.log(`[INFO] Found ${pendingTeachers.length} pending teachers out of ${allTeachers.length} active Wali Kelas.`);

    // Pick ONE random teacher to send to
    const teacher = pendingTeachers[Math.floor(Math.random() * pendingTeachers.length)];

    console.log(`[INFO] Processing report for: ${teacher.nama} (Kelas: ${teacher.waliKelas})`);

    // Process Report for this teacher
    const students = await Siswa.find({ kelas: teacher.waliKelas }).lean();
    if (students.length === 0) {
        console.log(`[WARN] No students found for class ${teacher.waliKelas}. Skipping.`);
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

    console.log(`[ACTION] Sending WhatsApp message to ${teacher.nama} (${teacher.noHp})...`);

    try {
        const result = await sendWhatsApp(teacher.noHp, message);
        if (result && result.status === true) {
            console.log(`[SUCCESS] Message successfully queued for ${teacher.nama}.`);
            sentToday.add(teacher.nipy);
        } else {
            console.error(`[ERROR] Fonnte reported failure: ${JSON.stringify(result)}`);
        }
    } catch (err) {
        console.error(`[CRITICAL] Failed to execute sendWhatsApp:`, err.message);
    }
}

// Initial run
async function startWorker() {
    console.log('============================================');
    console.log('WhatsApp Auto-Report Worker Started Bootstrapping');
    console.log('Schedule: 08:45 - 13:00 WIB');
    console.log('============================================');

    const loop = async () => {
        try {
            await runReport();
        } catch (error) {
            console.error('[EROR] Worker Loop Failed:', error);
        }

        const nowWIB = getWIBDate();
        const currentHour = nowWIB.getHours();
        const currentMinute = nowWIB.getMinutes();
        const timeInMinutes = currentHour * 60 + currentMinute;
        const startMinutes = 8 * 60 + 45;

        let nextRunMinutes;
        // High frequency check near start time
        if (timeInMinutes >= startMinutes - 10 && timeInMinutes < startMinutes) {
            nextRunMinutes = 0.5; // Every 30 seconds to be precise
        } else if (timeInMinutes >= startMinutes && timeInMinutes <= startMinutes + 10) {
            nextRunMinutes = 2; // Every 2 minutes during initial hour
        } else {
            nextRunMinutes = 5 + Math.random() * 10;
        }

        console.log(`[WAIT] Next run in ${Math.round(nextRunMinutes * 10) / 10} minutes.`);
        setTimeout(loop, nextRunMinutes * 60 * 1000);
    };

    loop();
}

startWorker();
