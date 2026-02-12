'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, MessageCircle, User, CheckCircle, Clock } from 'lucide-react';
import Image from 'next/image';

interface Guru {
    _id: string;
    nipy: string;
    nama: string;
}

interface Question {
    _id: string;
    nama_guru: string;
    pertanyaan: string;
    jawaban: string;
    status: 'menunggu' | 'dijawab';
    createdAt: string;
    answeredAt?: string;
}

export default function QnAFloatingButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'list' | 'ask'>('list');
    const [mounted, setMounted] = useState(false);

    const [teachers, setTeachers] = useState<Guru[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);

    // Form
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        setMounted(true);
        // Initial Fetch
        fetchMyQuestions(false);

        // Polling setiap 30 detik untuk cek jawaban baru
        const interval = setInterval(() => {
            fetchMyQuestions(true);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchTeachers();
            fetchMyQuestions(true);
        }
    }, [isOpen]);

    const fetchTeachers = async () => {
        const res = await fetch('/api/guru/list');
        const json = await res.json();
        if (json.success) setTeachers(json.data);
    };

    const fetchMyQuestions = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const res = await fetch('/api/siswa/qna', { cache: 'no-store' });
            const json = await res.json();
            if (json.success) setQuestions(json.data);
        } catch (e) {
            console.error(e);
        }
        if (!isBackground) setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedTeacher || !questionText) {
            setError('Pilih guru dan isi pertanyaan dulu ya!');
            return;
        }

        const guru = teachers.find(t => t.nipy === selectedTeacher);
        if (!guru) return;

        try {
            const res = await fetch('/api/siswa/qna', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_guru: guru.nipy,
                    nama_guru: guru.nama,
                    pertanyaan: questionText
                })
            });

            const json = await res.json();

            if (!res.ok) {
                setError(json.error || 'Gagal mengirim pertanyaan');
            } else {
                setQuestionText('');
                setSelectedTeacher('');
                setActiveTab('list');
                fetchMyQuestions();
                alert('Pertanyaan berhasil dikirim!');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi');
        }
    };

    // Cek Eligibility untuk tombol "Tanya Baru" - LOGIC HARIAN
    const canAsk = () => {
        const todayStr = new Date().toDateString();
        // Filter pertanyaan hari ini saja - API sort DESC, jadi [0] adalah latest
        const questionsToday = questions.filter(q => new Date(q.createdAt).toDateString() === todayStr);

        if (questionsToday.length >= 2) return false;

        // Jika ada 1 pertanyaan hari ini, cek statusnya
        if (questionsToday.length === 1 && questionsToday[0].status !== 'dijawab') return false;

        return true;
    };

    // State untuk Notifikasi Belum Dibaca
    const [unseenCount, setUnseenCount] = useState(0);

    // Effect: Hitung Unseen saat questions berubah
    useEffect(() => {
        if (!mounted) return;
        const seenIds = JSON.parse(localStorage.getItem('seen_answers') || '[]');
        const count = questions.filter(q => q.status === 'dijawab' && !seenIds.includes(q._id)).length;
        setUnseenCount(count);
    }, [questions, mounted]);

    // Effect: Mark as Seen saat buka modal
    useEffect(() => {
        if (isOpen && activeTab === 'list' && unseenCount > 0) {
            const seenIds = JSON.parse(localStorage.getItem('seen_answers') || '[]');
            const answeredIds = questions.filter(q => q.status === 'dijawab').map(q => q._id);

            // Gabung dan simpan unique
            const updatedSeen = Array.from(new Set([...seenIds, ...answeredIds]));
            localStorage.setItem('seen_answers', JSON.stringify(updatedSeen));

            // Delay sedikit biar user sadar ada notif yg hilang (opsional, tapi langsung 0 lebih baik)
            setUnseenCount(0);
        }
    }, [isOpen, activeTab, questions, unseenCount]);

    // const answeredCount = questions.filter(q => q.status === 'dijawab').length; // HAPUS INI

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Bubble Text Notif (Hanya jika ada jawaban baru & modal tertutup) */}
            {unseenCount > 0 && !isOpen && (
                <div className="fixed bottom-32 right-8 z-[9998] bg-white px-4 py-2 rounded-xl shadow-xl border border-[#d7ccc8] animate-bounce max-w-[200px] hidden md:block">
                    <div className="text-sm font-bold text-[#5d4037] flex items-center gap-1">
                        <span className="text-lg">✨</span> Jawaban Baru!
                    </div>
                    <div className="text-xs text-[#8d6e63] mt-1">Ustadz sudah membalas pertanyaanmu.</div>
                    {/* Panah */}
                    <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white transform rotate-45 border-b border-r border-[#d7ccc8]"></div>
                </div>
            )}

            {/* Floating Button (Diperbesar 2x dan Fixed ke Body) */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 z-[9999] group animate-bounce-slow"
                title="Baknus Yuk Tanya!"
            >
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl border-4 border-white overflow-hidden bg-[#5d4037] hover:scale-110 transition-transform duration-300 ring-4 ring-[#8d6e63]/30">
                    <img
                        src="/img/tanya_baknus_fix.jpg"
                        alt="Tanya Jawab"
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Badge Notif (Diperbesar) */}
                {unseenCount > 0 && (
                    <div className="absolute top-0 right-0 bg-red-600 text-white text-sm md:text-base font-bold w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 border-white animate-pulse shadow-lg">
                        {unseenCount}
                    </div>
                )}
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#fdfbf7] w-full max-w-md h-[600px] max-h-[90vh] rounded-xl shadow-2xl flex flex-col relative overflow-hidden border border-[#d7ccc8]">

                        {/* Header */}
                        <div className="bg-[#5d4037] p-4 text-[#fdfbf7] flex justify-between items-center relative overflow-hidden">
                            {/* Pattern BG */}
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>

                            <div className="flex items-center gap-3 relative z-10">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <MessageCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg font-serif">Baknus Yuk Tanya!</h3>
                                    <p className="text-xs text-[#d7ccc8]">Tanya Ustadz/Ustadzahmu</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-[#d7ccc8] hover:text-white relative z-10">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[#d7ccc8] bg-[#efebe9]">
                            <button
                                onClick={() => setActiveTab('list')}
                                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'list' ? 'bg-[#fdfbf7] text-[#5d4037] border-t-2 border-t-[#5d4037]' : 'text-[#8d6e63] hover:bg-[#d7ccc8]/30'}`}
                            >
                                Pertanyaan Saya ({questions.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('ask')}
                                disabled={!canAsk()}
                                className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${activeTab === 'ask' ? 'bg-[#fdfbf7] text-[#5d4037] border-t-2 border-t-[#5d4037]' : 'text-[#8d6e63] hover:bg-[#d7ccc8]/30'} ${!canAsk() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Tanya Baru
                                {!canAsk() && <span className="p-1 bg-gray-200 text-gray-500 rounded text-[10px]">Max</span>}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 bg-[#fdfbf7] scrollbar-thin scrollbar-thumb-[#8d6e63] scrollbar-track-transparent">
                            {loading ? (
                                <div className="text-center py-10 text-[#8d6e63] animate-pulse">Memuat data...</div>
                            ) : activeTab === 'list' ? (
                                <div className="space-y-4">
                                    {questions.length === 0 ? (
                                        <div className="text-center py-10">
                                            <p className="text-[#8d6e63] mb-2 font-serif italic">Belum ada pertanyaan.</p>
                                            <button onClick={() => setActiveTab('ask')} className="text-[#5d4037] font-bold underline hover:text-[#3e2723]">
                                                Yuk mulai bertanya!
                                            </button>
                                        </div>
                                    ) : (
                                        questions.map((q) => (
                                            <div key={q._id} className="bg-white p-4 rounded-lg border border-[#d7ccc8] shadow-sm relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-1 text-xs font-bold text-[#8d6e63] bg-[#efebe9] px-2 py-1 rounded-full">
                                                        <User className="w-3 h-3" /> To: {q.nama_guru}
                                                    </div>
                                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${q.status === 'dijawab' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {q.status}
                                                    </span>
                                                </div>

                                                <div className="mb-3">
                                                    <p className="text-[#3e2723] font-serif leading-relaxed">"{q.pertanyaan}"</p>
                                                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(q.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                {q.jawaban && (
                                                    <div className="bg-[#f0f4f8] p-3 rounded-md border-l-4 border-[#5d4037] relative mt-4 group">
                                                        {/* Arrow pointing up */}
                                                        <div className="absolute -top-2 left-4 w-4 h-4 bg-[#f0f4f8] transform rotate-45 border-t border-l border-gray-100"></div>

                                                        <p className="text-[#263238] text-sm leading-relaxed font-serif">
                                                            {q.jawaban}
                                                        </p>
                                                        <p className="text-[10px] text-[#5d4037] font-bold mt-2 text-right">
                                                            — Ustadz/ah {q.nama_guru}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-xs text-yellow-800 mb-4 flex gap-2">
                                        <span className="text-xl">💡</span>
                                        <div>
                                            Kamu hanya bisa bertanya <strong>2 kali setiap hari</strong>. Pertanyaan kedua hari ini hanya bisa diajukan setelah pertanyaan pertama dijawab.
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-[#5d4037] mb-1">Kepada Guru:</label>
                                        <select
                                            value={selectedTeacher}
                                            onChange={(e) => setSelectedTeacher(e.target.value)}
                                            className="w-full p-3 border border-[#d7ccc8] rounded bg-white focus:ring-[#8d6e63] focus:border-[#5d4037] outline-none text-[#3e2723]"
                                            required
                                        >
                                            <option value="">-- Pilih Ustadz/Ustadzah --</option>
                                            {teachers.map((t) => (
                                                <option key={t._id} value={t.nipy}>{t.nama}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-[#5d4037] mb-1">Pertanyaanmu:</label>
                                        <textarea
                                            value={questionText}
                                            onChange={(e) => setQuestionText(e.target.value)}
                                            className="w-full p-3 border border-[#d7ccc8] rounded bg-white focus:ring-[#8d6e63] focus:border-[#5d4037] outline-none min-h-[120px] text-[#3e2723]"
                                            placeholder="Tulis pertanyaanmu dengan sopan dan jelas..."
                                            required
                                            maxLength={500}
                                        />
                                        <div className="text-right text-xs text-gray-400 mt-1">{questionText.length}/500</div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-3 rounded text-sm font-bold border border-red-200 animate-pulse">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-[#5d4037] text-white py-3 rounded font-bold shadow-md hover:bg-[#3e2723] transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Send className="w-4 h-4" />
                                        Kirim Pertanyaan
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
        , document.body); // Portal Target
}
