
'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, X, Save, GraduationCap, School, Search, ImageOff, User } from 'lucide-react';

export default function AdminManagement() {
    const [activeTab, setActiveTab] = useState<'siswa' | 'guru'>('siswa');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        nis: '',
        nipy: '',
        nama: '',
        kelas: '',
        ket: '',
        waliKelas: '',
        password: '',
        emailPribadi: '',
        noHp: ''
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const [classList, setClassList] = useState<string[]>([]);

    // Fetch classes specifically for suggestions
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await fetch('/api/admin/siswa');
                if (res.ok) {
                    const students = await res.json();
                    const classes = [...new Set(students.map((s: any) => s.kelas))].filter(Boolean) as string[];
                    setClassList(classes.sort());
                }
            } catch (e) {
                console.error("Failed to fetch classes for suggestion", e);
            }
        };
        fetchClasses();
    }, [activeTab, showModal]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/${activeTab}`);
            const json = await res.json();
            if (res.ok) setData(json);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item: any = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                nis: item.nis || '',
                nipy: item.nipy || '',
                nama: item.nama || '',
                kelas: item.kelas || '',
                ket: item.ket || '',
                waliKelas: item.waliKelas || '',
                password: '', // Don't show password
                emailPribadi: item.emailPribadi || '',
                noHp: item.noHp || ''
            });
        } else {
            setEditingItem(null);
            setFormData({
                nis: '',
                nipy: '',
                nama: '',
                kelas: '',
                ket: '',
                waliKelas: '',
                password: '',
                emailPribadi: '',
                noHp: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const method = editingItem ? 'PUT' : 'POST';
        const body = editingItem ? { ...formData, _id: editingItem._id } : formData;

        try {
            const res = await fetch(`/api/admin/${activeTab}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setShowModal(false);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error || 'Terjadi kesalahan');
            }
        } catch (error) {
            alert('Gagal menyimpan data');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;

        try {
            const res = await fetch(`/api/admin/${activeTab}?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchData();
        } catch (error) {
            alert('Gagal menghapus data');
        }
    };

    const handleDeletePhoto = async (id: string, role: string) => {
        if (!confirm('Hapus foto profil ini karena melanggar aturan?')) return;

        try {
            const res = await fetch('/api/admin/photo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, role })
            });

            if (res.ok) {
                alert('Foto profil berhasil dihapus');
                fetchData();
            } else {
                alert('Gagal menghapus foto');
            }
        } catch (error) {
            alert('Kesalahan sistem');
        }
    };

    const filteredData = data.filter(item =>
        item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nis || item.nipy)?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="w-full">
            {/* Tab Selector */}
            <div className="flex gap-4 mb-8 justify-center">
                <button
                    onClick={() => setActiveTab('siswa')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-sm border-2 transition-all font-serif ${activeTab === 'siswa'
                        ? "bg-[#5d4037] text-[#f0e6d2] border-[#3e2723] shadow-md"
                        : "bg-[#f0e6d2] text-[#5d4037] border-[#d7ccc8] hover:bg-[#d7ccc8]/30"
                        }`}
                >
                    <GraduationCap className="w-5 h-5" />
                    Manajemen Siswa
                </button>
                <button
                    onClick={() => setActiveTab('guru')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-sm border-2 transition-all font-serif ${activeTab === 'guru'
                        ? "bg-[#5d4037] text-[#f0e6d2] border-[#3e2723] shadow-md"
                        : "bg-[#f0e6d2] text-[#5d4037] border-[#d7ccc8] hover:bg-[#d7ccc8]/30"
                        }`}
                >
                    <School className="w-5 h-5" />
                    Manajemen Guru
                </button>
            </div>

            {/* Actions & Search */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-white/50 p-4 rounded-sm border border-[#d7ccc8]">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8d6e63]" />
                    <input
                        type="text"
                        placeholder="Cari nama atau nomor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#5d4037] outline-none font-serif text-sm text-[#3e2723]"
                    />
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#5d4037] text-[#f0e6d2] px-6 py-2 rounded-sm border-b-4 border-[#3e2723] active:border-b-0 hover:bg-[#4e342e] transition-all font-serif"
                >
                    <UserPlus className="w-4 h-4" />
                    Tambah {activeTab === 'siswa' ? 'Siswa' : 'Guru'} baru
                </button>
            </div>

            {/* Data Table */}
            <div className="bg-[#f0e6d2] border-2 border-[#8d6e63] rounded-sm overflow-hidden shadow-sm bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-serif border-collapse">
                        <thead className="bg-[#5d4037] text-[#f0e6d2]">
                            <tr>
                                <th className="p-4 border-b border-[#3e2723] w-16">Foto</th>
                                <th className="p-4 border-b border-[#3e2723]">{activeTab === 'siswa' ? 'NIS' : 'NIPY'}</th>
                                <th className="p-4 border-b border-[#3e2723]">Nama</th>
                                <th className="p-4 border-b border-[#3e2723]">{activeTab === 'siswa' ? 'Kelas' : 'Detail'}</th>
                                <th className="p-4 border-b border-[#3e2723] text-center w-32">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-[#3e2723]">
                            {loading ? (
                                <tr><td colSpan={4} className="p-10 text-center italic">Membuka lembaran data...</td></tr>
                            ) : currentData.length === 0 ? (
                                <tr><td colSpan={4} className="p-10 text-center italic text-[#795548]">Belum ada data yang tertulis.</td></tr>
                            ) : (
                                currentData.map((item) => (
                                    <tr key={item._id} className="hover:bg-[#d7ccc8]/30 transition-colors border-b border-[#d7ccc8]/50">
                                        <td className="p-4">
                                            <div className="w-10 h-10 rounded-full border border-[#8d6e63] overflow-hidden bg-white/50">
                                                {item.foto ? (
                                                    <img
                                                        src={item.foto.startsWith('/uploads/') ? `/api${item.foto}` : item.foto}
                                                        alt="Thumb"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#d7ccc8]">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">{item.nis || item.nipy}</td>
                                        <td className="p-4 font-bold">{item.nama}</td>
                                        <td className="p-4 italic">
                                            {activeTab === 'siswa'
                                                ? item.kelas
                                                : (
                                                    <div className="flex flex-col">
                                                        <span>{item.ket || '-'}</span>
                                                        {item.waliKelas && (
                                                            <span className="text-xs text-[#5d4037] font-bold bg-[#d7ccc8]/50 px-2 py-0.5 rounded-full w-fit mt-1">
                                                                Wali Kelas: {item.waliKelas}
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            }
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-2">
                                                {item.foto && (
                                                    <button
                                                        onClick={() => handleDeletePhoto(item._id, activeTab)}
                                                        className="p-2 text-orange-600 hover:bg-orange-600 hover:text-white rounded-sm transition-all"
                                                        title="Hapus Foto Profil"
                                                    >
                                                        <ImageOff className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="p-2 text-[#5d4037] hover:bg-[#5d4037] hover:text-white rounded-sm transition-all"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item._id)}
                                                    className="p-2 text-red-700 hover:bg-red-700 hover:text-white rounded-sm transition-all"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {!loading && filteredData.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4 px-2">
                    <p className="text-sm text-[#8d6e63] font-serif italic">
                        Menampilkan {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredData.length)} dari {filteredData.length} data
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-[#f0e6d2] border border-[#d7ccc8] text-[#5d4037] rounded-sm disabled:opacity-50 hover:bg-[#d7ccc8]/50 font-serif text-sm transition-colors"
                        >
                            Sebelumnya
                        </button>
                        <span className="px-4 py-2 bg-[#5d4037] text-[#f0e6d2] rounded-sm font-serif text-sm flex items-center shadow-sm">
                            Halaman {currentPage}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                            className="px-4 py-2 bg-[#f0e6d2] border border-[#d7ccc8] text-[#5d4037] rounded-sm disabled:opacity-50 hover:bg-[#d7ccc8]/50 font-serif text-sm transition-colors"
                        >
                            Berikutnya
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#fdfbf7] w-full max-w-md p-8 rounded-sm border-2 border-[#8d6e63] shadow-2xl relative bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] max-h-[90vh] overflow-y-auto">
                        {/* Decorative internal border */}
                        <div className="absolute inset-2 border border-dashed border-[#8d6e63] opacity-30 pointer-events-none"></div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-[#8d6e63] hover:text-[#3e2723]"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-serif font-bold text-[#3e2723] mb-6 border-b border-[#8d6e63]/30 pb-2">
                            {editingItem ? 'Perbarui Data' : `Tambah ${activeTab === 'siswa' ? 'Siswa' : 'Guru'}`}
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4 font-serif">
                            <div>
                                <label className="block text-sm text-[#5d4037] mb-1">{activeTab === 'siswa' ? 'NIS' : 'NIPY'}</label>
                                <input
                                    type="text"
                                    required
                                    value={activeTab === 'siswa' ? formData.nis : formData.nipy}
                                    onChange={(e) => setFormData({ ...formData, [activeTab === 'siswa' ? 'nis' : 'nipy']: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#5d4037] outline-none text-[#3e2723]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#5d4037] mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nama}
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#5d4037] outline-none text-[#3e2723]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#5d4037] mb-1">{activeTab === 'siswa' ? 'Kelas' : 'Jabatan'}</label>
                                <div className="relative">
                                    {activeTab === 'siswa' ? (
                                        <>
                                            <input
                                                type="text"
                                                required
                                                list="classListData"
                                                value={formData.kelas}
                                                onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                                                className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#5d4037] outline-none text-[#3e2723]"
                                                placeholder="Pilih atau ketik kelas baru..."
                                            />
                                            <datalist id="classListData">
                                                {classList.map((k: string) => (
                                                    <option key={k} value={k} />
                                                ))}
                                            </datalist>
                                        </>
                                    ) : (
                                        <select
                                            value={formData.ket}
                                            onChange={(e) => setFormData({ ...formData, ket: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#5d4037] outline-none text-[#3e2723]"
                                        >
                                            <option value="">Pilih Jabatan...</option>
                                            <option value="Wali Kelas">Wali Kelas</option>
                                            <option value="Guru PAI">Guru PAI</option>
                                            <option value="Keduanya">Keduanya (Wali Kelas & Guru PAI)</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            {activeTab === 'guru' && (formData.ket === 'Wali Kelas' || formData.ket === 'Keduanya') && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="block text-sm text-[#5d4037] mb-1">Wali Kelas Untuk</label>
                                    <div className="relative">
                                        <select
                                            required={true}
                                            value={formData.waliKelas}
                                            onChange={(e) => setFormData({ ...formData, waliKelas: e.target.value })}
                                            className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#5d4037] outline-none text-[#3e2723]"
                                        >
                                            <option value="">-- Pilih Kelas --</option>
                                            {classList.map((k: string) => (
                                                <option key={k} value={k}>{k}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.waliKelas && (
                                        <p className={`text-xs mt-1 ${classList.some(c => c.toLowerCase() === formData.waliKelas.toLowerCase())
                                            ? "text-green-600 font-bold"
                                            : "text-red-500 font-bold"
                                            }`}>
                                            {classList.some(c => c.toLowerCase() === formData.waliKelas.toLowerCase())
                                                ? "✓ Kelas valid (Data siswa tersedia)"
                                                : "⚠ Peringatan: Kelas ini belum memiliki data siswa!"}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-[#5d4037] mb-1">Email Pribadi</label>
                                <input
                                    type="email"
                                    value={formData.emailPribadi}
                                    onChange={(e) => setFormData({ ...formData, emailPribadi: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#5d4037] outline-none text-[#3e2723]"
                                    placeholder="contoh@gmail.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#5d4037] mb-1">No WhatsApp (WA)</label>
                                <input
                                    type="text"
                                    value={formData.noHp}
                                    onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#5d4037] outline-none text-[#3e2723]"
                                    placeholder="08123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#5d4037] mb-1">
                                    {editingItem ? 'Password Baru (Kosongkan jika tidak diubah)' : 'Password'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingItem}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:border-[#5d4037] outline-none text-[#3e2723]"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-[#5d4037] text-white py-3 rounded-sm border-b-4 border-[#3e2723] active:border-b-0 hover:bg-[#4e342e] transition-all"
                                >
                                    <Save className="w-5 h-5" />
                                    {editingItem ? 'Simpan Perubahan' : 'Catat Data Baru'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
