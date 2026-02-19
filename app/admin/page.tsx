import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Navbar from '@/components/Navbar';
import AdminManagement from '@/components/AdminManagement';
import AdminStoriesManagement from '@/components/AdminStoriesManagement';
import AdminWaManagement from '@/components/AdminWaManagement';
import AdminSpvManagement from '@/components/AdminSpvManagement';
import { FileText, ArrowLeft } from 'lucide-react';
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

                <div className="flex justify-center mb-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <Link
                        href="/admin/logs"
                        className="flex items-center gap-2 px-8 py-3 bg-[#5d4037] text-[#fdfbf7] rounded-full font-serif font-bold shadow-lg hover:bg-[#3e2723] hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 border-2 border-[#8d6e63] group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <FileText className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">Pantau Log Aktifitas Siswa</span>
                    </Link>
                </div>

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
