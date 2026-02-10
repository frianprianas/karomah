
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import { getSession } from '@/lib/auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ nis: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'guru') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { nis } = await params;
        await connectDB();
        const journals = await Jurnal.find({ nis }).sort({ tgl_jurnal: 1 });

        return NextResponse.json({ success: true, data: journals });
    } catch (error) {
        console.error('Fetch student journal error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
