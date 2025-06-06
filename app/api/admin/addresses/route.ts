import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - List all addresses with optional filtering
export async function GET(req: NextRequest) {
    try {
        // Get filters from query params
        const searchParams = req.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const city = searchParams.get('city');

        // Build the query
        const whereClause: any = {};

        if (userId) {
            whereClause.userId = parseInt(userId);
        }

        if (city) {
            whereClause.city = {
                contains: city,
                mode: 'insensitive',
            };
        }

        // Fetch addresses with filters
        const addresses = await prisma.address.findMany({
            where: whereClause,
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
            orderBy: {
                id: 'desc',
            },
        });

        return NextResponse.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch addresses' },
            { status: 500 }
        );
    }
}

// POST - Create a new address
export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Ensure userId is a number
        if (data.userId && typeof data.userId === 'string') {
            data.userId = parseInt(data.userId);
        }

        // Create the address
        const address = await prisma.address.create({
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

        return NextResponse.json(address);
    } catch (error) {
        console.error('Error creating address:', error);
        return NextResponse.json(
            { error: 'Failed to create address' },
            { status: 500 }
        );
    }
}

// DELETE - Bulk delete addresses
export async function DELETE(request: Request) {
    try {
        const { ids } = await request.json();

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { error: 'Invalid or empty IDs array' },
                { status: 400 }
            );
        }

        // Convert string IDs to numbers if needed
        const numericIds = ids.map((id: string | number) =>
            typeof id === 'string' ? parseInt(id) : id
        );

        // Delete addresses
        const result = await prisma.address.deleteMany({
            where: {
                id: {
                    in: numericIds,
                },
            },
        });

        return NextResponse.json({
            success: true,
            deleted: result.count,
        });
    } catch (error) {
        console.error('Error deleting addresses:', error);
        return NextResponse.json(
            { error: 'Failed to delete addresses' },
            { status: 500 }
        );
    }
}
