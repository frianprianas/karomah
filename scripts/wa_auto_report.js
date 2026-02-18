
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

async function runReport() {
    console.log(`[${new Date().toLocaleTimeString()}] Checking for auto-report schedule...`);

    await connectDB();

    const settings = await Setting.findOne({ key: 'wa_auto_report' });
    if (!settings || !settings.value.enabled) {
        console.log('Feature disabled.');
        return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const timeInMinutes = currentHour * 60 + currentMinute;

    const startMinutes = 18 * 60 + 30; // 18:30
    const endMinutes = 21 * 60 + 30;   // 21:30

    if (timeInMinutes < startMinutes || timeInMinutes > endMinutes) {
        console.log('Outside scheduled time range.');
        return;
    }

    const ramadanDay = getRamadanDay();
    const teachers = await Guru.find({ ket: { $in: ['Wali Kelas', 'Keduanya'] }, noHp: { $exists: true, $ne: '' } });

    console.log(`Found ${teachers.length} Wali Kelas to process.`);

    for (const teacher of teachers) {
        if (!teacher.noHp || !teacher.waliKelas) continue;

        // Get students in this class
        const students = await Siswa.find({ kelas: teacher.waliKelas });
        const studentNisList = students.map(s => s.nis);

        // Get journals for today
        const journals = await Jurnal.find({
            nis: { $in: studentNisList },
            tgl_jurnal: ramadanDay,
            jam_tidur: { $exists: true, $ne: '' }
        });

        const filledCount = journals.length;
        const totalCount = students.length;
        const percent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

        // Random greeting
        const greetings = settings.value.greetings || ["Assalamu'alaikum"];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];

        let body = settings.value.messageTemplate || "Berikut *Laporan Progres Jurnal Ramadan* kelas *[KELAS]* untuk Hari ke-[HARI]:\n\n📊 *Statistik:* \n- Sudah Mengisi: *[ISI] Siswa*\n- Belum Mengisi: *[KOSONG] Siswa*\n- Progres: *[PERSEN]%*";

        body = body.replace('[KELAS]', teacher.waliKelas)
            .replace('[HARI]', ramadanDay)
            .replace('[ISI]', filledCount)
            .replace('[KOSONG]', totalCount - filledCount)
            .replace('[PERSEN]', percent);

        const message = `${greeting} *Ustadz/ah ${teacher.nama}*,\n\n${body}\n\nMohon bantuannya untuk mengingatkan santri yang belum mengisi agar segera melengkapi jurnalnya hari ini.\n\nTerika kasih,\n_Admin Karomah BN666_`;

        console.log(`Sending report to ${teacher.nama} (${teacher.noHp})...`);
        await sendWhatsApp(teacher.noHp, message);

        // Random delay 10-20 seconds between teachers to be safe
        await new Promise(r => setTimeout(r, 10000 + Math.random() * 10000));
    }
}

// Initial run
async function startWorker() {
    console.log('WhatsApp Auto-Report Worker Started.');

    const loop = async () => {
        await runReport();

        // Random interval between 10 to 30 minutes
        const nextRunMinutes = 10 + Math.random() * 20;
        console.log(`Next run in ${Math.round(nextRunMinutes)} minutes.`);

        setTimeout(loop, nextRunMinutes * 60 * 1000);
    };

    loop();
}

startWorker();
