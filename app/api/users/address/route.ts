import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
    try {
        const { userId, street, house, apartment } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Update user's address
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                street,
                house,
                apartment,
            },
            select: {
                id: true,
                street: true,
                house: true,
                apartment: true,
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating user address:', error);
        return NextResponse.json(
            { error: 'Failed to update address' },
            { status: 500 }
        );
    }
}
