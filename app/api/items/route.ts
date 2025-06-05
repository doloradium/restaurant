import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface Review {
    id: number;
    itemId: number;
    userId: number;
    text: string;
    rating: number;
    user: {
        id: number;
        name: string;
        surname: string;
    };
}

interface Image {
    id: number;
    itemId: number;
    imageUrl: string;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url!);
        // Increase default limit to 100 and allow up to 1000 items
        const requestedLimit = parseInt(searchParams.get('limit') || '100', 10);
        const limit = Math.min(requestedLimit, 1000); // Cap at 1000 for safety
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        // First get the items with standard relations but without reviews to avoid potential issues
        const items = await prisma.item.findMany({
            skip: offset,
            take: limit,
            include: {
                category: true,
            },
        });

        // If there are no items, return an empty array
        if (items.length === 0) {
            return NextResponse.json([]);
        }

        // Safely get reviews separately to avoid potential relation issues
        const itemIds = items.map((item) => item.id);
        let reviews: Review[] = [];
        try {
            reviews = await prisma.review.findMany({
                where: {
                    itemId: { in: itemIds },
                },
                select: {
                    id: true,
                    itemId: true,
                    userId: true,
                    text: true,
                    rating: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            surname: true,
                        },
                    },
                },
            });
        } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError);
            // Continue without reviews if there's an error
        }

        // Try to get images using a simpler approach first
        let images: Image[] = [];
        try {
            images = await prisma.image.findMany({
                where: {
                    itemId: { in: itemIds },
                },
            });
        } catch (imageError) {
            console.error('Error fetching images with findMany:', imageError);

            // Fall back to raw query if the first approach fails
            try {
                const rawImages = await prisma.$queryRaw`
                    SELECT id, "itemId", "imageUrl" 
                    FROM "Image" 
                    WHERE "itemId" IN (${Prisma.join(itemIds)})
                `;

                // Convert raw results to the expected format
                if (Array.isArray(rawImages)) {
                    images = rawImages as Image[];
                }
            } catch (rawQueryError) {
                console.error(
                    'Error with raw query for images:',
                    rawQueryError
                );
                // Continue without images if there's an error
            }
        }

        // Combine the data
        const itemsWithExtras = items.map((item) => {
            const itemImages = Array.isArray(images)
                ? images.filter((img) => img.itemId === item.id)
                : [];

            const itemReviews = Array.isArray(reviews)
                ? reviews.filter((review) => review.itemId === item.id)
                : [];

            return {
                ...item,
                images: itemImages,
                reviews: itemReviews,
            };
        });

        return NextResponse.json(itemsWithExtras);
    } catch (error) {
        console.error('Error in items API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: String(error) },
            { status: 500 }
        );
    }
}
