
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { image } = body; // Ini berisi Base64 dari Client

        if (!image) {
            return NextResponse.json({ success: false, message: 'No image data' }, { status: 400 });
        }

        // --- SOLUSI JITU ---
        // Kita tidak lagi simpan ke Disk (Ubuntu Permission sering error)
        // Kita langsung kembalikan Base64-nya untuk disimpan di MongoDB field 'foto'
        // Karena sudah dikompres di client (max 50KB), ini sangat aman untuk DB.

        return NextResponse.json({
            success: true,
            url: image // URL sekarang berisi data Base64 panjang murni
        });

    } catch (e: any) {
        console.error('Upload Error:', e);
        return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
    }
}
