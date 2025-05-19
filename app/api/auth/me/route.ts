import { NextRequest, NextResponse } from 'next/server';
import {
    verifyAccessToken,
    verifyRefreshToken,
    generateTokens,
    setAuthCookies,
} from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    let accessToken = req.cookies.get('accessToken')?.value;
    let payload = accessToken ? await verifyAccessToken(accessToken) : null;

    if (!payload) {
        // Try refresh token
        const refreshToken = req.cookies.get('refreshToken')?.value;
        if (refreshToken) {
            const refreshPayload = await verifyRefreshToken(refreshToken);
            if (refreshPayload) {
                // Issue new tokens
                const user = await prisma.user.findUnique({
                    where: { id: refreshPayload.userId },
                    select: { id: true, name: true, email: true, role: true },
                });
                if (!user) {
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
                const response = NextResponse.json({ user });
                setAuthCookies(response, newAccessToken, newRefreshToken);
                return response;
            }
        }
        return NextResponse.json({ user: null }, { status: 401 });
    }

    // Access token is valid
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, email: true, role: true },
    });
    if (!user) {
        return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user });
}
