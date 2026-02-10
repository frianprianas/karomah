
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Siswa from '@/models/Siswa';
import Guru from '@/models/Guru';
import Admin from '@/models/Admin';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
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

        // Create token
        const token = await signToken({
            id: user._id,
            username: role === 'siswa' ? (user as any).nis : (role === 'guru' ? (user as any).nipy : (user as any).username),
            role: userRole,
            name: user.nama,
            kelas: role === 'siswa' ? (user as any).kelas : null
        });

        const cookieStore = await cookies();
        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return NextResponse.json({ success: true, user: { name: user.nama, role: userRole } });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
