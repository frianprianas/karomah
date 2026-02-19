
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import TanyaJawab from '@/models/TanyaJawab';
import { getSession } from '@/lib/auth';

import Guru from '@/models/Guru';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'siswa') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id_guru, nama_guru, pertanyaan } = await req.json();

        if (!id_guru || !pertanyaan) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
        }

        await connectDB();

        // Cek History Pertanyaan Siswa PER HARI INI
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const historyToday = await TanyaJawab.find({
            nis_siswa: session.username,
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        }).sort({ createdAt: 1 });

        // Rule 1: Max 2 Pertanyaan HARI INI
        if (historyToday.length >= 2) {
            return NextResponse.json({ error: 'Mohon maaf, jatah 2 pertanyaanmu HARI INI sudah habis. Silakan bertanya lagi besok!' }, { status: 400 });
        }

        // Rule 2: Jika sudah ada 1 pertanyaan hari ini, pastikan statusnya 'dijawab' sebelum boleh tanya lagi.
        if (historyToday.length === 1 && historyToday[0].status !== 'dijawab') {
            return NextResponse.json({ error: 'Pertanyaan pertamamu hari ini belum dijawab oleh Guru. Mohon tunggu jawaban sebelum mengajukan pertanyaan kedua.' }, { status: 400 });
        }

        // Create Pertanyaan Baru
        const newQ = await TanyaJawab.create({
            nis_siswa: session.username,
            nama_siswa: session.name,
            kelas_siswa: session.kelas || '-',
            id_guru,
            nama_guru,
            pertanyaan,
            status: 'menunggu'
        });

        // NOTIFIKASI WA KE GURU
        try {
            const guru = await Guru.findOne({ nipy: id_guru });
            if (guru && guru.noHp) {
                const message = `*Assalamu'alaikum ${guru.nama}*,\n\nAda pertanyaan baru di fitur Tanya Jawab (QnA) Karomah:\n\n🧑‍🎓 *Siswa*: ${session.name} (${session.kelas || '-'}) \n❓ *Pertanyaan*: "${pertanyaan}"\n\nSilakan buka aplikasi Karomah untuk menjawab. Terima kasih.`;
                await sendWhatsAppMessage(guru.noHp, message);
            }
        } catch (waError) {
            console.error('Gagal kirim notif WA QnA:', waError);
            // Jangan gagalkan request utama hanya karena WA gagal
        }

        return NextResponse.json({ success: true, data: newQ });
    } catch (error) {
        console.error("QnA Error:", error);
        return NextResponse.json({ error: 'Gagal mengirim pertanyaan' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session || session.role !== 'siswa') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        // Ambil semua pertanyaan siswa ini (riwayat total), urutkan terbaru
        const questions = await TanyaJawab.find({ nis_siswa: session.username }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: questions });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
    }
}
