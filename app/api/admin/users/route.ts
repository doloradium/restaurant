import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        // Get role filter from query params
        const searchParams = req.nextUrl.searchParams;
        const role = searchParams.get('role');

        // Build the query
        const whereClause = role ? { role } : {};

        // Fetch users with filter
        const users = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                surname: true,
                email: true,
                phoneNumber: true,
                role: true,
                rating: true,
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
            orderBy: {
                name: 'asc',
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

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
            ...userData
        } = data;

        // Create user with address if address data is provided
        const user = await prisma.user.create({
            data: {
                ...userData,
                ...(addressData.street &&
                addressData.city &&
                addressData.houseNumber
                    ? {
                          addresses: {
                              create: [addressData],
                          },
                      }
                    : {}),
            },
            include: {
                addresses: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
}
