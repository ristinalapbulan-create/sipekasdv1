import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;
    const role = request.cookies.get('user_role')?.value; // 'sekolah' or 'disdik'

    const { pathname } = request.nextUrl;

    const isSekolahRoute = pathname.startsWith('/sekolah');
    const isDisdikRoute = pathname.startsWith('/disdik');
    const isHomeRoute = pathname === '/';

    if (!token) {
        // Protected routes require auth — redirect ke landing page (login modal ada di sana)
        if (isSekolahRoute || isDisdikRoute) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Jika sudah login dan buka home, redirect ke dashboard sesuai role
    if (isHomeRoute) {
        if (role === 'disdik') {
            return NextResponse.redirect(new URL('/disdik/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/sekolah/dashboard', request.url));
        }
    }

    // Prevent role mismatch
    if (isSekolahRoute && role !== 'sekolah') {
        return NextResponse.redirect(new URL('/disdik/dashboard', request.url));
    }

    if (isDisdikRoute && role !== 'disdik') {
        return NextResponse.redirect(new URL('/sekolah/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
