
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

    try {
        const { id, role } = await req.json();
        await connectDB();

        if (role === 'siswa') {
            await Siswa.updateOne({ _id: id }, { $set: { foto: '' } });
        } else if (role === 'guru') {
            await Guru.updateOne({ _id: id }, { $set: { foto: '' } });
        } else {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: 'Foto profil berhasil dihapus' });
    } catch (e: any) {
        console.error('Delete photo error:', e);
        return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }
}
