
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Siswa from '@/models/Siswa';
import Guru from '@/models/Guru';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { role, id, name, extra, password } = await req.json();

        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;
        if (role === 'siswa') {
            newUser = await Siswa.create({
                nis: id,
                nama: name,
                kelas: extra, // extra maps to class
                password: hashedPassword,
            });
        } else if (role === 'guru') {
            newUser = await Guru.create({
                nipy: id,
                nama: name,
                ket: extra, // extra maps to ket
                password: hashedPassword,
            });
        } else {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        return NextResponse.json({ success: true, user: newUser });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
