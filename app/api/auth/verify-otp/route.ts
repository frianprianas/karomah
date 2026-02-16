
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { getSession, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const session = await getSession();

        // Ensure user is an admin with pending OTP
        if (!session || (session as any).role !== 'admin' || !(session as any).otpPending) {
            console.error("OTP Verification: Unauthorized access attempt or missing session", session);
            return NextResponse.json({ error: 'Sesi tidak valid atau OTP tidak diperlukan' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const otp = body.otp;

        if (!otp) {
            return NextResponse.json({ error: 'Kode OTP diperlukan' }, { status: 400 });
        }

        await connectDB();

        // Ensure we handle the ID properly
        const adminId = (session as any).id;
        if (!adminId) {
            console.error("OTP Verification: Session ID missing", session);
            return NextResponse.json({ error: 'ID Admin tidak ditemukan dalam sesi' }, { status: 400 });
        }

        const admin = await Admin.findById(adminId);
        if (!admin) {
            console.error("OTP Verification: Admin not found in DB for ID", adminId);
            return NextResponse.json({ error: 'Data Admin tidak ditemukan' }, { status: 404 });
        }

        // Validate OTP
        if (!admin.otp || admin.otp !== otp) {
            console.log(`OTP Verification: Wrong OTP. Expected ${admin.otp}, got ${otp}`);
            return NextResponse.json({ error: 'Kode OTP salah' }, { status: 400 });
        }

        if (admin.otpExpires && new Date() > new Date(admin.otpExpires)) {
            console.log("OTP Verification: OTP Expired");
            return NextResponse.json({ error: 'Kode OTP telah kadaluarsa' }, { status: 400 });
        }

        // OTP Valid: Upgrade Session
        const token = await signToken({
            id: admin._id.toString(),
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

        // Clear OTP from DB
        await Admin.updateOne({ _id: admin._id }, {
            $unset: { otp: "", otpExpires: "" }
        });

        console.log(`OTP Verification: Success for admin ${admin.username}`);
        return NextResponse.json({ success: true, message: 'Verifikasi berhasil' });
    } catch (error: any) {
        console.error('OTP verification system error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan sistem (OTP Error)' }, { status: 500 });
    }
}
