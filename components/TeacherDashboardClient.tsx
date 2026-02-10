
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Users, GraduationCap, ArrowLeft } from 'lucide-react';

interface Student {
    nis: string;
    nama: string;
    kelas: string;
    filledCount: number;
}

interface TeacherDashboardClientProps {
    groupedStudents: Record<string, Student[]>;
}

export default function TeacherDashboardClient({ groupedStudents }: TeacherDashboardClientProps) {
    const [selectedClass, setSelectedClass] = useState<string | null>(null);

    const classes = Object.keys(groupedStudents).sort();

    if (selectedClass) {
        const students = groupedStudents[selectedClass];
        return (
            <div className="w-full space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <button
                    onClick={() => setSelectedClass(null)}
                    className="flex items-center gap-2 text-[#8d6e63] hover:text-[#3e2723] transition-colors font-serif group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Kembali ke Daftar Kelas
                </button>

                <div className="bg-[#f0e6d2] p-6 rounded-sm border-2 border-[#8d6e63] mb-8 shadow-sm relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]">
                    <div className="absolute inset-2 border border-dashed border-[#8d6e63] opacity-30 pointer-events-none"></div>
                    <h2 className="text-3xl font-serif font-bold text-[#3e2723] text-center">Kelas {selectedClass}</h2>
                    <p className="text-center text-[#795548] italic font-serif">Daftar Santri / Siswa</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map((student) => (
                        <Link
                            href={`/teacher/student/${student.nis}`}
                            key={student.nis}
                            className="bg-white p-5 rounded-sm border-2 border-[#d7ccc8] hover:border-[#8d6e63] shadow-sm hover:shadow-md transition-all group relative flex flex-col justify-between"
                        >
                            {/* Decorative internal border */}
                            <div className="absolute inset-1 border border-dashed border-[#8d6e63] opacity-10 pointer-events-none"></div>

                            <div className="mb-4">
                                <span className="text-[10px] font-mono text-[#a1887f] bg-[#efebe9] px-2 py-0.5 rounded-sm block w-fit mb-2">
                                    NIS: {student.nis}
                                </span>
                                <h3 className="font-serif font-bold text-[#3e2723] group-hover:text-[#5d4037] text-lg leading-tight">
                                    {student.nama}
                                </h3>
                            </div>

                            <div className="space-y-2">
                                <div className="w-full bg-[#efebe9] rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-[#5d4037] h-full rounded-full transition-all duration-700"
                                        style={{ width: `${(student.filledCount / 30) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs font-serif text-[#795548]">
                                    <span>Progress Jurnal</span>
                                    <span className="font-bold">{student.filledCount} / 30 Hari</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {classes.map((kelas) => (
                <button
                    key={kelas}
                    onClick={() => setSelectedClass(kelas)}
                    className="bg-[#f0e6d2] p-8 rounded-sm border-2 border-[#8d6e63] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]"
                >
                    {/* Decorative corners */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#8d6e63] opacity-30"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#8d6e63] opacity-30"></div>

                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[#efebe9] border-2 border-[#8d6e63] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                            <Users className="w-8 h-8 text-[#5d4037]" />
                        </div>

                        <h3 className="text-2xl font-serif font-bold text-[#3e2723] mb-1">Kelas {kelas}</h3>
                        <div className="w-12 h-0.5 bg-[#8d6e63] my-2 opacity-50"></div>

                        <div className="flex items-center gap-2 text-[#795548] font-serif italic">
                            <GraduationCap className="w-4 h-4" />
                            <span>{groupedStudents[kelas].length} Santri</span>
                        </div>
                    </div>

                    <div className="absolute top-1/2 -right-4 translate-y-[-50%] group-hover:right-4 transition-all opacity-0 group-hover:opacity-100">
                        <ChevronRight className="w-8 h-8 text-[#8d6e63]" />
                    </div>
                </button>
            ))}
        </div>
    );
}
