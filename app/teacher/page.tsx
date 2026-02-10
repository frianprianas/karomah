import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import connectDB from '@/lib/db';
import Siswa from '@/models/Siswa';
import Jurnal from '@/models/Jurnal';
import TeacherDashboardClient from '@/components/TeacherDashboardClient';
import Image from 'next/image';

async function getStudentsWithProgress() {
    await connectDB();

    const students = await Siswa.find().sort({ kelas: 1, nama: 1 }).lean();

    const progressMap = new Map();
    const progress = await Jurnal.aggregate([
        { $group: { _id: "$nis", count: { $sum: 1 } } }
    ]);

    progress.forEach(p => {
        progressMap.set(p._id, p.count);
    });

    return students.map(s => ({
        ...s,
        _id: s._id.toString(),
        filledCount: progressMap.get(s.nis) || 0
    })) as any[];
}

export default async function TeacherDashboard() {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    if (session.role !== 'guru') {
        redirect('/dashboard');
    }

    const students = await getStudentsWithProgress();

    const groupedStudents = students.reduce((acc: any, student) => {
        const k = student.kelas || 'Tanpa Kelas';
        if (!acc[k]) acc[k] = [];
        acc[k].push(student);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pb-20 font-serif">
            <Navbar user={session as any} />

            <main className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col items-center">
                {/* Header / Title Page Effect */}
                <div className="w-full text-center border-b-2 border-double border-[#8d6e63] pb-6 mb-12 mt-4">
                    <div className="flex justify-center mb-6">
                        <div className="p-1 rounded-full border-2 border-[#8d6e63] shadow-sm">
                            <Image src="/logo.jpg" alt="Logo" width={90} height={90} className="rounded-full sepia-[.3]" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-[#3e2723] mb-2 tracking-wide">Ahlan Wa Sahlan</h1>
                    <div className="mt-4 space-y-1 font-serif">
                        <p className="text-2xl text-[#5d4037] font-bold">Ustadz/Ustadzah {(session as any).name}</p>
                        <p className="text-[#8d6e63] text-sm mt-1 uppercase tracking-[0.3em] font-bold">SMK Bakti Nusantara 666</p>
                        <p className="text-[#795548] italic text-xs">Aplikasi Karomah - Jurnal Ramadan 1447 H</p>
                    </div>
                </div>

                <TeacherDashboardClient groupedStudents={groupedStudents} />
            </main>
        </div>
    );
}
