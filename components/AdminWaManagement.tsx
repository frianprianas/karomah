
'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Save, Power, Plus, Trash2 } from 'lucide-react';

export default function AdminWaManagement() {
    const [settings, setSettings] = useState({
        enabled: false,
        greetings: ["", "", "", ""],
        messageTemplate: "Berikut *Laporan Progres Jurnal Ramadan* kelas *[KELAS]* untuk Hari ke-[HARI]:\n\n📊 *Statistik:* \n- Sudah Mengisi: *[ISI] Siswa*\n- Belum Mengisi: *[KOSONG] Siswa*\n- Progres: *[PERSEN]%*"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/wa-settings');
            const data = await res.json();
            if (data) {
                setSettings(data);
            }
        } catch (error) {
            console.error('Error fetching WA settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/wa-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                alert('Pengaturan berhasil disimpan!');
            }
        } catch (error) {
            console.error('Error saving WA settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const updateGreeting = (index: number, val: string) => {
        const newGreetings = [...settings.greetings];
        newGreetings[index] = val;
        setSettings({ ...settings, greetings: newGreetings });
    };

    if (loading) return null;

    return (
        <section className="w-full mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#5d4037] rounded-lg">
                    <MessageSquare className="w-6 h-6 text-[#fdfbf7]" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#3e2723]">Laporan Otomatis WhatsApp</h2>
                    <p className="text-[#8d6e63] text-sm italic">Kirim Progress Kelas ke Wali Kelas jam 18:30 - 21:30</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-[#d7ccc8] shadow-sm overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">
                <div className="p-6 border-b border-[#d7ccc8] flex items-center justify-between bg-[#efebe9]/30">
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
                            className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${settings.enabled ? 'bg-emerald-600' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${settings.enabled ? 'left-8' : 'left-1'}`}></div>
                        </div>
                        <span className={`font-bold text-sm uppercase ${settings.enabled ? 'text-emerald-700' : 'text-gray-500'}`}>
                            {settings.enabled ? 'Aktif' : 'Non-Aktif'}
                        </span>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-[#5d4037] text-white rounded-full text-sm font-bold hover:bg-[#3e2723] transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-[#5d4037] mb-3 uppercase tracking-wider">
                            Variasi Salam Pembuka (Minimal 4)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.greetings.map((greet, idx) => (
                                <div key={idx} className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8d6e63] font-mono">
                                        #{idx + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={greet}
                                        onChange={(e) => updateGreeting(idx, e.target.value)}
                                        placeholder="Contoh: Assalamualaikum..."
                                        className="w-full pl-10 pr-4 py-3 bg-[#fdfbf7] border-2 border-[#d7ccc8] rounded-lg focus:border-[#5d4037] outline-none transition-colors text-sm font-serif italic text-[#3e2723]"
                                    />
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-xs text-[#8d6e63] italic">
                            * Sistem akan memilih salam secara acak agar pesan tidak terdeteksi sebagai bot oleh WhatsApp.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-[#5d4037] mb-3 uppercase tracking-wider">
                            Template Isi Pesan
                        </label>
                        <textarea
                            value={settings.messageTemplate}
                            onChange={(e) => setSettings({ ...settings, messageTemplate: e.target.value })}
                            rows={6}
                            className="w-full p-4 bg-[#fdfbf7] border-2 border-[#d7ccc8] rounded-lg focus:border-[#5d4037] outline-none transition-colors text-sm font-serif text-[#3e2723]"
                            placeholder="Tulis template pesan di sini..."
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-[10px] bg-[#efebe9] px-2 py-1 rounded border border-[#d7ccc8] font-bold text-[#5d4037]">[KELAS]</span>
                            <span className="text-[10px] bg-[#efebe9] px-2 py-1 rounded border border-[#d7ccc8] font-bold text-[#5d4037]">[HARI]</span>
                            <span className="text-[10px] bg-[#efebe9] px-2 py-1 rounded border border-[#d7ccc8] font-bold text-[#5d4037]">[ISI]</span>
                            <span className="text-[10px] bg-[#efebe9] px-2 py-1 rounded border border-[#d7ccc8] font-bold text-[#5d4037]">[KOSONG]</span>
                            <span className="text-[10px] bg-[#efebe9] px-2 py-1 rounded border border-[#d7ccc8] font-bold text-[#5d4037]">[PERSEN]</span>
                        </div>
                        <p className="mt-2 text-[10px] text-[#8d6e63] italic">
                            * Gunakan tag di atas untuk memasukkan data dinamis secara otomatis.
                        </p>
                    </div>

                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                        <h4 className="text-amber-800 font-bold text-sm mb-1 uppercase">Informasi Penjadwalan:</h4>
                        <ul className="text-amber-700 text-xs space-y-1 font-serif">
                            <li>• Pesan dikirim setiap hari antara pukul 07:30 s/d 15:00 WIB.</li>
                            <li>• Setiap Wali Kelas akan dikirimi ringkasan progress amalan santri di kelasnya.</li>
                            <li>• Jeda antar pesan diatur acak antara 10 - 30 menit untuk menghindari spam.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
