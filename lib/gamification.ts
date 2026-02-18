
import { IJurnal } from '@/models/Jurnal';

export interface Badge {
    name: string;
    level: string;
    color: string;
    bgColor: string;
    minPoints: number;
    icon: string;
}

export const BADGES: Badge[] = [
    { name: 'Mukmin', level: 'Bronze', color: '#cd7f32', bgColor: '#fff7ed', minPoints: 0, icon: '🌙' },
    { name: 'Muhsin', level: 'Silver', color: '#94a3b8', bgColor: '#f8fafc', minPoints: 500, icon: '✨' },
    { name: 'Muttaqin', level: 'Gold', color: '#d4af37', bgColor: '#fffbeb', minPoints: 1200, icon: '🌟' },
    { name: 'Mukhlish', level: 'Platinum', color: '#e5e7eb', bgColor: '#f3f4f6', minPoints: 2200, icon: '💎' },
    { name: 'Siddiq', level: 'Legend', color: '#ef4444', bgColor: '#fef2f2', minPoints: 3200, icon: '👑' },
];

export function calculatePoints(jurnal: IJurnal): number {
    let points = 0;

    // 1. Sholat Wajib (10 pts each)
    if (jurnal.sholat_wajib.subuh) points += 10;
    if (jurnal.sholat_wajib.dhuhur) points += 10;
    if (jurnal.sholat_wajib.ashar) points += 10;
    if (jurnal.sholat_wajib.magrib) points += 10;
    if (jurnal.sholat_wajib.isya) points += 10;

    // 2. Sahur (10 pts)
    if (jurnal.sahur) points += 10;

    // 3. Sholat Sunah (5 pts each)
    if (jurnal.sholat_sunah.rawatib) points += 5;
    if (jurnal.sholat_sunah.dhuha) points += 5;
    if (jurnal.sholat_sunah.tarawih) points += 10; // Tarawih is special
    if (jurnal.sholat_sunah.tahajud) points += 5;
    if (jurnal.sholat_sunah.taubat) points += 5;
    if (jurnal.sholat_sunah.mutlak) points += 5;
    if (jurnal.sholat_sunah.hajat) points += 5;

    // 4. Tadarus (10 pts)
    if (jurnal.tadarus && jurnal.tadarus.surat && jurnal.tadarus.surat !== '-') points += 10;

    // 5. Positive Activities (10 pts each)
    if (jurnal.bantu_ortu && jurnal.bantu_ortu.ya_tidak) points += 10;
    if (jurnal.aktifitas_sosial && jurnal.aktifitas_sosial.ya_tidak) points += 10;
    if (jurnal.olah_raga && jurnal.olah_raga.ya_tidak) points += 5;

    return points;
}

export function getBadge(totalPoints: number): Badge {
    const reversedBadges = [...BADGES].reverse();
    return reversedBadges.find(badge => totalPoints >= badge.minPoints) || BADGES[0];
}
