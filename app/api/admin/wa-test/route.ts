
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Guru from '@/models/Guru';
import Siswa from '@/models/Siswa';
import Jurnal from '@/models/Jurnal';
import Setting from '@/models/Setting';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const logs: string[] = [];
        logs.push("--- WA AUTO REPORT MANUAL TRIGGER ---");

        // 1. Settings
        const settings = await Setting.findOne({ key: 'wa_auto_report' });
        if (!settings) {
            return NextResponse.json({ error: 'Setting wa_auto_report not found' });
        }
        logs.push(`Feature Enabled: ${settings.value.enabled}`);

        // 2. Wali Kelas
        const allGurus = await Guru.find({}).lean();
        logs.push(`Total Guru in DB: ${allGurus.length}`);

        const waliKelasList = allGurus.filter((t: any) =>
            (t.ket === 'Wali Kelas' || t.ket === 'Keduanya' || t.waliKelas) &&
            t.noHp && t.noHp.length > 5
        );
        logs.push(`Wali Kelas Found: ${waliKelasList.length}`);

        if (waliKelasList.length === 0) {
            return NextResponse.json({ logs, status: 'No teachers found' });
        }

        // 3. One Teacher for Test
        const teacher = waliKelasList[0];
        logs.push(`Testing with: ${teacher.nama} (Kelas: ${teacher.waliKelas}, HP: ${teacher.noHp})`);

        // 4. Students
        const students = await Siswa.find({ kelas: teacher.waliKelas }).lean();
        logs.push(`Students in class: ${students.length}`);

        if (students.length === 0) {
            return NextResponse.json({ logs, status: 'No students in class' });
        }

        // 5. Stats
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        const nowWIB = new Date(utc + (7 * 3600000));
        const startOfDay = new Date(nowWIB);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(nowWIB);
        endOfDay.setHours(23, 59, 59, 999);

        // Ramadan Day
        const ramadanStart = new Date('2026-02-18T00:00:00+07:00');
        const d1 = new Date(ramadanStart.getFullYear(), ramadanStart.getMonth(), ramadanStart.getDate());
        const d2 = new Date(nowWIB.getFullYear(), nowWIB.getMonth(), nowWIB.getDate());
        const diffDays = Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        const ramadanDay = Math.max(1, diffDays + 1);
        logs.push(`Ramadan Day: ${ramadanDay}`);

        const studentNisList = students.map((s: any) => s.nis);
        const journals = await Jurnal.find({
            nis: { $in: studentNisList },
            $or: [
                { tgl_jurnal: ramadanDay },
                { createdAt: { $gte: startOfDay, $lte: endOfDay } }
            ]
        }).lean();
        logs.push(`Journals filled today: ${journals.length}`);

        // 6. Send
        const filledCount = journals.length;
        const totalCount = students.length;
        const percent = Math.round((filledCount / totalCount) * 100);

        const greetings = settings.value.greetings || ["Assalamu'alaikum"];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];

        let body = settings.value.messageTemplate || "Berikut *Laporan Progres Jurnal Ramadan* kelas *[KELAS]* untuk Hari ke-[HARI]:\n\n📊 *Statistik:* \n- Sudah Mengisi: *[ISI] Siswa*\n- Belum Mengisi: *[KOSONG] Siswa*\n- Progres: *[PERSEN]%*";

        body = body.replace('[KELAS]', teacher.waliKelas || '')
            .replace('[HARI]', ramadanDay.toString())
            .replace('[ISI]', filledCount.toString())
            .replace('[KOSONG]', (totalCount - filledCount).toString())
            .replace('[PERSEN]', percent.toString());

        const message = `${greeting} *Ustadz/ah ${teacher.nama}*,\n\n${body}\n\nMohon bantuannya untuk mengingatkan santri yang belum mengisi agar segera melengkapi jurnalnya hari ini.\n\nTerima kasih,\n_Admin Karomah BN666_`;

        logs.push(`Sending message...`);
        const result = await sendWhatsAppMessage(teacher.noHp!, message);
        logs.push(`Result: ${JSON.stringify(result)}`);

        return NextResponse.json({ success: true, logs });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
