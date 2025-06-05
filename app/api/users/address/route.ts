import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db-helpers';

export async function PUT(req: NextRequest) {
    try {
        const {
            userId,
            city,
            street,
            houseNumber,
            apartment,
            entrance,
            floor,
            intercom,
        } = await req.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Check if required fields are present
        if (!city || !street || !houseNumber) {
            return NextResponse.json(
                { error: 'City, street, and house number are required' },
                { status: 400 }
            );
        }

        // Create or update address for the user
        const address = await dbHelpers.address.create({
            userId: Number(userId),
            city,
            street,
            houseNumber,
            apartment,
            entrance,
            floor,
            intercom,
        });

        return NextResponse.json({ success: true, address });
    } catch (error) {
        console.error('Error creating user address:', error);
        return NextResponse.json(
            { error: 'Failed to create address' },
            { status: 500 }
        );
    }
}

// Add a GET endpoint to retrieve user addresses
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url!);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Get all addresses for the user
        const addresses = await dbHelpers.address.findMany({
            where: {
                userId: Number(userId),
            },
        });

        return NextResponse.json(addresses);
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch addresses' },
            { status: 500 }
        );
    }
}

// Add a DELETE endpoint to remove an address
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url!);
        const addressId = searchParams.get('addressId');

        if (!addressId) {
            return NextResponse.json(
                { error: 'Address ID is required' },
                { status: 400 }
            );
        }

        // Delete the address
        await dbHelpers.address.delete({
            where: {
                id: Number(addressId),
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
