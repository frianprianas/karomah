
'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function SideNavigation({ day, maxDays = 30 }: { day: number, maxDays?: number }) {
    const router = useRouter();

    const goToPrev = () => {
        if (day > 1) router.push(`/journal/${day - 1}`);
    };

    const goToNext = () => {
        if (day < maxDays) router.push(`/journal/${day + 1}`);
    };

    return (
        <div className="fixed inset-y-0 left-0 right-0 pointer-events-none flex items-center justify-between px-2 sm:px-4 z-40">
            {/* Left Button */}
            {day > 1 ? (
                <button
                    onClick={goToPrev}
                    className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#f0e6d2] border-2 border-[#8d6e63] rounded-full shadow-lg text-[#3e2723] opacity-60 hover:opacity-100 active:scale-95 transition-all bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]"
                    title="Halaman Sebelumnya"
                >
                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>
            ) : <div className="w-10 sm:w-12"></div>}

            {/* Right Button */}
            {day < maxDays ? (
                <button
                    onClick={goToNext}
                    className="pointer-events-auto w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#f0e6d2] border-2 border-[#8d6e63] rounded-full shadow-lg text-[#3e2723] opacity-60 hover:opacity-100 active:scale-95 transition-all bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]"
                    title="Halaman Berikutnya"
                >
                    <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 rotate-180" />
                </button>
            ) : <div className="w-10 sm:w-12"></div>}
        </div>
    );
}
