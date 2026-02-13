
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register Font (gunakan font standar yg aman, atau daftarkan custom font)
// Kita pakai Helvetica bawaan PDF saja biar aman tanpa download font eksternal yg mungkin berat
// Atau Open Sans jika perlu unicode support (misal tulisan Arab), tapi sementara Latin dulu.

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        lineHeight: 1.5,
    },
    headerContainer: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#112233',
        paddingBottom: 10,
        alignItems: 'center',
    },
    schoolName: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    reportTitle: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 2,
    },
    subTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Oblique',
    },
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 4,
    },
    infoColumn: {
        flexDirection: 'column',
    },
    infoText: {
        fontSize: 10,
        marginBottom: 4,
    },
    label: {
        fontFamily: 'Helvetica-Bold',
        width: 60,
    },

    // Table Styles
    table: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#dee2e6',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#e9ecef',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        alignItems: 'center',
        height: 24,
        fontFamily: 'Helvetica-Bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
        alignItems: 'center',
        paddingVertical: 4,
    },
    col1: { width: '10%', textAlign: 'center', padding: 2 }, // Hari
    col2: { width: '15%', textAlign: 'center', padding: 2 }, // Puasa
    col3: { width: '15%', textAlign: 'center', padding: 2 }, // Sholat 5 Waktu
    col4: { width: '30%', padding: 2 }, // Tadarus
    col5: { width: '30%', padding: 2 }, // Catatan Guru

    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 4,
        backgroundColor: '#fff3cd',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 8,
        color: '#856404',
        textTransform: 'uppercase',
        fontFamily: 'Helvetica-Bold',
    },
    summaryValue: {
        fontSize: 14,
        color: '#856404',
        fontFamily: 'Helvetica-Bold',
    },

    footer: {
        marginTop: 40,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    signatureBox: {
        width: 150,
        textAlign: 'center',
    },
    signatureLine: {
        marginTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#000',
    }
});

interface JournalReportProps {
    student: any;
    journals: any[];
}

export const JournalReport = ({ student, journals }: JournalReportProps) => {
    // Hitung Summary
    const totalPuasa = journals.filter(j => j.puasa).length;
    const totalTarawih = journals.filter(j => j.sholat_sunah?.tarawih).length;

    // Hitung Sholat Wajib (Rata-rata atau Total Check)
    // Misal: Total Sholat Wajib yang dikerjakan
    let totalSholatWajib = 0;
    journals.forEach(j => {
        if (j.sholat_wajib) {
            totalSholatWajib += Object.values(j.sholat_wajib).filter(Boolean).length;
        }
    });

    // Tadarus Summary (Jumlah kali input tadarus)
    const totalTadarus = journals.filter(j => j.tadarus?.surat || j.tadarus?.ayat).length;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.schoolName}>YAYASAN PENDIDIKAN KAROMAH</Text>
                    <Text style={styles.reportTitle}>RAPOR KEGIATAN RAMADAN 1446 H</Text>
                    <Text style={styles.subTitle}>Laporan Aktifitas Ibadah Harian Siswa</Text>
                </View>

                {/* Info Siswa */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoColumn}>
                        <Text style={styles.infoText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Nama     :</Text> {student.nama}</Text>
                        <Text style={styles.infoText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Kelas    :</Text> {student.kelas}</Text>
                    </View>
                    <View style={styles.infoColumn}>
                        <Text style={styles.infoText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>NIS      :</Text> {student.nis}</Text>
                        <Text style={styles.infoText}><Text style={{ fontFamily: 'Helvetica-Bold' }}>Tanggal  :</Text> {new Date().toLocaleDateString('id-ID')}</Text>
                    </View>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Total Puasa</Text>
                        <Text style={styles.summaryValue}>{totalPuasa} Hari</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Sholat Tarawih</Text>
                        <Text style={styles.summaryValue}>{totalTarawih} Hari</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Sholat Wajib</Text>
                        <Text style={styles.summaryValue}>{totalSholatWajib} Waktu</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Aktifitas Tadarus</Text>
                        <Text style={styles.summaryValue}>{totalTadarus} Kali</Text>
                    </View>
                </View>

                {/* Table Header */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Hari</Text>
                        <Text style={styles.col2}>Puasa</Text>
                        <Text style={styles.col3}>Sholat 5</Text>
                        <Text style={styles.col4}>Tadarus</Text>
                        <Text style={styles.col5}>Catatan/Komentar</Text>
                    </View>

                    {/* Table Rows */}
                    {journals.map((j) => {
                        const sholatCount = j.sholat_wajib ? Object.values(j.sholat_wajib).filter(Boolean).length : 0;
                        return (
                            <View style={styles.tableRow} key={j._id}>
                                <Text style={styles.col1}>{j.tgl_jurnal}</Text>
                                <Text style={styles.col2}>{j.puasa ? 'Ya' : 'Tidak'}</Text>
                                <Text style={styles.col3}>{sholatCount}/5</Text>
                                <Text style={styles.col4}>
                                    {j.tadarus?.surat ? `${j.tadarus.surat} ${j.tadarus.ayat ? `(${j.tadarus.ayat})` : ''}` : '-'}
                                </Text>
                                <Text style={styles.col5}>{j.catatan_guru || '-'}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Footer TTD */}
                <View style={styles.footer}>
                    <View style={styles.signatureBox}>
                        <Text>Mengetahui,</Text>
                        <Text>Guru Kelas / Pembimbing</Text>
                        <View style={styles.signatureLine} />
                        <Text style={{ marginTop: 4, fontFamily: 'Helvetica-Oblique', fontSize: 8 }}>(Tanda Tangan & Nama Terang)</Text>
                    </View>
                </View>

                {/* Page Number */}
                <Text style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 8, color: 'grey' }} render={({ pageNumber, totalPages }) => (
                    `${pageNumber} / ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    );
};
