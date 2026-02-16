
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Rute yang butuh login
const PROTECTED_ROUTES = ['/dashboard', '/teacher', '/admin'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Cek apakah user sedang mengakses halaman yang dilindungi
    const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isOTPPage = pathname.startsWith('/auth/verify-otp');

    if (isProtected || isOTPPage) {
        const token = request.cookies.get('token')?.value;

        // 2. Jika tidak ada token (belum login), tendang ke halaman login
        if (!token) {
            return NextResponse.redirect(new URL('/', request.url));
        }

        // 3. Verifikasi Token JWT
        const payload = await verifyToken(token);

        if (!payload) {
            const response = NextResponse.redirect(new URL('/', request.url));
            response.cookies.delete('token');
            return response;
        }

        // --- VALIDASI OTP UNTUK ADMIN ---
        if ((payload as any).otpPending) {
            // Jika butuh OTP tapi mau masuk ke halaman lain (selain halaman OTP itu sendiri)
            if (!isOTPPage) {
                return NextResponse.redirect(new URL('/auth/verify-otp', request.url));
            }
        } else {
            // Jika SUDAH masuk (tidak pending OTP) tapi coba buka halaman OTP lagi
            if (isOTPPage) {
                const target = payload.role === 'admin' ? '/admin' : '/dashboard';
                return NextResponse.redirect(new URL(target, request.url));
            }
        }

        // 4. SLIDING SESSION (Perpanjang Otomatis)
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
