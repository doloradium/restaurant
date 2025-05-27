import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
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

        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
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
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
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

        const data = await request.json();

        // Extract orderItems from data if present
        const { orderItems, ...orderData } = data;

        // Start a transaction
        const updatedOrder = await prisma.$transaction(async (prisma) => {
            // Update order data
            const order = await prisma.order.update({
                where: {
                    id: orderId,
                },
                data: orderData,
                include: {
                    orderItems: true,
                },
            });

            // If orderItems is provided, update them
            if (orderItems && Array.isArray(orderItems)) {
                // First remove all existing order items
                await prisma.orderItem.deleteMany({
                    where: {
                        orderId: orderId,
                    },
                });

                // Then create the new ones
                for (const item of orderItems) {
                    await prisma.orderItem.create({
                        data: {
                            orderId: orderId,
                            itemId: item.itemId,
                            quantity: item.quantity,
                        },
                    });
                }
            }

            // Return the updated order with fresh orderItems
            return prisma.order.findUnique({
                where: {
                    id: orderId,
                },
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
            });
        });

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
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

        // Check if order exists
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Delete order items first
        await prisma.orderItem.deleteMany({
            where: {
                orderId: orderId,
            },
        });

        // Then delete the order
        await prisma.order.delete({
            where: {
                id: orderId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json(
            { error: 'Failed to delete order' },
            { status: 500 }
        );
    }
}
