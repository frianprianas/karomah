
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb://localhost:27017/karomah_ramadan";

async function checkAdmins() {
    try {
        await mongoose.connect(MONGODB_URI);
        const collection = mongoose.connection.db.collection('admins');
        const admins = await collection.find({}).toArray();
        console.log("Found admins:", admins.map(a => ({
            username: a.username,
            nama: a.nama,
            role: a.role || 'admin'
        })));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
checkAdmins();
