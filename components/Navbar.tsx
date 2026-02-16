
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, BookOpen, User } from 'lucide-react';
import Image from 'next/image';
import { logout } from '@/lib/auth'; // Wait, logout is server action or utility? Need to implement client-side logout handler or API call.

export default function Navbar({ user }: { user?: { name: string; role: string; kelas?: string | null; foto?: string | null } }) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        // Call server action or api to clear cookie
        await fetch('/api/auth/logout', { method: 'POST' }); // Need this route
        router.push('/');
        router.refresh();
    };

    if (pathname === '/login') return null;

    return (
        <nav className="bg-[#f0e6d2] text-[#3e2723] shadow-md relative z-50 border-b-4 border-double border-[#8d6e63] bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                <Link href="/" className="font-serif font-bold flex items-center gap-2 sm:gap-3 decoration-none hover:opacity-80 transition-opacity">
                    <div className="relative shrink-0">
                        <div className="absolute -inset-1 rounded-full bg-[#8d6e63] opacity-20 blur-sm"></div>
                        <Image src="/logo.jpg" alt="Karomah Logo" width={32} height={32} className="relative rounded-full object-cover border-2 border-[#5d4037] sepia-[.2] sm:w-10 sm:h-10" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg sm:text-2xl leading-tight tracking-wide" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.8)' }}>KAROMAH</span>
                        <span className="text-[10px] sm:text-[12px] font-normal text-[#795548] leading-tight">SMK Bakti Nusantara 666</span>
                    </div>
                </Link>

                {user && (
                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="flex flex-col items-end font-serif">
                            <div className="font-bold text-[#4e342e] text-xs sm:text-base whitespace-nowrap">{user.name}</div>
                            <div className="text-[#795548] text-[9px] sm:text-xs font-style-italic uppercase tracking-widest">
                                {user.kelas ? user.kelas : user.role}
                            </div>
                        </div>

                        {/* Stories Link */}
                        <Link
                            href="/stories"
                            className="group flex items-center justify-center p-2 rounded-full border border-[#d7ccc8] hover:bg-[#d7ccc8]/30 transition-all text-[#5d4037]"
                            aria-label="Status Ramadan"
                            title="Status (Stories)"
                        >
                            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Link>
                        <Link
                            href="/profile"
                            className="group flex items-center justify-center p-0.5 rounded-full border border-[#d7ccc8] hover:bg-[#d7ccc8]/30 transition-all text-[#5d4037] overflow-hidden w-8 h-8 sm:w-10 sm:h-10"
                            aria-label="Profil Saya"
                            title="Profil Saya"
                        >
                            {user.foto ? (
                                <img
                                    src={user.foto.startsWith('/uploads/') ? `/api${user.foto}` : user.foto}
                                    alt="Foto Profil"
                                    className="w-full h-full object-cover rounded-full"
                                />
                            ) : (
                                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                        </Link>

                        {/* Compact Logout */}
                        <button
                            onClick={handleLogout}
                            className="group flex items-center justify-center p-2 rounded-full border border-[#d7ccc8] hover:bg-[#d7ccc8]/30 transition-all text-[#5d4037]"
                            aria-label="Logout"
                            title="Tutup Buku (Logout)"
                        >
                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}
