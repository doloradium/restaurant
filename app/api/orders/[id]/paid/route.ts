import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db-helpers';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const orderId = parseInt(id);

        if (isNaN(orderId)) {
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
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Обновляем заказ, помечая его как оплаченный
        const updatedOrder = await dbHelpers.order.update({
            where: { id: orderId },
            data: { isPaid: true },
            include: {
                orderItems: {
                    include: {
                        item: true,
                    },
                },
                address: true,
            },
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order payment status:', error);
        return NextResponse.json(
            { error: 'Failed to update order payment status' },
            { status: 500 }
        );
    }
}
