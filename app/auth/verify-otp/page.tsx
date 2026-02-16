
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowRight, Mail, MessageSquare } from 'lucide-react';
import BookFrame from '@/components/BookFrame';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function OTPContent() {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const method = searchParams.get('method') || 'email';

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length < 6) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: otpCode })
            });

            const data = await res.json();
            if (res.ok) {
                router.push('/admin');
            } else {
                setError(data.error || 'Terjadi kesalahan');
            }
        } catch (err) {
            setError('Gagal menghubungkan ke server');
        } finally {
            setLoading(false);
        }
    };

    // Auto-submit when all digits filled
    useEffect(() => {
        if (otp.join('').length === 6) {
            handleSubmit();
        }
    }, [otp]);

    return (
        <div className="max-w-md w-full bg-[#fdfbf7] p-8 rounded-sm border-2 border-[#8d6e63] shadow-xl relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
            {/* Decorative Dashed Border */}
            <div className="absolute inset-2 border border-dashed border-[#8d6e63] opacity-30 pointer-events-none"></div>

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#5d4037]/10 mb-4 border border-[#5d4037]/20">
                    <ShieldCheck className="w-8 h-8 text-[#5d4037]" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#3e2723] mb-2">Verifikasi Admin</h1>
                <p className="text-[#795548] text-sm italic font-serif">
                    Masukkan 6 digit kode keamanan yang kami kirimkan.
                </p>
            </div>

            <div className={cn(
                "p-4 rounded-sm border mb-8 flex items-start gap-3",
                method === 'whatsapp' ? "bg-[#e8f5e9] border-[#2e7d32]/30" : "bg-[#f0e6d2] border-[#8d6e63]/30"
            )}>
                {method === 'whatsapp' ? (
                    <MessageSquare className="w-5 h-5 text-[#2e7d32] shrink-0 mt-0.5" />
                ) : (
                    <Mail className="w-5 h-5 text-[#8d6e63] shrink-0 mt-0.5" />
                )}
                <div className="text-xs text-[#5d4037] leading-relaxed">
                    <p className="font-bold mb-1">Cek {method === 'whatsapp' ? 'WhatsApp' : 'Email'} Anda</p>
                    <p>
                        {method === 'whatsapp'
                            ? 'Silakan cari kode OTP di pesan masuk WhatsApp Anda.'
                            : 'Silakan cari kode OTP di kotak masuk (inbox) atau folder SPAM email Anda.'
                        }
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            className="w-10 h-14 sm:w-12 sm:h-16 text-center text-3xl font-bold bg-white border-2 border-[#d7ccc8] rounded-sm focus:border-[#5d4037] focus:ring-1 focus:ring-[#5d4037] outline-none text-[#3e2723] transition-all"
                        />
                    ))}
                </div>

                {error && (
                    <div className="text-red-600 text-sm text-center font-serif bg-red-50 p-2 border border-red-200 rounded-sm">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || otp.join('').length < 6}
                    className={cn(
                        "w-full flex items-center justify-center gap-2 py-4 rounded-sm border-b-4 font-serif font-bold text-lg transition-all",
                        loading || otp.join('').length < 6
                            ? "bg-[#d7ccc8] text-[#8d6e63] border-[#a1887f]"
                            : "bg-[#5d4037] text-[#fdfbf7] border-[#3e2723] hover:bg-[#4e342e] active:border-b-0 active:translate-y-1 shadow-md"
                    )}
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        <>
                            <span>Verifikasi Sekarang</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center text-[10px] text-[#8d6e63] uppercase tracking-widest font-serif">
                Akses Terbatas - SMK Bakti Nusantara 666
            </div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <BookFrame singlePage={true}>
            <div className="w-full h-full flex items-center justify-center p-4">
                <Suspense fallback={<div className="text-[#5d4037] font-serif">Memuat Verifikasi...</div>}>
                    <OTPContent />
                </Suspense>
            </div>
        </BookFrame>
    );
}
