'use client';

import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, XCircle, Search, BarChart3, Users, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminMonitoring({ role }: { role: string }) {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalSiswa: 0,
        totalGuru: 0,
        filledToday: 0,
        fillRate: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    const [classes, setClasses] = useState<string[]>([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [searchStudent, setSearchStudent] = useState('');

    useEffect(() => {
        fetchStats();
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchClassData(selectedClass);
        }
    }, [selectedClass]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await fetch('/api/admin/journal'); // No param = get classes
            const data = await res.json();
            if (Array.isArray(data)) {
                setClasses(data);
                if (data.length > 0) setSelectedClass(data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    const fetchClassData = async (kelas: string) => {
        setLoadingData(true);
        try {
            const res = await fetch(`/api/admin/journal?kelas=${encodeURIComponent(kelas)}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setStudents(data);
            }
        } catch (error) {
            console.error('Failed to fetch class data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const filteredStudents = students.filter(s =>
        s.nama.toLowerCase().includes(searchStudent.toLowerCase()) ||
        s.nis.includes(searchStudent)
    );

    return (
        <section className="w-full mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* 1. STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-xl border-2 border-[#d7ccc8] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-800">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase">Total Siswa</p>
                        <h3 className="text-2xl font-bold text-[#3e2723]">{loadingStats ? '...' : stats.totalSiswa}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border-2 border-[#d7ccc8] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-100 rounded-full text-amber-800">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase">Total Guru</p>
                        <h3 className="text-2xl font-bold text-[#3e2723]">{loadingStats ? '...' : stats.totalGuru}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border-2 border-[#d7ccc8] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-800">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase">Mengisi Hari Ini</p>
                        <h3 className="text-2xl font-bold text-[#3e2723]">{loadingStats ? '...' : stats.filledToday}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border-2 border-[#d7ccc8] shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 rounded-full text-indigo-800">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold uppercase">Persentase</p>
                        <h3 className="text-2xl font-bold text-[#3e2723]">{loadingStats ? '...' : `${stats.fillRate}%`}</h3>
                    </div>
                </div>
            </div>

            {/* 2. JOURNAL MONITORING */}
            <div className="bg-white rounded-xl border-2 border-[#d7ccc8] shadow-sm overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                <div className="p-6 border-b border-[#d7ccc8] bg-[#efebe9]/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#5d4037] rounded-lg shadow-sm">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-[#3e2723] font-serif">Monitoring Jurnal Harian</h3>
                            <p className="text-xs text-[#5d4037]">Cek kelengkapan pengisian jurnal per kelas</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Filter className="w-4 h-4 text-[#8d6e63]" />
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="bg-white border border-[#d7ccc8] text-[#3e2723] text-sm rounded-lg focus:ring-[#8d6e63] focus:border-[#5d4037] block w-full md:w-48 p-2.5 outline-none font-bold"
                        >
                            {classes.map(cls => (
                                <option key={cls} value={cls}>{cls}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full p-3 pl-10 text-sm text-[#3e2723] border border-[#d7ccc8] rounded-lg bg-[#fdfbf7] focus:ring-[#8d6e63] focus:border-[#5d4037] outline-none"
                            placeholder="Cari Nama Siswa..."
                            value={searchStudent}
                            onChange={(e) => setSearchStudent(e.target.value)}
                        />
                    </div>

                    {loadingData ? (
                        <div className="text-center py-10 text-gray-500 italic">Memuat data kelas...</div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 italic">Belum ada data siswa di kelas ini.</div>
                    ) : (
                        <div className="overflow-x-auto rounded-lg border border-[#d7ccc8]">
                            <table className="w-full text-sm text-left text-gray-500">
                                <thead className="text-xs text-[#fdfbf7] uppercase bg-[#5d4037]">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nama Siswa</th>
                                        <th scope="col" className="px-6 py-3 text-center">Status Jurnal Hari Ini</th>
                                        <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student) => (
                                        <tr key={student.nis} className="bg-white border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-[#3e2723] whitespace-nowrap">
                                                {student.nama}
                                                <div className="text-xs text-gray-400 font-normal">{student.nis}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {student.jurnalFilled ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-green-200">
                                                            <CheckCircle className="w-3 h-3 mr-1" /> Sudah Mengisi
                                                        </span>
                                                        {student.sedangHalangan && (
                                                            <span className="inline-flex items-center bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded-full border border-pink-200 font-bold uppercase tracking-tighter">
                                                                Sdg Halangan
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-red-200">
                                                        <XCircle className="w-3 h-3 mr-1" /> Belum Mengisi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => router.push(`/teacher/student/${student.nis}`)}
                                                    className="font-medium text-[#8d6e63] hover:underline hover:text-[#5d4037]"
                                                >
                                                    Lihat Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
