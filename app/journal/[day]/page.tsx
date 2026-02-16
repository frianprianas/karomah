
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import JournalEntryForm from '@/components/JournalEntryForm';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import SideNavigation from '@/components/SideNavigation';
import QnAFloatingButton from '@/components/QnAFloatingButton';
import StoriesFloatingButton from '@/components/StoriesFloatingButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getJournal(nis: string, day: number) {
    await connectDB();
    const journal = await Jurnal.findOne({ nis, tgl_jurnal: day } as any).lean();
    console.log(`FETCHED JOURNAL DAY ${day} for ${nis}:`, journal ? (journal as any).catatan_guru : 'NOT FOUND');
    return journal;
}

import Siswa from '@/models/Siswa';

export default async function JournalPage({ params }: { params: Promise<{ day: string }> }) {
    const session = await getSession();
    if (!session || session.role !== 'siswa') {
        redirect('/');
    }

    const { day } = await params;
    const dayNum = parseInt(day);

    if (isNaN(dayNum) || dayNum < 1 || dayNum > 30) {
        redirect('/dashboard');
    }

    // --- SEQUENTIAL LOCK CHECK ---
    if (dayNum > 1) {
        await connectDB();
        const prevDayJournal = await Jurnal.findOne({
            nis: (session as any).username,
            tgl_jurnal: dayNum - 1
        });

        const isPrevFull = prevDayJournal && prevDayJournal.jam_tidur && prevDayJournal.jam_tidur.trim().length > 0;

        if (!isPrevFull) {
            redirect('/dashboard');
        }
    }

    const existingData = await getJournal((session as any).username, dayNum);
    // Ensure serialization
    const serializedData = existingData ? JSON.parse(JSON.stringify(existingData)) : undefined;

    // Fetch Student Profile
    const student = await Siswa.findOne({ nis: (session as any).username }).select('foto status statusUpdatedAt nama').lean();

    // Check status expiration (24 hours)
    let showStatus = false;
    if (student?.status && student?.statusUpdatedAt) {
        const diff = new Date().getTime() - new Date(student.statusUpdatedAt).getTime();
        const hours = diff / (1000 * 3600);
        if (hours < 24) showStatus = true;
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pb-20 font-serif">
            <Navbar user={{ ...session as any, foto: student?.foto }} />

            <main className="max-w-3xl mx-auto p-4 sm:p-6">
                <Link href="/dashboard" className="inline-flex items-center text-[#8d6e63] mb-6 hover:text-[#3e2723] transition-colors group">
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Daftar Isi
                </Link>

                <div className="bg-[#f0e6d2] text-[#3e2723] p-6 rounded-sm border-2 border-[#8d6e63] mb-8 shadow-sm relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]">
                    {/* Decorative internal dashed border */}
                    <div className="absolute inset-2 border border-dashed border-[#8d6e63] opacity-30 pointer-events-none"></div>

                    <div className="flex justify-center mb-4">
                        <div className="p-1 rounded-full border-2 border-[#8d6e63] shadow-inner bg-white/20 w-[68px] h-[68px] overflow-hidden">
                            {student?.foto ? (
                                <img
                                    src={student.foto.startsWith('/uploads/') ? `/api${student.foto}` : student.foto}
                                    alt="Foto Profil"
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <img src="/logo.jpg" alt="Logo" className="rounded-full sepia-[.3] w-full h-full" />
                            )}
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-center mb-1 uppercase tracking-tighter">
                        Lembaran Hari ke-{day}
                    </h1>
                    <p className="text-[#795548] text-center italic text-sm">SMK Bakti Nusantara 666</p>

                    {showStatus && (
                        <div className="max-w-md mx-auto mt-3 px-4 text-center">
                            <p className="text-[#5d4037] text-xs font-serif italic opacity-80 border-t border-b border-[#8d6e63]/30 py-1 inline-block">
                                “{student?.status}”
                            </p>
                        </div>
                    )}

                </div >

                <div className="bg-white/50 p-1 rounded-sm border border-[#d7ccc8] mb-8">
                    <JournalEntryForm key={dayNum} day={dayNum} initialData={serializedData} />
                </div>

                <SideNavigation day={dayNum} canGoNext={serializedData?.jam_tidur?.trim()?.length > 0} />

                <div className="mt-8 flex justify-between items-center bg-[#f0e6d2] p-4 rounded-sm border-2 border-[#8d6e63] shadow-sm bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]">
                    {dayNum > 1 ? (
                        <Link
                            href={`/journal/${dayNum - 1}`}
                            className="inline-flex items-center gap-2 text-[#5d4037] font-bold hover:text-[#3e2723] px-3 py-2 rounded transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Halaman Sebelumnya</span>
                            <span className="sm:hidden">Hari {dayNum - 1}</span>
                        </Link>
                    ) : (
                        <div></div> // Spacer
                    )}

                    {dayNum < 30 && serializedData?.jam_tidur?.trim()?.length > 0 ? (
                        <Link
                            href={`/journal/${dayNum + 1}`}
                            className="inline-flex items-center gap-2 text-[#5d4037] font-bold hover:text-[#3e2723] px-3 py-2 rounded transition-all"
                        >
                            <span className="hidden sm:inline">Halaman Berikutnya</span>
                            <span className="sm:hidden">Hari {dayNum + 1}</span>
                            <ChevronLeft className="w-5 h-5 rotate-180" />
                        </Link>
                    ) : (
                        <div></div> // Spacer
                    )}
                </div>
            </main >

            <QnAFloatingButton />
            <StoriesFloatingButton />
        </div >
    );
}
