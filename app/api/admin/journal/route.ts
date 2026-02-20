
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

        const { searchParams } = new URL(req.url);
        const kelas = searchParams.get('kelas');

        await connectDB();

        // 1. Get Distinct Classes
        if (!kelas) {
            const students = await Siswa.find().select('kelas').lean();
            const classes = Array.from(new Set(students.map((s: any) => s.kelas))).filter(Boolean).sort();
            return NextResponse.json(classes);
        }

        // 2. Get Students and their Journal Status for specific class
        const students = await Siswa.find({ kelas }).sort({ nama: 1 }).lean();

        // Cek Jurnal Hari Ini
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const studentNises = students.map((s: any) => s.nis);

        const journals = await Jurnal.find({
            nis: { $in: studentNises },
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).select('nis _id sedang_halangan').lean();

        const result = students.map((s: any) => {
            const journal = journals.find((j: any) => j.nis === s.nis);
            return {
                _id: s._id,
                nis: s.nis,
                nama: s.nama,
                jurnalFilled: !!journal,
                sedangHalangan: journal?.sedang_halangan || false,
                journalId: journal?._id
            };
        });

        return NextResponse.json(result);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
