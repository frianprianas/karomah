import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { getSession } from '@/lib/auth';
import { hash } from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'admin' && session.role !== 'spv')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const spv = await Admin.findOne({ role: 'spv' }, { password: 0 }); // Exclude password
        return NextResponse.json(spv);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username, nama, password } = await req.json();

        if (!username || !nama || !password) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
        }

        await connectDB();

        // Check if SPV exists
        const existingSpv = await Admin.findOne({ role: 'spv' });
        const hashedPassword = await hash(password, 10);

        if (existingSpv) {
            // Update
            existingSpv.username = username;
            existingSpv.nama = nama;
            existingSpv.password = hashedPassword;
            await existingSpv.save();
            return NextResponse.json({ success: true, message: 'Data SPV diperbarui' });
        } else {
            // Create new
            await Admin.create({
                username,
                nama,
                password: hashedPassword,
                role: 'spv'
            });
            return NextResponse.json({ success: true, message: 'SPV baru dibuat' });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        await Admin.deleteOne({ role: 'spv' });
        return NextResponse.json({ success: true, message: 'SPV dihapus' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
