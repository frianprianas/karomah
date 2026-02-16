
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { getSession, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const session = await getSession();

        // Ensure user is an admin with pending OTP
        if (!session || session.role !== 'admin' || !session.otpPending) {
            return NextResponse.json({ error: 'Unauthorized or OTP not required' }, { status: 401 });
        }

        const { otp } = await req.json();
        await connectDB();

        const admin = await Admin.findById(session.id);
        if (!admin) {
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        // Validate OTP
        if (!admin.otp || admin.otp !== otp) {
            return NextResponse.json({ error: 'Kode OTP salah' }, { status: 400 });
        }

        if (admin.otpExpires && new Date() > new Date(admin.otpExpires)) {
            return NextResponse.json({ error: 'Kode OTP telah kadaluarsa' }, { status: 400 });
        }

        // OTP Valid: Upgrade Session
        const token = await signToken({
            id: admin._id,
            username: admin.username,
            role: 'admin',
            name: admin.nama
        });

        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        // Clear OTP
        await Admin.updateOne({ _id: admin._id }, {
            $unset: { otp: "", otpExpires: "" }
        });

        return NextResponse.json({ success: true, message: 'Verifikasi berhasil' });
    } catch (error: any) {
        console.error('OTP verification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
