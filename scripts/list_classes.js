
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://127.0.0.1:27017/karomah";

async function listClasses() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");

    const Siswa = mongoose.model('Siswa', new mongoose.Schema({
        kelas: String,
        nama: String
    }, { strict: false }));

    const classes = await Siswa.distinct('kelas');
    console.log("Daftar Kelas di Database:");
    classes.forEach(c => console.log(`- "${c}"`));

    // Cek detail untuk kelas yang mencurigakan
    const susClasses = classes.filter(c => /nama/i.test(c) || /nis/i.test(c) || /kelas/i.test(c));
    if (susClasses.length > 0) {
        console.log("\nKelas Mencurigakan (Detail):");
        for (const k of susClasses) {
            const count = await Siswa.countDocuments({ kelas: k });
            console.log(`  Kelas: "${k}", Jumlah Siswa: ${count}`);
            const sample = await Siswa.find({ kelas: k }).limit(3);
            sample.forEach(s => console.log(`    Contoh Siswa: ${s.nama} (${s.nis})`));
        }
    }

    await mongoose.disconnect();
}

listClasses();
