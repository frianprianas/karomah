
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/karomah_ramadan";

async function checkClasses() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const Siswa = mongoose.model('Siswa', new mongoose.Schema({
            kelas: String
        }), 'siswas');

        // Group by class and count
        const result = await Siswa.aggregate([
            {
                $group: {
                    _id: "$kelas",
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        console.log("Existing Classes and Student Counts:");
        result.forEach(r => {
            console.log(`- "${r._id}": ${r.count} students`);
        });

        const Guru = mongoose.model('Guru', new mongoose.Schema({
            nama: String,
            ket: String,
            waliKelas: String
        }), 'gurus');

        const teachers = await Guru.find({ ket: 'Wali Kelas' });
        console.log("\nExisting Wali Kelas Teachers:");
        teachers.forEach(t => {
            console.log(`- ${t.nama}: assigned to "${t.waliKelas}"`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

checkClasses();
