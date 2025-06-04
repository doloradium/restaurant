import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = Number(params.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
        }

        const item = await prisma.item.findUnique({
            where: { id },
            include: {
                category: true,
                reviews: {
                    include: { user: true },
                },
            },
        });

        if (!item) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Get the item's images
        const images = await prisma.$queryRaw`
            SELECT id, "itemId", "imageUrl" FROM "Image" WHERE "itemId" = ${id}
        `;

        // Calculate average rating from reviews
        let avgRating = 5; // Default rating if no reviews
        if (item.reviews && item.reviews.length > 0) {
            const totalRating = item.reviews.reduce((sum, review) => {
                // Use the review's rating if available, otherwise use 5 as default
                const reviewRating =
                    (review as any).rating !== undefined
                        ? (review as any).rating
                        : 5;
                return sum + reviewRating;
            }, 0);
            avgRating = totalRating / item.reviews.length;
        }

        return NextResponse.json({
            ...item,
            images: Array.isArray(images) ? images : [],
            rating: avgRating, // Add calculated rating
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
