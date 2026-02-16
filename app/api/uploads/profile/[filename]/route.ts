
import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
    req: NextRequest,
    { params }: { params: { filename: string } }
) {
    const filename = params.filename;
    // Gunakan path absolut yang sama dengan tempat penyimpanan
    const filePath = join(process.cwd(), 'public/uploads/profile', filename);

    if (!existsSync(filePath)) {
        return new NextResponse('File not found', { status: 404 });
    }

    try {
        const fileBuffer = await readFile(filePath);

        // Tentukan Content-Type berdasarkan ekstensi
        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'image/jpeg';
        if (ext === 'png') contentType = 'image/png';
        if (ext === 'gif') contentType = 'image/gif';
        if (ext === 'webp') contentType = 'image/webp';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (error) {
        return new NextResponse('Error reading file', { status: 500 });
    }
}
