import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const { userId, items, paymentType, address, status } = await req.json();

    // items: [{ itemId, quantity }]
    const order = await prisma.order.create({
        data: {
            userId,
            paymentType,
            status,
            orderItems: {
                create: items.map((item: any) => ({
                    itemId: item.itemId,
                    quantity: item.quantity,
                })),
            },
            address,
        },
        include: { orderItems: true },
    });

    return NextResponse.json(order);
}
