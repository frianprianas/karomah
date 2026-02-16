
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

export async function POST(req: NextRequest) {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure filename is safe and unique
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const path = join(process.cwd(), 'public/uploads/profile', filename);

    try {
        await writeFile(path, buffer);
        console.log(`Saved file to ${path}`);
        return NextResponse.json({ success: true, url: `/uploads/profile/${filename}` });
    } catch (e) {
        console.error('Upload error:', e);
        return NextResponse.json({ success: false, message: 'Failed to save file' }, { status: 500 });
    }
}
