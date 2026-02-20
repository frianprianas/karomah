
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

// Models
const SettingSchema = new mongoose.Schema({
    key: String,
    value: mongoose.Schema.Types.Mixed
});
const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

const GuruSchema = new mongoose.Schema({
    nipy: String,
    nama: String,
    ket: String,
    noHp: String,
    waliKelas: String
});
const Guru = mongoose.models.Guru || mongoose.model('Guru', GuruSchema);

const SiswaSchema = new mongoose.Schema({
    nis: String,
    nama: String,
    kelas: String
});
const Siswa = mongoose.models.Siswa || mongoose.model('Siswa', SiswaSchema);

const JurnalSchema = new mongoose.Schema({
    nis: String,
    tgl_jurnal: Number,
    jam_tidur: String
}, { timestamps: true });
const Jurnal = mongoose.models.Jurnal || mongoose.model('Jurnal', JurnalSchema);

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
    // START RAMADAN: 18 FEBRUARI 2026 (As per user context)
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

    console.log(`[${nowWIB.toLocaleTimeString('id-ID')}] Logic Run...`);

    // Reset tracker if day changes
    if (currentDay !== lastDay) {
        console.log('New day detected (WIB). Resetting sent list.');
        sentToday.clear();
        lastDay = currentDay;
    }

    const currentHour = nowWIB.getHours();
    const currentMinute = nowWIB.getMinutes();
    const timeInMinutes = currentHour * 60 + currentMinute;

    // Schedule: 08:15 to 13:00 WIB (Monitoring Mode)
    const startMinutes = 8 * 60 + 15;  // 08:15
    const endMinutes = 13 * 60 + 0;    // 13:00

    if (timeInMinutes < startMinutes || timeInMinutes > endMinutes) {
        console.log(`Outside scheduled time range (08:15 - 13:00). Current: ${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute}`);
        return;
    }

    await connectDB();

    const settings = await Setting.findOne({ key: 'wa_auto_report' });
    if (!settings || !settings.value.enabled) {
        console.log('Feature disabled by Admin.');
        return;
    }

    // Filter teachers who haven't received report today
    const allTeachers = await Guru.find({ ket: { $in: ['Wali Kelas', 'Keduanya'] }, noHp: { $exists: true, $ne: '' } });
    const pendingTeachers = allTeachers.filter(t => !sentToday.has(t.nipy));

    if (pendingTeachers.length === 0) {
        console.log('All teachers have received reports for today.');
        return;
    }

    console.log(`Found ${pendingTeachers.length} pending teachers out of ${allTeachers.length}.`);

    // Pick ONE random teacher to send to
    const teacher = pendingTeachers[Math.floor(Math.random() * pendingTeachers.length)];

    if (!teacher.noHp || !teacher.waliKelas) {
        console.log(`Skipping invalid teacher data: ${teacher.nama}`);
        sentToday.add(teacher.nipy);
        return;
    }

    // Process Report for this teacher
    const students = await Siswa.find({ kelas: teacher.waliKelas });
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
    });

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

    console.log(`Sending report to ${teacher.nama} (${teacher.noHp})...`);

    // Send Message
    try {
        await sendWhatsApp(teacher.noHp, message);
        console.log('Message sent successfully.');
        sentToday.add(teacher.nipy);
    } catch (err) {
        console.error('Failed to send message:', err);
    }
}

// Initial run
async function startWorker() {
    console.log('WhatsApp Auto-Report Worker Started.');
    console.log('Schedule: 08:15 - 13:00 WIB (Monitoring Mode)');

    const loop = async () => {
        try {
            await runReport();
        } catch (error) {
            console.error('Worker Error:', error);
        }

        // Random interval between 5 to 15 minutes (Faster for checking)
        // User wants control start 07:30.
        const nextRunMinutes = 5 + Math.random() * 10;
        console.log(`Next check in ${Math.round(nextRunMinutes)} minutes.`);

        setTimeout(loop, nextRunMinutes * 60 * 1000);
    };

    loop();
}

startWorker();
