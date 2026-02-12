
const mongoose = require('mongoose');

async function detective() {
    try {
        console.log("Connecting to verify databases...");
        await mongoose.connect("mongodb://localhost:27017/admin"); // Connect to admin DB
        const adminDb = mongoose.connection.db.admin();
        const dbs = await adminDb.listDatabases();

        console.log("Databases Found:", dbs.databases.map(db => db.name));

        for (const dbInfo of dbs.databases) {
            if (['admin', 'local', 'config'].includes(dbInfo.name)) continue;

            console.log(`\nChecking DB: ${dbInfo.name}...`);
            try {
                // Create separate connection for each DB
                const conn = await mongoose.createConnection(`mongodb://localhost:27017/${dbInfo.name}`).asPromise();
                const coll = conn.collection('siswas');
                // Check if collection exists first to avoid error
                const colls = await conn.db.listCollections({ name: 'siswas' }).toArray();

                if (colls.length > 0) {
                    const count = await coll.countDocuments();

                    if (count > 0) {
                        const classes = await coll.distinct('kelas');
                        console.log(`  Found ${count} students.`);
                        console.log(`  Classes: ${classes.join(', ')}`);

                        // Check for weird classes (not X RPL)
                        // Note: sesuaikan whitelist kelas jika user punya kelas valid lain
                        // Tapi user bilang "baru buat 2 kelas".
                        const bad = await coll.find({
                            kelas: { $nin: ["X RPL 1", "X RPL 2"] }
                        }).toArray();

                        if (bad.length > 0) {
                            console.log(`  !! DETECTED BAD DATA HERE (${bad.length} docs) !!`);
                            bad.forEach(b => console.log(`    - ID: ${b._id}, Nama: ${b.nama}, Kelas: '${b.kelas}'`));

                            // HAPUS jika ada konfirmasi (tapi user minta fix, jadi hapus saja yg jelas sampah)
                            // Filter regex 'nama', 'nis', 'kelas'
                            const reallyBad = bad.filter(b => /nama/i.test(b.kelas) || /nis/i.test(b.kelas) || /kelas/i.test(b.kelas));

                            if (reallyBad.length > 0) {
                                console.log(`  Menghapus ${reallyBad.length} data sampah yang HAMPIR PASTI salah...`);
                                const ids = reallyBad.map(b => b._id);
                                await coll.deleteMany({ _id: { $in: ids } });
                                console.log("  Terhapus.");
                            } else {
                                console.log("  Data aneh ditemukan tapi tidak sesuai pola 'nama'/'nis'. Tidak dihapus otomatis. Cek manual.");
                            }
                        }
                    } else {
                        console.log("  No students found.");
                    }
                } else {
                    console.log("  Collection 'siswas' not found.");
                }
                await conn.close();
            } catch (e) {
                console.log("  Error checking:", e.message);
            }
        }

        await mongoose.disconnect();
    } catch (err) {
        console.error("Fatal Error:", err);
    }
}
detective();
