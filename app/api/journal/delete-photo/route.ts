import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        // Hanya Guru yang boleh menghapus
        if (!session || session.role !== 'guru') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { journalId, field } = await req.json();

        if (!journalId || !['aktifitas_sosial', 'catatan_ihsan'].includes(field)) {
            return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
        }

        await connectDB();

        // Update field foto menjadi string kosong
        // Menggunakan dynamic key update
        const updateQuery = { [`${field}.foto`]: '' };

        const updatedJournal = await Jurnal.findByIdAndUpdate(
            journalId,
            { $set: updateQuery },
            { new: true }
        );

        if (!updatedJournal) {
            return NextResponse.json({ error: 'Journal not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Foto berhasil dihapus', success: true });

    } catch (error: any) {
        console.error('Delete photo error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
