
import { NextRequest, NextResponse } from 'next/server';
import { join, resolve } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export async function GET(
    req: NextRequest,
    { params }: { params: { filename: string } }
) {
    const filename = params.filename;

    // Coba beberapa kemungkinan path untuk fleksibilitas standalone mode
    const pathsToTry = [
        join(process.cwd(), 'public/uploads/profile', filename),
        resolve('./public/uploads/profile', filename),
        join('/app/public/uploads/profile', filename)
    ];

    let filePath = '';
    for (const p of pathsToTry) {
        if (existsSync(p)) {
            filePath = p;
            break;
        }
    }

    if (!filePath) {
        console.error(`File not found in any paths: ${filename}`);
        return new NextResponse('File not found', { status: 404 });
    }

    try {
        const fileBuffer = await readFile(filePath);

        const ext = filename.split('.').pop()?.toLowerCase();
        let contentType = 'image/jpeg';
        if (ext === 'png') contentType = 'image/png';
        if (ext === 'gif') contentType = 'image/gif';
        if (ext === 'webp') contentType = 'image/webp';
        if (ext === 'svg') contentType = 'image/svg+xml';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Length': fileBuffer.length.toString()
            }
        });
    } catch (error: any) {
        console.error('Error serving file:', error);
        return new NextResponse('Error reading file', { status: 500 });
    }
}
