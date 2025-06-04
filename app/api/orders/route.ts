import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { userId, items, paymentType, address, status } =
            await req.json();

        // Validate required fields
        if (!userId || !items || !items.length || !paymentType || !status) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create the order with address fields from the user's delivery address
        const order = await prisma.order.create({
            data: {
                userId,
                paymentType,
                status,
                isPaid: paymentType === 'CARD', // Mark as paid if using card
                isCompleted: false,
                dateOrdered: new Date(),
                orderItems: {
                    create: items.map((item: any) => ({
                        itemId: item.itemId,
                        quantity: item.quantity,
                    })),
                },
            },
            include: {
                orderItems: {
                    include: {
                        item: true,
                    },
                },
            },
        });

        console.log('Order created successfully:', order);
        return NextResponse.json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
