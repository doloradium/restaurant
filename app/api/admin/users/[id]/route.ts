import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                addresses: {
                    select: {
                        id: true,
                        city: true,
                        street: true,
                        houseNumber: true,
                        apartment: true,
                        entrance: true,
                        floor: true,
                        intercom: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
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
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        const data = await request.json();

        // Remove passwordHash from data if present for security
        if (data.passwordHash) {
            delete data.passwordHash;
        }

        // Extract address data if provided
        const addressData = {
            city: data.city,
            street: data.street,
            houseNumber: data.houseNumber,
            apartment: data.apartment,
            entrance: data.entrance,
            floor: data.floor,
            intercom: data.intercom,
        };

        // Remove address fields from user data
        const {
            city,
            street,
            houseNumber,
            apartment,
            entrance,
            floor,
            intercom,
            addresses,
            ...userData
        } = data;

        // First, update the user data
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: userData,
            include: {
                addresses: true,
            },
        });

        // If we have address data, update or create the address
        if (addressData.street && addressData.city && addressData.houseNumber) {
            // Check if the user already has addresses
            if (updatedUser.addresses && updatedUser.addresses.length > 0) {
                // Update the first address
                await prisma.address.update({
                    where: {
                        id: updatedUser.addresses[0].id,
                    },
                    data: addressData,
                });
            } else {
                // Create a new address
                await prisma.address.create({
                    data: {
                        ...addressData,
                        userId: userId,
                    },
                });
            }
        }

        // Fetch the updated user with addresses
        const refreshedUser = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                addresses: true,
            },
        });

        return NextResponse.json(refreshedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
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
        const userId = parseInt(id);

        if (isNaN(userId)) {
            return NextResponse.json(
                { error: 'Invalid user ID' },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Delete related reviews
        await prisma.review.deleteMany({
            where: {
                userId: userId,
            },
        });

        // Delete related addresses
        await prisma.address.deleteMany({
            where: {
                userId: userId,
            },
        });

        // Delete related orders
        await prisma.order.deleteMany({
            where: {
                userId: userId,
            },
        });

        // Delete the user
        await prisma.user.delete({
            where: {
                id: userId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
}
