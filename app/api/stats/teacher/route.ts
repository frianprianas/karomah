
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import Siswa from '@/models/Siswa';
import Guru from '@/models/Guru';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'guru') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const teacher = await Guru.findOne({ nipy: (session as any).username }).lean();
        if (!teacher) {
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        }

        // Filter Siswa berdasarkan kelas jika Wali Kelas
        let studentFilter: any = {};
        if (teacher.ket === 'Wali Kelas' && teacher.waliKelas) {
            studentFilter.kelas = teacher.waliKelas.trim();
        }

        const students = await Siswa.find(studentFilter).select('nis nama kelas').lean();
        const nisList = students.map(s => s.nis);
        const totalStudents = students.length;

        // Ambil semua jurnal untuk siswa-siswa tersebut
        const jurnals = await Jurnal.find({ nis: { $in: nisList } }).lean();

        // 1. Progress per Hari (Berapa% siswa isi jurnal per hari Ramadan)
        const dailyProgress: Record<number, number> = {};
        jurnals.forEach(j => {
            const day = j.tgl_jurnal;
            dailyProgress[day] = (dailyProgress[day] || 0) + 1;
        });

        const dailyChartData = Object.entries(dailyProgress).map(([day, count]) => ({
            name: `Hari ${day}`,
            count,
            percentage: Math.round((count / totalStudents) * 100)
        })).sort((a, b) => {
            const dayA = parseInt(a.name.split(' ')[1]);
            const dayB = parseInt(b.name.split(' ')[1]);
            return dayA - dayB;
        });

        // 2. Statistik Sholat Wajib (Rata-rata keberhasilan per waktu sholat)
        const sholatWajib = { subuh: 0, dhuhur: 0, ashar: 0, magrib: 0, isya: 0 };
        jurnals.forEach(j => {
            if (j.sholat_wajib.subuh) sholatWajib.subuh++;
            if (j.sholat_wajib.dhuhur) sholatWajib.dhuhur++;
            if (j.sholat_wajib.ashar) sholatWajib.ashar++;
            if (j.sholat_wajib.magrib) sholatWajib.magrib++;
            if (j.sholat_wajib.isya) sholatWajib.isya++;
        });

        const totalEntries = jurnals.length || 1;
        const sholatChartData = [
            { name: 'Subuh', count: sholatWajib.subuh, percentage: Math.round((sholatWajib.subuh / totalEntries) * 100) },
            { name: 'Dhuhur', count: sholatWajib.dhuhur, percentage: Math.round((sholatWajib.dhuhur / totalEntries) * 100) },
            { name: 'Ashar', count: sholatWajib.ashar, percentage: Math.round((sholatWajib.ashar / totalEntries) * 100) },
            { name: 'Magrib', count: sholatWajib.magrib, percentage: Math.round((sholatWajib.magrib / totalEntries) * 100) },
            { name: 'Isya', count: sholatWajib.isya, percentage: Math.round((sholatWajib.isya / totalEntries) * 100) },
        ];

        // 3. Aktivitas Lainnya
        const extraActivities = {
            sahur: 0,
            tarawih: 0,
            tadarus: 0,
            bantu_ortu: 0
        };
        jurnals.forEach(j => {
            if (j.sahur) extraActivities.sahur++;
            if (j.sholat_sunah.tarawih) extraActivities.tarawih++;
            if (j.tadarus.surat) extraActivities.tadarus++;
            if (j.bantu_ortu.ya_tidak) extraActivities.bantu_ortu++;
        });

        const activitiesChartData = [
            { name: 'Sahur', value: Math.round((extraActivities.sahur / totalEntries) * 100) },
            { name: 'Tarawih', value: Math.round((extraActivities.tarawih / totalEntries) * 100) },
            { name: 'Tadarus', value: Math.round((extraActivities.tadarus / totalEntries) * 100) },
            { name: 'Bantu Ortu', value: Math.round((extraActivities.bantu_ortu / totalEntries) * 100) },
        ];

        return NextResponse.json({
            success: true,
            totalStudents,
            totalEntries,
            dailyChartData,
            sholatChartData,
            activitiesChartData,
            teacherClass: teacher.waliKelas || 'Semua Kelas'
        });

    } catch (error: any) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
