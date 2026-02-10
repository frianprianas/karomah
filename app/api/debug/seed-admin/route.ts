import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        // Hanya izinkan akses dari localhost untuk keamanan
        const forwarded = req.headers.get("x-forwarded-for");
        if (forwarded && forwarded !== '127.0.0.1') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }

        await connectDB();

        // Cek jika sudah ada
        const existing = await Admin.findOne({ username });
        if (existing) {
            return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await Admin.create({
            username,
            password: hashedPassword,
            nama: 'Super Admin',
            role: 'admin'
        });

        return NextResponse.json({ message: 'Admin created successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
