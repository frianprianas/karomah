'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';

export default function StoriesFloatingButton() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [allStories, setAllStories] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showBubble, setShowBubble] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchStories();

        const fetchInterval = setInterval(fetchStories, 60000);
        return () => clearInterval(fetchInterval);
    }, []);

    // Effect untuk rotasi otomatis setiap 3 detik
    useEffect(() => {
        if (allStories.length === 0) return;

        const rotationInterval = setInterval(() => {
            setShowBubble(false); // Hide first for transition

            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % allStories.length);
                setShowBubble(true);
            }, 500); // Wait for fade out

        }, 3500); // 3s display + 0.5s transition

        // Initial show
        setShowBubble(true);

        return () => clearInterval(rotationInterval);
    }, [allStories]);

    const fetchStories = async () => {
        try {
            const res = await fetch('/api/stories');
            const json = await res.json();
            if (json.success && json.data && json.data.length > 0) {
                setAllStories(json.data);
            } else {
                setAllStories([]);
                setShowBubble(false);
            }
        } catch (e) {
            console.error("Failed to fetch stories for notification", e);
        }
    };

    // Hide on stories page itself and login page
    if (pathname === '/stories' || pathname === '/') return null;
    if (!mounted) return null;

    const currentStory = allStories[currentIndex];

    return createPortal(
        <div className="fixed bottom-8 left-4 sm:left-8 z-[9999] group flex items-end gap-2">
            {/* Notification Bubble - Auto Rotating / Empty State */}
            <div className={`
                absolute bottom-full left-1/2 -translate-x-1/2 mb-4 whitespace-nowrap
                transition-all duration-500 ease-in-out transform
                ${showBubble ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'}
            `}>
                <div className="relative bg-white/95 backdrop-blur-sm border-2 border-[#fbc02d] text-[#5d4037] px-4 py-2 rounded-2xl shadow-xl font-serif text-xs font-bold flex flex-col items-center min-w-[140px]">
                    {currentStory ? (
                        <>
                            <span className="text-[10px] text-[#fbc02d] uppercase tracking-tighter mb-0.5">Stories Hari Ini..</span>
                            <div className="flex items-center gap-2">
                                {currentStory.foto && (
                                    <img src={currentStory.foto.startsWith('/uploads/') ? `/api${currentStory.foto}` : currentStory.foto} className="w-4 h-4 rounded-full object-cover border border-[#fbc02d]" alt="" />
                                )}
                                <span>{currentStory.name.split(' ')[0]} menambahkan Stories...</span>
                            </div>
                            <span className="text-[9px] opacity-60 font-mono mt-0.5">
                                {new Date(currentStory.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </span>
                        </>
                    ) : (
                        <div className="py-1 flex flex-col items-center gap-0.5">
                            <span className="text-[10px] text-[#fbc02d] uppercase tracking-tighter mb-0.5">Stories Hari Ini..</span>
                            <span className="text-[18px] animate-bounce">✨</span>
                            <span className="text-sm">Ayo update Stories!</span>
                        </div>
                    )}

                    {/* Shadow Tail */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 border-r-2 border-b-2 border-[#fbc02d] rotate-45"></div>
                </div>
            </div>

            <Link
                href="/stories"
                className="block relative w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl border-4 border-white overflow-hidden bg-[#fff9c4] hover:scale-110 transition-transform duration-300 ring-4 ring-[#fbc02d]/30 animate-bounce-slow"
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
