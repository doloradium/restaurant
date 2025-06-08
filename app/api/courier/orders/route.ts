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

// GET - Fetch orders assigned to the courier
export async function GET(request: Request) {
    try {
        // Verify courier authentication
        const courier = await verifyCourierAuth(request);
        if (!courier) {
            return NextResponse.json(
                { error: 'Не авторизован' },
                { status: 401 }
            );
        }

        const courierId = courier.id;

        // Get orders that are assigned to this courier and are READY or DELIVERED (not completed yet)
        const orders = await prisma.order.findMany({
            where: {
                courierId: courierId,
                status: {
                    in: ['READY', 'DELIVERED'],
                },
                isCompleted: false,
            },
            include: {
                orderItems: {
                    include: {
                        item: true,
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phoneNumber: true,
                    },
                },
                address: true,
            },
            orderBy: [
                // Sort by delivery date
                { deliveryTime: 'asc' },
            ],
        });

        // Ensure dates are properly formatted
        const formattedOrders = orders.map((order) => {
            return {
                ...order,
                deliveryTime: order.deliveryTime
                    ? order.deliveryTime.toISOString()
                    : null,
            };
        });

        return NextResponse.json({ orders: formattedOrders });
    } catch (error) {
        console.error('Error fetching courier orders:', error);
        return NextResponse.json(
            { error: 'Не удалось загрузить заказы' },
            { status: 500 }
        );
    }
}
