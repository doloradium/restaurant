import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const itemId = parseInt(id);

        if (isNaN(itemId)) {
            return NextResponse.json(
                { error: 'Invalid item ID' },
                { status: 400 }
            );
        }

        const item = await prisma.item.findUnique({
            where: {
                id: itemId,
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                categoryId: true,
                category: {
                    select: {
                        name: true,
                    },
                },
                images: true,
            },
        });

        if (!item) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error fetching item:', error);
        return NextResponse.json(
            { error: 'Failed to fetch item' },
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
        const itemId = parseInt(id);

        if (isNaN(itemId)) {
            return NextResponse.json(
                { error: 'Invalid item ID' },
                { status: 400 }
            );
        }

        const data = await request.json();

        const updatedItem = await prisma.item.update({
            where: {
                id: itemId,
            },
            data,
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                categoryId: true,
                category: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        return NextResponse.json(
            { error: 'Failed to update item' },
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
        const itemId = parseInt(id);

        if (isNaN(itemId)) {
            return NextResponse.json(
                { error: 'Invalid item ID' },
                { status: 400 }
            );
        }

        // Check if item exists
        const item = await prisma.item.findUnique({
            where: {
                id: itemId,
            },
        });

        if (!item) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }

        // Delete all related images
        await prisma.image.deleteMany({
            where: {
                itemId: itemId,
            },
        });

        // Delete the item
        await prisma.item.delete({
            where: {
                id: itemId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting item:', error);
        return NextResponse.json(
            { error: 'Failed to delete item' },
            { status: 500 }
        );
    }
}
