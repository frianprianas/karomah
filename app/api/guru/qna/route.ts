
import connectDB from '@/lib/db';
import TanyaJawab from '@/models/TanyaJawab';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'guru') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        // Ambil pertanyaan untuk guru ini (NIPY dari token)
        const questions = await TanyaJawab.find({ id_guru: session.username }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: questions });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'guru') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, jawaban } = await req.json();

        if (!id || !jawaban) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
        }

        await connectDB();

        // Update Pertanyaan -> Dijawab
        const updatedQ = await TanyaJawab.findOneAndUpdate(
            { _id: id, id_guru: session.username }, // Pastikan guru yang menjawab adalah guru yang dituju
            {
                jawaban,
                status: 'dijawab',
                answeredAt: new Date()
            },
            { new: true }
        );

        if (!updatedQ) {
            return NextResponse.json({ error: 'Pertanyaan tidak ditemukan atau bukan milik Anda' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedQ });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal menyimpan jawaban' }, { status: 500 });
    }
}
