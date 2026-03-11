
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import Siswa from '@/models/Siswa';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'admin' && session.role !== 'spv')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const exportAll = searchParams.get('export') === 'true';

        // Base Query untuk Siswa
        let query: any = {};
        if (search) {
            query = {
                $or: [
                    { nama: { $regex: search, $options: 'i' } },
                    { nis: { $regex: search, $options: 'i' } },
                    { kelas: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const totalSiswa = await Siswa.countDocuments(query);
        const totalPages = Math.ceil(totalSiswa / limit);
        const skipped = (page - 1) * limit;

        // Ambil Siswa
        let studentsFetch = Siswa.find(query).sort({ kelas: 1, nama: 1 }).lean();
        if (!exportAll) {
            studentsFetch = studentsFetch.skip(skipped).limit(limit);
        }
        const students = await studentsFetch;

        if (students.length === 0) {
            return NextResponse.json({
                data: [],
                pagination: { total: totalSiswa, page, limit, totalPages: 0 }
            });
        }

        const studentNises = students.map((s: any) => s.nis);

        // Ambil SEMUA jurnal dari siswa yang termuat (untuk menghitung persentase/poin)
        // Hari Ramadan max 30. Persentase = (jumlah hari isi / 30) * 100
        const journals = await Jurnal.aggregate([
            { $match: { nis: { $in: studentNises } } },
            { $group: { _id: '$nis', hitungMurni: { $sum: 1 }, hitungHalangan: { $sum: { $cond: [{ $eq: ['$sedang_halangan', true] }, 1, 0] } } } }
        ]);

        const journalMap: Record<string, { totalIsi: number, halangan: number }> = {};
        journals.forEach(j => {
            journalMap[j._id] = { totalIsi: j.hitungMurni, halangan: j.hitungHalangan };
        });

        // Konstanta Hari Maksimal Jurnal
        const MAX_DAYS = 30;

        const data = students.map((s: any) => {
            const jData = journalMap[s.nis] || { totalIsi: 0, halangan: 0 };
            const murni = jData.totalIsi - jData.halangan;
            const halangan = jData.halangan;
            const persentase = Math.round((jData.totalIsi / MAX_DAYS) * 100);

            return {
                nis: s.nis,
                nama: s.nama,
                kelas: s.kelas,
                totalIsi: jData.totalIsi,
                murniIsi: murni,
                halangan: halangan,
                persentase: persentase
            };
        });

        // Sort from largest points (most filled days) to least.
        data.sort((a, b) => b.totalIsi - a.totalIsi || a.nama.localeCompare(b.nama));

        return NextResponse.json({
            data,
            pagination: {
                total: totalSiswa,
                page,
                limit,
                totalPages
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
