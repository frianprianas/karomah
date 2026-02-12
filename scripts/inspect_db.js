
const mongoose = require('mongoose');
const MONGODB_URI = "mongodb://localhost:27017/karomah_ramadan";

async function inspect() {
    await mongoose.connect(MONGODB_URI);

    // 1. List Collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));

    // 2. Cek 'siswas' secara manual
    const collection = mongoose.connection.db.collection('siswas');
    const docs = await collection.find({}).limit(5).toArray();
    console.log("\nSample Documents (siswas):", docs);

    // 3. Distinct Kelas (Low Level Driver)
    const distinctClasses = await collection.distinct("kelas");
    console.log("\nDistinct Kelas (Driver Low Level):", distinctClasses);

    // 4. Cari yang aneh
    const weird = await collection.find({
        kelas: { $nin: ["X RPL 1", "X RPL 2"] }
    }).toArray();

    console.log(`\nSiswa dengan kelas aneh (${weird.length}):`);
    weird.forEach(w => console.log(`- Nama: ${w.nama}, Kelas: '${w.kelas}'`));

    // HAPUS LANGSUNG
    if (weird.length > 0) {
        console.log("Menghapus...");
        await collection.deleteMany({
            kelas: { $nin: ["X RPL 1", "X RPL 2"] }
        });
        console.log("Terhapus.");
    }

    await mongoose.disconnect();
}
inspect();
