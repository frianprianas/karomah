
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import connectDB from '@/lib/db';
import Jurnal from '@/models/Jurnal';
import Siswa from '@/models/Siswa';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Check, X, Clock, Moon, Sun, BookOpen, Activity, Heart, Users, MapPin, Globe, ExternalLink, Trash2 } from 'lucide-react';
import TeacherNoteInput from '@/components/TeacherNoteInput';
import { JournalImage } from '@/components/JournalImages';
import DownloadReportButton from '@/components/DownloadReportButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getStudentData(nis: string) {
    await connectDB();
    const student = await Siswa.findOne({ nis }).select('nama kelas nis').lean();
    const journals = await Jurnal.find({ nis }).sort({ tgl_jurnal: 1 }).lean();
    return {
        student: student ? { ...student, _id: (student as any)._id.toString() } : null,
        journals: journals.map(j => ({
            ...j,
            _id: (j as any)._id.toString(),
            createdAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
            updatedAt: j.updatedAt ? new Date(j.updatedAt).toISOString() : null
        }))
    };
}

// Helper untuk format sholat
const PRAYER_NAMES = ['subuh', 'dhuhur', 'ashar', 'magrib', 'isya'];
const SUNNAH_NAMES = ['rawatib', 'dhuha', 'tarawih', 'tahajud', 'taubat', 'mutlak', 'hajat'];

export default async function StudentJournalPage({ params }: { params: Promise<{ nis: string }> }) {
    const session = await getSession();

    // Izinkan Guru dan Admin
    if (!session || (session.role !== 'guru' && session.role !== 'admin')) {
        redirect('/');
    }

    const { nis } = await params;
    const { student, journals } = await getStudentData(nis);

    const backLink = session.role === 'admin' ? '/admin/logs' : '/teacher';
    const backText = session.role === 'admin' ? 'Kembali ke Log Aktifitas' : 'Kembali ke Daftar Santri';

    if (!student) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] p-6 font-serif">
                <Navbar user={session as any} />
                <div className="max-w-4xl mx-auto text-center mt-10">
                    <h1 className="text-xl font-bold text-red-600">Siswa tidak ditemukan</h1>
                    <Link href={backLink} className="text-[#8d6e63] hover:underline mt-4 inline-block">Kembali</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pb-20 font-serif">
            <Navbar user={session as any} />

            <main className="max-w-4xl mx-auto p-4 sm:p-6 flex flex-col items-center">
                <div className="w-full">
                    <Link href={backLink} className="inline-flex items-center text-[#8d6e63] mb-6 hover:text-[#3e2723] hover:underline transition-all group">
                        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        {backText}
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

                        {/* Tombol PDF */}
                        <div className="flex justify-center mt-6">
                            <DownloadReportButton student={student} journals={journals} />
                        </div>
                    </div>

                    <div className="space-y-12">
                        {journals.length === 0 ? (
                            <div className="text-center py-16 text-[#8d6e63] italic bg-white/50 rounded-sm border-2 border-dashed border-[#d7ccc8]">
                                Belum ada lembaran jurnal yang tertulis.
                            </div>
                        ) : (
                            journals.map((journal: any) => (
                                <div key={journal._id} className="bg-white rounded-sm border-2 border-[#d7ccc8] overflow-hidden shadow-sm relative">
                                    <div className="absolute -top-6 right-2 p-4 opacity-10 pointer-events-none">
                                        <Image src="/logo.jpg" alt="Watermark" width={100} height={100} className="grayscale" />
                                    </div>

                                    <div className="bg-[#f0e6d2] px-6 py-4 border-b-2 border-[#d7ccc8] flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#5d4037] text-[#fdfbf7] font-bold text-sm border border-[#3e2723]">
                                                {journal.tgl_jurnal}
                                            </span>
                                            <h3 className="font-bold text-[#3e2723] text-lg">Ramadan Hari ke-{journal.tgl_jurnal}</h3>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <span className="text-xs text-[#795548] italic block">Diisi pada:</span>
                                            <span className="text-xs font-bold text-[#5d4037]">
                                                {new Date(journal.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 sm:p-8">
                                        {/* GRID UTAMA */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                                            {/* KOLOM KIRI: IBADAH RUTIN */}
                                            <div className="space-y-6">
                                                {/* Waktu Tidur & Bangun */}
                                                <div className="flex items-center gap-4 bg-[#fdfbf7] p-3 rounded border border-[#efebe9]">
                                                    <div className="flex-1">
                                                        <span className="text-[10px] uppercase text-[#8d6e63] font-bold tracking-wider flex items-center gap-1 mb-1">
                                                            <Moon className="w-3 h-3" /> Jam Tidur
                                                        </span>
                                                        <span className="font-bold text-[#3e2723] text-lg">{journal.jam_tidur || '-'}</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-[#d7ccc8]"></div>
                                                    <div className="flex-1">
                                                        <span className="text-[10px] uppercase text-[#8d6e63] font-bold tracking-wider flex items-center gap-1 mb-1">
                                                            <Sun className="w-3 h-3" /> Jam Bangun
                                                        </span>
                                                        <span className="font-bold text-[#3e2723] text-lg">{journal.jam_bangun || '-'}</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-[#d7ccc8]"></div>
                                                    <div className="flex-1">
                                                        <span className="text-[10px] uppercase text-[#8d6e63] font-bold tracking-wider flex items-center gap-1 mb-1">
                                                            🍽️ Sahur
                                                        </span>
                                                        <span className={`font-bold text-sm ${journal.sahur ? 'text-green-700' : 'text-red-600'}`}>
                                                            {journal.sahur ? 'YA' : 'TIDAK'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Sholat Wajib Detail */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#5d4037] border-b border-[#d7ccc8] pb-2 mb-3 flex items-center gap-2">
                                                        <Clock className="w-4 h-4" /> Sholat Wajib
                                                    </h4>
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {PRAYER_NAMES.map((p) => (
                                                            <div key={p} className={`flex flex-col items-center p-2 rounded border ${journal.sholat_wajib[p] ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                                <span className="text-[10px] uppercase font-bold text-[#5d4037] mb-1">{p}</span>
                                                                {journal.sholat_wajib[p] ?
                                                                    <Check className="w-5 h-5 text-green-600" /> :
                                                                    <X className="w-5 h-5 text-red-500" />
                                                                }
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Sholat Sunnah Detail */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#5d4037] border-b border-[#d7ccc8] pb-2 mb-3 flex items-center gap-2">
                                                        <Heart className="w-4 h-4" /> Sholat Sunnah
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {SUNNAH_NAMES.filter(s => journal.sholat_sunah[s]).length > 0 ? (
                                                            SUNNAH_NAMES.filter(s => journal.sholat_sunah[s]).map(s => (
                                                                <span key={s} className="px-3 py-1 bg-[#efebe9] text-[#5d4037] text-xs font-bold rounded-full border border-[#d7ccc8] capitalize">
                                                                    {s}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Tidak ada sholat sunnah yang dikerjakan.</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Tadarus Detail */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#5d4037] border-b border-[#d7ccc8] pb-2 mb-3 flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4" /> Tadarus Al-Qur'an
                                                    </h4>
                                                    <div className="bg-[#fdfbf7] p-3 rounded border border-[#efebe9] flex justify-between items-center">
                                                        <div>
                                                            <span className="text-[10px] text-[#8d6e63] font-bold uppercase block">Surat</span>
                                                            <span className="text-[#3e2723] font-serif font-medium text-lg">{journal.tadarus?.surat || '-'}</span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-[10px] text-[#8d6e63] font-bold uppercase block">Ayat</span>
                                                            <span className="text-[#3e2723] font-medium">{journal.tadarus?.ayat || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* KOLOM KANAN: AKTIFITAS & IHSAN */}
                                            <div className="space-y-6">

                                                {/* Aktifitas Harian (Olahraga, Bantu Ortu, Sosial) */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#5d4037] border-b border-[#d7ccc8] pb-2 mb-3 flex items-center gap-2">
                                                        <Activity className="w-4 h-4" /> Kegiatan Produktif
                                                    </h4>

                                                    <div className="space-y-4">
                                                        {/* Olahraga */}
                                                        <div className={`p-3 rounded border ${journal.olah_raga?.ya_tidak ? 'bg-[#f1f8e9] border-[#c5e1a5]' : 'bg-gray-50 border-gray-200'}`}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className={`w-2 h-2 rounded-full ${journal.olah_raga?.ya_tidak ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                                                                <span className="font-bold text-xs uppercase text-[#5d4037]">Olahraga</span>
                                                            </div>
                                                            {journal.olah_raga?.ya_tidak && (
                                                                <p className="text-sm text-[#3e2723] mt-1 pl-4 border-l-2 border-green-200">
                                                                    "{journal.olah_raga.kegiatan || 'Tanpa keterangan'}"
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Bantu Ortu */}
                                                        <div className={`p-3 rounded border ${journal.bantu_ortu?.ya_tidak ? 'bg-[#f1f8e9] border-[#c5e1a5]' : 'bg-gray-50 border-gray-200'}`}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className={`w-2 h-2 rounded-full ${journal.bantu_ortu?.ya_tidak ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                                                                <span className="font-bold text-xs uppercase text-[#5d4037]">Bantu Orang Tua</span>
                                                            </div>
                                                            {journal.bantu_ortu?.ya_tidak && (
                                                                <p className="text-sm text-[#3e2723] mt-1 pl-4 border-l-2 border-green-200">
                                                                    "{journal.bantu_ortu.kegiatan || 'Tanpa keterangan'}"
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Aktifitas Sosial */}
                                                        <div className={`p-3 rounded border ${journal.aktifitas_sosial?.ya_tidak ? 'bg-[#f1f8e9] border-[#c5e1a5]' : 'bg-gray-50 border-gray-200'}`}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className={`w-2 h-2 rounded-full ${journal.aktifitas_sosial?.ya_tidak ? 'bg-green-600' : 'bg-gray-400'}`}></div>
                                                                <span className="font-bold text-xs uppercase text-[#5d4037]">Aktifitas Sosial</span>
                                                            </div>
                                                            {journal.aktifitas_sosial?.ya_tidak && (
                                                                <div className="pl-4 border-l-2 border-green-200 mt-1">
                                                                    <p className="text-sm text-[#3e2723] mb-2">
                                                                        "{journal.aktifitas_sosial.kegiatan || 'Tanpa keterangan'}"
                                                                    </p>
                                                                    {journal.aktifitas_sosial.foto && (
                                                                        <div className="w-24 h-24 bg-gray-100 rounded border border-gray-300 overflow-hidden cursor-pointer hover:scale-105 transition-transform">
                                                                            <JournalImage
                                                                                journalId={journal._id}
                                                                                field="aktifitas_sosial"
                                                                                photoUrl={journal.aktifitas_sosial.foto}
                                                                                alt="Foto Sosial"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Catatan Ihsan (Update Tipe, Link, Lokasi) */}
                                                <div>
                                                    <h4 className="text-sm font-bold text-[#5d4037] border-b border-[#d7ccc8] pb-2 mb-3 flex items-center gap-2">
                                                        <Users className="w-4 h-4" /> Catatan Ihsan
                                                    </h4>
                                                    {(journal.catatan_ihsan?.isi || journal.catatan_ihsan?.foto || journal.catatan_ihsan?.link || journal.catatan_ihsan?.lokasi) ? (
                                                        <div className="bg-[#fdfbf7] p-4 rounded border border-[#d7ccc8] relative">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-[#8d6e63]"></div>

                                                            {/* Tipe Badge & Links */}
                                                            <div className='flex flex-wrap gap-2 mb-3'>
                                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 border ${(journal.catatan_ihsan.tipe === 'Daring')
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                    : 'bg-green-50 text-green-700 border-green-200'
                                                                    }`}>
                                                                    {journal.catatan_ihsan.tipe === 'Daring' ? <Globe className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
                                                                    {journal.catatan_ihsan.tipe || 'Langsung'}
                                                                </span>

                                                                {journal.catatan_ihsan.tipe === 'Daring' && journal.catatan_ihsan.link && (
                                                                    <a
                                                                        href={journal.catatan_ihsan.link}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="flex items-center gap-1 text-[10px] text-blue-600 underline hover:text-blue-800"
                                                                    >
                                                                        <ExternalLink className="w-3 h-3" /> Buka Link Sumber
                                                                    </a>
                                                                )}

                                                                {/* Lokasi GPS Display */}
                                                                {journal.catatan_ihsan.tipe === 'Langsung' && journal.catatan_ihsan.lokasi && (
                                                                    <a
                                                                        href={`https://www.google.com/maps/search/?api=1&query=${journal.catatan_ihsan.lokasi}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="flex items-center gap-1 text-[10px] text-green-600 underline hover:text-green-800"
                                                                    >
                                                                        <MapPin className="w-3 h-3" /> Cek Lokasi Maps
                                                                    </a>
                                                                )}
                                                                {journal.catatan_ihsan.tipe === 'Langsung' && !journal.catatan_ihsan.lokasi && (
                                                                    <span className="text-[10px] text-red-400 italic flex items-center gap-1"><MapPin className="w-3 h-3" /> Tidak ada lokasi GPS</span>
                                                                )}
                                                            </div>

                                                            {/* Nama Tempat Display */}
                                                            {journal.catatan_ihsan.tipe === 'Langsung' && journal.catatan_ihsan.nama_tempat && (
                                                                <div className="flex items-center gap-2 text-xs text-[#5d4037] font-bold bg-[#efebe9] px-2 py-1 rounded inline-block mb-3 border border-[#d7ccc8]">
                                                                    <MapPin className="w-3 h-3 text-[#8d6e63]" />
                                                                    <span>{journal.catatan_ihsan.nama_tempat}</span>
                                                                </div>
                                                            )}

                                                            {journal.catatan_ihsan?.isi && (
                                                                <p className="italic text-[#3e2723] text-sm leading-relaxed mb-3">
                                                                    "{journal.catatan_ihsan.isi}"
                                                                </p>
                                                            )}

                                                            {/* Foto Catatan Ihsan */}
                                                            {journal.catatan_ihsan?.foto && (
                                                                <div className="mb-3 inline-block bg-white p-1 border border-gray-200 rounded-sm">
                                                                    <div className="w-full max-w-[200px] h-32 bg-gray-100 overflow-hidden">
                                                                        <JournalImage
                                                                            journalId={journal._id}
                                                                            field="catatan_ihsan"
                                                                            photoUrl={journal.catatan_ihsan.foto}
                                                                            alt="Bukti Ihsan"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="text-right border-t border-[#d7ccc8]/50 pt-2">
                                                                <span className="text-[10px] text-[#8d6e63] font-bold uppercase">Sumber: </span>
                                                                <span className="text-xs font-bold text-[#5d4037]">{journal.catatan_ihsan?.sumber || '-'}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-gray-400 italic">Tidak ada catatan.</p>
                                                    )}
                                                </div>

                                            </div>
                                        </div>

                                        {/* FOOTER: TANDA TANGAN & KOMENTAR GURU */}
                                        <div className="mt-8 pt-6 border-t border-[#d7ccc8] flex flex-col md:flex-row gap-8 items-start">

                                            {/* Bagian Tanda Tangan */}
                                            <div className="w-full md:w-1/3 flex flex-col items-center">
                                                <p className="text-[10px] font-bold text-[#8d6e63] uppercase tracking-widest mb-2">Tanda Tangan Pemateri</p>
                                                <div className="w-full h-24 bg-white border-2 border-dashed border-[#d7ccc8] rounded flex items-center justify-center overflow-hidden">
                                                    {journal.tanda_tangan ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={journal.tanda_tangan} alt="TTD" className="max-h-full max-w-full object-contain" />
                                                    ) : (
                                                        <span className="text-xs text-gray-300 italic">Belum ditandatangani</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Bagian Komentar Guru */}
                                            <div className="w-full md:w-2/3">
                                                <p className="text-[10px] font-bold text-[#8d6e63] uppercase tracking-widest mb-2">Catatan / Komentar Guru</p>
                                                <TeacherNoteInput
                                                    journalId={journal._id || (journal as any)._id}
                                                    nis={student.nis}
                                                    day={journal.tgl_jurnal}
                                                    initialNote={journal.catatan_guru}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div >
    );
}
