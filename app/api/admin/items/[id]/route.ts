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

        // Get the original item first to verify it exists
        const existingItem = await prisma.item.findUnique({
            where: {
                id: itemId,
            },
        });

        if (!existingItem) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 }
            );
        }

        const data = await request.json();
        console.log('Received update data:', data);

        // Clean the data before sending to Prisma
        const cleanData = { ...data };

        // Ensure price is a number
        if (typeof cleanData.price === 'string') {
            cleanData.price = parseFloat(cleanData.price);
        }

        // Ensure categoryId is a number
        if (typeof cleanData.categoryId === 'string') {
            cleanData.categoryId = parseInt(cleanData.categoryId);
        }

        // Remove any fields that shouldn't be directly updated
        delete cleanData.category;
        delete cleanData.images;
        delete cleanData.id;

        console.log('Cleaned data for update:', cleanData);

        const updatedItem = await prisma.item.update({
            where: {
                id: itemId,
            },
            data: cleanData,
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

        console.log('Item updated successfully:', updatedItem);
        return NextResponse.json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        // Return more detailed error information
        let errorMessage = 'Failed to update item';
        let errorDetails =
            error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            {
                error: errorMessage,
                details: errorDetails,
            },
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
