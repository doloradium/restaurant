import { NextRequest, NextResponse } from 'next/server';
import {
    verifyAccessToken,
    verifyRefreshToken,
    generateTokens,
    setAuthCookies,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    console.log('🔍 /api/auth/me: Starting token verification');
    let accessToken = req.cookies.get('accessToken')?.value;
    let payload = accessToken ? await verifyAccessToken(accessToken) : null;

    if (!payload) {
        console.log(
            '⚠️ Access token invalid or expired, attempting refresh...'
        );
        // Try refresh token
        const refreshToken = req.cookies.get('refreshToken')?.value;
        if (refreshToken) {
            const refreshPayload = await verifyRefreshToken(refreshToken);
            if (refreshPayload) {
                console.log('✅ Refresh token valid, generating new tokens...');
                // Issue new tokens
                const user = await prisma.user.findUnique({
                    where: { id: refreshPayload.userId },
                    select: { id: true, name: true, email: true, role: true },
                });
                if (!user) {
                    console.log('❌ User not found during refresh');
                    return NextResponse.json({ user: null }, { status: 401 });
                }
                const {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                } = await generateTokens({
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                });
                console.log('🔄 New tokens generated, setting cookies...');
                const response = NextResponse.json({ user });
                setAuthCookies(response, newAccessToken, newRefreshToken);
                console.log('✅ Token refresh complete');
                return response;
            } else {
                console.log('❌ Refresh token invalid');
            }
        } else {
            console.log('❌ No refresh token found');
        }
        return NextResponse.json({ user: null }, { status: 401 });
    }

    console.log('✅ Access token valid');
    // Access token is valid
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, email: true, role: true },
    });
    if (!user) {
        console.log('❌ User not found');
        return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
}
