
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/karomah_ramadan";

async function forceUpdate() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        // Define schema explicitly to ensure field is recognized
        const GuruSchema = new mongoose.Schema({
            nama: String,
            nipy: String,
            ket: String,
            waliKelas: String
        }, { strict: false });

        const Guru = mongoose.model('Guru', GuruSchema);

        // Find Kifka
        const teacher = await Guru.findOne({ nama: /Kifka/i });
        if (!teacher) {
            console.log("Teacher Kifka not found!");
            return;
        }

        console.log(`Updating teacher: ${teacher.nama}`);

        // Force update
        teacher.ket = 'Wali Kelas';
        teacher.waliKelas = 'X RPL 1'; // Assign a valid class

        await teacher.save();
        console.log(`Updated successfully. New data:`);
        console.log(`Nama: ${teacher.nama}, Ket: ${teacher.ket}, Wali: ${teacher.waliKelas}`);

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

forceUpdate();
