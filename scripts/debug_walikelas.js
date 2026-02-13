
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/karomah_ramadan";

async function debugWaliKelas() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const Guru = mongoose.model('Guru', new mongoose.Schema({
            nama: String,
            ket: String,
            waliKelas: String,
            nipy: String
        }), 'gurus');

        const Siswa = mongoose.model('Siswa', new mongoose.Schema({
            nama: String,
            kelas: String
        }), 'siswas');

        const waliKelasTeachers = await Guru.find({ ket: 'Wali Kelas' });
        console.log(`Found ${waliKelasTeachers.length} teachers with role 'Wali Kelas'.\n`);

        for (const teacher of waliKelasTeachers) {
            console.log(`Teacher: ${teacher.nama} (${teacher.nipy})`);
            console.log(`  - Assigned Class (waliKelas): "${teacher.waliKelas}"`);

            if (!teacher.waliKelas) {
                console.log(`  - WARNING: waliKelas field is empty/undefined!`);
                continue;
            }

            const exactMatchCount = await Siswa.countDocuments({ kelas: teacher.waliKelas });
            console.log(`  - Exact match students found: ${exactMatchCount}`);

            if (exactMatchCount === 0) {
                console.log(`  - !! NO STUDENTS FOUND FOR THIS CLASS !!`);

                // Try to find similar classes (case insensitive)
                const similarStudents = await Siswa.find({
                    kelas: { $regex: new RegExp(`^${teacher.waliKelas.trim()}$`, 'i') }
                }).limit(5);

                if (similarStudents.length > 0) {
                    console.log(`  - Found ${similarStudents.length} students with similar class name (Case/Space difference?):`);
                    console.log(`    Example: "${similarStudents[0].kelas}"`);
                } else {
                    console.log(`  - No similar class names found either.`);

                    // List all available classes to help debug
                    const distinctClasses = await Siswa.distinct('kelas');
                    console.log(`  - Available classes in DB: ${distinctClasses.join(', ')}`);
                }
            }
            console.log('---');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debugWaliKelas();
