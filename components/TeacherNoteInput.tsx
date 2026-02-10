
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Save, CheckCircle2 } from 'lucide-react';

interface TeacherNoteInputProps {
    journalId: string;
    nis: string;
    day: number;
    initialNote?: string;
}

export default function TeacherNoteInput({ journalId, nis, day, initialNote = '' }: TeacherNoteInputProps) {
    const [note, setNote] = useState(initialNote);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const router = useRouter();

    // Sync state if props change (e.g. after router.refresh())
    useEffect(() => {
        setNote(initialNote);
    }, [initialNote]);

    const handleSave = async () => {
        if (loading) return;
        setLoading(true);
        setSaved(false);

        try {
            const res = await fetch('/api/teacher/note', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ journalId, nis, day, catatan: note })
            });

            if (res.ok) {
                const data = await res.json();
                setSaved(true);
                router.refresh();
                alert('Catatan berhasil disimpan!');
                setTimeout(() => setSaved(false), 3000);
            } else {
                const data = await res.json();
                alert('Gagal menyimpan: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Failed to save note');
            alert('Terjadi kesalahan koneksi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-[#8d6e63]/20 font-serif">
            <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-[#8d6e63]" />
                <span className="text-sm font-bold text-[#5d4037]">Catatan Pembina / Guru:</span>
            </div>

            <div className="relative">
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Tuliskan apresiasi atau nasehat untuk santri..."
                    className="w-full p-3 bg-[#fdfbf7] border-2 border-[#d7ccc8] rounded-sm focus:border-[#8d6e63] outline-none text-sm text-[#3e2723] min-h-[80px] resize-none pb-12"
                />

                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    {saved && (
                        <span className="flex items-center gap-1 text-xs text-green-700 animate-in fade-in slide-in-from-right-2">
                            <CheckCircle2 className="w-3 h-3" />
                            Tersimpan
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#5d4037] text-white px-4 py-1.5 rounded-sm text-xs border-b-2 border-[#3e2723] hover:bg-[#4e342e] active:border-b-0 active:translate-y-[1px] disabled:opacity-50 transition-all shadow-sm"
                    >
                        <Save className="w-3 h-3" />
                        {loading ? 'Menyimpan...' : 'Simpan Catatan'}
                    </button>
                </div>
            </div>
        </div>
    );
}
