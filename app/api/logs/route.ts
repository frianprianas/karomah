import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import TanyaJawab from '@/models/TanyaJawab';
import Siswa from '@/models/Siswa';
import Aktivitas from '@/models/Aktivitas';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'guru' && session.role !== 'admin' && session.role !== 'spv')) {
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

        // Hitung Total Dokumen terpisah
        const countJurnal = await Jurnal.countDocuments(searchFilter);

        // QnA menggunakan field nis_siswa
        const finalQnaFilter = search ? { nis_siswa: { $in: (searchFilter.nis ? searchFilter.nis['$in'] : []) } } : {};
        const countQnA = await TanyaJawab.countDocuments(finalQnaFilter);
        const countAktivitas = await Aktivitas.countDocuments(searchFilter);

        const totalLogs = countJurnal + countQnA + countAktivitas;

        // Aggregation Pipeline
        // Kita gunakan Jurnal sebagai base, tapi jika kosong union tetap jalan
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
            {
                $unionWith: {
                    coll: 'aktivitas_logs',
                    pipeline: [
                        { $match: searchFilter },
                        { $addFields: { type: '$tipe', activity: '$aksi', date: '$createdAt' } },
                        { $project: { nis: 1, type: 1, activity: 1, date: 1 } }
                    ]
                }
            },
            { $sort: { date: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);

        // Manual Lookup data Siswa
        const uniqueNises = Array.from(new Set(logs.map((l: any) => l.nis)));
        const studentsList = await Siswa.find({ nis: { $in: uniqueNises } }).lean();
        const studentMap: Record<string, any> = {};
        studentsList.forEach((s: any) => { studentMap[s.nis] = s; });

        const data = logs.map((log: any) => {
            const student = studentMap[log.nis];
            return {
                _id: log._id,
                nis: log.nis,
                nama: student ? student.nama : 'Siswa Tidak Dikenal',
                kelas: student ? student.kelas : '-',
                hari_ke: log.activity,
                type: log.type,
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
