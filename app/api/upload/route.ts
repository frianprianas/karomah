
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

    if (buffer.length > 5 * 1024 * 1024) {
        return NextResponse.json({ success: false, message: 'File too large (Max 5MB)' }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), 'public/uploads/profile');

    // Ensure directory exists
    try {
        const { mkdir } = await import('fs/promises');
        await mkdir(uploadDir, { recursive: true });
    } catch (err) {
        console.error('Directory creation failed:', err);
    }

    // Ensure filename is safe and unique
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const path = join(uploadDir, filename);

    try {
        await writeFile(path, buffer);
        console.log(`Saved file to ${path}`);
        return NextResponse.json({ success: true, url: `/uploads/profile/${filename}` });
    } catch (e: any) {
        console.error('File write error:', e);
        return NextResponse.json({ success: false, message: 'Failed to save file: ' + e.message }, { status: 500 });
    }
}
