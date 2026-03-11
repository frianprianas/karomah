'use client';

import { useState, useEffect } from 'react';
import { Download, Search, CheckCircle, FileSpreadsheet, RefreshCw, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminRecap() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
    });

    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchData(1, search);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const fetchData = async (page: number, searchQuery: string = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/recap?page=${page}&limit=${pagination.limit}&search=${encodeURIComponent(searchQuery)}`);
            const json = await res.json();
            if (json.data) {
                setData(json.data);
                setPagination(json.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch recap:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchData(newPage, search);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Fetch all data for export
            const res = await fetch(`/api/admin/recap?export=true&search=${encodeURIComponent(search)}`);
            const json = await res.json();

            if (json.data && json.data.length > 0) {
                // Dynamically import xlsx from window if using script tag, or module
                const XLSX = await import('xlsx');
                import('file-saver').then(FileSaver => {
                    const exportData = json.data.map((item: any, index: number) => ({
                        'No': index + 1,
                        'NIS': item.nis,
                        'Nama': item.nama,
                        'Kelas': item.kelas,
                        'Total Mengisi (Hari)': item.totalIsi,
                        'Mengisi Murni (Hari)': item.murniIsi,
                        'Halangan/Udzur (Hari)': item.halangan,
                        'Persentase Pengisian': `${item.persentase}%`
                    }));

                    const worksheet = XLSX.utils.json_to_sheet(exportData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Rekap Jurnal");
                    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
                    FileSaver.saveAs(data, `Rekap_Jurnal_Karomah_${new Date().getTime()}.xlsx`);
                });
            } else {
                alert("Tidak ada data untuk diekspor");
            }
        } catch (error) {
            console.error("Export error:", error);
            alert("Gagal melakukan export");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <section className="w-full mt-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white rounded-xl border-2 border-[#d7ccc8] shadow-sm overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">

                {/* Header Sub-Component */}
                <div className="p-6 border-b border-[#d7ccc8] bg-[#fdfbf7] flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 border border-green-200 rounded-lg shadow-sm">
                            <FileSpreadsheet className="w-6 h-6 text-green-700" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-[#3e2723] font-serif">Rekap Keseluruhan & Poin</h3>
                            <p className="text-xs text-[#5d4037]">Data agregasi jurnal, poin persentase dan Export ke Excel.</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d6e63]" />
                            <input
                                type="text"
                                placeholder="Cari Siswa/Kelas..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border-2 border-[#d7ccc8] rounded-full focus:border-[#5d4037] outline-none text-sm text-[#3e2723]"
                            />
                        </div>
                        <button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-full font-bold shadow-sm transition-colors text-sm disabled:opacity-50"
                        >
                            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isExporting ? 'Memproses...' : 'Export Excel'}
                        </button>
                    </div>
                </div>

                {/* Table Area */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-[#3e2723]">
                        <thead className="text-xs uppercase bg-[#5d4037] text-white">
                            <tr>
                                <th scope="col" className="px-6 py-4 rounded-tl-lg">Informasi Siswa</th>
                                <th scope="col" className="px-6 py-4 text-center">Total Isi</th>
                                <th scope="col" className="px-6 py-4 text-center">Rincian<br /><span className="text-[9px] text-orange-200">(Murni / Udzur)</span></th>
                                <th scope="col" className="px-6 py-4 text-center">Persentase</th>
                                <th scope="col" className="px-6 py-4 text-center rounded-tr-lg">Detail</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-[#8d6e63] font-serif italic">
                                        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#5d4037]" />
                                        Merekap data lembaran...
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-[#8d6e63] font-serif italic border-b border-[#d7ccc8]/50">
                                        Belum ada santri atau tidak ada hasil pencarian.
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, idx) => (
                                    <tr key={item.nis} className="bg-white/50 border-b border-[#d7ccc8] hover:bg-white transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-base text-[#3e2723]">{item.nama}</div>
                                            <div className="text-xs text-[#8d6e63] mt-1 flex gap-2">
                                                <span className="bg-[#f0e6d2] px-2 py-0.5 rounded font-bold border border-[#d7ccc8]">{item.kelas}</span>
                                                <span className="font-mono text-gray-500">{item.nis}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-lg">
                                            {item.totalIsi} <span className="text-xs font-normal text-gray-500">hari</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded shadow-inner" title="Isi Murni">
                                                    {item.murniIsi}
                                                </div>
                                                <span className="text-gray-300">/</span>
                                                <div className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded shadow-inner" title="Halangan/Udzur">
                                                    {item.halangan}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`text-sm font-bold px-2.5 py-1 rounded-full border ${item.persentase >= 80 ? 'bg-green-100 text-green-800 border-green-200' : item.persentase >= 50 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
                                                    {item.persentase}%
                                                </span>
                                                {/* Progress bar visual indicator */}
                                                <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                                                    <div
                                                        className={`h-full ${item.persentase >= 80 ? 'bg-green-500' : item.persentase >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${item.persentase}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => router.push(`/teacher/student/${item.nis}`)}
                                                className="p-2 text-[#5d4037] bg-[#f0e6d2] hover:bg-[#5d4037] hover:text-white rounded-lg transition-colors shadow-sm"
                                                title="Lihat Detail Jurnal Siswa"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && data.length > 0 && pagination.totalPages > 1 && (
                    <div className="p-4 bg-[#fdfbf7] border-t border-[#d7ccc8] flex flex-col md:flex-row justify-between items-center gap-4">
                        <span className="text-sm text-[#8d6e63] font-serif">
                            Halaman <span className="font-bold text-[#3e2723]">{pagination.page}</span> dari <span className="font-bold text-[#3e2723]">{pagination.totalPages}</span>
                            <span className="mx-2">|</span> Total: {pagination.total} Siswa
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 border border-[#8d6e63] rounded-md text-[#5d4037] hover:bg-[#efebe9] disabled:opacity-50 transition-colors font-bold text-sm"
                            >
                                Prev
                            </button>

                            <div className="flex border rounded-md overflow-hidden bg-white">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    // Sederhana pagination slider math
                                    let pageNum = pagination.page - 2 + i;
                                    if (pagination.page <= 3) pageNum = i + 1;
                                    else if (pagination.page >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;

                                    if (pageNum < 1 || pageNum > pagination.totalPages) return null;

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 text-sm font-bold border-r last:border-r-0 ${pageNum === pagination.page ? 'bg-[#5d4037] text-white' : 'text-[#5d4037] hover:bg-[#efebe9]'}`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className="px-4 py-2 border border-[#8d6e63] rounded-md text-[#5d4037] hover:bg-[#efebe9] disabled:opacity-50 transition-colors font-bold text-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
