
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await connectDB();
        const session = await getSession();

        if (!session || session.role !== 'siswa') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            tgl_jurnal,
            jam_bangun,
            sahur,
            sholat_wajib,
            sholat_sunah,
            tadarus,
            olah_raga,
            bantu_ortu,
            aktifitas_sosial,
            catatan_ihsan,
            jam_tidur,
            sedang_halangan,
            tanda_tangan
        } = await req.json();

        // Validasi Hari Jurnal
        const hariKe = parseInt(tgl_jurnal);
        if (isNaN(hariKe) || hariKe < 1 || hariKe > 30) {
            return NextResponse.json({ error: 'Hari jurnal tidak valid (1-30)' }, { status: 400 });
        }

        // Upsert journal entry using $set to only update specific fields
        const journal = await Jurnal.findOneAndUpdate(
            { nis: (session as any).username, tgl_jurnal } as any,
            {
                $set: {
                    jam_bangun,
                    sahur,
                    sholat_wajib,
                    sholat_sunah,
                    tadarus,
                    olah_raga,
                    bantu_ortu,
                    aktifitas_sosial,
                    catatan_ihsan,
                    jam_tidur,
                    sedang_halangan,
                    tanda_tangan
                }
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, data: journal });
    } catch (error) {
        console.error('Journal submit error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();
        const session = await getSession();

        if (!session || session.role !== 'siswa') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all journals for the logged-in student
        const journals = await Jurnal.find({ nis: (session as any).username } as any).sort({ tgl_jurnal: 1 });

        return NextResponse.json({ success: true, data: journals });
    } catch (error) {
        console.error('Journal fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
