import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phoneNumber: true,
                street: true,
                house: true,
                apartment: true,
                role: true,
                rating: true,
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const user = await prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phoneNumber: true,
                street: true,
                house: true,
                apartment: true,
                role: true,
                rating: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
