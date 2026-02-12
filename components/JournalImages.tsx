'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, Eye, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

interface JournalImageProps {
    journalId: string;
    field: 'aktifitas_sosial' | 'catatan_ihsan';
    photoUrl: string;
    alt: string;
}

export function JournalImage({ journalId, field, photoUrl, alt }: JournalImageProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Jangan render apa-apa jika foto tidak ada
    if (!photoUrl) return null;

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Mencegah bubble event ke parent
        if (!confirm('Apakah Anda yakin ingin menghapus foto siswa ini? Tindakan ini tidak dapat dibatalkan.')) return;

        setLoading(true);
        try {
            const res = await fetch('/api/journal/delete-photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ journalId, field }),
            });

            if (!res.ok) throw new Error('Gagal menghapus');

            // Refresh halaman agar data terbaru terambil
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Gagal menghapus foto. Silakan coba lagi.');
            setLoading(false);
        }
    };

    return (
        <>
            <div
                className="relative group rounded overflow-hidden shadow-sm inline-block cursor-pointer"
                onClick={() => setIsModalOpen(true)}
            >
                {/* Foto */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={photoUrl}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity hover:scale-105 duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}
                />

                {/* Overlay Kontrol - Muncul saat hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
                        className="bg-white p-2 rounded-full text-blue-600 hover:bg-blue-50"
                        title="Lihat ukuran penuh"
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="bg-white p-2 rounded-full text-red-600 hover:bg-red-50 disabled:opacity-50"
                        title="Hapus foto tidak pantas"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent animate-spin rounded-full"></div>
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Label Status */}
                {loading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-[10px] text-center p-1 font-bold">
                        MENGHAPUS...
                    </div>
                )}
            </div>

            {/* MODAL FULLSCREEN */}
            {isModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center pointer-events-none">
                        {/* Tombol Close */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full pointer-events-auto transition-colors z-50 backdrop-blur-md"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Gambar */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={photoUrl}
                            alt={alt}
                            className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm pointer-events-auto cursor-default animate-in zoom-in-95 duration-300"
                            onClick={(e) => e.stopPropagation()} // Supaya klik gambar tidak menutup modal
                        />

                        {/* Caption */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md pointer-events-auto">
                            <span className="text-white text-sm font-medium">{alt}</span>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
