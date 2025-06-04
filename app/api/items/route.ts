import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url!);
        // Increase default limit to 100 and allow up to 1000 items
        const requestedLimit = parseInt(searchParams.get('limit') || '100', 10);
        const limit = Math.min(requestedLimit, 1000); // Cap at 1000 for safety
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        // First get the items with standard relations
        const items = await prisma.item.findMany({
            skip: offset,
            take: limit,
            include: {
                category: true,
                reviews: true,
            },
        });

        // If there are no items, return an empty array
        if (items.length === 0) {
            return NextResponse.json([]);
        }

        // Then get the images separately - fixed query to handle empty array
        const itemIds = items.map((item) => item.id);

        // Use a safer query approach
        const images = await prisma.$queryRaw`
            SELECT id, "itemId", "imageUrl" 
            FROM "Image" 
            WHERE "itemId" IN (${Prisma.join(itemIds)})
        `;

        // Combine the data
        const itemsWithImages = items.map((item) => {
            const itemImages = Array.isArray(images)
                ? images.filter((img: any) => img.itemId === item.id)
                : [];

            return {
                ...item,
                images: itemImages,
            };
        });

        return NextResponse.json(itemsWithImages);
    } catch (error) {
        console.error('Error in items API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
