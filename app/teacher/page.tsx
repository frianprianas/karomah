import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import connectDB from '@/lib/db';
import Siswa from '@/models/Siswa';
import Jurnal from '@/models/Jurnal';
import TanyaJawab from '@/models/TanyaJawab';
import TeacherDashboardClient from '@/components/TeacherDashboardClient';
import Link from 'next/link';
import Image from 'next/image';
import { FileText, MessageCircle, AlertTriangle } from 'lucide-react';
import StoriesFloatingButton from '@/components/StoriesFloatingButton';

export const dynamic = 'force-dynamic';

import { calculatePoints } from '@/lib/gamification';

async function getStudentsWithProgress() {
    await connectDB();

    const students = await Siswa.find().sort({ kelas: 1, nama: 1 }).lean();
    const nisList = students.map(s => s.nis);

    // Fetch all journals for all students to calculate points
    const jurnals = await Jurnal.find({ nis: { $in: nisList } }).lean();

    const statsMap = new Map<string, { count: number, points: number }>();

    jurnals.forEach((j: any) => {
        const stats = statsMap.get(j.nis) || { count: 0, points: 0 };
        stats.count += 1;
        stats.points += calculatePoints(j);
        statsMap.set(j.nis, stats);
    });

    return students.map(s => {
        const stats = statsMap.get(s.nis) || { count: 0, points: 0 };
        return {
            ...s,
            _id: s._id.toString(),
            filledCount: stats.count,
            totalPoints: stats.points
        };
    }) as any[];
}

import Guru from '@/models/Guru';

export default async function TeacherDashboard() {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    if (session.role !== 'guru') {
        redirect('/dashboard');
    }

    await connectDB();
    const teacher = await Guru.findOne({ nipy: (session as any).username }).lean();

    console.log("--- DEBUG DASHBOARD GURU ---");
    console.log("Guru Logged In:", (session as any).name);
    console.log("Guru NIPY:", (session as any).username);
    console.log("Guru Data from DB:", JSON.stringify(teacher, null, 2));

    const allStudents = await getStudentsWithProgress();
    console.log("Total Students fetched:", allStudents.length);

    // Filter data sampah (kelas 'nama', 'nis', dll) yang mungkin lolos dari DB
    let students = allStudents.filter(s => {
        const k = s.kelas ? s.kelas.toLowerCase().trim() : '';
        // Pastikan kelas valid (bukan header CSV dan panjang > 1)
        return k && k.length > 1 && !['nama', 'nis', 'kelas', 'password', 'no'].includes(k);
    });

    console.log("Total Valid Students:", students.length);

    // Filter berdasarkan Role Guru
    if (teacher) {
        console.log("Checking Filter Rule...");
        console.log("Teacher Role (ket):", teacher.ket);
        console.log("Teacher Wali Kelas:", teacher.waliKelas);

        // Jika hanya Wali Kelas (bukan Guru PAI/Keduanya), filter hanya kelas yang diampu
        if (teacher.ket === 'Wali Kelas') {
            const targetClass = teacher.waliKelas ? teacher.waliKelas.trim().toLowerCase() : '';
            console.log("Filtering for target class:", targetClass);

            students = students.filter(s => {
                const studentClass = s.kelas ? s.kelas.trim().toLowerCase() : '';
                // console.log(`Comparing student class '${studentClass}' with '${targetClass}'`); 
                return studentClass && studentClass === targetClass;
            });
            console.log("Students after filter:", students.length);
        } else {
            console.log("Teacher is PAI/Keduanya, showing all students.");
        }
    } else {
        console.log("Teacher data not found in DB!");
    }
    console.log("---------------------------");

    const groupedStudents = students.reduce((acc: any, student) => {
        const k = student.kelas || 'Tanpa Kelas';
        if (!acc[k]) acc[k] = [];
        acc[k].push(student);
        return acc;
    }, {});

    const pendingQuestionsCount = await TanyaJawab.countDocuments({
        id_guru: (session as any).username,
        status: 'menunggu'
    });

    return (
        <div className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pb-20 font-serif">
            <Navbar user={{ ...session as any, foto: teacher?.foto }} />

            <main className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col items-center">
                {/* Header / Title Page Effect */}
                <div className="w-full text-center border-b-2 border-double border-[#8d6e63] pb-6 mb-12 mt-4">
                    <div className="flex justify-center mb-6">
                        <div className="p-1 rounded-full border-2 border-[#8d6e63] shadow-sm w-[94px] h-[94px] overflow-hidden">
                            {teacher?.foto ? (
                                <img src={teacher.foto.startsWith('/uploads/') ? `/api${teacher.foto}` : teacher.foto} alt="Foto Profil" className="rounded-full object-cover w-full h-full" />
                            ) : (
                                <img src="/logo.jpg" alt="Logo" className="rounded-full sepia-[.3] w-full h-full" />
                            )}
                        </div>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-[#3e2723] mb-2 tracking-wide">Ahlan Wa Sahlan</h1>
                    <div className="mt-4 space-y-1 font-serif">
                        <p className="text-2xl text-[#5d4037] font-bold">Ustadz/Ustadzah {(session as any).name}</p>
                        <p className="text-[#8d6e63] text-sm mt-1 uppercase tracking-[0.3em] font-bold">SMK Bakti Nusantara 666</p>
                        <p className="text-[#795548] italic text-xs">Aplikasi Karomah - Jurnal Ramadan 1447 H</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10 w-full max-w-2xl px-4">
                    <Link
                        href="/teacher/logs"
                        className="flex-1 flex justify-center items-center gap-2 px-6 py-3 bg-[#5d4037] text-[#fdfbf7] rounded-full font-serif font-bold shadow-lg hover:bg-[#3e2723] hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 border-2 border-[#8d6e63] group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <FileText className="w-5 h-5 relative z-10" />
                        <span className="relative z-10 text-sm whitespace-nowrap">Log Aktifitas Siswa</span>
                    </Link>

                    <Link
                        href="/teacher/stats"
                        className="flex-1 flex justify-center items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-full font-serif font-bold shadow-lg hover:bg-emerald-800 hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 border-2 border-emerald-900 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span className="relative z-10 text-sm whitespace-nowrap">Statistik Monitoring</span>
                    </Link>

                    {/* Hanya Guru PAI atau Guru Keduanya (Wali Kelas & Guru PAI) yang bisa melihat Tanya Jawab */}
                    {teacher && (teacher.ket === 'Guru PAI' || teacher.ket === 'Keduanya') && (
                        <Link
                            href="/teacher/qna"
                            className={`flex-1 flex justify-center items-center gap-2 px-6 py-3 rounded-full font-serif font-bold shadow-lg transition-all hover:-translate-y-1 active:scale-95 border-2 group relative overflow-hidden ${pendingQuestionsCount > 0
                                ? 'bg-yellow-400 text-[#3e2723] border-yellow-600 hover:bg-yellow-300 animate-pulse-subtle'
                                : 'bg-[#fdfbf7] text-[#5d4037] border-[#5d4037] hover:bg-[#efebe9]'
                                }`}
                        >
                            <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ${pendingQuestionsCount > 0 ? 'bg-white/20' : 'bg-[#5d4037]/10'}`}></div>

                            <div className="relative z-10 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                <span className="text-sm whitespace-nowrap">Tanya Jawab Santri</span>

                                {pendingQuestionsCount > 0 && (
                                    <span className="ml-1 bg-red-600 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                        {pendingQuestionsCount}
                                    </span>
                                )}
                            </div>
                        </Link>
                    )}
                </div>

                <TeacherDashboardClient groupedStudents={groupedStudents} />
            </main>

            {/* Floating Action Button untuk Status (Stories) */}
            <StoriesFloatingButton />
        </div>
    );
}
