import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Retrieve a single address
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const addressId = parseInt(id);

        if (isNaN(addressId)) {
            return NextResponse.json(
                { error: 'Invalid address ID' },
                { status: 400 }
            );
        }

        const address = await prisma.address.findUnique({
            where: {
                id: addressId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                    },
                },
            },
        });

        if (!address) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(address);
    } catch (error) {
        console.error('Error fetching address:', error);
        return NextResponse.json(
            { error: 'Failed to fetch address' },
            { status: 500 }
        );
    }
}

// PUT - Update an address
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const addressId = parseInt(id);

        if (isNaN(addressId)) {
            return NextResponse.json(
                { error: 'Invalid address ID' },
                { status: 400 }
            );
        }

        const data = await request.json();

        // Ensure userId is a number if present
        if (data.userId && typeof data.userId === 'string') {
            data.userId = parseInt(data.userId);
        }

        // Remove nested user object if present (can't be updated directly)
        if (data.user) {
            delete data.user;
        }

        // Check if the address exists
        const existingAddress = await prisma.address.findUnique({
            where: { id: addressId },
        });

        if (!existingAddress) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            );
        }

        // Update the address
        const updatedAddress = await prisma.address.update({
            where: {
                id: addressId,
            },
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedAddress);
    } catch (error) {
        console.error('Error updating address:', error);
        return NextResponse.json(
            { error: 'Failed to update address' },
            { status: 500 }
        );
    }
}

// DELETE - Delete a single address
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const addressId = parseInt(id);

        if (isNaN(addressId)) {
            return NextResponse.json(
                { error: 'Invalid address ID' },
                { status: 400 }
            );
        }

        // Check if address exists
        const address = await prisma.address.findUnique({
            where: {
                id: addressId,
            },
        });

        if (!address) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            );
        }

        // Check if this is the user's only address and has orders
        const hasOrders = await prisma.order.findFirst({
            where: {
                addressId: addressId,
            },
        });

        if (hasOrders) {
            return NextResponse.json(
                {
                    error:
                        'Cannot delete address with associated orders. ' +
                        'You must update those orders to use a different address first.',
                },
                { status: 400 }
            );
        }

        // Delete the address
        await prisma.address.delete({
            where: {
                id: addressId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting address:', error);
        return NextResponse.json(
            { error: 'Failed to delete address' },
            { status: 500 }
        );
    }
}
