
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';

export default function StoriesFloatingButton() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Hide on stories page itself and login page
    if (pathname === '/stories' || pathname === '/') return null;
    if (!mounted) return null;

    return createPortal(
        <div className="fixed bottom-8 left-4 sm:left-8 z-[9999] group animate-bounce-slow">
            <Link
                href="/stories"
                className="block relative w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl border-4 border-white overflow-hidden bg-[#fff9c4] hover:scale-110 transition-transform duration-300 ring-4 ring-[#fbc02d]/30"
                aria-label="Status Ramadan"
                title="Status Ramadan"
            >
                <div className="w-full h-full relative">
                    <Image
                        src="/status.png"
                        alt="Stories Icon"
                        fill
                        className="object-cover p-1"
                    />
                </div>

                {/* Notification Badge */}
                <span className="absolute top-2 right-2 flex h-4 w-4 md:h-5 md:w-5 z-10 transition-transform group-hover:scale-110">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-red-600 border-2 border-white"></span>
                </span>
            </Link>
        </div>,
        document.body
    );
}
