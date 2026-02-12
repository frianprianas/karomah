
import connectDB from '@/lib/db';
import Guru from '@/models/Guru';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDB();
        const gurus = await Guru.find({}).select('nama nipy').lean();
        return NextResponse.json({ success: true, data: gurus });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
    }
}
