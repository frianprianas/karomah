
const mongoose = require('mongoose');

// Ganti URI sesuai env lokal jika perlu, atau hardcoded untuk quick fix
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/karomah";

async function cleanData() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");

    const Siswa = mongoose.model('Siswa', new mongoose.Schema({}, { strict: false }));

    // Cari siswa dengan kelas 'nama', 'nis', atau 'kelas' (case insensitive)
    const badStudents = await Siswa.find({
        kelas: { $in: [/nama/i, /nis/i, /kelas/i] }
    });

    console.log(`Ditemukan ${badStudents.length} data siswa tidak valid:`);
    badStudents.forEach(s => {
        console.log(`- Nama: ${s.nama}, NIS: ${s.nis}, Kelas: ${s.kelas}`);
    });

    if (badStudents.length > 0) {
        // Hapus data ini
        const res = await Siswa.deleteMany({
            _id: { $in: badStudents.map(s => s._id) }
        });
        console.log(`\nBerhasil menghapus ${res.deletedCount} data sampah.`);
    } else {
        console.log("Data bersih.");
    }

    await mongoose.disconnect();
}

cleanData();
