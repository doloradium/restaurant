import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
    try {
        // Get token from cookies
        const cookieStore = await cookies();
        const token = cookieStore.get('courier_token')?.value;

        if (!token) {
            return NextResponse.json({ user: null });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        ) as {
            id: number;
            email: string;
            role: string;
        };

        // Check if user exists and is a courier
        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        // Validate user is a courier
        if (!user || user.role !== 'COURIER') {
            // Clear invalid token
            const response = NextResponse.json({ user: null });
            response.cookies.delete('courier_token');
            return response;
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Courier session error:', error);
        // If token verification fails, clear it
        const response = NextResponse.json({ user: null });
        response.cookies.delete('courier_token');
        return response;
    }
}
