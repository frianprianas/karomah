
'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { JournalReport } from './pdf/JournalReport';
import { FileDown } from 'lucide-react';

interface DownloadReportButtonProps {
    student: any;
    journals: any[];
}

export default function DownloadReportButton({ student, journals }: DownloadReportButtonProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <button className="inline-flex items-center gap-2 bg-[#d7ccc8] text-[#8d6e63] px-4 py-2 rounded font-bold cursor-not-allowed">
                <FileDown className="w-4 h-4" /> Memuat PDF...
            </button>
        );
    }

    return (
        <PDFDownloadLink
            document={<JournalReport student={student} journals={journals} />}
            fileName={`Rapor_Ramadan_${student.nama.replace(/\s+/g, '_')}.pdf`}
            className="inline-flex items-center gap-2 bg-[#5d4037] text-white px-4 py-2 rounded font-bold hover:bg-[#3e2723] transition-colors shadow-sm"
        >
            {({ loading }) =>
                loading ? (
                    <span className="flex items-center gap-2">Generating...</span>
                ) : (
                    <>
                        <FileDown className="w-4 h-4" /> Download Rapor
                    </>
                )
            }
        </PDFDownloadLink>
    );
}
