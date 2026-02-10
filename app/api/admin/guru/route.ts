
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Guru from '@/models/Guru';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const guru = await Guru.find({}).sort({ nama: 1 });
        return NextResponse.json(guru);
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

        await connectDB();
        const { nipy, nama, ket, password } = await req.json();

        const hashedPassword = await bcrypt.hash(password, 10);
        const newGuru = new Guru({
            nipy,
            nama,
            ket,
            password: hashedPassword
        });

        await newGuru.save();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const { _id, nipy, nama, ket, password } = await req.json();

        const updateData: any = { nipy, nama, ket };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        await Guru.findByIdAndUpdate(_id, updateData);
        return NextResponse.json({ success: true });
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

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        await connectDB();
        await Guru.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
