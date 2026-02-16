
'use client';

import { useState, useEffect } from 'react';
import { User, Phone, Edit, MessageSquare, Save, Camera, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit Form State
    const [noHp, setNoHp] = useState('');
    const [status, setStatus] = useState('');
    const [emailPribadi, setEmailPribadi] = useState('');
    const [fotoUrl, setFotoUrl] = useState('');
    const [previewFoto, setPreviewFoto] = useState('');

    // File Upload State
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/profile');
            const json = await res.json();
            if (json.success) {
                setUser(json.data);
                setNoHp(json.data.noHp || '');
                setStatus(json.data.status || '');
                setEmailPribadi(json.data.emailPribadi || '');
                setFotoUrl(json.data.foto || '');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // --- SOLUSI JITU: Kompresi Gambar di Browser ---
        const compressImage = (file: File): Promise<string> => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new (window as any).Image();
                    img.src = event.target?.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 400; // Ukuran pas untuk profil
                        const scaleSize = MAX_WIDTH / img.width;
                        canvas.width = MAX_WIDTH;
                        canvas.height = img.height * scaleSize;

                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                        // Kompres ke format WebP atau JPEG dengan kualitas 0.7
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        resolve(dataUrl);
                    };
                };
            });
        };

        try {
            setUploading(true);
            const compressedBase64 = await compressImage(file);

            // Preview lokal langsung dari base64
            setPreviewFoto(compressedBase64);

            // Kirim ke API (Kita modif API-nya untuk terima Base64 atau langsung simpan)
            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: compressedBase64 })
            });

            const json = await res.json();
            if (json.success) {
                setFotoUrl(json.url);
            } else {
                alert('Gagal upload: ' + json.message);
            }
        } catch (e: any) {
            console.error('Upload error:', e);
            alert('Gagal memproses foto.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    noHp,
                    status,
                    emailPribadi,
                    foto: fotoUrl
                })
            });

            const json = await res.json();
            if (res.ok && json.success) {
                alert('Profil berhasil diperbarui!');
                setPreviewFoto(''); // Clear preview because we'll use actual updated URL
                fetchProfile(); // Refresh Data
            } else {
                alert('Gagal memperbarui profil: ' + (json.error || 'Silakan coba lagi.'));
            }
        } catch (e: any) {
            console.error('Save error:', e);
            alert('Terjadi kesalahan saat menyimpan data.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center font-serif text-[#5d4037]">
            Memuat Profil...
        </div>
    );

    if (!user) return (
        <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center font-serif text-[#5d4037]">
            <p>Data tidak ditemukan. Silakan login kembali.</p>
            <Link href="/" className="mt-4 underline">Ke Halaman Login</Link>
        </div>
    );

    const roleLabel = user.nis ? 'Siswa' : 'Guru';
    const idLabel = user.nis ? 'NIS' : 'NIPY';
    const idValue = user.nis || user.nipy;
    const subLabel = user.kelas || user.ket || '-';

    return (
        <div className="min-h-screen bg-[#fdfbf7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] font-serif pb-20">
            {/* Header Simple */}
            <div className="bg-[#5d4037] text-[#fdfbf7] p-4 shadow-md sticky top-0 z-[50]">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Link href={user.nis ? "/dashboard" : "/teacher"} className="flex items-center gap-2 hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-bold hidden sm:inline">Kembali</span>
                    </Link>
                    <h1 className="text-xl font-bold tracking-wide">Profil Saya</h1>
                    <div className="w-8"></div> {/* Spacer */}
                </div>
            </div>

            <main className="max-w-2xl mx-auto p-6 mt-6">

                <div className="bg-white rounded-xl shadow-lg border border-[#d7ccc8] overflow-hidden relative">
                    {/* Cover Background (Optional) */}
                    <div className="h-32 bg-gradient-to-r from-[#8d6e63] to-[#5d4037]"></div>

                    {/* Profile Header */}
                    <div className="px-6 pb-6 relative">
                        {/* Avatar Wrapper */}
                        <div className="absolute -top-16 left-6">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#efebe9]">
                                    {previewFoto || fotoUrl ? (
                                        <img
                                            src={(previewFoto || fotoUrl).startsWith('/uploads/') ? `/api${previewFoto || fotoUrl}` : (previewFoto || fotoUrl)}
                                            alt="Foto Profil"
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#d7ccc8]">
                                            <User className="w-16 h-16" />
                                        </div>
                                    )}
                                </div>

                                {/* Camera Icon Overlay */}
                                <label className="absolute bottom-0 right-0 bg-[#5d4037] text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-[#3e2723] transition-colors">
                                    <Camera className="w-5 h-5" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                            {uploading && (
                                <div className="absolute top-2 -right-16 bg-white/80 px-2 py-1 rounded text-[10px] font-bold text-[#5d4037] shadow-sm">
                                    Uploading...
                                </div>
                            )}
                        </div>

                        {/* Name & Basic Info - Beside Avatar but pushed down */}
                        <div className="ml-36 pt-2">
                            <h2 className="text-2xl font-bold text-[#3e2723] leading-tight">{user.nama}</h2>
                            <p className="text-[#8d6e63] font-bold text-sm mt-1 uppercase tracking-wide">
                                {roleLabel} • {subLabel}
                            </p>
                            <p className="text-[#a1887f] text-xs font-mono mt-1">
                                {idLabel}: {idValue}
                            </p>
                        </div>
                    </div>

                    {/* Form Edit */}
                    <form onSubmit={handleSave} className="p-6 border-t border-[#d7ccc8] space-y-6">

                        {/* Status Quote */}
                        <div>
                            <label className="block text-sm font-bold text-[#5d4037] mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Status / Motto Ramadan
                            </label>
                            <textarea
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full p-3 border border-[#d7ccc8] rounded-lg bg-[#fafafa] focus:ring-2 focus:ring-[#8d6e63] focus:border-[#5d4037] outline-none text-[#3e2723] min-h-[80px]"
                                placeholder="Tuliskan motivasi atau status Ramadanmu..."
                                maxLength={150}
                            />
                            <p className="text-right text-xs text-[#a1887f] mt-1">{status.length}/150</p>
                        </div>

                        {/* No HP / WhatsApp */}
                        <div>
                            <label className="block text-sm font-bold text-[#5d4037] mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Nomor Handphone / WhatsApp
                            </label>
                            <input
                                type="text"
                                value={noHp}
                                onChange={(e) => setNoHp(e.target.value)}
                                className="w-full p-3 border border-[#d7ccc8] rounded-lg bg-[#fafafa] focus:ring-2 focus:ring-[#8d6e63] focus:border-[#5d4037] outline-none text-[#3e2723]"
                                placeholder="Contoh: 081234567890"
                            />
                            <p className="text-xs text-[#a1887f] mt-1 italic">
                                *Nomor ini hanya akan dilihat oleh Admin/Guru untuk keperluan komunikasi.
                            </p>
                        </div>

                        {/* Email Fields */}
                        <div className="space-y-4 pt-2">
                            {/* School Email (Read Only) */}
                            <div>
                                <label className="block text-sm font-bold text-[#5d4037] mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                    Email Sekolah (B-Mail)
                                </label>
                                <div className="p-3 border border-[#d7ccc8] rounded-lg bg-blue-50/50 text-[#3e2723] font-mono text-sm break-all">
                                    {idValue.toLowerCase()}@smk.baktinusantara666.sch.id
                                </div>
                                <p className="text-[10px] md:text-xs text-blue-700 mt-2 leading-relaxed bg-blue-50 p-2 rounded border border-blue-100 italic">
                                    💡 Anda bisa login ke email sekolah ini dengan masuk ke <a href="https://baknusmail.smkbn666.sch.id" target="_blank" className="font-bold underline">baknusmail.smkbn666.sch.id</a> dengan password sama dengan aplikasi Karomah ini.
                                </p>
                            </div>

                            {/* Personal Email (Editable) */}
                            <div>
                                <label className="block text-sm font-bold text-[#5d4037] mb-2 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Pribadi
                                </label>
                                <input
                                    type="email"
                                    value={emailPribadi}
                                    onChange={(e) => setEmailPribadi(e.target.value)}
                                    className="w-full p-3 border border-[#d7ccc8] rounded-lg bg-[#fafafa] focus:ring-2 focus:ring-[#8d6e63] focus:border-[#5d4037] outline-none text-[#3e2723]"
                                    placeholder="contoh@gmail.com"
                                />
                                <p className="text-xs text-[#a1887f] mt-1 italic">
                                    *Gunakan email pribadi yang aktif (seperti Gmail).
                                </p>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving || uploading}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-md transition-all
                                    ${saving || uploading
                                        ? 'bg-[#d7ccc8] text-[#8d6e63] cursor-not-allowed'
                                        : 'bg-[#5d4037] text-[#fdfbf7] hover:bg-[#3e2723] hover:shadow-lg active:scale-95'}
                                `}
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>

                    </form>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-[#a1887f] text-xs">Aplikasi Jurnal Ramadan - SMK Bakti Nusantara 666</p>
                </div>

            </main>
        </div>
    );
}
