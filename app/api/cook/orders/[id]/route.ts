import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper function to verify cook authentication
async function verifyCookAuth(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('cook_token')?.value;

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

        // Verify this is a cook user
        if (decoded.role !== 'COOK') {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

// PUT - Update order status (CONFIRMED -> PREPARING -> READY)
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Verify cook authentication
        const cook = await verifyCookAuth(request);
        if (!cook) {
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
        if (!status || !['PREPARING', 'READY'].includes(status)) {
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

        // Validate the status transition
        const validTransitions: Record<string, string[]> = {
            CONFIRMED: ['PREPARING'],
            PREPARING: ['READY'],
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
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { status },
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
