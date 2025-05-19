import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    verifyRefreshToken,
    generateTokens,
    setAuthCookies,
    clearAuthCookies,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
        return NextResponse.json(
            { error: 'Refresh token not found' },
            { status: 401 }
        );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
        // Clear invalid cookies
        const response = NextResponse.json(
            { error: 'Invalid refresh token' },
            { status: 401 }
        );
        return clearAuthCookies(response);
    }

    // Get user from database
    const user = await prisma.user.findUnique({
        where: { id: payload.userId },
    });

    if (!user) {
        // Clear invalid cookies
        const response = NextResponse.json(
            { error: 'User not found' },
            { status: 401 }
        );
        return clearAuthCookies(response);
    }

    // Generate new tokens
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

    // Create response with user data
    const response = NextResponse.json({
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            surname: user.surname,
            role: user.role,
        },
    });

    // Set new auth cookies
    return setAuthCookies(response, newAccessToken, newRefreshToken);
}
