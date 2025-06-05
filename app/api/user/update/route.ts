import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';
import { dbHelpers } from '@/lib/db-helpers';

export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = await verifyAccessToken(accessToken);
        if (!payload || !payload.userId) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const data = await request.json();
        const { name, surname, email, phoneNumber, street, house, apartment } =
            data;

        // Validate required fields
        if (!name || !surname || !email) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if email is already taken by another user
        const existingUser = await dbHelpers.user.findFirst({
            where: {
                email,
                id: { not: Number(payload.userId) },
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already in use' },
                { status: 400 }
            );
        }

        // Update user (without address fields)
        const updatedUser = await dbHelpers.user.update({
            where: { id: Number(payload.userId) },
            data: {
                name,
                surname,
                email,
                phoneNumber,
            },
        });

        // Handle address information if provided
        if (street && house) {
            // Check if user has any addresses
            const existingAddresses = await dbHelpers.address.findMany({
                where: {
                    userId: Number(payload.userId),
                },
            });

            if (existingAddresses.length > 0) {
                // Update the primary address (first one)
                await dbHelpers.address.update({
                    where: { id: existingAddresses[0].id },
                    data: {
                        street,
                        houseNumber: house,
                        apartment,
                    },
                });
            } else {
                // Create a new address
                await dbHelpers.address.create({
                    data: {
                        userId: Number(payload.userId),
                        city: 'Default City', // You might want to make this a parameter
                        street,
                        houseNumber: house,
                        apartment,
                    },
                });
            }
        }

        // Get user's addresses
        const addresses = await dbHelpers.address.findMany({
            where: {
                userId: Number(payload.userId),
            },
        });

        // Combine user data with addresses
        const userWithAddresses = {
            ...updatedUser,
            addresses,
        };

        return NextResponse.json(userWithAddresses);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
