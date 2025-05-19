import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = await verifyAccessToken(accessToken);
        if (!payload || !payload.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const data = await request.json();
        const { name, surname, email, phoneNumber, street, house, apartment } =
            data;

        // Validate required fields
        if (!name || !surname || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if email is already taken by another user
        const existingUser = await prisma.user.findFirst({
            where: {
                email,
                id: { not: Number(payload.userId) },
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 400 }
            );
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: Number(payload.userId) },
            data: {
                name,
                surname,
                email,
                phoneNumber,
                street,
                house,
                apartment,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
