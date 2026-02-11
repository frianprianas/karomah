
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle } from 'lucide-react';
import { SURAH_LIST } from '@/lib/quran';

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

export default function JournalEntryForm({ day, initialData }: JournalEntryFormProps) {
    console.log(`JOURNAL DAY ${day} - INITIAL NOTE:`, initialData?.catatan_guru);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        aktifitas_sosial: { ya_tidak: false, kegiatan: '' },
        catatan_ihsan: { sumber: '', isi: '' },
        jam_tidur: ''
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
        };
    });

    const handleChange = (section: string, field: string, value: any) => {
        if (section === 'root') {
            setFormData({ ...formData, [field]: value });
        } else {
            // console.log(formData);
            setFormData({
                ...formData,
                [section]: { ...formData[section], [field]: value }
            });
        }
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
            // Show success briefly or just refresh
            alert('Data berhasil diperbarui!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-6 bg-[#fdfbf7] shadow-inner rounded-sm border border-[#d7ccc8] relative">
            {/* Corner decorations for the form */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#8d6e63] opacity-40"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#8d6e63] opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-[#8d6e63] opacity-40"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#8d6e63] opacity-40"></div>

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

            {/* Activities with Toggles */}
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
                        )}
                    </div>
                </section>
            ))}

            {/* Catatan Ihsan */}
            <section className="space-y-4">
                <h3 className="text-xl font-serif font-bold text-[#3e2723] border-b border-[#8d6e63]/30 pb-2">Catatan Ihsan</h3>
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
    );
}
