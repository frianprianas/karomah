
'use client';

import { useState, useEffect } from 'react';
import { Clock, User, ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

interface Story {
    id: string;
    name: string;
    role: string;
    subLabel: string;
    foto?: string;
    status: string;
    updatedAt: string;
}

function timeSince(date: string) {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + "h";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + "m";
    }
    return Math.floor(seconds) + "s";
}

export default function StoriesList({ user }: { user: any }) {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(10);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await fetch('/api/stories');
                const json = await res.json();
                if (json.data) {
                    setStories(json.data);
                }
            } catch (error) {
                console.error("Failed to fetch stories", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStories();
    }, []);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center font-serif text-[#5d4037]">
            Memuat Status Guru & Teman...
        </div>
    );

    const backLink = user.role === 'guru' ? '/teacher' : '/dashboard';

    return (
        <div className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] pb-20 font-serif">
            <Navbar user={user} />

            {/* Sticky Sub-Header for Navigation */}
            <div className="bg-[#f0e6d2] border-b border-[#d7ccc8] sticky top-0 z-40 shadow-sm backdrop-blur-md bg-opacity-90">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link href={backLink} className="flex items-center gap-2 text-[#5d4037] font-bold hover:text-[#3e2723] transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm">Kembali</span>
                    </Link>
                    <span className="text-sm font-bold text-[#8d6e63]">Status Ramadan</span>
                    <div className="w-8"></div>
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-6 md:p-8">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h1 className="text-3xl font-bold text-[#3e2723] mb-2 tracking-wide font-serif">Mutiara Ramadan</h1>
                    <p className="text-[#8d6e63] italic text-sm">Berbagi kebaikan dari hati ke hati.</p>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#8d6e63] to-transparent mx-auto mt-4 opacity-50"></div>
                </div>

                {/* My Story Card */}
                <div className="mb-12">
                    <Link href="/profile" className="flex items-center gap-4 p-4 bg-white/60 border border-[#d7ccc8] rounded-2xl hover:bg-white hover:shadow-md transition-all group border-dashed">
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full border-2 border-[#8d6e63] overflow-hidden bg-[#efebe9]">
                                {user?.foto ? (
                                    <Image src={user.foto} alt="Profile" width={56} height={56} className="object-cover w-full h-full" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#d7ccc8]"><User className="w-8 h-8" /></div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-[#5d4037] text-white rounded-full p-1 border-2 border-white">
                                <span className="block text-[10px] w-3 h-3 flex items-center justify-center font-bold">+</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#3e2723]">Status Saya</h3>
                            <p className="text-xs text-[#8d6e63] group-hover:text-[#5d4037]">Apa yang ingin Anda bagikan hari ini?</p>
                        </div>
                    </Link>
                </div>

                {stories.length === 0 ? (
                    <div className="text-center py-12 text-[#8d6e63] bg-white/40 rounded-xl border border-dashed border-[#d7ccc8]">
                        <p className="italic mb-2">Belum ada status terbaru.</p>
                        <p className="text-sm">Jadilah yang pertama berbagi semangat!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {stories.slice(0, visibleCount).map((story, index) => {
                            const isGuru = String(story.role).toLowerCase() === 'guru';
                            // Alternate left/right for students, guru always centered
                            const isLeft = index % 2 === 0;

                            if (isGuru) {
                                return (
                                    <div key={story.id} className="relative flex flex-col items-center">
                                        {/* Avatar at Top */}
                                        <div className="z-10 -mb-6">
                                            <div className="w-16 h-16 rounded-full border-4 border-[#ffab00] p-0.5 bg-white shadow-xl">
                                                <div className="w-full h-full rounded-full overflow-hidden bg-[#efebe9]">
                                                    {story.foto ? (
                                                        <Image src={story.foto} alt={story.name} width={64} height={64} className="object-cover w-full h-full" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[#d7ccc8] bg-[#f5f5f5]">
                                                            <User className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Guru Chat Bubble */}
                                        <div className="w-full max-w-lg bg-[#3e2723] text-[#fdfbf7] p-8 rounded-[2rem] shadow-2xl relative border-b-8 border-[#2d1d1a]">
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffab00] text-[#3e2723] text-[10px] px-4 py-1 rounded-full font-black tracking-widest border-2 border-[#3e2723] whitespace-nowrap shadow-lg">PESAN USTADZ/AH</div>

                                            <div className="text-center pt-2">
                                                <div className="text-4xl text-[#ffab00] font-serif opacity-30 leading-none mb-1">“</div>
                                                <p className="text-lg md:text-xl italic font-serif leading-relaxed px-4">
                                                    {story.status}
                                                </p>
                                                <div className="text-4xl text-[#ffab00] font-serif opacity-30 leading-none flex justify-end transform rotate-180 mt-1">“</div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-[#d7ccc8] uppercase tracking-widest font-bold">
                                                <span>{story.name}</span>
                                                <span>{timeSince(story.updatedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div key={story.id} className={`flex gap-3 md:gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'} items-end group px-2`}>
                                    {/* Small Avatar */}
                                    <div className="flex-shrink-0 mb-3">
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 ${isLeft ? 'border-[#8d6e63]' : 'border-[#5d4037]'} overflow-hidden shadow-lg bg-white`}>
                                            {story.foto ? (
                                                <Image src={story.foto} alt={story.name} width={48} height={48} className="object-cover w-full h-full" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#d7ccc8] bg-[#f5f5f5]">
                                                    <User className="w-5 h-5 md:w-6 md:h-6" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Student Chat Bubble */}
                                    <div className={`max-w-[85%] md:max-w-[75%] relative p-5 rounded-[2rem] shadow-lg border-2 ${isLeft
                                            ? 'bg-white border-[#d1c4e9]/30 rounded-bl-none text-[#3e2723]'
                                            : 'bg-[#5d4037] border-[#3e2723] rounded-br-none text-[#fdfbf7]'
                                        }`}>
                                        <div className={`text-[10px] font-bold mb-1 uppercase tracking-tight ${isLeft ? 'text-[#8d6e63]' : 'text-[#d7ccc8]'}`}>
                                            {story.name} <span className="opacity-50 mx-1">•</span> {story.subLabel}
                                        </div>

                                        <p className="font-serif italic leading-relaxed text-sm md:text-base">
                                            {story.status}
                                        </p>

                                        <div className={`mt-2 text-[9px] text-right opacity-40 font-mono`}>
                                            {timeSince(story.updatedAt)}
                                        </div>

                                        {/* Simple tail using CSS border triangle logic or div - here simplified as a small nudge */}
                                        <div className={`absolute bottom-0 w-4 h-4 ${isLeft
                                                ? '-left-1 bg-white border-l-2 border-b-2 border-[#d1c4e9]/30 rounded-bl-lg'
                                                : '-right-1 bg-[#5d4037] border-r-2 border-b-2 border-[#3e2723] rounded-br-lg'
                                            }`} style={{ transform: isLeft ? 'rotate(5deg)' : 'rotate(-5deg)' }}></div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Pagination / Load More */}
                        {visibleCount < stories.length && (
                            <div className="text-center pt-8">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-8 py-3 bg-[#5d4037] text-white rounded-full text-sm font-bold shadow-lg hover:bg-[#3e2723] transition-all flex items-center justify-center gap-2 mx-auto"
                                >
                                    Lihat Lebih Banyak
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                                <p className="text-xs text-[#a1887f] mt-3">
                                    Menampilkan {Math.min(visibleCount, stories.length)} dari {stories.length} mutiara kata
                                </p>
                            </div>
                        )}

                        {visibleCount >= stories.length && stories.length > 5 && (
                            <div className="text-center pt-12 pb-4">
                                <div className="w-16 h-px bg-[#d7ccc8] mx-auto mb-4"></div>
                                <p className="text-xs text-[#a1887f] italic font-serif">"Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain."</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
