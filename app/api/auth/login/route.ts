
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Siswa from '@/models/Siswa';
import Guru from '@/models/Guru';
import Admin from '@/models/Admin';
import { signToken } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit'; // Import
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { sendOTP } from '@/lib/mail';

export async function POST(req: Request) {
    try {
        // --- Rate Limiting ---
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        const limiter = rateLimit(ip, 5, 60000); // 5 login per menit per IP

        if (!limiter.success) {
            return NextResponse.json(
                { error: 'Terlalu banyak percobaan login. Tunggu 1 menit.' },
                { status: 429 }
            );
        }
        // ---------------------

        await connectDB();
        const { id, password, role } = await req.json();

        let user = null;
        let userRole = role;

        if (role === 'siswa') {
            user = await Siswa.findOne({ nis: id });
        } else if (role === 'guru') {
            user = await Guru.findOne({ nipy: id });
        } else if (role === 'admin') {
            user = await Admin.findOne({ username: id });
        } else {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // --- KHUSUS ADMIN: KIRIM OTP ---
        if (role === 'admin') {
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 menit

            await Admin.updateOne({ _id: user._id }, {
                $set: { otp: otpCode, otpExpires }
            });

            // Kirim Email
            const adminEmail = (user as any).emailPribadi;
            if (!adminEmail) {
                return NextResponse.json({ error: 'Email admin belum diset pada profil. Silakan hubungi operator.' }, { status: 400 });
            }

            try {
                await sendOTP(adminEmail, otpCode);
            } catch (mailError) {
                console.error('Mail sending failed:', mailError);
                return NextResponse.json({ error: 'Gagal mengirim email OTP. Periksa konfigurasi mail server.' }, { status: 500 });
            }

            // Set temporary OTP pending token
            const tempToken = await signToken({
                id: user._id.toString(),
                username: (user as any).username,
                role: 'admin',
                otpPending: true
            });

            const cookieStore = await cookies();
            cookieStore.set('token', tempToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 10, // 10 menit
                path: '/',
            });

            return NextResponse.json({
                success: true,
                needsOTP: true,
                message: 'OTP telah dikirim ke email Anda. Silakan cek Inbox atau folder SPAM.'
            });
        }

        // --- NORMAL LOGIN (SISWA/GURU) ---
        // Create token
        const token = await signToken({
            id: user._id.toString(),
            username: role === 'siswa' ? (user as any).nis : (role === 'guru' ? (user as any).nipy : (user as any).username),
            role: userRole,
            name: user.nama,
            kelas: role === 'siswa' ? (user as any).kelas : null,
            waliKelas: role === 'guru' ? (user as any).waliKelas : null
        });

        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return NextResponse.json({
            success: true,
            user: {
                name: user.nama,
                role: userRole,
                waliKelas: role === 'guru' ? (user as any).waliKelas : undefined
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
