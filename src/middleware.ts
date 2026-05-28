import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const role = request.cookies.get('user_role')?.value;

    const { pathname } = request.nextUrl;

    const isSekolahRoute = pathname.startsWith('/sekolah');
    const isDisdikRoute = pathname.startsWith('/disdik');
    const isHomeRoute = pathname === '/';

    // Jika tidak ada token → redirect protected routes ke landing
    if (!token) {
        if (isSekolahRoute || isDisdikRoute) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Jika sudah login dan buka home → redirect ke dashboard sesuai role
    if (isHomeRoute) {
        if (role === 'disdik') {
            return NextResponse.redirect(new URL('/disdik/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/sekolah/dashboard', request.url));
        }
    }

    // Role mismatch: sekolah akses /disdik → redirect
    if (isDisdikRoute && role === 'sekolah') {
        return NextResponse.redirect(new URL('/sekolah/dashboard', request.url));
    }

    // Role mismatch: disdik akses /sekolah → redirect
    if (isSekolahRoute && role === 'disdik') {
        return NextResponse.redirect(new URL('/disdik/dashboard', request.url));
    }

    // Semua OK → lanjutkan
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Hanya match halaman utama, /disdik/*, /sekolah/*, /setup
        '/',
        '/disdik/:path*',
        '/sekolah/:path*',
        '/setup',
    ],
};
