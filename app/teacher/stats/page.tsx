
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, BarChart3, Users, Calendar, CheckCircle2 } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#8d6e63', '#5d4037', '#d7ccc8', '#3e2723', '#a1887f'];

export default function TeacherStatsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/stats/teacher');
                const data = await res.json();
                if (data.success) {
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center font-serif text-[#8d6e63] italic">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#8d6e63] border-t-transparent rounded-full animate-spin"></div>
                    <p>Menghitung data statistik...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center font-serif">
                <p>Gagal memuat data statistik.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pb-20 font-serif">
            <header className="bg-[#5d4037] text-[#fdfbf7] p-4 shadow-md sticky top-0 z-50">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/teacher" className="p-2 hover:bg-[#4e342e] rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-xl font-bold">Statistik Monitoring</h1>
                    </div>
                    <div className="text-xs font-bold bg-[#8d6e63] px-3 py-1 rounded-full border border-white/20">
                        {stats.teacherClass}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-[#d7ccc8] shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-[#efebe9] rounded-lg">
                            <Users className="w-6 h-6 text-[#5d4037]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#8d6e63] font-bold uppercase">Total Siswa</p>
                            <p className="text-2xl font-bold text-[#3e2723]">{stats.totalStudents}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-[#d7ccc8] shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-[#efebe9] rounded-lg">
                            <Calendar className="w-6 h-6 text-[#5d4037]" />
                        </div>
                        <div>
                            <p className="text-xs text-[#8d6e63] font-bold uppercase">Total Entri Jurnal</p>
                            <p className="text-2xl font-bold text-[#3e2723]">{stats.totalEntries}</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-[#d7ccc8] shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-[#e8f5e9] rounded-lg">
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-xs text-[#8d6e63] font-bold uppercase">Rataan Sholat</p>
                            <p className="text-2xl font-bold text-[#3e2723]">
                                {Math.round(stats.sholatChartData.reduce((acc: number, curr: any) => acc + curr.percentage, 0) / 5)}%
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-[#d7ccc8] shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-[#fff3e0] rounded-lg">
                            <BarChart3 className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-[#8d6e63] font-bold uppercase">EFEKTIFITAS</p>
                            <p className="text-2xl font-bold text-[#3e2723]">
                                {stats.totalEntries > 0 ? 'Aktif' : 'Nol'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Daily Progress Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-[#d7ccc8] shadow-md">
                        <h2 className="text-lg font-bold text-[#3e2723] mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-[#8d6e63] rounded-full"></div>
                            Progress Pengisian Harian
                        </h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.dailyChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" stroke="#8d6e63" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#8d6e63" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #d7ccc8', borderRadius: '8px' }}
                                        itemStyle={{ color: '#5d4037', fontWeight: 'bold' }}
                                    />
                                    <Line type="monotone" dataKey="percentage" stroke="#5d4037" strokeWidth={3} dot={{ r: 6, fill: '#8d6e63', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sholat Wajib Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-[#d7ccc8] shadow-md">
                        <h2 className="text-lg font-bold text-[#3e2723] mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
                            Kedisplinan Sholat Wajib
                        </h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.sholatChartData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" stroke="#5d4037" fontSize={12} width={80} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#f8f8f8' }}
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #d7ccc8', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="percentage" name="Persentase" radius={[0, 4, 4, 0]}>
                                        {stats.sholatChartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Activities Chart */}
                    <div className="bg-white p-6 rounded-2xl border border-[#d7ccc8] shadow-md">
                        <h2 className="text-lg font-bold text-[#3e2723] mb-6 flex items-center gap-2">
                            <div className="w-1.5 h-6 bg-amber-600 rounded-full"></div>
                            Partisipasi Aktivitas Utama
                        </h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.activitiesChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.activitiesChartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-center text-xs text-gray-500 mt-2 italic">* Persentase dari total seluruh entri jurnal yang masuk</p>
                    </div>

                    {/* Insight Box */}
                    <div className="bg-[#5d4037] text-[#fdfbf7] p-8 rounded-2xl shadow-xl flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -ml-12 -mb-12"></div>

                        <h2 className="text-2xl font-bold mb-4 relative z-10">Ringkasan Analitik</h2>
                        <p className="text-[#d7ccc8] leading-relaxed relative z-10 mb-6 font-serif italic">
                            "Sesungguhnya kejujuran itu membawa kepada kebaikan, dan kebaikan itu membawa ke Surga."
                        </p>
                        <ul className="space-y-3 relative z-10">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                <span className="text-sm">Rata-rata <b>{Math.round(stats.totalEntries / stats.totalStudents)}</b> hari jurnal telah diisi oleh setiap siswa.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                <span className="text-sm">Waktu sholat dengan tingkat partisipasi terendah adalah <b>{stats.sholatChartData.sort((a: any, b: any) => a.percentage - b.percentage)[0].name}</b>.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                <span className="text-sm"><b>{stats.activitiesChartData.find((a: any) => a.name === 'Tarawih').value}%</b> siswa aktif menjalankan Sholat Tarawih.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
}
