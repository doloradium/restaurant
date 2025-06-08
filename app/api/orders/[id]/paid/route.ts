import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db-helpers';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const orderId = parseInt(id);

        console.log(
            `[${new Date().toISOString()}] Updating payment status for order ${orderId}`
        );

        if (isNaN(orderId)) {
            console.error(`Invalid order ID: ${id}`);
            return NextResponse.json(
                { error: 'Invalid order ID' },
                { status: 400 }
            );
        }

        // Проверяем, существует ли заказ
        const order = await dbHelpers.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            console.error(`Order not found: ${orderId}`);
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        console.log(
            `Found order ${orderId}, current status: ${order.status}, isPaid: ${order.isPaid}, paymentType: ${order.paymentType}`
        );

        // Always update the order to paid and confirmed regardless of current state
        // This ensures it works even if called multiple times
        const updatedOrder = await dbHelpers.order.update({
            where: { id: orderId },
            data: {
                isPaid: true,
                status: 'CONFIRMED', // Update status to CONFIRMED when payment is completed
            },
            include: {
                orderItems: {
                    include: {
                        item: true,
                    },
                },
                address: true,
            },
        });

        console.log(
            `Order ${orderId} updated successfully, new status: ${updatedOrder.status}, isPaid: ${updatedOrder.isPaid}`
        );

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order payment status:', error);
        return NextResponse.json(
            { error: 'Failed to update order payment status' },
            { status: 500 }
        );
    }
}
