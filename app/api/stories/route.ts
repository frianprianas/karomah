
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Siswa from '@/models/Siswa';
import Guru from '@/models/Guru';

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - ONE_DAY_MS);

    try {
        // Fetch Active Stories from Siswa
        const students = await Siswa.find({
            status: { $exists: true, $ne: '' },
            statusUpdatedAt: { $gt: cutoffDate }
        }).select('nama foto status statusUpdatedAt kelas nis').lean();

        // Fetch Active Stories from Guru
        const teachers = await Guru.find({
            status: { $exists: true, $ne: '' },
            statusUpdatedAt: { $gt: cutoffDate }
        }).select('nama foto status statusUpdatedAt ket nipy').lean();

        // Normalize and Combine
        const stories = [
            ...students.map(s => ({
                id: (s as any)._id,
                name: s.nama,
                role: 'Siswa',
                subLabel: s.kelas,
                foto: s.foto,
                status: s.status,
                updatedAt: s.statusUpdatedAt
            })),
            ...teachers.map(t => ({
                id: (t as any)._id,
                name: t.nama,
                role: 'Guru',
                subLabel: t.ket,
                foto: t.foto,
                status: t.status,
                updatedAt: t.statusUpdatedAt
            }))
        ];

        // Sort by Newest First
        stories.sort((a, b) => new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime());

        return NextResponse.json({ success: true, data: stories });
    } catch (e) {
        console.error("Fetch stories error:", e);
        return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
    }
}
