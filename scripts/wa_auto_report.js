
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
});
const Jurnal = mongoose.models.Jurnal || mongoose.model('Jurnal', JurnalSchema);

async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;
    return mongoose.connect(MONGODB_URI);
}

async function sendWhatsApp(target, message) {
    const token = 'KQ1XKbd2ZHue4cn9e7hc';

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
    }
}

function getRamadanDay() {
    // Logic to determine current Ramadan day. 
    // For simplicity, let's assume we store the start date or just use a fixed day for testing
    // Or we can determine it based on current date if we know when Ramadan 1447 starts.
    // Let's assume Ramadan 1 starts on March 2, 2026 (approx for 1447H)
    const ramadanStart = new Date('2026-02-18'); // FOR TESTING: using today's date
    const today = new Date();
    const diffTime = Math.abs(today - ramadanStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.min(Math.max(diffDays, 1), 30);
}

// State to track sent status in memory
let sentToday = new Set();
let lastDay = new Date().getDate();

async function runReport() {
    const now = new Date();

    // Reset tracker if day changes
    if (now.getDate() !== lastDay) {
        console.log('New day detected. Resetting sent list.');
        sentToday.clear();
        lastDay = now.getDate();
    }

    console.log(`[${now.toLocaleTimeString()}] Checking for auto-report schedule...`);

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const timeInMinutes = currentHour * 60 + currentMinute;

    // Schedule: 07:30 to 14:00 (Extended window to accommodate 10-30 min intervals for all teachers)
    const startMinutes = 7 * 60 + 30;  // 07:30
    const endMinutes = 15 * 60 + 0;    // 15:00

    if (timeInMinutes < startMinutes || timeInMinutes > endMinutes) {
        console.log('Outside scheduled time range (07:30 - 15:00).');
        return;
    }

    await connectDB();

    const settings = await Setting.findOne({ key: 'wa_auto_report' });
    if (!settings || !settings.value.enabled) {
        console.log('Feature disabled by Admin.');
        return;
    }

    const ramadanDay = getRamadanDay();
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
        sentToday.add(teacher.nipy); // Mark as processed to avoid stuck loop
        return;
    }

    // Process Report for this teacher
    const students = await Siswa.find({ kelas: teacher.waliKelas });
    const studentNisList = students.map(s => s.nis);

    const journals = await Jurnal.find({
        nis: { $in: studentNisList },
        tgl_jurnal: ramadanDay,
        jam_tidur: { $exists: true, $ne: '' }
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
    console.log('Schedule: 07:30 - 15:00 WIB');

    const loop = async () => {
        await runReport();

        // Random interval between 10 to 30 minutes
        const nextRunMinutes = 10 + Math.random() * 20;
        console.log(`Next execution in ${Math.round(nextRunMinutes)} minutes.`);

        setTimeout(loop, nextRunMinutes * 60 * 1000);
    };

    loop();
}

startWorker();
