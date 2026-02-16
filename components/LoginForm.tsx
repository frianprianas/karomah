
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, GraduationCap, School, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: string[]) {
    return twMerge(clsx(inputs));
}

export default function LoginForm() {
    const [role, setRole] = useState<'siswa' | 'guru' | 'admin'>('siswa');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [otpMethod, setOtpMethod] = useState<'email' | 'whatsapp'>('email');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password, role, otpMethod }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            if (data.needsOTP) {
                router.push(`/auth/verify-otp?method=${otpMethod}`);
            } else if (role === 'admin') {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }

            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col md:flex-row items-center justify-center relative overflow-hidden">

            {/* Watermark Background for Mobile - Logo Besar Pudar */}
            <div className="absolute inset-0 pointer-events-none md:hidden flex items-center justify-center opacity-[0.03]">
                <Image
                    src="/logo.jpg"
                    width={400}
                    height={400}
                    alt="Watermark"
                    className="grayscale"
                />
            </div>

            {/* Container Desktop: Card Style. Mobile: Full Width/Height Transparent Container */}
            <div className="w-full h-full md:h-auto md:max-w-[900px] flex flex-col md:flex-row bg-transparent md:bg-[#fdfbf7] md:rounded-lg md:shadow-2xl md:border border-[#d7ccc8] overflow-hidden z-10">

                {/* --- HEADER IDENTITY --- */}
                {/* Mobile: Bagian Atas Halaman */}
                <div className="w-full md:w-5/12 bg-transparent md:bg-[#efebe9] relative flex flex-col items-center justify-end pb-4 pt-12 md:py-10 md:px-8 border-b md:border-b-0 md:border-r border-transparent md:border-[#d7ccc8]">
                    {/* Pattern Desktop */}
                    <div className="hidden md:block absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pattern-light.png')] opacity-30"></div>

                    <div className="relative z-10 flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-700">

                        {/* Judul Tambahan di Atas Logo */}
                        <div className="mb-6 md:mb-8 text-center space-y-1">
                            <h2 className="font-serif text-lg md:text-xl text-[#5d4037] font-semibold tracking-wide">
                                Catatan Harian Bulan Ramadan
                            </h2>
                            <p className="font-serif text-xl md:text-2xl text-[#3e2723] font-medium" dir="rtl" lang="ar">
                                ملاحظات يومية لشهر رمضان
                            </p>
                        </div>

                        <div className="mb-3 md:mb-4 relative">
                            <div className="absolute -inset-4 bg-[#8d6e63]/20 blur-xl rounded-full md:hidden"></div>
                            <Image
                                src="/logo.jpg"
                                alt="Karomah Logo"
                                width={120}
                                height={120}
                                // Mobile: Logo w-24 h-24
                                className="rounded-full shadow-lg border-[4px] border-white w-48 h-48 md:w-32 md:h-32 object-cover relative z-10"
                                priority
                            />
                        </div>

                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#3e2723] mb-1 tracking-wide drop-shadow-sm">
                            KAROMAH
                        </h1>
                        <div className="h-0.5 w-12 bg-[#8d6e63]/50 rounded-full mb-2"></div>
                        <p className="text-[#5d4037] font-serif text-xs md:text-sm uppercase tracking-[0.2em] font-bold">
                            SMK Bakti Nusantara 666
                        </p>
                    </div>
                </div>

                {/* --- FORM SECTION --- */}
                {/* Mobile: Bagian Tengah/Bawah Halaman */}
                <div className="w-full md:w-7/12 flex-grow flex flex-col justify-start md:justify-center p-6 md:p-10 bg-transparent md:bg-white/60 backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto flex flex-col gap-5 md:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

                        {/* Greeting Desktop */}
                        <div className="hidden md:block text-left">
                            <h2 className="text-2xl font-serif font-bold text-[#4e342e]">Selamat Datang</h2>
                            <p className="text-[#8d6e63] text-sm mt-1">Silakan masuk untuk mengisi jurnal.</p>
                        </div>

                        {/* Role Selector */}
                        <div className="bg-white/80 backdrop-blur-sm p-1.5 rounded-xl border border-[#d7ccc8] shadow-sm flex gap-1">
                            {(['siswa', 'guru', 'admin'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={cn(
                                        "flex-1 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 py-2 rounded-lg font-serif text-[10px] md:text-xs uppercase tracking-wider font-bold transition-all duration-300",
                                        role === r
                                            ? "bg-[#5d4037] text-[#f0e6d2] shadow-md transform scale-105"
                                            : "text-[#8d6e63] hover:bg-[#d7ccc8]/30 hover:text-[#5d4037]"
                                    )}
                                >
                                    {r === 'siswa' && <GraduationCap className="w-4 h-4" />}
                                    {r === 'guru' && <School className="w-4 h-4" />}
                                    {r === 'admin' && <Settings className="w-4 h-4" />}
                                    <span className="mt-0.5 md:mt-0">{r}</span>
                                </button>
                            ))}
                        </div>

                        {/* OTP Method Selector (Only for Admin) */}
                        {role === 'admin' && (
                            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-[#8d6e63] ml-1">Kirim OTP Lewat:</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setOtpMethod('email')}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-serif text-[11px] font-bold border transition-all",
                                            otpMethod === 'email'
                                                ? "bg-[#efebe9] border-[#5d4037] text-[#3e2723] shadow-inner"
                                                : "border-[#d7ccc8] text-[#8d6e63] hover:bg-[#efebe9]/50"
                                        )}
                                    >
                                        <Image src="https://www.google.com/s2/favicons?domain=gmail.com&sz=32" width={14} height={14} alt="Email" className="grayscale opacity-70" />
                                        EMAIL
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setOtpMethod('whatsapp')}
                                        className={cn(
                                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-serif text-[11px] font-bold border transition-all",
                                            otpMethod === 'whatsapp'
                                                ? "bg-[#e8f5e9] border-[#2e7d32] text-[#1b5e20] shadow-inner"
                                                : "border-[#d7ccc8] text-[#8d6e63] hover:bg-[#e8f5e9]/50"
                                        )}
                                    >
                                        <Image src="https://www.google.com/s2/favicons?domain=whatsapp.com&sz=32" width={14} height={14} alt="WA" className="grayscale opacity-70" />
                                        WHATSAPP
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-200 text-xs font-serif flex items-center shadow-sm">
                                <span className="mr-2 text-lg">⚠️</span> {error}
                            </div>
                        )}

                        <div className="space-y-4 bg-white/50 p-4 rounded-2xl border border-[#d7ccc8]/50 shadow-sm md:shadow-none md:bg-transparent md:p-0 md:border-0">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8d6e63] group-focus-within:text-[#5d4037] transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <input
                                    type="text"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#d7ccc8] rounded-xl focus:border-[#5d4037] focus:ring-4 focus:ring-[#8d6e63]/10 outline-none font-serif text-[#3e2723] placeholder-[#bcaaa4] transition-all text-sm font-medium"
                                    placeholder={role === 'siswa' ? 'Nomor Induk Siswa' : (role === 'guru' ? 'NIPY Guru' : 'Username Admin')}
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8d6e63] group-focus-within:text-[#5d4037] transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#d7ccc8] rounded-xl focus:border-[#5d4037] focus:ring-4 focus:ring-[#8d6e63]/10 outline-none font-serif text-[#3e2723] placeholder-[#bcaaa4] transition-all text-sm font-medium"
                                    placeholder="Kata Sandi"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#5d4037] to-[#4e342e] text-[#f0e6d2] font-serif font-bold py-4 rounded-xl shadow-lg shadow-[#5d4037]/30 border-b-4 border-[#3e2723] active:border-b-0 active:translate-y-1 active:shadow-none hover:brightness-110 transition-all flex items-center justify-center gap-2 text-sm tracking-wide mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-[#f0e6d2] border-t-transparent rounded-full animate-spin"></div>
                            ) : 'MASUK APLIKASI'}
                        </button>

                        <div className="text-center mt-6 md:hidden">
                            <p className="text-[10px] text-[#8d6e63]/60 font-serif font-semibold tracking-widest uppercase">
                                — Edisi Ramadan 2026 —
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
