'use client';

import { useState } from 'react';
import { X, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SalawatModal() {
    const [isOpen, setIsOpen] = useState(false);

    const handleClose = () => setIsOpen(false);
    const handleOpen = () => setIsOpen(true);

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
                className="mb-8 flex items-center gap-3 px-6 py-3 bg-[#8d6e63] text-white font-serif font-bold rounded-2xl hover:bg-[#5d4037] transition-all shadow-[0_4px_10px_rgba(141,110,99,0.3)] hover:shadow-[0_6px_15px_rgba(141,110,99,0.4)] border-2 border-[#d7ccc8] group"
            >
                <div className="bg-white/20 p-1.5 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Music size={20} className="text-white" />
                </div>
                <span className="tracking-wide text-sm md:text-base">Salawat Quraniyah</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="bg-[#fdfbf7] w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden border-4 border-[#8d6e63] relative flex flex-col"
                        >
                            {/* Header Decoration */}
                            <div className="h-4 bg-[#8d6e63] w-full shrink-0"></div>

                            <button
                                onClick={handleClose}
                                className="absolute top-6 right-6 text-[#8d6e63] hover:text-[#5d4037] hover:bg-[#efebe9] rounded-full p-2 transition-all z-10"
                            >
                                <X size={26} />
                            </button>

                            <div className="p-8 overflow-y-auto overflow-x-hidden md:px-12 scrollbar-thin scrollbar-thumb-[#8d6e63] scrollbar-track-transparent">
                                <div className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-[#efebe9] rounded-full flex items-center justify-center mb-6 border-4 border-[#d7ccc8] shadow-inner">
                                        <Music className="text-[#8d6e63]" size={40} />
                                    </div>

                                    <h3 className="text-xl md:text-3xl font-bold font-serif text-[#3e2723] mb-2 text-center leading-tight">
                                        SHALAWAT QURANIYAH & <br className="hidden md:block" /> QOSIDAH FADHOILIL QUR`AN
                                    </h3>
                                    <div className="w-32 h-1.5 bg-[#d7ccc8] rounded-full mb-8"></div>

                                    <div className="w-full space-y-8 text-[#5d4037] font-serif">
                                        {/* Intro Section */}
                                        <div className="space-y-4 text-center bg-[#efebe9]/50 p-6 rounded-2xl border border-[#d7ccc8]/50">
                                            <div className="space-y-2">
                                                <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-1" dir="rtl">صلاة الله وسلام ، علی من أوحي القرآن</p>
                                                <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#8d6e63]">SHOLÂTULLÂHI WA SALÂM ‘ALÂ MAN ÛHIYAL QUR-ÃN</p>
                                                <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-1 pt-2" dir="rtl">صلاة الله وسلام ، علی من أوحي القرآن</p>
                                                <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#8d6e63]">SHOLÂTULLÂHI WA SALÂM ‘ALÂ MAN ÛHIYAL QUR-ÃN</p>
                                            </div>
                                            <div className="space-y-2 pt-4 border-t border-[#d7ccc8]/30">
                                                <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-1" dir="rtl">وأهل بيته الکرام ، وصحبه ذوی القرآن</p>
                                                <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#8d6e63]">WA AHLI BAITIHIL KIRÔM WA SHOHBIHI DZAWÎL QUR-ÃN</p>
                                                <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-1 pt-2" dir="rtl">وأهل بيته الکرام ، وصحبه ذوی القرآن</p>
                                                <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#8d6e63]">WA AHLI BAITIHIL KIRÔM WA SHOHBIHI DZAWÎL QUR-ÃN</p>
                                            </div>
                                        </div>

                                        {/* Lyrics Sections */}
                                        <div className="space-y-8 text-center text-sm md:text-base leading-relaxed italic">
                                            <div className="space-y-6">
                                                <p>
                                                    DENGARKANLAH KATA NABI # PERINTAHNYA KITA TURUTI<br />
                                                    SEBAIK-BAIK SEORANG ABDI # BELAJAR MENGAJAR KITAB SUCI
                                                </p>
                                                <p>
                                                    JIKA ANDA AKAN MEMBACA # AYAT QUR’AN KAPAN SAJA<br />
                                                    BACA TA’AWUDZ TERLEBIH DULU # JANGAN BIARKAN ITU BERLALU
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                <p>
                                                    BACALAH SLALU BISMILLAH # JIKA DARI AWAL SURAH<br />
                                                    SELAIN SURAH BAROAH # KARENA TAK ADA SUNNAH
                                                </p>
                                                <p>
                                                    BACALAH QUR’AN DENGAN TARTIL #  BACANYA PELAN SAMBIL MEMIKIR<br />
                                                    AKAN DATANG MALAIKAT JIBRIL # MEMBAWA RAHMAT BAGI PEDZIKIR
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                <p>
                                                    JIKA ADA YANG BACA QUR’AN # MARILAH SAMA MENDENGARKAN<br />
                                                    JIKA KITA SAMA MEMBACA # JANGANLAH KITA SALING MENCERCA
                                                </p>
                                                <p>
                                                    ORANG MAHIR BACA AL-QUR’AN # SAMA MALAIKATUR-RAHMAN<br />
                                                    ORANG SULIT BACA AL-QUR’AN # AKAN DAPAT DUA GANJARAN
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                <p>
                                                    SIAPA SENANG MEMBACA QUR’AN # PASTILAH DIA DAPAT GANJARAN<br />
                                                    SIAPA SENANG BERSIMAAN # DAPAT RAHMAT DARI YANG RAHMAN
                                                </p>
                                                <p>
                                                    BARANG SIAPA YANG HAFAL QUR’AN # NILAI-NILAINYA DIAMALKAN<br />
                                                    ORANG TUANYA DISEMATKAN # MAHKOTA INTAN YANG BERKILAUAN
                                                </p>
                                            </div>

                                            <div className="space-y-6">
                                                <p>
                                                    JIKA SELESAI MENGAJI # TUTUPLAH MUSHAF YANG SUCI<br />
                                                    BENARKANLAH SANG ILAHI #  TANDA CINTA YANG ABADI
                                                </p>
                                                <p>
                                                    ITULAH SYAIR TENTANG AL-QUR’AN # KITAB SUCI KITA MULIAKAN<br />
                                                    MEMINTA ALLAH YANG MAHA RAHMAN # DAPAT SYAFA’ATNYA AL-QUR’AN
                                                </p>
                                            </div>
                                        </div>

                                        {/* Outro Section */}
                                        <div className="space-y-4 text-center bg-[#efebe9]/50 p-6 rounded-2xl border border-[#d7ccc8]/50">
                                            <div className="space-y-2">
                                                <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-1" dir="rtl">صلاة الله وسلام ، علی من أوحي القرآن</p>
                                                <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#8d6e63]">SHOLÂTULLÂHI WA SALÂM ‘ALÂ MAN ÛHIYAL QUR-ÃN</p>
                                                <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-1 pt-2" dir="rtl">صلاة الله وسلام ، علی من أوحي القرآن</p>
                                                <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#8d6e63]">SHOLÂTULLÂHI WA SALÂM ‘ALÂ MAN ÛHIYAL QUR-ÃN</p>
                                            </div>
                                            <div className="space-y-2 pt-4 border-t border-[#d7ccc8]/30">
                                                <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-1" dir="rtl">وأهل بيته الکرام ، وصحبه ذوی القرآن</p>
                                                <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#8d6e63]">WA AHLI BAITIHIL KIRÔM WA SHOHBIHI DZAWÎL QUR-ÃN</p>
                                                <p className="text-2xl md:text-3xl font-bold leading-relaxed mb-1 pt-2" dir="rtl">وأهل بيته الکرام ، وصحبه ذوی القرآن</p>
                                                <p className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-[#8d6e63]">WA AHLI BAITIHIL KIRÔM WA SHOHBIHI DZAWÎL QUR-ÃN</p>
                                            </div>
                                        </div>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleClose}
                                        className="mt-12 mb-4 px-10 py-3 bg-[#8d6e63] text-white font-serif font-bold rounded-xl hover:bg-[#6d4c41] transition-colors shadow-lg"
                                    >
                                        Tutup
                                    </motion.button>
                                </div>
                            </div>

                            {/* Footer Decoration */}
                            <div className="h-3 bg-[#8d6e63] w-full shrink-0"></div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
