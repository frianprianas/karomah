
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import connectDB from '@/lib/db';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        let waSetting = await Setting.findOne({ key: 'wa_auto_report' });

        if (!waSetting) {
            waSetting = await Setting.create({
                key: 'wa_auto_report',
                value: {
                    enabled: false,
                    greetings: [
                        "Assalamu'alaikum",
                        "Ass",
                        "Assalamu'alaikum Wr. WB",
                        "Selamat Malam"
                    ]
                }
            });
        }

        return NextResponse.json(waSetting.value);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await connectDB();

        const waSetting = await Setting.findOneAndUpdate(
            { key: 'wa_auto_report' },
            { value: body },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, data: waSetting.value });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
