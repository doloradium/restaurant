import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET handler to fetch all orders
export async function GET(req: NextRequest) {
    try {
        // Get status filter from query params
        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get('status');

        // Build the query
        const whereClause = status ? { status } : {};

        // Fetch orders with filter
        const orders = await prisma.order.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                orderItems: {
                    include: {
                        item: true,
                    },
                },
            },
            orderBy: {
                dateOrdered: 'desc',
            },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

// POST handler to create a new order (for admin only)
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const order = await prisma.order.create({
            data,
            include: {
                orderItems: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
