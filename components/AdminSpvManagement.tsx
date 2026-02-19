'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserX, Save, ShieldAlert } from 'lucide-react';

export default function AdminSpvManagement() {
    const [spvData, setSpvData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        nama: '',
        password: ''
    });

    useEffect(() => {
        fetchSpv();
    }, []);

    const fetchSpv = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/spv');
            const data = await res.json();
            if (res.ok && data) {
                setSpvData(data);
                setFormData({
                    username: data.username,
                    nama: data.nama,
                    password: '' // Don't show password
                });
            } else {
                setSpvData(null);
            }
        } catch (error) {
            console.error('Error fetching SPV:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/spv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Data Supervisor berhasil disimpan!');
                fetchSpv();
            } else {
                const err = await res.json();
                alert(err.error || 'Gagal menyimpan data');
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan sistem');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Yakin ingin menghapus akses Supervisor?')) return;
        try {
            const res = await fetch('/api/admin/spv', { method: 'DELETE' });
            if (res.ok) {
                alert('Supervisor dihapus');
                setSpvData(null);
                setFormData({ username: '', nama: '', password: '' });
            }
        } catch (e) {
            alert('Gagal menghapus');
        }
    }

    return (
        <section className="w-full mt-12 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg border border-amber-300">
                    <ShieldAlert className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-[#3e2723] font-serif">Manajemen Supervisor (SPV)</h2>
                    <p className="text-sm text-[#5d4037] italic">
                        Akun khusus untuk memantau data tanpa izin mengubah (Read-Only).
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-[#d7ccc8] shadow-sm overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] p-6">
                {loading ? (
                    <p className="text-center italic text-gray-500">Memuat data SPV...</p>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="w-full">
                            <label className="block text-sm font-bold text-[#5d4037] mb-2 uppercase tracking-wider">Username Login</label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full p-3 bg-[#fdfbf7] border-2 border-[#d7ccc8] rounded-lg focus:border-[#5d4037] outline-none transition-colors text-sm font-serif text-[#3e2723]"
                                placeholder="Contoh: pengawas1"
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-bold text-[#5d4037] mb-2 uppercase tracking-wider">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                className="w-full p-3 bg-[#fdfbf7] border-2 border-[#d7ccc8] rounded-lg focus:border-[#5d4037] outline-none transition-colors text-sm font-serif text-[#3e2723]"
                                placeholder="Nama Pengawas"
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-sm font-bold text-[#5d4037] mb-2 uppercase tracking-wider">Password</label>
                            <input
                                type="password"
                                required={!spvData}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full p-3 bg-[#fdfbf7] border-2 border-[#d7ccc8] rounded-lg focus:border-[#5d4037] outline-none transition-colors text-sm font-serif text-[#3e2723]"
                                placeholder={spvData ? "(Biarkan kosong jika tetap)" : "Password Baru"}
                            />
                        </div>

                        <div className="flex gap-2 w-full md:w-auto shrink-0">
                            <button
                                type="submit"
                                className="flex-1 md:flex-none bg-[#5d4037] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#3e2723] transition-colors flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Save className="w-4 h-4" />
                                {spvData ? 'Update SPV' : 'Buat SPV'}
                            </button>

                            {spvData && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="bg-red-100 text-red-700 px-4 py-3 rounded-lg font-bold hover:bg-red-200 transition-colors flex items-center justify-center border border-red-200"
                                    title="Hapus Akses SPV"
                                >
                                    <UserX className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </form>
                )}

                <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-3 rounded-r text-xs text-amber-800 font-serif italic">
                    * Hanya diperbolehkan 1 akun Supervisor. Membuat baru akan menimpa data yang lama.
                </div>
            </div>
        </section>
    );
}
