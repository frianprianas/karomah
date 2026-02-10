
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, GraduationCap, School } from 'lucide-react';
import Link from 'next/link';

export default function Register() {
    const [role, setRole] = useState<'siswa' | 'guru'>('siswa');
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [extra, setExtra] = useState(''); // Class or Description
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role, id, name, extra, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            router.push('/'); // Go to login
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-emerald-100">
                <div className="text-center mb-6">
                    <Link href="/" className="inline-flex items-center gap-2 text-emerald-800 font-bold text-2xl mb-2">
                        <Image src="/logo.jpg" alt="Karomah Logo" width={40} height={40} className="rounded-full object-cover" />
                        Karomah
                    </Link>
                    <h1 className="text-xl font-semibold text-gray-700">Daftar Akun Baru</h1>
                </div>

                <div className="flex gap-2 p-1 bg-emerald-50 rounded-lg mb-6">
                    <button
                        onClick={() => setRole('siswa')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${role === 'siswa' ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-600 hover:bg-emerald-100/50"}`}
                    >
                        <GraduationCap className="w-4 h-4" />
                        Siswa
                    </button>
                    <button
                        onClick={() => setRole('guru')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${role === 'guru' ? "bg-white text-emerald-700 shadow-sm" : "text-emerald-600 hover:bg-emerald-100/50"}`}
                    >
                        <School className="w-4 h-4" />
                        Guru
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {role === 'siswa' ? 'NIS' : 'NIPY'}
                        </label>
                        <input
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Nomor Induk"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Nama Lengkap"
                            required
                        />
                    </div>

                    {role === 'siswa' ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
                            <input
                                type="text"
                                value={extra}
                                onChange={(e) => setExtra(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Contoh: 10 IPA 1"
                                required
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Jabatan</label>
                            <input
                                type="text"
                                value={extra}
                                onChange={(e) => setExtra(e.target.value)}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                placeholder="Guru PAI / Wali Kelas"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 disabled:opacity-70 mt-4"
                    >
                        {loading ? 'Mendaftar...' : 'Daftar Akun'}
                    </button>
                </form>

                <p className="text-center mt-4 text-sm text-gray-600">
                    Sudah punya akun? <Link href="/" className="text-emerald-600 font-semibold hover:underline">Masuk disini</Link>
                </p>
            </div>
        </div>
    );
}
