
const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://localhost:27017/karomah_ramadan";

async function listClasses() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const Siswa = mongoose.model('Siswa', new mongoose.Schema({
            kelas: String
        }), 'siswas'); // Explicit collection name if needed, but mongoose usually infers 'siswas'

        const classes = await Siswa.distinct('kelas');
        console.log("Daftar Kelas yang ada di database:");
        classes.sort().forEach(c => console.log(`- ${c}`));

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

listClasses();
