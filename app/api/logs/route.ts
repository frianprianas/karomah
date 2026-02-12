import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import TanyaJawab from '@/models/TanyaJawab';
import Siswa from '@/models/Siswa';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'guru' && session.role !== 'admin')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        // Jika ada pencarian, kita perlu cari NIS dulu dari tabel Siswa
        let searchFilter: any = {};
        if (search) {
            const students = await Siswa.find({
                $or: [
                    { nama: { $regex: search, $options: 'i' } },
                    { kelas: { $regex: search, $options: 'i' } },
                    { nis: { $regex: search, $options: 'i' } }
                ]
            }).select('nis');

            const nises = students.map(s => s.nis);
            searchFilter = { nis: { $in: nises } };
        }

        // Hitung Total Dokumen (Agak berat kalau union count, jadi kita estimasi atau count terpisah lalu jumlahkan)
        // Untuk akurasi, kita count terpisah
        const countJurnal = await Jurnal.countDocuments(searchFilter);

        const qnaFilter = search ? { nis_siswa: { $in: (searchFilter.nis ? searchFilter.nis['$in'] : []) } } : {};
        // Perbaiki filter QnA jika search kosong (tampilkan semua)
        const finalQnaFilter = search ? qnaFilter : {};

        const countQnA = await TanyaJawab.countDocuments(finalQnaFilter);
        const totalLogs = countJurnal + countQnA;

        // Aggregation Pipeline untuk Join Limit Offset
        // Jurnal Collection sebagai base
        const logs = await Jurnal.aggregate([
            { $match: searchFilter },
            { $addFields: { type: 'jurnal', activity: '$tgl_jurnal', date: { $ifNull: ['$updatedAt', '$createdAt'] } } },
            { $project: { nis: 1, type: 1, activity: 1, date: 1 } },
            {
                $unionWith: {
                    coll: 'tanyajawabs',
                    pipeline: [
                        { $match: finalQnaFilter },
                        { $addFields: { type: 'qna', activity: '$pertanyaan', date: '$createdAt', nis: '$nis_siswa' } },
                        { $project: { nis: 1, type: 1, activity: 1, date: 1 } }
                    ]
                }
            },
            { $sort: { date: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        // Manual Lookup data Siswa untuk setiap log
        const uniqueNises = Array.from(new Set(logs.map((l: any) => l.nis)));
        const students = await Siswa.find({ nis: { $in: uniqueNises } }).lean();

        // Map student data ke map untuk akses cepet
        const studentMap: Record<string, any> = {};
        students.forEach((s: any) => {
            studentMap[s.nis] = s;
        });

        // Gabungkan data
        const data = logs.map((log: any) => {
            const student = studentMap[log.nis];
            return {
                _id: log._id,
                nis: log.nis,
                nama: student ? student.nama : 'Siswa Tidak Dikenal',
                kelas: student ? student.kelas : '-',
                hari_ke: log.activity, // Untuk Jurnal = Angka/String Hari, Untuk QnA = Text Pertanyaan
                type: log.type, // 'jurnal' atau 'qna'
                tanggal_isi: log.date
            };
        });

        return NextResponse.json({
            data,
            pagination: {
                total: totalLogs,
                page,
                limit,
                totalPages: Math.ceil(totalLogs / limit)
            }
        });

    } catch (error: any) {
        console.error('Logs Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
