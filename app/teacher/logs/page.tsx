
'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft, Search, Calendar, ChevronRight, MessageCircle, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface LogEntry {
    _id: string;
    nis: string;
    nama: string;
    kelas: string;
    hari_ke: string | number; // Bisa angka (jurnal) atau text pertanyaan
    tanggal_isi: string;
    type?: 'jurnal' | 'qna' | 'status' | 'biodata';
}

function TeacherLogsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State dari URL atau Default
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialSearch = searchParams.get('search') || '';

    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(initialSearch);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Fetch Data Function
    const fetchLogs = async (p: number, s: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/logs?page=${p}&limit=20&search=${s}`);
            const data = await res.json();

            if (data.data) {
                setLogs(data.data);
                setTotalPages(data.pagination.totalPages);
                setTotalItems(data.pagination.total);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    // Effect saat search/page berubah
    useEffect(() => {
        // Debounce search sedikit agar tidak spam API
        const timer = setTimeout(() => {
            fetchLogs(page, search);
        }, 500);

        return () => clearTimeout(timer);
    }, [page, search]);

    // Update URL tanpa refresh halaman saat filter berubah
    useEffect(() => {
        const params = new URLSearchParams();
        if (page > 1) params.set('page', page.toString());
        if (search) params.set('search', search);

        router.replace(`/teacher/logs?${params.toString()}`);
    }, [page, search, router]);

    return (
        <div className="min-h-screen bg-[#fdfbf7] font-serif">

            <header className="bg-[#5d4037] text-[#fdfbf7] p-4 shadow-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/teacher" className="p-2 hover:bg-[#4e342e] rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-xl font-bold">Log Aktifitas Siswa</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 sm:p-6">

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-sm border border-[#d7ccc8] shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-20 z-40">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari Nama Siswa / Kelas..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset ke hal 1 jika search berubah
                            }}
                            className="w-full pl-9 p-2 border border-[#d7ccc8] rounded-sm focus:ring-[#8d6e63] focus:border-[#5d4037] text-sm outline-none"
                        />
                    </div>
                    <div className="text-xs text-[#8d6e63] font-bold">
                        Total: {totalItems} Data
                    </div>
                </div>

                {/* Log List */}
                <div className="space-y-4">
                    {loading ? (
                        // Skeleton Loading
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="animate-pulse bg-white p-4 h-24 rounded border border-[#d7ccc8]"></div>
                        ))
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 italic">
                            Tidak ada data log yang ditemukan.
                        </div>
                    ) : (
                        logs.map((log) => {
                            const getBorderColor = () => {
                                switch (log.type) {
                                    case 'qna': return 'border-l-blue-600';
                                    case 'status': return 'border-l-green-600';
                                    case 'biodata': return 'border-l-amber-600';
                                    default: return 'border-l-[#8d6e63]';
                                }
                            };

                            const getIcon = () => {
                                switch (log.type) {
                                    case 'qna': return <MessageCircle className="w-3 h-3 text-blue-500" />;
                                    case 'status': return <span className="text-xs">💬</span>;
                                    case 'biodata': return <User className="w-3 h-3 text-amber-500" />;
                                    default: return <Calendar className="w-3 h-3 text-[#8d6e63]" />;
                                }
                            };

                            return (
                                <div key={log._id} className={`bg-white p-4 rounded-sm border-l-4 border-y border-r border-gray-200 shadow-sm hover:shadow-md transition-shadow relative group ${getBorderColor()}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            {log.type === 'qna' ? (
                                                <div className="text-[#3e2723] text-sm md:text-base leading-relaxed font-serif">
                                                    Pada tanggal <span className="font-bold">{new Date(log.tanggal_isi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>,
                                                    siswa <span className="font-bold text-[#5d4037] underline">{log.nama}</span> ({log.kelas})
                                                    telah <span className="font-bold text-blue-700">mengajukan pertanyaan</span>:
                                                    <div className="mt-2 text-sm italic bg-blue-50 p-2 border-l-2 border-blue-400 text-blue-900 rounded-r line-clamp-2">
                                                        "{log.hari_ke}"
                                                    </div>
                                                </div>
                                            ) : log.type === 'status' ? (
                                                <div className="text-[#3e2723] text-sm md:text-base leading-relaxed font-serif">
                                                    Pada tanggal <span className="font-bold">{new Date(log.tanggal_isi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>,
                                                    siswa <span className="font-bold text-[#5d4037] underline">{log.nama}</span> ({log.kelas})
                                                    telah <span className="font-bold text-green-700">mengupdate status</span>:
                                                    <div className="mt-2 text-sm italic bg-green-50 p-2 border-l-2 border-green-400 text-green-900 rounded-r line-clamp-2">
                                                        "{log.hari_ke}"
                                                    </div>
                                                </div>
                                            ) : log.type === 'biodata' ? (
                                                <p className="text-[#3e2723] text-sm md:text-base leading-relaxed font-serif">
                                                    Pada tanggal <span className="font-bold">{new Date(log.tanggal_isi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>,
                                                    siswa <span className="font-bold text-[#5d4037] underline">{log.nama}</span> ({log.kelas})
                                                    telah <span className="font-bold text-amber-700">memperbarui biodata</span> profilnya.
                                                </p>
                                            ) : (
                                                <p className="text-[#3e2723] text-sm md:text-base leading-relaxed font-serif">
                                                    Pada tanggal <span className="font-bold">{new Date(log.tanggal_isi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>,
                                                    siswa <span className="font-bold text-[#5d4037] underline">{log.nama}</span> ({log.kelas})
                                                    telah mengisi jurnal hari ke-<span className="font-bold bg-[#efebe9] px-2 py-0.5 rounded-full border border-[#d7ccc8]">{log.hari_ke}</span>.
                                                </p>
                                            )}

                                            <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                                {getIcon()}
                                                {new Date(log.tanggal_isi).toLocaleDateString('id-ID', { weekday: 'long', hour: '2-digit', minute: '2-digit' })} WIB
                                            </p>
                                        </div>

                                        {log.type === 'qna' ? (
                                            <Link
                                                href="/teacher/qna"
                                                className="sm:w-auto w-full text-center px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-colors rounded-sm shadow-sm whitespace-nowrap"
                                            >
                                                Jawab
                                            </Link>
                                        ) : log.type === 'jurnal' ? (
                                            <Link
                                                href={`/teacher/student/${log.nis}`}
                                                className="sm:w-auto w-full text-center px-4 py-2 bg-[#fdfbf7] border border-[#d7ccc8] text-[#8d6e63] text-xs font-bold uppercase tracking-wider hover:bg-[#8d6e63] hover:text-white transition-colors rounded-sm shadow-sm whitespace-nowrap"
                                            >
                                                Lihat Detail
                                            </Link>
                                        ) : (
                                            <Link
                                                href={`/teacher/student/${log.nis}`}
                                                className="sm:w-auto w-full text-center px-4 py-2 bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors rounded-sm shadow-sm whitespace-nowrap"
                                            >
                                                Lihat Profil
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2 text-sm font-bold text-[#5d4037] bg-white border border-[#d7ccc8] rounded">
                            Halaman {page} dari {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function LogsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-serif italic text-[#8d6e63]">Memuat Log Aktifitas...</div>}>
            <TeacherLogsContent />
        </Suspense>
    );
}
