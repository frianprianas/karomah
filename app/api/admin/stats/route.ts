
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import Siswa from '@/models/Siswa';
import Guru from '@/models/Guru';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'admin' && session.role !== 'spv')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // 1. Total Siswa & Guru
        const studentCount = await Siswa.countDocuments({});
        const teacherCount = await Guru.countDocuments({});

        // 2. Monitoring Jurnal Hari Ini
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const journalCountToday = await Jurnal.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // 3. Persentase
        const fillRate = studentCount > 0 ? Math.round((journalCountToday / studentCount) * 100) : 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalSiswa: studentCount,
                totalGuru: teacherCount,
                filledToday: journalCountToday,
                fillRate: fillRate
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
