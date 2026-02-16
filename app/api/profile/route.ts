
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Siswa from '@/models/Siswa';
import Guru from '@/models/Guru';
import Aktivitas from '@/models/Aktivitas';

export async function GET(req: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    let user = null;

    if (session.role === 'siswa') {
        user = await Siswa.findOne({ nis: (session as any).username }).select('-password');
    } else if (session.role === 'guru') {
        user = await Guru.findOne({ nipy: (session as any).username }).select('-password');
    }

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
}

export async function PUT(req: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { noHp, status, foto, emailPribadi } = await req.json();

    await connectDB();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    let updatedUser = null;

    if (session.role === 'siswa') {
        const nis = (session as any).username;
        const oldUser = await Siswa.findOne({ nis });

        // Tentukan apa yang diubah
        const hasStatusChanged = status && status !== oldUser?.status;
        const hasBioChanged = (noHp && noHp !== oldUser?.noHp) || (foto && foto !== oldUser?.foto) || (emailPribadi && emailPribadi !== oldUser?.emailPribadi);

        // --- VALIDASI LIMIT HARIAN ---
        if (hasStatusChanged) {
            const statusCount = await Aktivitas.countDocuments({
                nis,
                tipe: 'status',
                createdAt: { $gte: todayStart, $lte: todayEnd }
            });
            if (statusCount >= 10) {
                return NextResponse.json({ error: 'Limit tercapai! Anda hanya bisa update status 10 kali dalam sehari.' }, { status: 429 });
            }
        }

        if (hasBioChanged) {
            const bioCount = await Aktivitas.countDocuments({
                nis,
                tipe: 'biodata',
                createdAt: { $gte: todayStart, $lte: todayEnd }
            });
            if (bioCount >= 2) {
                return NextResponse.json({ error: 'Limit profil tercapai! Anda hanya bisa ganti foto/biodata 2 kali dalam sehari.' }, { status: 429 });
            }
        }

        updatedUser = await Siswa.findOneAndUpdate(
            { nis },
            { noHp, status, foto, emailPribadi, statusUpdatedAt: new Date() },
            { new: true }
        ).select('-password');

        if (updatedUser) {
            try {
                if (hasStatusChanged) {
                    await Aktivitas.create({
                        nis,
                        tipe: 'status',
                        aksi: status
                    });
                }

                if (hasBioChanged) {
                    await Aktivitas.create({
                        nis,
                        tipe: 'biodata',
                        aksi: 'Memperbarui profil (Biodata/Foto)'
                    });
                }
            } catch (logError) {
                console.error('Logging activity failed:', logError);
                // Kita tidak return error agar update profil tetap jalan
            }
        }
    } else if (session.role === 'guru') {
        const nipy = (session as any).username;
        const oldUser = await Guru.findOne({ nipy });

        const hasStatusChanged = status && status !== oldUser?.status;
        const hasBioChanged = (noHp && noHp !== oldUser?.noHp) || (foto && foto !== oldUser?.foto) || (emailPribadi && emailPribadi !== oldUser?.emailPribadi);

        // --- VALIDASI LIMIT HARIAN GURU ---
        if (hasStatusChanged) {
            const statusCount = await Aktivitas.countDocuments({
                nis: nipy,
                tipe: 'status',
                createdAt: { $gte: todayStart, $lte: todayEnd }
            });
            if (statusCount >= 10) {
                return NextResponse.json({ error: 'Limit tercapai! Anda hanya bisa update status 10 kali dalam sehari.' }, { status: 429 });
            }
        }

        if (hasBioChanged) {
            const bioCount = await Aktivitas.countDocuments({
                nis: nipy,
                tipe: 'biodata',
                createdAt: { $gte: todayStart, $lte: todayEnd }
            });
            if (bioCount >= 2) {
                return NextResponse.json({ error: 'Limit profil tercapai! Anda hanya bisa ganti foto/biodata 2 kali dalam sehari.' }, { status: 429 });
            }
        }

        updatedUser = await Guru.findOneAndUpdate(
            { nipy },
            { noHp, status, foto, emailPribadi, statusUpdatedAt: new Date() },
            { new: true }
        ).select('-password');

        if (updatedUser) {
            try {
                if (hasStatusChanged) {
                    await Aktivitas.create({ nis: nipy, tipe: 'status', aksi: status });
                }
                if (hasBioChanged) {
                    await Aktivitas.create({ nis: nipy, tipe: 'biodata', aksi: 'Memperbarui profil (Biodata/Foto)' });
                }
            } catch (logError) {
                console.error('Logging activity failed:', logError);
            }
        }
    }

    if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser });
}
