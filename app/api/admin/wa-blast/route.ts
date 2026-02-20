
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Guru from '@/models/Guru';
import Siswa from '@/models/Siswa';
import Jurnal from '@/models/Jurnal';
import Setting from '@/models/Setting';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // 1. Get Wali Kelas List
        const allGurus = await Guru.find({}).sort({ nama: 1 }).lean();
        const waliKelasList = allGurus.filter((t: any) =>
            (t.ket === 'Wali Kelas' || t.ket === 'Keduanya' || t.waliKelas) &&
            t.noHp && t.noHp.length > 5
        );

        // 2. Get Stats for each teacher
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const nowWIB = new Date(utc + (7 * 3600000));
        const startOfDay = new Date(nowWIB);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(nowWIB);
        endOfDay.setHours(23, 59, 59, 999);

        // Ramadan Day calculation
        const ramadanStart = new Date('2026-02-18T00:00:00+07:00');
        const d1 = new Date(ramadanStart.getFullYear(), ramadanStart.getMonth(), ramadanStart.getDate());
        const d2 = new Date(nowWIB.getFullYear(), nowWIB.getMonth(), nowWIB.getDate());
        const diffDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        const ramadanDay = Math.max(1, diffDays + 1);

        const results = await Promise.all(waliKelasList.map(async (teacher: any) => {
            const students = await Siswa.find({ kelas: teacher.waliKelas }).lean();
            const studentNisList = students.map((s: any) => s.nis);

            const journals = await Jurnal.find({
                nis: { $in: studentNisList },
                $or: [
                    { tgl_jurnal: ramadanDay },
                    { createdAt: { $gte: startOfDay, $lte: endOfDay } }
                ]
            }).lean();

            return {
                id: teacher._id,
                nipy: teacher.nipy,
                nama: teacher.nama,
                kelas: teacher.waliKelas,
                noHp: teacher.noHp,
                stats: {
                    filled: journals.length,
                    total: students.length,
                    percent: students.length > 0 ? Math.round((journals.length / students.length) * 100) : 0
                }
            };
        }));

        return NextResponse.json({
            teachers: results,
            ramadanDay,
            todayStr: nowWIB.toDateString()
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { teacherId, ramadanDay, stats, customMessage } = await req.json();

        if (!teacherId) {
            return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 });
        }

        await connectDB();
        const teacher = await Guru.findById(teacherId);
        if (!teacher || !teacher.noHp) {
            return NextResponse.json({ error: 'Teacher or Phone Number not found' }, { status: 404 });
        }

        const settings = await Setting.findOne({ key: 'wa_auto_report' });
        if (!settings) {
            return NextResponse.json({ error: 'WA Settings not found' }, { status: 404 });
        }

        const greetings = settings.value.greetings || ["Assalamu'alaikum"];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];

        let body = settings.value.messageTemplate || "Berikut *Laporan Progres Jurnal Ramadan* kelas *[KELAS]* untuk Hari ke-[HARI]:\n\n📊 *Statistik:* \n- Sudah Mengisi: *[ISI] Siswa*\n- Belum Mengisi: *[KOSONG] Siswa*\n- Progres: *[PERSEN]%*";

        body = body.replace('[KELAS]', teacher.waliKelas || '')
            .replace('[HARI]', ramadanDay.toString())
            .replace('[ISI]', stats.filled.toString())
            .replace('[KOSONG]', (stats.total - stats.filled).toString())
            .replace('[PERSEN]', stats.percent.toString());

        const finalMessage = `${greeting} *Ustadz/ah ${teacher.nama}*,\n\n${body}\n\nMohon bantuannya untuk mengingatkan santri yang belum mengisi agar segera melengkapi jurnalnya hari ini.\n\nTerima kasih,\n_Admin Karomah BN666_`;

        const result = await sendWhatsAppMessage(teacher.noHp, finalMessage);

        return NextResponse.json({ success: true, result });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
