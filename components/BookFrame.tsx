
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
        <div className="min-h-screen bg-[#2c1810] flex items-center justify-center p-2 sm:p-8 overflow-hidden relative">
            {/* Wood Texture Background Pattern */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0V0zm10 10h10v10H10V10zM0 10h10v10H0V10z' fill='%235D4037' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`
            }}></div>

            <div className="relative w-full max-w-5xl aspect-[4/3] sm:aspect-[3/2] flex perspective-1000">

                {/* Book Cover/Binding Effect */}
                <div className="absolute inset-0 bg-[#fdfbf7] rounded-sm sm:rounded-md shadow-2xl flex overflow-hidden">
                    {singlePage ? (
                        // Single Page Background Layout (No Binding)
                        <div className="w-full h-full bg-[#fdfbf7] relative shadow-inner bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                            {/* Subtle gradients for depth */}
                            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200/50 to-transparent pointer-events-none"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-200/50 to-transparent pointer-events-none"></div>
                        </div>
                    ) : (
                        // Double Page Background Layout (With Binding)
                        <>
                            {/* Left Page Background */}
                            <div className="w-1/2 h-full bg-[#fdfbf7] border-r border-gray-200 rounded-l-sm sm:rounded-l-md relative shadow-inner">
                                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-200/50 to-transparent"></div>
                            </div>
                            {/* Right Page Background */}
                            <div className="w-1/2 h-full bg-[#fdfbf7] rounded-r-sm sm:rounded-r-md relative shadow-inner">
                                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200/50 to-transparent"></div>
                            </div>
                            {/* Center Binding */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-4 -ml-2 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 rounded-sm shadow-inner z-20"></div>
                        </>
                    )}
                </div>

                {/* Content Container */}
                <div className="relative z-10 w-full h-full flex">

                    {/* Navigation Controls */}
                    {prevLink && (
                        <Link href={prevLink} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                            <ChevronLeft />
                        </Link>
                    )}
                    {nextLink && (
                        <Link href={nextLink} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                            <ChevronRight />
                        </Link>
                    )}

                    {/* Page Content Animation */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={day || 'dashboard'}
                            initial={{ opacity: 0, rotateY: 90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: -90 }}
                            transition={{ duration: 0.6, ease: "easeInOut" }}
                            className="w-full h-full flex flex-col sm:flex-row overflow-hidden origin-left"
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Mobile: Single Column. Desktop: Double Column if possible, or just centered content */}
                            <div className="w-full h-full overflow-y-auto p-6 sm:p-10 custom-scrollbar">
                                {children}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                </div>
            </div>
        </div>
    );
}
