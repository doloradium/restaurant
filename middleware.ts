import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
    verifyAccessToken,
    verifyRefreshToken,
    getAccessToken,
    getRefreshToken,
} from './lib/auth';

// Add paths that don't require authentication
const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/items',
    '/api/reviews',
    '/api/categories',
    '/api/yandex/suggest',
    '/api/yandex/geocode',
    '/login',
    '/register',
    '/menu',
    '/about',
    '/contact',
    '/admin-login',
    '/',
];

// Add paths that require authentication
const protectedPaths = ['/api/admin', '/admin', '/profile', '/orders'];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    console.log('Middleware processing path:', path);

    // Allow public paths without any processing
    if (publicPaths.some((publicPath) => path.startsWith(publicPath))) {
        console.log('Path is public, allowing access');
        return NextResponse.next();
    }

    // Check if it's a protected route
    if (
        protectedPaths.some((protectedPath) => path.startsWith(protectedPath))
    ) {
        console.log('Protected route detected');
        const accessToken = getAccessToken(request);
        const refreshToken = getRefreshToken(request);

        console.log('Access token present:', !!accessToken);
        console.log('Refresh token present:', !!refreshToken);

        // If no tokens, redirect to login
        if (!accessToken && !refreshToken) {
            console.log('No tokens found, redirecting to login');
            // For admin routes, redirect to admin login
            if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
                return NextResponse.redirect(
                    new URL('/admin-login', request.url)
                );
            }
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Verify access token
        let payload = null;
        if (accessToken) {
            console.log('Verifying access token...');
            payload = await verifyAccessToken(accessToken);
            console.log('Access token verification result:', payload);
        }

        if (payload) {
            console.log('Access token verified, payload:', payload);
            // For admin routes, check if user has admin role
            if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
                console.log(
                    'Admin route detected, checking role:',
                    payload.role
                );
                if (payload.role !== 'ADMIN') {
                    console.log('User does not have admin role');
                    return new NextResponse(
                        JSON.stringify({ error: 'Forbidden' }),
                        {
                            status: 403,
                        }
                    );
                }
                console.log('User has admin role, allowing access');
            }
            // Access token is valid, proceed
            return NextResponse.next();
        }

        // Access token is invalid, try refresh token
        if (refreshToken) {
            console.log('Access token invalid, trying refresh token');
            const refreshPayload = await verifyRefreshToken(refreshToken);
            console.log('Refresh token verification result:', refreshPayload);

            if (refreshPayload) {
                console.log(
                    'Refresh token valid, redirecting to login page with refresh needed parameter'
                );
                // For admin routes, redirect to admin login
                if (
                    path.startsWith('/admin') ||
                    path.startsWith('/api/admin')
                ) {
                    const response = NextResponse.redirect(
                        new URL('/admin-login?refresh=true', request.url)
                    );
                    return response;
                }
                // Redirect to login page with parameter instead of directly to refresh endpoint
                const response = NextResponse.redirect(
                    new URL('/login?refresh=true', request.url)
                );
                return response;
            }
            console.log('Refresh token invalid');
        }

        // Both tokens are invalid, redirect to login
        console.log('Both tokens are invalid, redirecting to login');
        // For admin routes, redirect to admin login
        if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
            return NextResponse.redirect(new URL('/admin-login', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Only match specific paths that need middleware
        '/api/admin/:path*',
        '/admin/:path*',
        '/profile/:path*',
        '/orders/:path*',
    ],
};
