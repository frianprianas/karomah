
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

// Inline component usage to avoid props
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
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, password, role }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Redirect based on role
            if (role === 'admin') {
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
        <div className="relative w-full max-w-md perspective-1000">
            {/* Book Cover Aesthetic */}
            <div className="bg-[#2c1810] p-3 rounded-r-2xl rounded-l-md shadow-2xl transform rotate-y-3 border-l-8 border-[#3e2723] relative z-10">
                {/* Gold filigree corners or border */}
                <div className="bg-[#f0e6d2] p-8 rounded-r-xl rounded-l-sm border-4 border-double border-[#8b5a2b] relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]">

                    {/* Decorative corners */}
                    <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#8b5a2b] rounded-tl-lg"></div>
                    <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#8b5a2b] rounded-tr-lg"></div>
                    <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#8b5a2b] rounded-bl-lg"></div>
                    <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#8b5a2b] rounded-br-lg"></div>

                    <div className="text-center mb-8 flex flex-col items-center">
                        <div className="mb-4 relative">
                            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-700 to-yellow-300 opacity-60 blur-sm"></div>
                            <Image
                                src="/logo.jpg"
                                alt="Karomah Logo"
                                width={80}
                                height={80}
                                className="relative rounded-full object-cover border-4 border-[#8b5a2b]"
                            />
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-[#5d4037] mb-1 tracking-wide" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.5)' }}>KAROMAH</h1>
                        <p className="text-[#8d6e63] font-serif text-[10px] uppercase tracking-[0.2em] mb-1">SMK Bakti Nusantara 666</p>
                        <div className="w-16 h-1 bg-[#8b5a2b] my-2"></div>
                        <p className="text-[#6d4c41] font-serif italic text-sm">Buku Digital Ramadan</p>
                    </div>

                    <div className="flex gap-1 p-1 bg-[#e6d8c3] rounded-lg mb-6 border border-[#cbbca0]">
                        <button
                            onClick={() => setRole('siswa')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1 py-2 rounded-md font-serif text-[11px] sm:text-xs transition-all",
                                role === 'siswa' ? "bg-white text-[#5d4037] shadow-sm border border-[#d7ccc8]" : "text-[#795548] hover:bg-[#d7ccc8]/50"
                            )}
                        >
                            <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                            Siswa
                        </button>
                        <button
                            onClick={() => setRole('guru')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1 py-2 rounded-md font-serif text-[11px] sm:text-xs transition-all",
                                role === 'guru' ? "bg-white text-[#5d4037] shadow-sm border border-[#d7ccc8]" : "text-[#795548] hover:bg-[#d7ccc8]/50"
                            )}
                        >
                            <School className="w-3 h-3 sm:w-4 sm:h-4" />
                            Guru
                        </button>
                        <button
                            onClick={() => setRole('admin')}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1 py-2 rounded-md font-serif text-[11px] sm:text-xs transition-all",
                                role === 'admin' ? "bg-white text-[#5d4037] shadow-sm border border-[#d7ccc8]" : "text-[#795548] hover:bg-[#d7ccc8]/50"
                            )}
                        >
                            <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                            Admin
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-800 p-3 rounded border border-red-200 text-sm font-serif text-center">
                                * {error} *
                            </div>
                        )}

                        <div>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5a2b] w-4 h-4" />
                                <input
                                    type="text"
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    className="pl-9 w-full p-2.5 bg-white/50 border-b-2 border-[#bcaaa4] focus:border-[#5d4037] transition-all outline-none font-serif text-[#4e342e] placeholder-[#a1887f]"
                                    placeholder={role === 'siswa' ? 'Nomor Induk Siswa' : (role === 'guru' ? 'NIPY Guru' : 'Username Admin')}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5a2b] w-4 h-4" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-9 w-full p-2.5 bg-white/50 border-b-2 border-[#bcaaa4] focus:border-[#5d4037] transition-all outline-none font-serif text-[#4e342e] placeholder-[#a1887f]"
                                    placeholder="Kata Sandi"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#5d4037] text-[#f0e6d2] font-serif font-bold py-3 rounded mt-6 border-b-4 border-[#3e2723] active:border-b-0 hover:bg-[#4e342e] hover:-translate-y-px active:translate-y-1 transition-all shadow-md"
                        >
                            {loading ? 'Membuka...' : 'Buka Buku'}
                        </button>

                        <p className="text-center mt-6 text-xs text-[#795548] font-serif">
                            &copy; 2024 Karomah Edition • SMK BN 666
                        </p>
                    </form>
                </div>
            </div>
            {/* Page edge effect */}
            <div className="absolute top-2 bottom-2 right-2 w-4 bg-gray-200 z-0 rounded-r-sm border-l border-gray-300 skew-y-1"></div>
        </div>
    );
}
