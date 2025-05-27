import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

// GET handler to fetch all orders
export async function GET(req: NextRequest) {
    try {
        console.log('Fetching all orders');

        // Get all orders with related items
        const orders = await prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        item: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                dateOrdered: 'desc',
            },
        });

        console.log(`Found ${orders.length} orders`);
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
