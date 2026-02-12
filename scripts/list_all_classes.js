
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb://localhost:27017/karomah_ramadan";

async function listAll() {
    await mongoose.connect(MONGODB_URI);

    // Model Siswa (schema strict false untuk melihat semua field)
    const Siswa = mongoose.model('Siswa', new mongoose.Schema({
        kelas: String,
        nama: String
    }, { strict: false }));

    const uniqueClasses = await Siswa.distinct("kelas");
    console.log("Total Kelas Unik:", uniqueClasses.length);
    uniqueClasses.forEach(c => console.log(`'${c}'`)); // Quote agar terlihat spasi

    // List semua siswa yang BUKAN X RPL
    const otherStudents = await Siswa.find({
        kelas: { $nin: ["X RPL 1", "X RPL 2"] }
    });

    console.log(`\nSiswa di kelas selain X RPL (${otherStudents.length} siswa):`);
    otherStudents.forEach(s => console.log(`- Nama: ${s.nama}, Kelas: '${s.kelas}'`));

    if (otherStudents.length > 0) {
        // Hapus data yang kelasnya aneh ini
        const res = await Siswa.deleteMany({
            kelas: { $nin: ["X RPL 1", "X RPL 2"] }
        });
        console.log(`\nMenghapus ${res.deletedCount} siswa dengan kelas aneh.`);
    }

    await mongoose.disconnect();
}
listAll();
