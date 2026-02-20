
'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Save } from 'lucide-react';

export default function AdminWaManagement({ userRole }: { userRole?: string }) {
    const [settings, setSettings] = useState({
        enabled: false,
        greetings: ["", "", "", ""],
        messageTemplate: "Berikut *Laporan Progres Jurnal Ramadan* kelas *[KELAS]* untuk Hari ke-[HARI]:\n\n📊 *Statistik:* \n- Sudah Mengisi: *[ISI] Siswa*\n- Belum Mengisi: *[KOSONG] Siswa*\n- Progres: *[PERSEN]%*"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Blast States
    const [blastMode, setBlastMode] = useState(false);
    const [teacherList, setTeacherList] = useState<any[]>([]);
    const [sendingStatus, setSendingStatus] = useState<Record<string, 'waiting' | 'sending' | 'sent' | 'error'>>({});
    const [isBlasting, setIsBlasting] = useState(false);
    const [blastProgress, setBlastProgress] = useState({ current: 0, total: 0 });
    const [nextBlastTime, setNextBlastTime] = useState<Date | null>(null);
    const [ramadanDay, setRamadanDay] = useState(1);

    const isReadOnly = userRole === 'spv';

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

    const fetchTeacherStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/wa-blast');
            const data = await res.json();
            if (data.teachers) {
                setTeacherList(data.teachers);
                setRamadanDay(data.ramadanDay);
                // Initialize status
                const initialStatus: any = {};
                data.teachers.forEach((t: any) => {
                    initialStatus[t.id] = 'waiting';
                });
                setSendingStatus(initialStatus);
            }
        } catch (error) {
            console.error('Error fetching teacher stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (isReadOnly) return;
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
        if (isReadOnly) return;
        const newGreetings = [...settings.greetings];
        newGreetings[index] = val;
        setSettings({ ...settings, greetings: newGreetings });
    };

    const sendToOneTeacher = async (teacher: any) => {
        setSendingStatus(prev => ({ ...prev, [teacher.id]: 'sending' }));
        try {
            const res = await fetch('/api/admin/wa-blast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacherId: teacher.id,
                    ramadanDay,
                    stats: teacher.stats
                })
            });
            const data = await res.json();
            if (data.success) {
                setSendingStatus(prev => ({ ...prev, [teacher.id]: 'sent' }));
                return true;
            } else {
                setSendingStatus(prev => ({ ...prev, [teacher.id]: 'error' }));
                return false;
            }
        } catch (error) {
            setSendingStatus(prev => ({ ...prev, [teacher.id]: 'error' }));
            return false;
        }
    };

    const startBlast = async () => {
        if (!confirm('Mulai kirim blast ke semua Wali Kelas dengan jeda waktu acak?')) return;
        setIsBlasting(true);
        setBlastProgress({ current: 0, total: teacherList.length });

        const delays = [5, 7, 11, 20, 30]; // minutes

        for (let i = 0; i < teacherList.length; i++) {
            const teacher = teacherList[i];

            // Skip if already sent
            if (sendingStatus[teacher.id] === 'sent') {
                setBlastProgress(p => ({ ...p, current: i + 1 }));
                continue;
            }

            setBlastProgress(p => ({ ...p, current: i + 1 }));
            await sendToOneTeacher(teacher);

            if (i < teacherList.length - 1) {
                const randomDelay = delays[Math.floor(Math.random() * delays.length)];
                const delayMs = randomDelay * 60 * 1000;

                const nextTime = new Date(Date.now() + delayMs);
                setNextBlastTime(nextTime);

                // Wait for the delay
                await new Promise(resolve => setTimeout(resolve, delayMs));
                setNextBlastTime(null);
            }
        }

        setIsBlasting(false);
        alert('Blast Selesai!');
    };

    if (loading && !blastMode) return null;

    return (
        <section className="w-full mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#5d4037] rounded-lg">
                        <MessageSquare className="w-6 h-6 text-[#fdfbf7]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#3e2723]">Laporan WhatsApp</h2>
                        <p className="text-[#8d6e63] text-sm italic">Otomatisasi Laporan Progress Jurnal ke Wali Kelas</p>
                    </div>
                </div>

                <div className="flex bg-[#efebe9]/50 p-1 rounded-xl border border-[#d7ccc8] self-start">
                    <button
                        onClick={() => setBlastMode(false)}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${!blastMode ? 'bg-[#5d4037] text-white shadow-md' : 'text-[#8d6e63] hover:bg-white/50'}`}
                    >
                        PENGATURAN
                    </button>
                    <button
                        onClick={() => {
                            setBlastMode(true);
                            fetchTeacherStats();
                        }}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${blastMode ? 'bg-[#5d4037] text-white shadow-md' : 'text-[#8d6e63] hover:bg-white/50'}`}
                    >
                        MANUAL BLAST
                    </button>
                </div>
            </div>

            {!blastMode ? (
                <div className={`bg-white rounded-xl border-2 border-[#d7ccc8] shadow-sm overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] ${isReadOnly ? 'opacity-80 pointer-events-none' : ''}`}>
                    <div className="p-6 border-b border-[#d7ccc8] flex items-center justify-between bg-[#efebe9]/30">
                        <div className="flex items-center gap-4">
                            <div
                                onClick={() => !isReadOnly && setSettings({ ...settings, enabled: !settings.enabled })}
                                className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${settings.enabled ? 'bg-emerald-600' : 'bg-gray-300'} ${isReadOnly ? 'cursor-not-allowed' : ''}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${settings.enabled ? 'left-8' : 'left-1'}`}></div>
                            </div>
                            <span className={`font-bold text-sm uppercase ${settings.enabled ? 'text-emerald-700' : 'text-gray-500'}`}>
                                {settings.enabled ? 'Auto-Report Aktif' : 'Auto-Report Non-Aktif'}
                            </span>
                        </div>

                        <div className="flex justify-end gap-3">
                            {userRole === 'admin' && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!confirm('Jalankan uji coba kirim laporan ke salah satu Wali Kelas? (Data asli akan terkirim)')) return;
                                        try {
                                            const res = await fetch('/api/admin/wa-test');
                                            const data = await res.json();
                                            if (data.success) {
                                                alert('Debug Berhasil:\n' + data.logs.join('\n'));
                                            } else {
                                                alert('Debug Gagal: ' + (data.error || JSON.stringify(data)));
                                            }
                                        } catch (e: any) {
                                            alert('Error: ' + e.message);
                                        }
                                    }}
                                    className="px-6 py-2 border-2 border-[#8d6e63] text-[#8d6e63] font-bold rounded-lg hover:bg-amber-50 transition-colors text-xs"
                                >
                                    UJI COBA
                                </button>
                            )}
                            <button
                                type="submit"
                                onClick={handleSave}
                                disabled={saving || userRole === 'spv'}
                                className="px-6 py-2 bg-[#5d4037] text-[#fdfbf7] font-bold rounded-lg hover:bg-[#3e2723] disabled:opacity-50 shadow-md transform active:scale-95 transition-all outline-none text-xs"
                            >
                                {saving ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN'}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-[#5d4037] mb-3 uppercase tracking-wider">
                                Variasi Salam Pembuka
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {settings.greetings.map((greet, idx) => (
                                    <div key={idx} className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8d6e63] font-mono">
                                            #{idx + 1}
                                        </span>
                                        <input
                                            type="text"
                                            disabled={isReadOnly}
                                            value={greet}
                                            onChange={(e) => updateGreeting(idx, e.target.value)}
                                            placeholder="Contoh: Assalamualaikum..."
                                            className="w-full pl-10 pr-4 py-3 bg-[#fdfbf7] border-2 border-[#d7ccc8] rounded-lg focus:border-[#5d4037] outline-none transition-colors text-sm font-serif italic text-[#3e2723] disabled:text-gray-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#5d4037] mb-3 uppercase tracking-wider">
                                Template Isi Pesan
                            </label>
                            <textarea
                                disabled={isReadOnly}
                                value={settings.messageTemplate}
                                onChange={(e) => setSettings({ ...settings, messageTemplate: e.target.value })}
                                rows={6}
                                className="w-full p-4 bg-[#fdfbf7] border-2 border-[#d7ccc8] rounded-lg focus:border-[#5d4037] outline-none transition-colors text-sm font-serif text-[#3e2723] disabled:text-gray-500"
                                placeholder="Tulis template pesan di sini..."
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                                {['[KELAS]', '[HARI]', '[ISI]', '[KOSONG]', '[PERSEN]'].map(tag => (
                                    <span key={tag} className="text-[10px] bg-[#efebe9] px-2 py-1 rounded border border-[#d7ccc8] font-bold text-[#5d4037]">{tag}</span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                            <h4 className="text-amber-800 font-bold text-sm mb-1 uppercase text-[10px]">Informasi Penjadwalan:</h4>
                            <ul className="text-amber-700 text-xs space-y-1 font-serif">
                                <li>• Jadwal Monitoring Otomatis: 09:00 s/d 13:00 WIB.</li>
                                <li>• Jeda antar pesan diatur acak antara 10 - 30 menit oleh sistem background.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-[#5d4037] text-[#fdfbf7] p-6 rounded-xl shadow-lg border-2 border-[#3e2723] flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h3 className="text-xl font-bold mb-1">Panel Kendali Blast</h3>
                            <p className="text-amber-200 text-sm italic">Hari ke-{ramadanDay} Ramadan</p>
                        </div>

                        <div className="flex gap-4 items-center">
                            {isBlasting && (
                                <div className="text-right mr-4">
                                    <p className="text-[10px] font-bold text-amber-300 uppercase animate-pulse">Proses Berjalan...</p>
                                    <p className="text-lg font-mono text-white">
                                        {nextBlastTime ? `Next: ${nextBlastTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}` : 'Mengirim...'}
                                    </p>
                                </div>
                            )}
                            <button
                                onClick={startBlast}
                                disabled={isBlasting || teacherList.length === 0}
                                className={`px-10 py-4 rounded-full font-bold text-lg shadow-xl transform active:scale-95 transition-all ${isBlasting ? 'bg-amber-600 cursor-not-allowed' : 'bg-[#fdfbf7] text-[#5d4037] hover:bg-white'}`}
                            >
                                {isBlasting ? `PROGRES: ${blastProgress.current}/${blastProgress.total}` : 'MULAI BLAST WA'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border-2 border-[#d7ccc8] shadow-sm overflow-hidden overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#efebe9]/50 border-b-2 border-[#d7ccc8]">
                                    <th className="px-6 py-4 text-xs font-bold text-[#5d4037] uppercase tracking-wider">Wali Kelas</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#5d4037] uppercase tracking-wider text-center">Data Jurnal</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#5d4037] uppercase tracking-wider">WhatsApp</th>
                                    <th className="px-6 py-4 text-xs font-bold text-[#5d4037] uppercase tracking-wider text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#d7ccc8]">
                                {teacherList.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center text-[#8d6e63] italic">Tidak ada wali kelas dengan nomor HP valid.</td>
                                    </tr>
                                ) : loading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-10 text-center">
                                            <div className="flex justify-center items-center gap-3">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#5d4037]"></div>
                                                <span className="text-xs text-[#5d4037] font-bold uppercase italic">Menghitung statistik...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    teacherList.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-[#fdfbf7] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-[#3e2723] leading-tight">{teacher.nama}</div>
                                                <div className="text-[10px] font-mono text-[#8d6e63] uppercase bg-amber-50 inline-block px-1 rounded mt-1 border border-amber-100">{teacher.kelas}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="text-xs font-bold text-[#5d4037]">{teacher.stats.filled} / {teacher.stats.total}</div>
                                                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-1000 ${teacher.stats.percent > 70 ? 'bg-emerald-500' : teacher.stats.percent > 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${teacher.stats.percent}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-[#5d4037]">
                                                {teacher.noHp}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {sendingStatus[teacher.id] === 'waiting' && <span className="inline-block w-3 h-3 rounded-full bg-gray-200"></span>}
                                                {sendingStatus[teacher.id] === 'sending' && <span className="inline-block w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>}
                                                {sendingStatus[teacher.id] === 'sent' && (
                                                    <div className="flex items-center justify-end gap-2 text-emerald-600">
                                                        <span className="text-[10px] font-bold uppercase">Terkirim</span>
                                                        <span className="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>
                                                    </div>
                                                )}
                                                {sendingStatus[teacher.id] === 'error' && (
                                                    <div className="flex items-center justify-end gap-2 text-rose-600">
                                                        <span className="text-[10px] font-bold uppercase">Gagal</span>
                                                        <span className="inline-block w-3 h-3 rounded-full bg-rose-500"></span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                        <div className="text-amber-600 font-bold text-xs uppercase animate-pulse">Peringatan:</div>
                        <div className="text-amber-800 text-[10px] font-serif leading-relaxed">
                            Mode manual menggunakan jeda acak (5, 7, 11, 20, atau 30 menit) di antara setiap pengiriman.
                            Jangan menutup tab browser ini atau mematikan koneksi internet sampai proses selesai untuk memastikan semua pesan terkirim.
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
