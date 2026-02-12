'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MessageCircle, CheckCircle, Clock, Send, User } from 'lucide-react';

interface Question {
    _id: string;
    nama_siswa: string;
    kelas_siswa: string;
    pertanyaan: string;
    jawaban: string;
    status: 'menunggu' | 'dijawab';
    createdAt: string;
    answeredAt?: string;
}

function TeacherQnAContent() {
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'menunggu' | 'dijawab'>('all');

    // Reply State
    const [selectedQ, setSelectedQ] = useState<Question | null>(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/guru/qna');
            const json = await res.json();
            if (json.success) setQuestions(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, []);

    const handleReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedQ || !replyText) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/guru/qna', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedQ._id,
                    jawaban: replyText
                })
            });

            const json = await res.json();
            if (json.success) {
                alert('Jawaban berhasil dikirim!');
                setSelectedQ(null);
                setReplyText('');
                fetchQuestions();
            } else {
                alert(json.error || 'Gagal mengirim jawaban');
            }
        } catch (err) {
            alert('Terjadi kesalahan');
        } finally {
            setSubmitting(false);
        }
    };

    const openReplyModal = (q: Question) => {
        setSelectedQ(q);
        setReplyText(q.jawaban || '');
    };

    const filteredQuestions = questions.filter(q => {
        if (filter === 'all') return true;
        return q.status === filter;
    });

    return (
        <div className="min-h-screen bg-[#fdfbf7] font-serif pb-10">
            {/* Header */}
            <header className="bg-[#5d4037] text-[#fdfbf7] p-4 shadow-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/teacher" className="p-2 hover:bg-[#4e342e] rounded-full transition-colors">
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Tanya Jawab Santri
                            </h1>
                            <p className="text-xs text-[#d7ccc8]">Jawab pertanyaan seputar Ramadan dari siswa</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 sm:p-6">

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-[#5d4037] text-white shadow-md' : 'bg-white text-[#8d6e63] border border-[#d7ccc8]'}`}
                    >
                        Semua ({questions.length})
                    </button>
                    <button
                        onClick={() => setFilter('menunggu')}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'menunggu' ? 'bg-yellow-600 text-white shadow-md' : 'bg-white text-[#8d6e63] border border-[#d7ccc8]'}`}
                    >
                        Perlu Dijawab ({questions.filter(q => q.status === 'menunggu').length})
                    </button>
                    <button
                        onClick={() => setFilter('dijawab')}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${filter === 'dijawab' ? 'bg-green-600 text-white shadow-md' : 'bg-white text-[#8d6e63] border border-[#d7ccc8]'}`}
                    >
                        Sudah Dijawab
                    </button>
                </div>

                {/* Question List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-[#8d6e63] animate-pulse">Memuat pertanyaan...</div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 italic bg-white rounded border border-[#d7ccc8]">
                            Tidak ada pertanyaan {filter !== 'all' ? `dengan status '${filter}'` : ''}.
                        </div>
                    ) : (
                        filteredQuestions.map((q) => (
                            <div key={q._id} className={`bg-white p-5 rounded-lg border shadow-sm transition-shadow hover:shadow-md relative group ${q.status === 'menunggu' ? 'border-l-4 border-l-yellow-500 border-y border-r border-gray-200' : 'border-l-4 border-l-green-500 border-y border-r border-[#d7ccc8]'}`}>

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-[#efebe9] flex items-center justify-center text-[#5d4037]">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-[#3e2723]">{q.nama_siswa}</h3>
                                            <p className="text-xs text-[#8d6e63]">Kelas {q.kelas_siswa}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${q.status === 'menunggu' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                        {q.status}
                                    </span>
                                </div>

                                <div className="ml-10">
                                    <p className="text-[#3e2723] leading-relaxed font-serif text-lg mb-2">
                                        "{q.pertanyaan}"
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-4">
                                        <Clock className="w-3 h-3" />
                                        {new Date(q.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                    </p>

                                    {q.jawaban && (
                                        <div className="bg-[#f1f8e9] p-3 rounded-md border border-green-200 text-sm text-[#33691e] mb-3">
                                            <strong>Jawaban Anda:</strong> <br />
                                            {q.jawaban}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => openReplyModal(q)}
                                        className={`px-4 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 ${q.status === 'menunggu' ? 'bg-[#5d4037] text-white hover:bg-[#4e342e]' : 'bg-white border border-[#d7ccc8] text-[#5d4037] hover:bg-[#efebe9]'}`}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        {q.status === 'menunggu' ? 'Jawab Sekarang' : 'Edit Jawaban'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Answer Modal */}
            {selectedQ && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-[#d7ccc8]">
                        <div className="bg-[#5d4037] p-4 text-white flex justify-between items-center">
                            <h3 className="font-bold">Jawab Pertanyaan</h3>
                            <button onClick={() => setSelectedQ(null)}><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleReply} className="p-6">
                            <div className="mb-4 bg-[#fff9c4] p-3 rounded border border-[#fff59d]">
                                <p className="text-xs text-[#f57f17] font-bold mb-1">Pertanyaan dari {selectedQ.nama_siswa}:</p>
                                <p className="text-[#f57f17] italic">"{selectedQ.pertanyaan}"</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold text-[#5d4037] mb-2">Jawaban Anda:</label>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="w-full p-3 border border-[#d7ccc8] rounded bg-[#fdfbf7] focus:ring-[#8d6e63] outline-none min-h-[150px] text-[#3e2723]"
                                    placeholder="Tulis jawaban yang membantu dan jelas..."
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setSelectedQ(null)} className="px-4 py-2 text-[#8d6e63] hover:bg-[#efebe9] rounded font-bold">Batal</button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2 bg-[#5d4037] text-white rounded font-bold hover:bg-[#4e342e] disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting ? 'Mengirim...' : 'Kirim Jawaban'}
                                    {!submitting && <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function X({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
    )
}

export default function TeacherQnAPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TeacherQnAContent />
        </Suspense>
    );
}
