import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db-helpers';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const orderId = parseInt(id);

        console.log(`Fetching order ${orderId}`);

        if (isNaN(orderId)) {
            console.error(`Invalid order ID: ${id}`);
            return NextResponse.json(
                { error: 'Invalid order ID' },
                { status: 400 }
            );
        }

        // Get the order with relevant details
        const order = await dbHelpers.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: {
                        item: true,
                    },
                },
                address: true,
            },
        });

        if (!order) {
            console.error(`Order ${orderId} not found`);
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        console.log(
            `Found order ${orderId}, status: ${order.status}, isPaid: ${order.isPaid}`
        );

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}
