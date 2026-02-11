
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import { getSession } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'guru') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { nis, day, catatan } = body;

        console.log('--- ROBUST DB UPDATE FOR TEACHER NOTE ---');
        console.log('Target:', { nis, day });
        console.log('Catatan:', catatan);

        if (!nis || day === undefined) {
            return NextResponse.json({ error: 'NIS and Day are required' }, { status: 400 });
        }

        await connectDB();

        // Target by NIS and Date, which is the unique constraint
        const updateResult = await Jurnal.collection.updateOne(
            { nis: nis, tgl_jurnal: Number(day) },
            {
                $set: {
                    catatan_guru: catatan || '',
                    dikomentari_pada: new Date(),
                    nama_guru_komentar: (session as any).name || 'Guru Pembina'
                }
            }
        );

        console.log('Update Result:', updateResult);

        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: 'Data jurnal santri tidak ditemukan.' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            catatan: catatan
        });
    } catch (error: any) {
        console.error('Detailed Update Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
