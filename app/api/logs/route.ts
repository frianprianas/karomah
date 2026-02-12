import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
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

        // Query Jurnal dengan filter (jika ada) dan pagination
        // Sort by updatedAt desc (paling baru diisi)
        const totalLogs = await Jurnal.countDocuments(searchFilter);
        const logs = await Jurnal.find(searchFilter)
            .sort({ updatedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Manual Lookup data Siswa untuk setiap log (lebih efisien daripada aggregate lookup besar jika data jutaan, tapi untuk skala sekolah aggregate juga oke. Kita pakai manual lookup batch agar simpel)
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
                hari_ke: log.tgl_jurnal,
                tanggal_isi: log.updatedAt || log.createdAt
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
