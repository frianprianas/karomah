
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Siswa from '@/models/Siswa';
import Jurnal from '@/models/Jurnal';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    // Token rahasia untuk akses eksternal
    // Anda bisa mengganti 'karomah_shared_2026' dengan kunci lain yang lebih kuat
    const SECRET_TOKEN = process.env.EXTERNAL_DATA_TOKEN || 'karomah_shared_2026';

    if (!token || token !== SECRET_TOKEN) {
        return NextResponse.json({
            success: false,
            message: 'Akses Ditolak: Token tidak valid atau tidak disertakan.'
        }, { status: 401 });
    }

    try {
        await connectDB();

        const type = searchParams.get('type') || 'siswa'; // Default ambil data siswa

        let data;
        if (type === 'siswa') {
            // Mengambil detail profil siswa
            data = await Siswa.find({})
                .select('nama nis kelas status foto gender -_id')
                .lean();
        } else if (type === 'jurnal') {
            // Mengambil detail isi jurnal secara lengkap
            data = await Jurnal.find({})
                .select('nis tgl_jurnal jam_bangun sahur sholat_wajib sholat_sunah tadarus olah_raga bantu_ortu aktifitas_sosial catatan_ihsan jam_tidur sedang_halangan catatan_guru -_id')
                .limit(2000) // Dinaikkan batasnya
                .lean();
        } else {
            return NextResponse.json({
                success: false,
                message: 'Tipe data tidak dikenal. Gunakan type=siswa atau type=jurnal.'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            type: type,
            total: data.length,
            timestamp: new Date().toISOString(),
            data: data
        });
    } catch (error) {
        console.error('Data sharing error:', error);
        return NextResponse.json({
            success: false,
            message: 'Terjadi kesalahan pada server saat mengambil data.'
        }, { status: 500 });
    }
}
