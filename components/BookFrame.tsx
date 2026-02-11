
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import Link from 'next/link';

interface BookFrameProps {
    children: ReactNode;
    prevLink?: string | null;
    nextLink?: string | null;
    day?: number;
    singlePage?: boolean;
}

export default function BookFrame({ children, prevLink, nextLink, day, singlePage = false }: BookFrameProps) {
    return (
        // MOBILE FIRST: Background kertas penuh (#fdfbf7), tanpa padding, tanpa border kayu.
        // DESKTOP (md): Background kayu (#2c1810), padding, dan efek buku.
        <div className="min-h-screen bg-[#fdfbf7] md:bg-[#2c1810] flex items-center justify-center p-0 md:p-8 overflow-hidden relative">

            {/* Desktop Only: Wood Texture Background Pattern */}
            <div className="hidden md:block absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 10h10v10H10V10zM0 10h10v10H0V10z' fill='%235D4037' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }}></div>

            {/* Container Buku */}
            {/* Mobile: w-full h-full, tidak ada aspect ratio paksa. */}
            {/* Desktop: max-w-5xl, aspect ratio buku, perspective effect. */}
            <div className="relative w-full h-full md:h-auto md:max-w-5xl md:aspect-[3/2] flex md:perspective-1000">

                {/* Book Cover/Binding Effect - DESKTOP ONLY */}
                {/* Di mobile kita sembunyikan efek binding buku ini agar full screen clean */}
                <div className="hidden md:flex absolute inset-0 bg-[#fdfbf7] rounded-md shadow-2xl overflow-hidden">
                    {singlePage ? (
                        <div className="w-full h-full bg-[#fdfbf7] relative shadow-inner bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200/50 to-transparent pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-200/50 to-transparent pointer-events-none"></div>
                        </div>
                    ) : (
                        <>
                            <div className="w-1/2 h-full bg-[#fdfbf7] border-r border-gray-200 rounded-l-md relative shadow-inner">
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-200/50 to-transparent"></div>
                            </div>
                            <div className="w-1/2 h-full bg-[#fdfbf7] rounded-r-md relative shadow-inner">
                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200/50 to-transparent"></div>
                            </div>
                            <div className="absolute left-1/2 top-0 bottom-0 w-4 -ml-2 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 rounded-sm shadow-inner z-20"></div>
                        </>
                    )}
                </div>

                {/* Content Container */}
                {/* Mobile: z-10 w-full h-full. */}
                <div className="relative z-10 w-full h-full flex flex-col md:flex-row">

                    {/* Navigation Controls - Hidden on Login usually, but kept for logic consistency */}
                    {prevLink && (
                        <Link href={prevLink} className="absolute left-2 top-1/2 -translate-y-1/2 z-50 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                            <span>Prev</span>
                        </Link>
                    )}
                    {nextLink && (
                        <Link href={nextLink} className="absolute right-2 top-1/2 -translate-y-1/2 z-50 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                            <span>Next</span>
                        </Link>
                    )}

                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={day || 'dashboard'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full h-full flex flex-col overflow-hidden bg-[#fdfbf7] md:bg-transparent bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] md:bg-none"
                        >
                            {/* Mobile: p-0 karena LoginForm sudah mengatur paddingnya sendiri. Desktop: p-10 */}
                            <div className="w-full h-full overflow-y-auto p-0 md:p-10 custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
}
