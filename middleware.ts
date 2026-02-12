
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Rute yang butuh login
const PROTECTED_ROUTES = ['/dashboard', '/teacher', '/admin'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Cek apakah user sedang mengakses halaman yang dilindungi
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    if (isProtected) {
        const token = request.cookies.get('token')?.value;

        // 2. Jika tidak ada token (belum login), tendang ke halaman login
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // 3. Verifikasi Token JWT
        // pastikan token asli dan belum expired (secara internal JWT, 24jam)
        const payload = await verifyToken(token);

        if (!payload) {
            // Token palsu atau sudah expired > 24 jam
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('token');
            return response;
        }

        // 4. SLIDING SESSION (Perpanjang Otomatis)
        // Setiap kali user aktif (pindah halaman/reload), kita reset timer cookie jadi 30 menit lagi.
        // Jika user diam > 30 menit, cookie browser otomatis dihapus browser -> Logout.

        const response = NextResponse.next();

        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7200, // 2 Jam (7200 detik)
            path: '/',
        });

        return response;
    }

    // Untuk rute lain (misal API publik atau halaman login), biarkan lewat
    return NextResponse.next();
}

// Config matcher agar middleware tidak jalan di sembarang file (misal gambar/css)
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
    ],
};
