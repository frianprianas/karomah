'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(true);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="bg-[#fdfbf7] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border-4 border-[#8d6e63] relative"
                    >
                        {/* Header Decoration */}
                        <div className="h-3 bg-[#8d6e63] w-full"></div>

                        <button
                            onClick={handleClose}
                            className="absolute top-5 right-5 text-[#8d6e63] hover:text-[#5d4037] hover:bg-[#efebe9] rounded-full p-1 transition-all"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-[#efebe9] rounded-full flex items-center justify-center mb-4 border-2 border-[#8d6e63]">
                                <span className="text-3xl">✨</span>
                            </div>

                            <h3 className="text-2xl font-bold font-serif text-[#3e2723] mb-6">
                                Pesan Penting
                            </h3>

                            <div className="relative py-4 px-2">
                                <span className="absolute -top-2 -left-2 text-6xl text-[#d7ccc8] opacity-40 font-serif leading-none">“</span>
                                <p className="text-xl font-serif text-[#5d4037] leading-relaxed relative z-10 px-4">
                                    Isilah Semua data dengan Jujur, Karena Kejujuran lebih penting dari Nilai.
                                </p>
                                <p className="text-lg font-serif text-[#5d4037] leading-relaxed mt-4">
                                    Terima kasih, Selamat Beribadah.<br />
                                    <span className="font-bold text-[#3e2723] mt-2 block">Salam SaJuTa</span>
                                </p>
                                <span className="absolute -bottom-8 -right-2 text-6xl text-[#d7ccc8] opacity-40 font-serif leading-none">”</span>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClose}
                                className="mt-8 px-8 py-2.5 bg-[#8d6e63] text-white font-serif font-semibold rounded-full hover:bg-[#6d4c41] transition-colors shadow-lg hover:shadow-xl"
                            >
                                Mengerti
                            </motion.button>
                        </div>

                        {/* Footer Decoration */}
                        <div className="h-2 bg-[#8d6e63] w-full"></div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
