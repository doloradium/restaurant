import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper function to verify courier authentication
async function verifyCourierAuth(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('courier_token')?.value;

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

        // Verify this is a courier user
        if (decoded.role !== 'COURIER') {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

// PUT - Update order status (READY -> DELIVERED -> completed)
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Verify courier authentication
        const courier = await verifyCourierAuth(request);
        if (!courier) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = params;
        const orderId = parseInt(id);

        // Get request data
        const data = await request.json();
        const { status } = data;

        // Validate status change
        if (!status || !['DELIVERED', 'COMPLETED'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status value' },
                { status: 400 }
            );
        }

        // Get current order to validate the transition
        const currentOrder = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!currentOrder) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if the courier is assigned to this order
        if (currentOrder.courierId !== courier.id) {
            return NextResponse.json(
                { error: 'You are not assigned to this order' },
                { status: 403 }
            );
        }

        // Validate the status transition
        const validTransitions: Record<string, string[]> = {
            READY: ['DELIVERED'],
            DELIVERED: ['COMPLETED'],
        };

        if (
            !validTransitions[currentOrder.status] ||
            !validTransitions[currentOrder.status].includes(status)
        ) {
            return NextResponse.json(
                {
                    error: `Invalid status transition from ${currentOrder.status} to ${status}`,
                },
                { status: 400 }
            );
        }

        // Update the order status
        const updateData: any = { status };

        // If marking as delivered, set the arrival date
        if (status === 'DELIVERED') {
            updateData.dateArrived = new Date();
        }

        // If marking as completed, set isCompleted flag
        if (status === 'COMPLETED') {
            updateData.isCompleted = true;
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: updateData,
        });

        return NextResponse.json({ order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json(
            { error: 'Failed to update order status' },
            { status: 500 }
        );
    }
}
