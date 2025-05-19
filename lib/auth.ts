import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface TokenPayload extends jose.JWTPayload {
    userId: number;
    email: string;
    role: string;
}

export const generateTokens = async (payload: TokenPayload) => {
    console.log('Generating tokens with payload:', payload);
    const accessToken = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(ACCESS_TOKEN_SECRET);

    const refreshToken = await new jose.SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(REFRESH_TOKEN_SECRET);

    return { accessToken, refreshToken };
};

export const setAuthCookies = (
    response: NextResponse,
    accessToken: string,
    refreshToken: string
) => {
    console.log('Setting auth cookies');
    // Set access token cookie (1 hour)
    response.cookies.set('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hour
        path: '/',
    });

    // Set refresh token cookie (7 days)
    response.cookies.set('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
    });

    return response;
};

export const clearAuthCookies = (response: NextResponse) => {
    console.log('Clearing auth cookies');
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    return response;
};

export const verifyAccessToken = async (token: string) => {
    try {
        console.log('Verifying access token:', token);
        const { payload } = await jose.jwtVerify(token, ACCESS_TOKEN_SECRET);
        console.log('Access token payload:', payload);
        return payload as TokenPayload;
    } catch (error) {
        console.error('Access token verification failed:', error);
        return null;
    }
};

export const verifyRefreshToken = async (token: string) => {
    try {
        console.log('Verifying refresh token:', token);
        const { payload } = await jose.jwtVerify(token, REFRESH_TOKEN_SECRET);
        console.log('Refresh token payload:', payload);
        return payload as TokenPayload;
    } catch (error) {
        console.error('Refresh token verification failed:', error);
        return null;
    }
};

export const getAccessToken = (request: NextRequest) => {
    const token = request.cookies.get('accessToken')?.value;
    console.log('Access token from request:', token);
    return token;
};

export const getRefreshToken = (request: NextRequest) => {
    const token = request.cookies.get('refreshToken')?.value;
    console.log('Refresh token from request:', token);
    return token;
};
