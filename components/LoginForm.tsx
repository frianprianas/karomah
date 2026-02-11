
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
                body: JSON.stringify({ id, password, role }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Login failed');

            if (role === 'admin') router.push('/admin');
            else router.push('/dashboard');

            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row bg-[#fdfbf7] md:rounded-lg shadow-2xl overflow-hidden border border-[#d7ccc8] h-[calc(100vh-2rem)] md:h-auto md:min-h-[500px]">

            {/* Left Side (Top on Mobile) - Visual Identity */}
            {/* Di mobile: flex-shrink-0 supaya tidak gepeng, tapi ukurannya kecil */}
            <div className="w-full md:w-5/12 bg-[#efebe9] relative flex flex-col items-center justify-center p-4 md:p-8 border-b md:border-b-0 md:border-r border-[#d7ccc8] overflow-hidden group shrink-0 h-[35%] md:h-auto">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pattern-light.png')] opacity-30"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="relative mb-2 md:mb-6">
                        <Image
                            src="/logo.jpg"
                            alt="Karomah Logo"
                            width={80} // Lebih kecil di mobile (default)
                            height={80}
                            className="rounded-full shadow-lg border-2 md:border-4 border-[#fff] w-16 h-16 md:w-28 md:h-28 object-cover"
                            priority
                        />
                    </div>

                    <h1 className="text-2xl md:text-5xl font-serif font-bold text-[#3e2723] mb-1 tracking-wide drop-shadow-sm">
                        KAROMAH
                    </h1>

                    <div className="w-8 md:w-16 h-0.5 md:h-1 bg-[#8d6e63] rounded-full mb-1 md:mb-3 opacity-60"></div>

                    <p className="text-[#5d4037] font-serif text-[10px] md:text-sm uppercase tracking-[0.1em] md:tracking-[0.2em] font-bold">
                        SMK Bakti Nusantara 666
                    </p>
                </div>
            </div>

            {/* Right Side (Bottom on Mobile) - Login Form */}
            {/* Di mobile: flex-grow supaya mengisi sisa layar */}
            <div className="w-full md:w-7/12 p-4 md:p-10 flex flex-col justify-center bg-white/50 backdrop-blur-sm relative h-[65%] md:h-auto">
                <form onSubmit={handleSubmit} className="space-y-3 md:space-y-6 w-full max-w-sm mx-auto relative z-10 flex flex-col justify-center h-full">

                    {/* Greeting & Role Selector Container */}
                    <div className="text-center md:text-left space-y-2 md:space-y-6">
                        <div className="hidden md:block">
                            <h2 className="text-xl font-serif font-bold text-[#4e342e]">Selamat Datang</h2>
                            <p className="text-[#8d6e63] text-sm">Silakan masuk untuk mengisi jurnal.</p>
                        </div>

                        {/* Role Selector */}
                        <div className="flex p-1 bg-[#efebe9] rounded-lg border border-[#d7ccc8]/50 shadow-inner">
                            {(['siswa', 'guru', 'admin'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-1 md:gap-2 py-1.5 md:py-2 rounded-md font-serif text-[10px] md:text-xs uppercase tracking-wider font-semibold transition-all duration-300",
                                        role === r
                                            ? "bg-white text-[#3e2723] shadow-sm ring-1 ring-[#8d6e63]/20"
                                            : "text-[#8d6e63] hover:bg-[#d7ccc8]/30 hover:text-[#5d4037]"
                                    )}
                                >
                                    {r === 'siswa' && <GraduationCap className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                                    {r === 'guru' && <School className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                                    {r === 'admin' && <Settings className="w-3 h-3 md:w-3.5 md:h-3.5" />}
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-800 p-2 rounded-sm border-l-4 border-red-400 text-[10px] md:text-xs font-serif flex items-center animate-pulse">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <div className="space-y-2 md:space-y-4">
                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1887f] transition-colors group-focus-within:text-[#5d4037]">
                                <User className="w-4 h-4" />
                            </div>
                            <input
                                type="text"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 md:py-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#8d6e63] focus:ring-1 focus:ring-[#8d6e63] outline-none font-serif text-[#3e2723] placeholder-[#d7ccc8] transition-all text-xs md:text-sm shadow-sm"
                                placeholder={role === 'siswa' ? 'Nomor Induk Siswa' : (role === 'guru' ? 'NIPY Guru' : 'Username Admin')}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1887f] transition-colors group-focus-within:text-[#5d4037]">
                                <Lock className="w-4 h-4" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 md:py-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#8d6e63] focus:ring-1 focus:ring-[#8d6e63] outline-none font-serif text-[#3e2723] placeholder-[#d7ccc8] transition-all text-xs md:text-sm shadow-sm"
                                placeholder="Kata Sandi"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#5d4037] text-[#f0e6d2] font-serif font-bold py-2.5 md:py-3 rounded-sm shadow-md border-b-4 border-[#3e2723] active:border-b-0 active:translate-y-1 active:shadow-none hover:bg-[#4e342e] transition-all flex items-center justify-center gap-2 group text-xs md:text-sm mt-2"
                    >
                        {loading ? '...' : 'Masuk Aplikasi'}
                    </button>

                    {/* Footer Mobile Only */}
                    <div className="text-center md:hidden pt-2">
                        <p className="text-[9px] text-[#8d6e63]/70 font-serif">
                            &copy; 2026 Edisi Ramadan
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
