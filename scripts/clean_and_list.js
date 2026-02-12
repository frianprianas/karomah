
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/karomah_ramadan"; // DB YANG BENAR

async function cleanAndList() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB: " + MONGODB_URI);

        const Siswa = mongoose.model('Siswa', new mongoose.Schema({
            kelas: String,
            nama: String,
            nis: String
        }, { strict: false }));

        // 1. Cek Kelas Aneh
        const strangeClasses = ['nama', 'nis', 'kelas', 'Nama', 'NIS', 'Kelas'];

        // Cari siswa yang kelasnya aneh
        const badStudents = await Siswa.find({
            kelas: { $in: strangeClasses.map(c => new RegExp(`^${c}$`, 'i')) }
        });

        console.log(`Ditemukan ${badStudents.length} siswa dengan kelas aneh:`);
        badStudents.forEach(s => console.log(`- ${s.nama} (${s.nis}) di kelas "${s.kelas}"`));

        if (badStudents.length > 0) {
            console.log("Menghapus data sampah...");
            const res = await Siswa.deleteMany({
                _id: { $in: badStudents.map(s => s._id) }
            });
            console.log(`Terhapus: ${res.deletedCount}`);
        } else {
            console.log("Tidak ada data sampah ditemukan dengan kriteria ini.");
        }

        // 2. Tampilkan Sisa Kelas
        const remainingClasses = await Siswa.distinct('kelas');
        console.log("\nDaftar Kelas Tersisa:");
        remainingClasses.sort().forEach(c => console.log(`- ${c}`));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

cleanAndList();
