import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
    id: string;
}

export async function GET(req: Request, { params }: { params: Params }) {
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
        console.log('Update order data received:', data);

        // Check if order exists before trying to update
        const existingOrder = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!existingOrder) {
            return NextResponse.json(
                { error: `Order with ID ${orderId} not found` },
                { status: 404 }
            );
        }

        // Extract orderItems from data if present and ensure it's kept separately
        const { orderItems, ...orderData } = data;

        // Additional validation and cleaning
        // Remove any keys with undefined values to avoid Prisma validation errors
        Object.keys(orderData).forEach((key) => {
            if (orderData[key] === undefined) {
                delete orderData[key];
            }
        });

        // Remove any fields that shouldn't be updated directly
        delete orderData.user;
        delete orderData.id;

        console.log('Cleaned order data for update:', orderData);

        try {
            // Start a transaction
            const updatedOrder = await prisma.$transaction(async (tx) => {
                console.log('Updating order with data:', orderData);

                // Update order data
                const order = await tx.order.update({
                    where: {
                        id: orderId,
                    },
                    data: orderData,
                });

                console.log('Order updated successfully:', order);

                // If orderItems is provided, update them
                if (orderItems && Array.isArray(orderItems)) {
                    console.log('Updating order items:', orderItems);

                    // First remove all existing order items
                    await tx.orderItem.deleteMany({
                        where: {
                            orderId: orderId,
                        },
                    });

                    // Then create the new ones
                    for (const item of orderItems) {
                        // Ensure itemId is a number
                        const itemId =
                            typeof item.itemId === 'string'
                                ? parseInt(item.itemId)
                                : item.itemId;

                        // Ensure quantity is a number
                        const quantity =
                            typeof item.quantity === 'string'
                                ? parseInt(item.quantity)
                                : item.quantity;

                        await tx.orderItem.create({
                            data: {
                                orderId: orderId,
                                itemId: itemId,
                                quantity: quantity,
                            },
                        });
                    }
                }

                // Return the updated order with fresh orderItems
                return tx.order.findUnique({
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

            console.log('Transaction completed successfully');
            return NextResponse.json(updatedOrder);
        } catch (transactionError: any) {
            console.error('Transaction error details:', transactionError);

            // Extract useful information from Prisma errors
            let errorMessage = 'Transaction failed';
            let errorDetails =
                transactionError.message || String(transactionError);

            // Check if it's a Prisma-specific error
            if (transactionError.code) {
                switch (transactionError.code) {
                    case 'P2025':
                        errorMessage = 'Record not found';
                        break;
                    case 'P2002':
                        errorMessage = 'Unique constraint violation';
                        break;
                    case 'P2003':
                        errorMessage = 'Foreign key constraint violation';
                        break;
                    default:
                        errorMessage = `Prisma error: ${transactionError.code}`;
                }
            }

            return NextResponse.json(
                {
                    error: errorMessage,
                    details: errorDetails,
                    code: transactionError.code || 'UNKNOWN',
                },
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            {
                error: 'Failed to update order',
                message: error.message || String(error),
            },
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

export async function PATCH(req: NextRequest, { params }: { params: Params }) {
    try {
        const { id } = params;
        const orderId = parseInt(id);

        // Validate order exists
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Get update data from request body
        const data = await req.json();

        // Update order with the provided data
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                // Only allow updating specific fields
                courierId:
                    data.courierId !== undefined
                        ? data.courierId === 0
                            ? null
                            : data.courierId
                        : undefined,
                status: data.status !== undefined ? data.status : undefined,
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

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json(
            { error: 'Failed to update order' },
            { status: 500 }
        );
    }
}
