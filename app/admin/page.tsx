import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AdminManagement from '@/components/AdminManagement';
import AdminWaManagement from '@/components/AdminWaManagement';
import AdminSpvManagement from '@/components/AdminSpvManagement';
import AdminStoriesManagement from '@/components/AdminStoriesManagement';
import AdminMonitoring from '@/components/AdminMonitoring';
import AdminRecap from '@/components/AdminRecap';
import { FileText, ArrowLeft, History, Users, Database } from 'lucide-react';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const session = await getSession();

    if (!session || (session.role !== 'admin' && session.role !== 'spv')) {
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pb-20 font-serif">
            <Navbar user={session as any} />

            <main className="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col items-center">
                {/* Header Section */}
                <div className="w-full text-center border-b-2 border-double border-[#8d6e63] pb-6 mb-8 mt-4">
                    <div className="flex justify-center mb-6">
                        <div className="p-1 rounded-full border-2 border-[#8d6e63] shadow-sm">
                            <Image src="/logo.jpg" alt="Logo" width={80} height={80} className="rounded-full sepia-[.3]" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-[#3e2723] mb-2">Manuskrip Administrasi</h1>
                    <p className="text-[#5d4037] italic">Pengelolaan Data Santri & Pengajar Karomah</p>
                    <p className="text-[#8d6e63] text-xs mt-2 uppercase tracking-[0.3em] font-bold">SMK Bakti Nusantara 666</p>
                    {session.role === 'spv' && (
                        <div className="mt-2 inline-block bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                            <span className="text-amber-800 text-xs font-bold font-mono">Supervisor (Read-Only)</span>
                        </div>
                    )}
                </div>

                {/* --- NEW: Monitoring Section (Statistik & Jurnal) --- */}
                <AdminMonitoring role={session.role} />

                {/* --- NEW: Recap Section --- */}
                <AdminRecap />

                {/* --- Menu Cards --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 w-full mt-10 mb-10">
                    {/* Card 1: Log Aktivitas */}
                    <Link href="/admin/logs" className="group relative overflow-hidden bg-white p-6 rounded-xl border border-[#d7ccc8] shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className="absolute inset-0 bg-[#5d4037]/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-xl"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="p-3 bg-[#efebe9] text-[#5d4037] rounded-full group-hover:bg-[#5d4037] group-hover:text-white transition-colors">
                                <History className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#3e2723]">Log Aktifitas Siswa</h3>
                                <p className="text-xs text-[#8d6e63] italic group-hover:text-[#5d4037] transition-colors">
                                    Pantau pengisian jurnal, QnA, dan update status secara realtime.
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Card 2: Kelola Data Master (Only Admin, but maybe SPV can view?) - Let's stick to management component logic */}
                    <div className="group relative overflow-hidden bg-white p-6 rounded-xl border border-[#d7ccc8] shadow-sm">
                        <div className="flex items-center gap-4 opacity-70">
                            <div className="p-3 bg-[#efebe9] text-[#5d4037] rounded-full">
                                <Database className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#3e2723]">Data Master</h3>
                                <p className="text-xs text-[#8d6e63] italic">
                                    Pengelolaan data Siswa dan Guru ada di tabel bawah.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Existing Management Components */}
                <AdminManagement userRole={session.role} />

                {/* WhatsApp Auto-Report Management: Visible to Admin & SPV (Read-Only for SPV handled in component) */}
                <AdminWaManagement userRole={session.role} />

                {/* SPV Management: ONLY Visible to Super Admin */}
                {session.role === 'admin' && <AdminSpvManagement />}

                {/* Moderasi Stories */}
                <AdminStoriesManagement />
            </main>
        </div>
    );
}
