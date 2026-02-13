
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb://localhost:27017/karomah_ramadan";

async function generateWaliKelas() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        // Schemas
        const SiswaSchema = new mongoose.Schema({ kelas: String }, { strict: false });
        const Siswa = mongoose.model('Siswa', SiswaSchema);

        const GuruSchema = new mongoose.Schema({
            nipy: { type: String, required: true, unique: true },
            nama: { type: String, required: true },
            ket: { type: String },
            password: { type: String, required: true },
            waliKelas: { type: String, index: true }
        });
        const Guru = mongoose.models.Guru || mongoose.model('Guru', GuruSchema);

        // 1. Get unique classes
        const classes = await Siswa.distinct('kelas');
        console.log(`Found ${classes.length} unique classes: ${classes.join(', ')}`);

        // 2. Create Wali Kelas for each class
        for (const className of classes) {
            if (!className) continue;

            const nipy = `wali_${className.replace(/\s+/g, '').toLowerCase()}`;
            const existingGuru = await Guru.findOne({
                $or: [{ waliKelas: className }, { nipy: nipy }]
            });

            if (existingGuru) {
                console.log(`- Wali Kelas for "${className}" already exists: ${existingGuru.nama}`);
                continue;
            }

            const hashedPassword = await bcrypt.hash('123456', 10);

            const newGuru = new Guru({
                nipy: nipy,
                nama: `Wali Kelas ${className}`,
                ket: 'Wali Kelas',
                password: hashedPassword,
                waliKelas: className
            });

            await newGuru.save();
            console.log(`+ Created Wali Kelas for "${className}" (NIPY: ${nipy})`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

generateWaliKelas();
