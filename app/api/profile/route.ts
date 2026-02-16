
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
    let updatedUser = null;

    if (session.role === 'siswa') {
        const nis = (session as any).username;
        // Ambil data lama untuk pembanding jika perlu log lebih detail, 
        // tapi user minta log umum saja
        const oldUser = await Siswa.findOne({ nis });

        updatedUser = await Siswa.findOneAndUpdate(
            { nis },
            { noHp, status, foto, emailPribadi, statusUpdatedAt: new Date() },
            { new: true }
        ).select('-password');

        if (updatedUser) {
            try {
                const hasStatusChanged = status && status !== oldUser?.status;
                const hasBioChanged = (noHp && noHp !== oldUser?.noHp) || (foto && foto !== oldUser?.foto) || (emailPribadi && emailPribadi !== oldUser?.emailPribadi);

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
        updatedUser = await Guru.findOneAndUpdate(
            { nipy: (session as any).username },
            { noHp, status, foto, emailPribadi, statusUpdatedAt: new Date() },
            { new: true }
        ).select('-password');
    }

    if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedUser });
}
