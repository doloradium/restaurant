import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;
        const refreshToken = cookieStore.get('refreshToken')?.value;

        let payload = null;

        if (accessToken) {
            payload = await verifyAccessToken(accessToken);
        }

        if (!payload && refreshToken) {
            const refreshPayload = await verifyRefreshToken(refreshToken);
            if (refreshPayload) {
                payload = refreshPayload;
            }
        }

        if (!payload) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({ authenticated: true, user: payload });
    } catch (error) {
        console.error('Token verification error:', error);
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
