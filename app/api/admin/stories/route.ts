
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Siswa from '@/models/Siswa';
import Guru from '@/models/Guru';

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, type, action } = await req.json();
    await connectDB();

    try {
        if (action === 'delete') {
            if (type === 'Siswa') {
                await Siswa.updateOne({ _id: id }, { status: '', statusUpdatedAt: null });
            } else {
                await Guru.updateOne({ _id: id }, { status: '', statusUpdatedAt: null });
            }
            return NextResponse.json({ success: true, message: 'Status berhasil dihapus' });
        } else if (action === 'ban') {
            const bannedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
            if (type === 'Siswa') {
                await Siswa.updateOne({ _id: id }, {
                    status: '',
                    statusUpdatedAt: null,
                    statusBannedUntil: bannedUntil
                });
            } else {
                await Guru.updateOne({ _id: id }, {
                    status: '',
                    statusUpdatedAt: null,
                    statusBannedUntil: bannedUntil
                });
            }
            return NextResponse.json({ success: true, message: 'Status dihapus dan user diblokir selama 24 jam' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
