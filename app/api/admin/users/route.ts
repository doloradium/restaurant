import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        // Get role filter from query params
        const searchParams = req.nextUrl.searchParams;
        const role = searchParams.get('role');

        // Build the query
        const whereClause = role ? { role } : {};

        // Fetch users with filter
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phoneNumber: true,
                role: true,
                rating: true,
            },
            orderBy: {
                name: 'asc',
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
