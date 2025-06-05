import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db-helpers';

export async function POST(req: NextRequest) {
    try {
        const { userId, items, paymentType, addressId, deliveryTime, status } =
            await req.json();

        // Validate required fields
        if (
            !userId ||
            !items ||
            !items.length ||
            !paymentType ||
            !status ||
            !addressId ||
            !deliveryTime
        ) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create the order with the addressId and deliveryTime
        const order = await dbHelpers.order.create({
            data: {
                userId,
                addressId,
                paymentType,
                status,
                isPaid: paymentType === 'CARD', // Mark as paid if using card
                isCompleted: false,
                deliveryTime: new Date(deliveryTime),
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
                address: true, // Include the address in the response
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

// Add a GET endpoint to fetch user orders
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url!);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get all orders for the user with their addresses
        const orders = await dbHelpers.order.findMany({
            where: {
                userId: Number(userId),
            },
            include: {
                orderItems: {
                    include: {
                        item: true,
                    },
                },
                address: true,
            },
            orderBy: {
                id: 'desc', // Most recent orders first
            },
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
