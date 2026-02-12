
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle, PenTool, Eraser, Check, X, Camera, Image as ImageIcon, Trash2, SwitchCamera } from 'lucide-react';
import { SURAH_LIST } from '@/lib/quran';
import { RAMADAN_HADITHS } from '@/lib/hadits';
import SignatureCanvas from 'react-signature-canvas';
import { createPortal } from 'react-dom';

interface JournalEntryFormProps {
    day: number;
    initialData?: any;
}

// Helper component for 24-hour time selection
function TimeSelect({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) {
    const [h, m] = value ? value.split(':') : ['', ''];

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

    const updateTime = (newH: string, newM: string) => {
        if (newH === '' && newM === '') {
            onChange('');
        } else {
            onChange(`${newH || '00'}:${newM || '00'}`);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex gap-2 items-center">
                <div className="relative w-full">
                    <select
                        value={h}
                        onChange={(e) => updateTime(e.target.value, m)}
                        className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white text-[#3e2723]"
                    >
                        <option value="">Jam</option>
                        {hours.map(hour => (
                            <option key={hour} value={hour}>{hour}</option>
                        ))}
                    </select>
                </div>
                <span className="font-bold text-gray-400">:</span>
                <div className="relative w-full">
                    <select
                        value={m}
                        onChange={(e) => updateTime(h, e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white text-[#3e2723]"
                    >
                        <option value="">Menit</option>
                        {minutes.map(min => (
                            <option key={min} value={min}>{min}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

// Helper function to compress image
const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Max dimension 800px to keep size small
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                // Compress to JPEG 0.6 quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

export default function JournalEntryForm({ day, initialData }: JournalEntryFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Signature State
    const [showSigModal, setShowSigModal] = useState(false);
    const sigCanvas = useRef<SignatureCanvas>(null);
    const [signaturePreview, setSignaturePreview] = useState(initialData?.tanda_tangan || '');

    // Camera State
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [cameraSection, setCameraSection] = useState('');
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const [isMounted, setIsMounted] = useState(false);

    // Hadith for today
    const todayHadith = RAMADAN_HADITHS.find(h => h.day === day);

    useEffect(() => {
        setIsMounted(true);
        return () => {
            // Cleanup stream if component unmounts
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const DEFAULT_DATA = {
        jam_bangun: '',
        sahur: false,
        sholat_wajib: {
            subuh: false, dhuhur: false, ashar: false, magrib: false, isya: false
        },
        sholat_sunah: {
            rawatib: false, dhuha: false, tarawih: false, tahajud: false, taubat: false, mutlak: false, hajat: false
        },
        tadarus: { surat: '', ayat: '' },
        olah_raga: { ya_tidak: false, kegiatan: '' },
        bantu_ortu: { ya_tidak: false, kegiatan: '' },
        aktifitas_sosial: { ya_tidak: false, kegiatan: '', foto: '' },
        catatan_ihsan: { sumber: '', isi: '', foto: '' },
        jam_tidur: '',
        tanda_tangan: ''
    };

    const [formData, setFormData] = useState(() => {
        if (!initialData) return DEFAULT_DATA;

        // Deep merge for safety
        return {
            ...DEFAULT_DATA,
            ...initialData,
            sholat_wajib: { ...DEFAULT_DATA.sholat_wajib, ...initialData.sholat_wajib },
            sholat_sunah: { ...DEFAULT_DATA.sholat_sunah, ...initialData.sholat_sunah },
            tadarus: { ...DEFAULT_DATA.tadarus, ...initialData.tadarus },
            olah_raga: { ...DEFAULT_DATA.olah_raga, ...initialData.olah_raga },
            bantu_ortu: { ...DEFAULT_DATA.bantu_ortu, ...initialData.bantu_ortu },
            aktifitas_sosial: { ...DEFAULT_DATA.aktifitas_sosial, ...initialData.aktifitas_sosial },
            catatan_ihsan: { ...DEFAULT_DATA.catatan_ihsan, ...initialData.catatan_ihsan },
            tanda_tangan: initialData.tanda_tangan || ''
        };
    });

    const handleChange = (section: string, field: string, value: any) => {
        if (section === 'root') {
            setFormData({ ...formData, [field]: value });
        } else {
            setFormData({
                ...formData,
                [section]: { ...formData[section], [field]: value }
            });
        }
    };

    const handleImageUpload = async (section: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                // Show loading indicator if needed here
                const compressedBase64 = await compressImage(file);
                handleChange(section, 'foto', compressedBase64);
            } catch (error) {
                console.error("Error compressing image", error);
                alert("Gagal memproses gambar. Pastikan format gambar didukung.");
            }
        }
    };

    const removeImage = (section: string) => {
        handleChange(section, 'foto', '');
    };

    // Camera Logic
    const startCamera = async (section: string) => {
        setCameraSection(section);
        setShowCameraModal(true);
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Camera Error:", err);
            alert("Gagal mengakses kamera. Pastikan izin kamera diberikan di browser Anda.");
            setShowCameraModal(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setShowCameraModal(false);
    };

    const takePhoto = () => {
        if (videoRef.current) {
            const video = videoRef.current;
            const canvas = document.createElement('canvas');
            // Set canvas dimentions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Compress result
                // Resize if too big handled by compressImage logic adapted for canvas?
                // For simplicity, just high compression
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

                handleChange(cameraSection, 'foto', dataUrl);
                stopCamera();
            }
        }
    };

    // Signature Logic
    const handleSaveSignature = () => {
        if (sigCanvas.current) {
            if (sigCanvas.current.isEmpty()) {
                alert("Silakan buat tanda tangan terlebih dahulu!");
                return;
            }
            const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            setSignaturePreview(dataURL);
            handleChange('root', 'tanda_tangan', dataURL);
            setShowSigModal(false);
        }
    };

    const handleClearSignature = () => {
        sigCanvas.current?.clear();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, tgl_jurnal: day }),
            });

            if (!res.ok) throw new Error('Failed to save journal');

            router.refresh();
            alert('Data berhasil diperbarui!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-6 bg-[#fdfbf7] shadow-inner rounded-sm border border-[#d7ccc8] relative">
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#8d6e63] opacity-40"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#8d6e63] opacity-40"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#8d6e63] opacity-40"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#8d6e63] opacity-40"></div>

                {/* Header Sekolah & Hadits Harian */}
                <div className="text-center mb-6 relative z-10">
                    <h2 className="font-serif text-lg md:text-xl font-bold text-[#3e2723] uppercase tracking-widest mb-4 border-b-2 border-[#8d6e63]/20 pb-2 inline-block">
                        SMK Bakti Nusantara 666
                    </h2>

                    {todayHadith && (
                        <div className="bg-[#fffdf9] p-5 rounded-xl border border-[#d7ccc8] shadow-sm relative mt-2 group hover:shadow-md transition-shadow">

                            <div className="space-y-3">
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fdfbf7] px-3 text-[#8d6e63] text-xs font-serif italic border border-[#d7ccc8] rounded-full">
                                    Mutiara Ramadan Hari ke-{day}
                                </span>

                                <p className="font-serif text-xl md:text-2xl text-[#5d4037] leading-loose text-center py-2" dir="rtl" lang="ar">
                                    {todayHadith.arabic}
                                </p>
                                <div className="h-px w-1/2 mx-auto bg-gradient-to-r from-transparent via-[#d7ccc8] to-transparent"></div>
                                <p className="font-serif text-sm md:text-base text-[#3e2723] italic leading-relaxed">
                                    "{todayHadith.translation}"
                                </p>
                                <p className="font-sans text-[10px] text-[#8d6e63] font-bold uppercase tracking-wider text-right mt-2">
                                    — {todayHadith.narrator}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 text-red-800 p-4 rounded-sm border border-red-200 flex items-center gap-2 font-serif text-sm">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Catatan Guru / Teacher's Note */}
                {initialData?.catatan_guru && (
                    <div className="bg-[#f0e6d2] p-6 rounded-sm border-2 border-[#8d6e63] shadow-sm relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/parchment.png')] animate-in fade-in zoom-in duration-500">
                        <div className="absolute top-0 right-0 p-2">
                            <div className="w-8 h-8 opacity-20 transform rotate-12">
                                <Save className="w-full h-full text-[#5d4037]" />
                            </div>
                        </div>
                        <h4 className="text-sm font-bold text-[#8d6e63] uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-6 h-[1px] bg-[#8d6e63]"></span>
                            Pesan dari Pembina
                            <span className="w-6 h-[1px] bg-[#8d6e63]"></span>
                        </h4>
                        <p className="text-[#3e2723] italic font-serif leading-relaxed text-lg">
                            "{initialData.catatan_guru}"
                        </p>
                        <div className="mt-4 flex justify-end flex-col items-end">
                            <div className="text-[10px] text-[#8d6e63] font-bold uppercase tracking-tighter">
                                Tertanda, {initialData.nama_guru_komentar || 'Guru Pembina Karomah'}
                            </div>
                            {initialData.dikomentari_pada && (
                                <div className="text-[9px] text-[#8d6e63] italic mt-1 text-right">
                                    {new Date(initialData.dikomentari_pada).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                    })} WIB
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Basic Info */}
                <section className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-[#3e2723] border-b border-[#8d6e63]/30 pb-2">Rutinitas Pagi</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <TimeSelect
                                label="Jam Bangun"
                                value={formData.jam_bangun}
                                onChange={(val) => handleChange('root', 'jam_bangun', val)}
                            />
                        </div>
                        <div className="flex items-center sm:pt-6">
                            <input
                                type="checkbox"
                                checked={formData.sahur}
                                onChange={(e) => handleChange('root', 'sahur', e.target.checked)}
                                className="w-5 h-5 text-[#5d4037] border-gray-300 rounded focus:ring-[#8d6e63]"
                                id="sahur"
                            />
                            <label htmlFor="sahur" className="ml-2 text-sm font-serif font-medium text-[#5d4037]">Melaksanakan Sahur?</label>
                        </div>
                    </div>
                </section>

                {/* Sholat Wajib */}
                <section className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-[#3e2723] border-b border-[#8d6e63]/30 pb-2">Sholat Wajib</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.keys(formData.sholat_wajib).map((prayer) => (
                            <div key={prayer} className="flex items-center bg-[#efebe9]/50 p-3 rounded-sm border border-[#d7ccc8] hover:bg-[#d7ccc8]/30 transition-colors cursor-pointer group">
                                <input
                                    type="checkbox"
                                    id={`wajib-${prayer}`}
                                    checked={formData.sholat_wajib[prayer]}
                                    onChange={(e) => handleChange('sholat_wajib', prayer, e.target.checked)}
                                    className="w-5 h-5 text-[#5d4037] border-gray-300 rounded focus:ring-[#8d6e63]"
                                />
                                <label htmlFor={`wajib-${prayer}`} className="ml-2 text-sm font-serif text-[#4e342e] capitalize cursor-pointer flex-1 group-hover:font-bold transition-all">{prayer}</label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Sholat Sunah */}
                <section className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-[#3e2723] border-b border-[#8d6e63]/30 pb-2">Sholat Sunnah</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.keys(formData.sholat_sunah).map((prayer) => (
                            <div key={prayer} className="flex items-center bg-[#efebe9]/50 p-3 rounded-sm border border-[#d7ccc8] hover:bg-[#d7ccc8]/30 transition-colors cursor-pointer group">
                                <input
                                    type="checkbox"
                                    id={`sunah-${prayer}`}
                                    checked={formData.sholat_sunah[prayer]}
                                    onChange={(e) => handleChange('sholat_sunah', prayer, e.target.checked)}
                                    className="w-5 h-5 text-[#5d4037] border-gray-300 rounded focus:ring-[#8d6e63]"
                                />
                                <label htmlFor={`sunah-${prayer}`} className="ml-2 text-sm font-serif text-[#4e342e] capitalize cursor-pointer flex-1 group-hover:font-bold transition-all">{prayer}</label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Tadarus */}
                <section className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-[#3e2723] border-b border-[#8d6e63]/30 pb-2">Tadarus Al-Qur'an</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-serif font-medium text-[#5d4037] mb-1">Nama Surat</label>
                            <select
                                value={formData.tadarus.surat}
                                onChange={(e) => handleChange('tadarus', 'surat', e.target.value)}
                                className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:ring-[#8d6e63] focus:border-[#5d4037] font-serif outline-none text-[#3e2723]"
                            >
                                <option value="">Pilih Surat...</option>
                                {SURAH_LIST.map((surah) => (
                                    <option key={surah} value={surah}>{surah}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-serif font-medium text-[#5d4037] mb-1">Ayat</label>
                            <input
                                type="text"
                                value={formData.tadarus.ayat}
                                onChange={(e) => handleChange('tadarus', 'ayat', e.target.value)}
                                className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:ring-[#8d6e63] focus:border-[#5d4037] font-serif outline-none text-[#3e2723]"
                                placeholder="Contoh: 1-10"
                            />
                        </div>
                    </div>
                </section>

                {/* Activities with Toggles and Photos (Updated for Aktifitas Sosial) */}
                {['olah_raga', 'bantu_ortu', 'aktifitas_sosial'].map((activity) => (
                    <section key={activity} className="space-y-4">
                        <h3 className="text-xl font-serif font-bold text-[#3e2723] border-b border-[#8d6e63]/30 pb-2 capitalize">{activity.replace('_', ' ')}</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`${activity}-check`}
                                    checked={formData[activity].ya_tidak}
                                    onChange={(e) => handleChange(activity, 'ya_tidak', e.target.checked)}
                                    className="w-5 h-5 text-[#5d4037] border-gray-300 rounded focus:ring-[#8d6e63]"
                                />
                                <label htmlFor={`${activity}-check`} className="ml-2 text-sm font-serif font-medium text-[#5d4037]">Dilakukan?</label>
                            </div>
                            {formData[activity].ya_tidak && (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="block text-sm font-serif font-medium text-[#5d4037] mb-1">Detail Keterangan</label>
                                        <textarea
                                            value={formData[activity].kegiatan}
                                            onChange={(e) => handleChange(activity, 'kegiatan', e.target.value)}
                                            className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:ring-[#8d6e63] focus:border-[#5d4037] font-serif outline-none text-[#3e2723]"
                                            rows={2}
                                            placeholder={`Ceritakan detail aktifitas ${activity.replace('_', ' ')}...`}
                                        />
                                    </div>

                                    {/* Upload Foto Khusus untuk Aktifitas Sosial */}
                                    {activity === 'aktifitas_sosial' && (
                                        <div className="bg-[#fffdf9] p-3 rounded-md border border-dashed border-[#d7ccc8]">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-serif font-medium text-[#5d4037] flex items-center gap-2">
                                                    <Camera className="w-4 h-4" />
                                                    Dokumentasi / Foto
                                                </label>
                                                {formData[activity].foto && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(activity)}
                                                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Hapus
                                                    </button>
                                                )}
                                            </div>

                                            {formData[activity].foto ? (
                                                <div className="relative w-full h-40 bg-gray-100 rounded-sm overflow-hidden border border-[#d7ccc8]">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={formData[activity].foto} alt="Dokumentasi" className="w-full h-full object-cover" />
                                                </div>
                                            ) : (
                                                <div className="flex gap-3 mt-2">
                                                    {/* Tombol Kamera Universal */}
                                                    <button
                                                        type="button"
                                                        onClick={() => startCamera(activity)}
                                                        className="relative group flex-1 bg-[#efebe9] hover:bg-[#d7ccc8] transition-colors rounded-lg border border-[#d7ccc8] cursor-pointer shadow-sm active:scale-95 transform flex flex-col items-center justify-center py-4 text-[#5d4037]"
                                                    >
                                                        <Camera className="w-6 h-6 mb-1" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wide">Ambil Foto</span>
                                                    </button>

                                                    {/* Tombol Galeri */}
                                                    <div className="relative group flex-1 bg-[#efebe9] hover:bg-[#d7ccc8] transition-colors rounded-lg border border-[#d7ccc8] cursor-pointer shadow-sm active:scale-95 transform">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => handleImageUpload(activity, e)}
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="flex flex-col items-center justify-center py-4 text-[#5d4037]">
                                                            <ImageIcon className="w-6 h-6 mb-1" />
                                                            <span className="text-[10px] font-bold uppercase tracking-wide">Galeri</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>
                ))}

                {/* Catatan IHSAN (updated label) */}
                <section className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-[#3e2723] border-b border-[#8d6e63]/30 pb-2">IHSAN</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-serif font-medium text-[#5d4037] mb-1">Sumber / Penceramah</label>
                            <input
                                type="text"
                                value={formData.catatan_ihsan.sumber}
                                onChange={(e) => handleChange('catatan_ihsan', 'sumber', e.target.value)}
                                className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:ring-[#8d6e63] focus:border-[#5d4037] font-serif outline-none text-[#3e2723]"
                                placeholder="Contoh: Kultum Masjid / Youtube"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-serif font-medium text-[#5d4037] mb-1">Isi Catatan</label>
                            <textarea
                                value={formData.catatan_ihsan.isi}
                                onChange={(e) => handleChange('catatan_ihsan', 'isi', e.target.value)}
                                className="w-full p-2.5 bg-white border border-[#d7ccc8] rounded-sm focus:ring-[#8d6e63] focus:border-[#5d4037] font-serif outline-none text-[#3e2723]"
                                rows={3}
                                placeholder="Ringkasan materi..."
                            />
                        </div>

                        {/* Foto Catatan Ihsan */}
                        <div className="bg-[#fffdf9] p-3 rounded-md border border-dashed border-[#d7ccc8] mt-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-serif font-medium text-[#5d4037] flex items-center gap-2">
                                    <Camera className="w-4 h-4" />
                                    Foto Bukti / Catatan
                                </label>
                                {formData.catatan_ihsan.foto && (
                                    <button
                                        type="button"
                                        onClick={() => removeImage('catatan_ihsan')}
                                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" /> Hapus
                                    </button>
                                )}
                            </div>

                            {formData.catatan_ihsan.foto ? (
                                <div className="relative w-full h-40 bg-gray-100 rounded-sm overflow-hidden border border-[#d7ccc8]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={formData.catatan_ihsan.foto} alt="Dokumentasi Ihsan" className="w-full h-full object-cover" />
                                </div>
                            ) : (
                                <div className="flex gap-3 mt-2">
                                    {/* Tombol Kamera Universal */}
                                    <button
                                        type="button"
                                        onClick={() => startCamera('catatan_ihsan')}
                                        className="relative group flex-1 bg-[#efebe9] hover:bg-[#d7ccc8] transition-colors rounded-lg border border-[#d7ccc8] cursor-pointer shadow-sm active:scale-95 transform flex flex-col items-center justify-center py-4 text-[#5d4037]"
                                    >
                                        <Camera className="w-6 h-6 mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-wide">Ambil Foto</span>
                                    </button>

                                    {/* Tombol Galeri */}
                                    <div className="relative group flex-1 bg-[#efebe9] hover:bg-[#d7ccc8] transition-colors rounded-lg border border-[#d7ccc8] cursor-pointer shadow-sm active:scale-95 transform">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload('catatan_ihsan', e)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center justify-center py-4 text-[#5d4037]">
                                            <ImageIcon className="w-6 h-6 mb-1" />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">Galeri</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tanda Tangan Button & Preview */}
                        <div className="mt-4">
                            <label className="block text-sm font-serif font-medium text-[#5d4037] mb-2">Tanda Tangan</label>
                            {signaturePreview ? (
                                <div className="space-y-2">
                                    <div
                                        className="relative border-2 border-[#d7ccc8] border-dashed rounded-sm w-full max-w-[200px] h-32 bg-white cursor-pointer hover:border-[#8d6e63] flex items-center justify-center group"
                                        onClick={() => setShowSigModal(true)}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={signaturePreview} alt="Signature" className="max-w-full max-h-full object-contain" />
                                        <div className="absolute top-0 right-0 bg-[#fdfbf7] p-1.5 rounded-bl-sm border-l border-b border-[#d7ccc8] group-hover:bg-[#efebe9]">
                                            <PenTool className="w-3.5 h-3.5 text-[#8d6e63]" />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSignaturePreview('');
                                            handleChange('root', 'tanda_tangan', '');
                                        }}
                                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-serif underline"
                                    >
                                        <Eraser className="w-3 h-3" /> Hapus Tanda Tangan
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        console.log("Tombol Tanda Tangan Diklik!");
                                        setShowSigModal(true);
                                    }}
                                    className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-[#8d6e63] text-[#8d6e63] bg-[#fdfbf7] rounded-md hover:bg-[#efebe9] transition-all font-serif text-sm font-bold w-full sm:w-auto justify-center active:scale-95 shadow-sm"
                                >
                                    <PenTool className="w-4 h-4" />
                                    Klik untuk Tanda Tangan
                                </button>
                            )}
                        </div>
                    </div>
                </section>

                {/* Jam Tidur */}
                <section className="space-y-4">
                    <h3 className="text-xl font-serif font-bold text-[#3e2723] border-b border-[#8d6e63]/30 pb-2">Istirahat</h3>
                    <div>
                        <TimeSelect
                            label="Jam Tidur (Malam)"
                            value={formData.jam_tidur}
                            onChange={(val) => handleChange('root', 'jam_tidur', val)}
                        />
                    </div>
                </section>

                <div className="pt-8 border-t border-[#8d6e63]/30">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-[#5d4037] text-[#fdfbf7] font-serif font-bold py-4 rounded-sm border-b-4 border-[#3e2723] active:border-b-0 hover:bg-[#4e342e] hover:-translate-y-px active:translate-y-1 transition-all shadow-md disabled:opacity-70"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Menyimpan...' : 'Simpan Jurnal'}
                    </button>

                    {/* Last Updated Info */}
                    {(initialData?.updatedAt || initialData?.createdAt) && (
                        <div className="text-center mt-4 space-y-1">
                            <p className="text-xs text-[#8d6e63] font-serif italic opacity-80">
                                Terakhir disimpan:
                            </p>
                            <p className="text-xs text-[#5d4037] font-serif font-semibold">
                                {new Date(initialData.updatedAt || initialData.createdAt).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}
                </div>
            </form>

            {/* CAMERA MODAL */}
            {showCameraModal && isMounted && createPortal(
                <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-black w-full max-w-lg h-full sm:h-auto sm:rounded-xl shadow-2xl flex flex-col relative overflow-hidden">

                        {/* Video Viewport */}
                        <div className="relative flex-1 bg-black flex items-center justify-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-contain sm:object-cover sm:max-h-[60vh]"
                            />

                            {/* Guide lines */}
                            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/30"></div>
                            <div className="absolute inset-10 border-2 border-white/20 rounded-lg pointer-events-none"></div>
                        </div>

                        {/* Controls */}
                        <div className="bg-[#1a1a1a] p-6 flex items-center justify-between gap-4">
                            <button
                                type="button"
                                onClick={stopCamera}
                                className="p-3 text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <button
                                type="button"
                                onClick={takePhoto}
                                className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors shadow-lg active:scale-95"
                            >
                                <div className="w-4 h-4 bg-white rounded-full"></div>
                            </button>

                            <button
                                type="button"
                                // Logic switch camera bisa ditambahkan disini nanti
                                onClick={() => { }}
                                className="p-3 text-white/50 hover:bg-white/10 rounded-full transition-colors opacity-0 cursor-default"
                            >
                                <SwitchCamera className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* SIGNATURE MODAL - PORTAL TO BODY */}
            {showSigModal && isMounted && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowSigModal(false)}>
                    {/* Stop propagation agar klik di modal tidak menutup modal */}
                    <div className="bg-[#fffdf9] w-full max-w-lg p-6 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-4 relative z-[100000] border border-[#d7ccc8]" onClick={(e) => e.stopPropagation()}>

                        <div className="flex justify-between items-center border-b border-[#d7ccc8] pb-3">
                            <h4 className="font-serif font-bold text-xl text-[#3e2723]">Buat Tanda Tangan</h4>
                            <button onClick={() => setShowSigModal(false)} className="p-1 text-[#8d6e63] hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Canvas Container */}
                        <div className="border-2 border-dashed border-[#d7ccc8] rounded-lg bg-white overflow-hidden relative w-full h-64 shadow-inner">
                            {/* Background Text Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
                                <span className="text-5xl font-serif text-[#3e2723] -rotate-12 italic">Sign Here</span>
                            </div>

                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor='#5d4037'
                                velocityFilterWeight={0.7}
                                minWidth={1}
                                maxWidth={3}
                                canvasProps={{
                                    className: 'cursor-crosshair w-full h-full',
                                    style: { width: '100%', height: '100%' }
                                }}
                                backgroundColor='transparent'
                            />
                        </div>

                        <div className="flex gap-3 justify-end pt-2">
                            <button
                                type="button"
                                onClick={handleClearSignature}
                                className="flex items-center gap-2 px-4 py-2.5 border border-[#d7ccc8] text-[#5d4037] rounded-lg hover:bg-[#efebe9] text-sm font-medium transition-colors"
                            >
                                <Eraser className="w-4 h-4" />
                                Hapus
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveSignature}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[#5d4037] text-white rounded-lg hover:bg-[#4e342e] text-sm font-bold shadow-lg shadow-[#5d4037]/20 active:transform active:scale-95 transition-all"
                            >
                                <Check className="w-4 h-4" />
                                Simpan
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
