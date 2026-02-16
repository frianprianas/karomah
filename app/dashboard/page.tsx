
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { CheckCircle } from 'lucide-react';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import WelcomeModal from '@/components/WelcomeModal';
import QnAFloatingButton from '@/components/QnAFloatingButton';
import StoriesFloatingButton from '@/components/StoriesFloatingButton';

export const dynamic = 'force-dynamic';

async function getJournalStatus(nis: string) {
    await connectDB();
    const journals = await Jurnal.find({ nis }).select('tgl_jurnal jam_tidur');

    const statusMap = new Map<number, 'full' | 'partial'>();

    journals.forEach((j: { tgl_jurnal: number; jam_tidur?: string }) => {
        if (j.jam_tidur && j.jam_tidur.trim().length > 0) {
            statusMap.set(j.tgl_jurnal, 'full');
        } else {
            statusMap.set(j.tgl_jurnal, 'partial');
        }
    });

    return statusMap;
}

import Siswa from '@/models/Siswa';

export default async function Dashboard() {
    const session = await getSession();

    if (!session) {
        redirect('/');
    }

    if (session.role === 'guru') {
        redirect('/teacher');
    }

    if (session.role === 'admin') {
        redirect('/admin');
    }

    await connectDB();
    const student = await Siswa.findOne({ nis: (session as any).username }).select('foto status statusUpdatedAt nama kelas nis').lean();
    const journalStatus = await getJournalStatus((session as any).username);

    // Check status expiration (24 hours)
    let showStatus = false;
    if (student?.status && student?.statusUpdatedAt) {
        const diff = new Date().getTime() - new Date(student.statusUpdatedAt).getTime();
        const hours = diff / (1000 * 3600);
        if (hours < 24) showStatus = true;
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pb-20">
            <Navbar user={{ ...session as any, foto: student?.foto }} />

            <main className="max-w-4xl mx-auto p-6 flex flex-col items-center">
                {/* Header / Title Page Effect */}
                <div className="w-full text-center border-b-2 border-double border-[#8d6e63] pb-6 mb-8 mt-4">
                    <div className="flex justify-center mb-4">
                        <div className="p-1 rounded-full border-2 border-[#8d6e63] shadow-sm overflow-hidden w-[88px] h-[88px]">
                            {student?.foto ? (
                                <img
                                    src={student.foto}
                                    alt="Foto Profil"
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <img src="/logo.jpg" alt="Logo" className="rounded-full sepia-[.3] w-20 h-20" />
                            )}
                        </div>
                    </div>
                    <h1 className="text-4xl font-serif font-bold text-[#3e2723] mb-2 tracking-wide">Ahlan Wa Sahlan</h1>

                    <div className="mt-4 space-y-1 font-serif">
                        <p className="text-2xl text-[#5d4037] font-bold">{student?.nama || (session as any).name}</p>

                        {/* Status / Motto Display */}
                        {showStatus && (
                            <div className="max-w-md mx-auto my-2 px-4">
                                <p className="text-[#8d6e63] italic text-sm font-serif relative inline-block">
                                    <span className="text-xl absolute -left-2 -top-1 opacity-40">“</span>
                                    {student?.status}
                                    <span className="text-xl absolute -right-2 -bottom-2 opacity-40">”</span>
                                </p>
                            </div>
                        )}
                        <div className="flex justify-center gap-4 text-[#795548] text-sm italic">
                            <span>NIS: {(session as any).username}</span>
                            <span>•</span>
                            <span>Kelas: {(session as any).kelas || (session as any).role}</span>
                        </div>
                    </div>

                    <p className="text-[#8d6e63] text-sm mt-4 font-serif uppercase tracking-widest font-bold">SMK Bakti Nusantara 666</p>
                    <p className="text-[#795548] text-xs mt-1 font-serif">Jurnal Ramadan 1447 Hijriyah</p>
                </div>

                <WelcomeModal />

                <h2 className="text-2xl font-serif font-bold text-[#3e2723] mb-6 relative">

                    <span className="bg-[#fdfbf7] px-4 relative z-10">Daftar Isi Jurnal</span>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-[1px] bg-[#8d6e63] -z-0"></div>
                </h2>

                <div className="flex flex-wrap justify-center gap-4 text-[#4e342e] font-serif text-sm opacity-80 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-[#8d6e63] bg-[#efebe9]"></div>
                        <span>Belum Diisi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-[#fbc02d] bg-[#fff9c4]"></div>
                        <span>Proses</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-[#2e7d32] bg-[#c8e6c9]"></div>
                        <span>Selesai</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 w-full max-w-3xl">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                        const status = journalStatus.get(day);
                        let borderClass = "border-[#d7ccc8] bg-[#efebe9] text-[#8d6e63] hover:border-[#8d6e63] hover:bg-[#d7ccc8]";

                        if (status === 'full') {
                            borderClass = "border-[#2e7d32] bg-[#e8f5e9] text-[#1b5e20] shadow-md";
                        } else if (status === 'partial') {
                            borderClass = "border-[#fbc02d] bg-[#fffde7] text-[#f57f17]";
                        }

                        return (
                            <Link
                                key={day}
                                href={`/journal/${day}`}
                                className={`
                                    relative p-4 rounded-sm border-2 flex flex-col items-center justify-center transition-all duration-300
                                    font-serif group cursor-pointer
                                    ${borderClass}
                                `}
                                style={{ boxShadow: status === 'full' ? 'inset 0 0 10px rgba(46, 125, 50, 0.1)' : 'none' }}
                            >
                                {/* Decorative internal border */}
                                <div className="absolute inset-1 border border-dashed border-current opacity-30 pointer-events-none"></div>

                                <span className="text-xs uppercase tracking-widest opacity-70 mb-1">Hari</span>
                                <span className="text-3xl font-bold">{day}</span>

                                {status === 'full' && (
                                    <div className="absolute top-1 right-1">
                                        <CheckCircle className="w-3 h-3" />
                                    </div>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </main>

            {/* Floating Action Button untuk Tanya Jawab */}
            <QnAFloatingButton />

            {/* Floating Action Button untuk Status (Stories) */}
            <StoriesFloatingButton />
        </div>
    );
}
