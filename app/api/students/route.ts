
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Siswa from '@/models/Siswa';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'guru') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const students = await Siswa.find().select('-password').sort({ kelas: 1, nama: 1 });
        return NextResponse.json({ success: true, data: students });
    } catch (error) {
        console.error('List students error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
