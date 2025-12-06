import NextAuth from 'next-auth';
import { authConfig } from './lib/auth.config';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
    const session = await auth();
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/register', '/tutors'];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

    // API routes
    if (pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // Allow public routes
    if (isPublicRoute && pathname !== '/tutor' && pathname !== '/student') {
        // Redirect logged-in users away from auth pages
        if (session?.user && (pathname === '/login' || pathname === '/register')) {
            const redirectUrl = session.user.role === 'TUTOR' ? '/tutor' : '/student';
            return NextResponse.redirect(new URL(redirectUrl, request.url));
        }
        return NextResponse.next();
    }

    // Redirect to login if not authenticated
    if (!session?.user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(url);
    }

    // Role-based access control
    const userRole = session.user.role;

    // Student routes
    if (pathname.startsWith('/student')) {
        if (userRole !== 'STUDENT') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Tutor routes
    if (pathname.startsWith('/tutor')) {
        if (userRole !== 'TUTOR') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Admin routes
    if (pathname.startsWith('/admin')) {
        if (userRole !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
