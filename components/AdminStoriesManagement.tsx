
'use client';

import { useState, useEffect } from 'react';
import { Trash2, ShieldAlert, User, Clock, CheckCircle, Search } from 'lucide-react';

interface Story {
    id: string;
    name: string;
    role: string;
    subLabel: string;
    foto?: string;
    status: string;
    updatedAt: string;
}

export default function AdminStoriesManagement() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(6);

    const fetchStories = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stories');
            const json = await res.json();
            if (json.data) {
                setStories(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch stories for admin", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStories();
    }, []);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    const handleAction = async (id: string, type: string, action: 'delete' | 'ban') => {
        const confirmMsg = action === 'delete'
            ? 'Hapus status ini?'
            : 'Hapus status dan blokir user ini selama 24 jam?';

        if (!confirm(confirmMsg)) return;

        setProcessingId(id);
        try {
            const res = await fetch('/api/admin/stories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, type, action })
            });

            if (res.ok) {
                setStories(stories.filter(s => s.id !== id));
                alert(action === 'delete' ? 'Status berhasil dihapus' : 'User berhasil dibanned 24 jam');
            } else {
                alert('Gagal memproses permintaan');
            }
        } catch (error) {
            alert('Kesalahan sistem');
        } finally {
            setProcessingId(null);
        }
    };

    const filteredStories = stories.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full mt-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <div className="flex items-center gap-3 mb-6 border-b border-[#8d6e63]/30 pb-4">
                <ShieldAlert className="w-8 h-8 text-[#5d4037]" />
                <div>
                    <h2 className="text-2xl font-serif font-bold text-[#3e2723]">Moderasi Stories</h2>
                    <p className="text-xs text-[#8d6e63] italic">Pantau dan tindak status yang melanggar aturan</p>
                </div>
            </div>

            {/* Search Moderation */}
            <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d6e63]" />
                <input
                    type="text"
                    placeholder="Cari kata kunci atau nama siswa/guru..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/50 border border-[#d7ccc8] rounded-full focus:border-[#5d4037] outline-none font-serif text-sm text-[#3e2723]"
                />
            </div>

            {loading ? (
                <div className="text-center py-12 italic text-[#8d6e63]">Memuat data mutiara kata...</div>
            ) : filteredStories.length === 0 ? (
                <div className="text-center py-12 bg-white/30 border-2 border-dashed border-[#d7ccc8] rounded-xl">
                    <CheckCircle className="w-12 h-12 text-green-600/30 mx-auto mb-2" />
                    <p className="text-[#8d6e63] font-serif">Tidak ada stories yang perlu dimoderasi.</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredStories.slice(0, visibleCount).map((story) => (
                            <div key={story.id} className="bg-white/80 border border-[#d7ccc8] rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
                                {/* Role Badge */}
                                <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white uppercase rounded-bl-xl ${story.role === 'Guru' ? 'bg-[#ffab00]' : 'bg-[#5d4037]'}`}>
                                    {story.role}
                                </div>

                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-[#8d6e63] overflow-hidden bg-[#efebe9]">
                                        {story.foto ? (
                                            <img
                                                src={story.foto.startsWith('/uploads/') ? `/api${story.foto}` : story.foto}
                                                alt={story.name}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#d7ccc8]"><User className="w-6 h-6" /></div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-[#3e2723] text-sm truncate">{story.name}</h4>
                                        <p className="text-[10px] text-[#8d6e63] italic">{story.subLabel}</p>
                                    </div>
                                </div>

                                <div className="bg-[#f0e6d2]/50 p-3 rounded-xl mb-4 flex-grow border border-[#8d6e63]/10">
                                    <p className="text-xs text-[#5d4037] italic leading-relaxed">"{story.status}"</p>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-[#d7ccc8]/50">
                                    <div className="flex items-center gap-1 text-[9px] text-[#8d6e63]">
                                        <Clock className="w-3 h-3" />
                                        {new Date(story.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAction(story.id, story.role, 'delete')}
                                            disabled={processingId === story.id}
                                            className="p-2 text-[#8d6e63] hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                                            title="Hapus Status"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleAction(story.id, story.role, 'ban')}
                                            disabled={processingId === story.id}
                                            className="p-2 text-[#8d6e63] hover:bg-red-600 hover:text-white rounded-lg transition-all shadow-sm"
                                            title="Hapus & Ban 24 Jam"
                                        >
                                            <ShieldAlert className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {processingId === story.id && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#5d4037]"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {visibleCount < filteredStories.length && (
                        <div className="flex justify-center mt-8">
                            <button
                                onClick={handleLoadMore}
                                className="px-8 py-3 bg-[#f0e6d2] border-2 border-[#8d6e63] text-[#5d4037] rounded-full font-bold shadow-md hover:bg-[#d7ccc8] hover:-translate-y-1 transition-all active:scale-95 group flex items-center gap-2"
                            >
                                <Clock className="w-4 h-4 text-[#8d6e63] group-hover:rotate-12 transition-transform" />
                                Tampilkan Stories Lainnya
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
