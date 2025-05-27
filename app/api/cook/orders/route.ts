import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper function to verify cook authentication
async function verifyCookAuth(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('cook_token')?.value;

    if (!token) {
        return null;
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        ) as {
            id: number;
            email: string;
            role: string;
        };

        // Verify this is a cook user
        if (decoded.role !== 'COOK') {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

// GET - Fetch orders for cook dashboard (CONFIRMED or PREPARING status)
export async function GET(request: Request) {
    try {
        // Verify cook authentication
        const cook = await verifyCookAuth(request);
        if (!cook) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch orders that are either CONFIRMED or PREPARING
        const orders = await prisma.order.findMany({
            where: {
                OR: [{ status: 'CONFIRMED' }, { status: 'PREPARING' }],
                isCompleted: false,
            },
            include: {
                orderItems: {
                    include: {
                        item: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: [
                // Sort by delivery date (using dateOrdered as fallback)
                { dateOrdered: 'asc' },
            ],
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Error fetching cook orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
