import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import Siswa from '@/models/Siswa';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import TeacherNoteInput from '@/components/TeacherNoteInput';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getStudentData(nis: string) {
    await connectDB();
    const student = await Siswa.findOne({ nis }).select('nama kelas nis').lean();
    const journals = await Jurnal.find({ nis }).sort({ tgl_jurnal: 1 }).lean();
    return {
        student: student ? { ...student, _id: (student as any)._id.toString() } : null,
        journals: journals.map(j => ({ ...j, _id: (j as any)._id.toString() }))
    };
}

export default async function StudentJournalPage({ params }: { params: Promise<{ nis: string }> }) {
    const session = await getSession();

    if (!session || session.role !== 'guru') {
        redirect('/');
    }

    const { nis } = await params;
    const { student, journals } = await getStudentData(nis);

    if (!student) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] p-6 font-serif">
                <Navbar user={session as any} />
                <div className="max-w-4xl mx-auto text-center mt-10">
                    <h1 className="text-xl font-bold text-red-600">Siswa tidak ditemukan</h1>
                    <Link href="/teacher" className="text-[#8d6e63] hover:underline mt-4 inline-block">Kembali</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pb-20 font-serif">
            <Navbar user={session as any} />

            <main className="max-w-3xl mx-auto p-4 sm:p-6 flex flex-col items-center">
                <div className="w-full">
                    <Link href="/teacher" className="inline-flex items-center text-[#8d6e63] mb-6 hover:text-[#3e2723] hover:underline transition-all group">
                        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Kembali ke Daftar Santri
                    </Link>

                    {/* Header Card */}
                    <div className="bg-[#f0e6d2] p-8 rounded-sm border-2 border-[#8d6e63] mb-10 shadow-md relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]">
                        <div className="absolute inset-2 border border-dashed border-[#8d6e63] opacity-30 pointer-events-none"></div>

                        <div className="flex justify-center mb-4">
                            <div className="p-1 rounded-full border-2 border-[#8d6e63] shadow-inner bg-white/20">
                                <Image src="/logo.jpg" alt="Logo" width={70} height={70} className="rounded-full sepia-[.3]" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-serif font-bold text-[#3e2723] text-center">{student.nama}</h1>
                        <p className="text-center text-[#795548] italic mb-4">Kelas {student.kelas} • NIS: {student.nis}</p>

                        <div className="w-24 h-0.5 bg-[#8d6e63] mx-auto my-4 opacity-40"></div>

                        <div className="flex justify-center gap-12 mt-4">
                            <div className="text-center">
                                <span className="block text-[#8d6e63] uppercase text-[10px] tracking-widest font-bold">Total Jurnal</span>
                                <span className="font-bold text-[#5d4037] text-2xl">{journals.length} / 30</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-[#8d6e63] uppercase text-[10px] tracking-widest font-bold">Progress</span>
                                <span className="font-bold text-[#5d4037] text-2xl">{Math.round((journals.length / 30) * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {journals.length === 0 ? (
                            <div className="text-center py-16 text-[#8d6e63] italic bg-white/50 rounded-sm border-2 border-dashed border-[#d7ccc8]">
                                Belum ada lembaran jurnal yang tertulis.
                            </div>
                        ) : (
                            journals.map((journal: any) => (
                                <div key={journal._id} className="bg-white rounded-sm border-2 border-[#d7ccc8] overflow-hidden shadow-sm relative">
                                    <div className="absolute inset-1 border border-dashed border-[#8d6e63] opacity-5 pointer-events-none"></div>

                                    <div className="bg-[#f0e6d2] px-6 py-4 border-b-2 border-[#d7ccc8] flex justify-between items-center bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]">
                                        <h3 className="font-bold text-[#3e2723] text-lg">Ramadan Hari ke-{journal.tgl_jurnal}</h3>
                                        <div className="text-right">
                                            <span className="text-xs text-[#795548] italic block">Tgl Pengisian:</span>
                                            <span className="text-xs font-bold text-[#5d4037]">
                                                {new Date(journal.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                                            {/* Summary of key activities */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between border-b border-[#d7ccc8]/50 pb-2">
                                                    <span className="text-[#795548]">Jam Bangun</span>
                                                    <span className="font-bold text-[#3e2723]">{journal.jam_bangun || '-'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-[#d7ccc8]/50 pb-2">
                                                    <span className="text-[#795548]">Sahur</span>
                                                    <span className={journal.sahur ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
                                                        {journal.sahur ? "Dilaksanakan" : "Tidak"}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-[#d7ccc8]/50 pb-2">
                                                    <span className="text-[#795548]">Sholat Wajib</span>
                                                    <span className="font-bold text-[#3e2723]">
                                                        {Object.values(journal.sholat_wajib).filter(Boolean).length} / 5 Waktu
                                                    </span>
                                                </div>
                                                <div className="flex justify-between border-b border-[#d7ccc8]/50 pb-2">
                                                    <span className="text-[#795548]">Sholat Sunnah</span>
                                                    <span className="font-bold text-[#3e2723]">
                                                        {Object.values(journal.sholat_sunah).filter(Boolean).length} Amalan
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between border-b border-[#d7ccc8]/50 pb-2">
                                                    <span className="text-[#795548]">Tadarus</span>
                                                    <span className="font-bold text-[#3e2723] whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                        {journal.tadarus?.surat ? `${journal.tadarus.surat}` : '-'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${journal.olah_raga?.ya_tidak ? 'bg-green-600' : 'bg-[#d7ccc8]'}`}></div>
                                                        <span className="text-[#795548] text-[11px] uppercase tracking-wider">Olahraga</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${journal.bantu_ortu?.ya_tidak ? 'bg-green-600' : 'bg-[#d7ccc8]'}`}></div>
                                                        <span className="text-[#795548] text-[11px] uppercase tracking-wider">Bantu Ortu</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full ${journal.aktifitas_sosial?.ya_tidak ? 'bg-green-600' : 'bg-[#d7ccc8]'}`}></div>
                                                        <span className="text-[#795548] text-[11px] uppercase tracking-wider">Sosial</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {journal.catatan_ihsan?.isi && (
                                                <div className="col-span-1 sm:col-span-2 bg-[#fdfbf7] p-4 rounded-sm border border-[#d7ccc8] mt-2 relative">
                                                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#8d6e63]"></div>
                                                    <p className="text-[10px] font-bold text-[#8d6e63] uppercase tracking-widest mb-2">Ringkasan Ceramah / Ihsan</p>
                                                    <p className="italic text-[#3e2723] leading-relaxed">"{journal.catatan_ihsan.isi}"</p>
                                                    <p className="text-[11px] text-right text-[#795548] mt-2 font-bold">— {journal.catatan_ihsan.sumber}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Teacher Note Input Component */}
                                        <TeacherNoteInput
                                            journalId={journal._id || (journal as any)._id}
                                            nis={student.nis}
                                            day={journal.tgl_jurnal}
                                            initialNote={journal.catatan_guru}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
