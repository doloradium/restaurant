import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { generateTokens, setAuthCookies } from '@/lib/auth';

export async function POST(req: NextRequest) {
    const { email, password, name, surname } = await req.json();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return NextResponse.json(
            { error: 'User already exists' },
            { status: 400 }
        );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            email,
            passwordHash,
            name,
            surname,
            role: 'USER',
        },
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens({
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

    // Set auth cookies
    return setAuthCookies(response, accessToken, refreshToken);
}
