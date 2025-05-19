import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateTokens, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens({
        userId: Number(user.id),
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

    // Set auth cookies
    return setAuthCookies(response, accessToken, refreshToken);
}
