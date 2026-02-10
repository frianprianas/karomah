
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);
    // Calculate direction synchronously during render based on previous path
    const prevPathRef = useRef(pathname);
    const directionRef = useRef<'forward' | 'backward'>('forward');

    if (prevPathRef.current !== pathname) {
        const getDay = (p: string) => {
            const match = p.match(/\/journal\/(\d+)/);
            return match ? parseInt(match[1]) : 0;
        };

        const prevDay = getDay(prevPathRef.current);
        const currentDay = getDay(pathname);

        if (prevDay > 0 && currentDay > 0) {
            directionRef.current = currentDay < prevDay ? 'backward' : 'forward';
        } else if (currentDay === 0 && prevDay > 0) {
            directionRef.current = 'backward';
        } else {
            directionRef.current = 'forward';
        }

        prevPathRef.current = pathname;
    }

    const direction = directionRef.current;

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = 0;
        }
    }, [pathname]);

    const variants = {
        initial: (dir: 'forward' | 'backward') => {
            if (dir === 'forward') {
                return {
                    zIndex: 1,
                    scale: 0.96,
                    opacity: 0,
                    rotateY: 0
                };
            } else {
                return {
                    zIndex: 50,
                    scale: 1,
                    opacity: 1,
                    rotateY: -85
                };
            }
        },
        enter: (dir: 'forward' | 'backward') => {
            if (dir === 'forward') {
                return {
                    zIndex: 1,
                    scale: 1,
                    opacity: 1,
                    rotateY: 0,
                    transition: { duration: 1.2, ease: "easeInOut", delay: 0.2 }
                };
            } else {
                return {
                    zIndex: 50,
                    rotateY: 0,
                    transition: { duration: 1.5, ease: "easeInOut" }
                };
            }
        },
        exit: (dir: 'forward' | 'backward') => {
            if (dir === 'forward') {
                return {
                    zIndex: 50,
                    rotateY: -120,
                    opacity: 1,
                    transition: { duration: 1.5, ease: "easeInOut" }
                };
            } else {
                return {
                    zIndex: 1,
                    scale: 0.96,
                    opacity: 0,
                    rotateY: 0,
                    transition: { duration: 1.2, ease: "easeInOut", delay: 0.2 }
                };
            }
        }
    };

    return (
        <div className="w-full h-screen bg-[#38332e] overflow-hidden flex items-start justify-center pt-2 pb-2 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
            {/* Desk/Background Context */}
            <div className="relative w-full max-w-5xl h-full perspective-2000">

                {/* Static Back Cover (Visual only) */}
                <div className="absolute inset-0 bg-[#fdfbf7] rounded-l-sm rounded-r-2xl shadow-xl transform scale-[0.98] translate-y-1 z-0 border border-gray-300"></div>

                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                    <motion.div
                        key={pathname}
                        custom={direction}
                        variants={variants}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        className="absolute inset-0 bg-white rounded-l-sm rounded-r-2xl shadow-2xl overflow-y-auto border-l border-gray-200 origin-left scroll-container"
                        style={{
                            transformStyle: 'preserve-3d',
                            backfaceVisibility: 'hidden'
                        }}
                        ref={containerRef}
                    >
                        {/* Spine Gradient */}
                        <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-gray-100 to-transparent pointer-events-none z-10"></div>

                        {/* Page Content */}
                        <div className="relative z-0 min-h-full flex flex-col justify-start">
                            {children}
                        </div>

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

// Ensure we have perspective utility
// Tailwind config might need:
// .perspective-1500 { perspective: 1500px; }
