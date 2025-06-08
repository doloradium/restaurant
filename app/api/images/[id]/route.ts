import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Check if it's a numeric ID (item ID)
        if (!isNaN(Number(id))) {
            const itemId = Number(id);

            // Find the item's primary image
            const image = await prisma.image.findFirst({
                where: { itemId: itemId },
            });

            if (image) {
                return NextResponse.json({ imageUrl: image.imageUrl });
            }

            // If no images found for this item
            return NextResponse.json({ imageUrl: '/images/default-dish.jpg' });
        }

        // If id is not numeric, it might be a direct image ID
        const directImage = await prisma.image.findUnique({
            where: { id: Number(id) },
        });

        if (directImage) {
            return NextResponse.json({ imageUrl: directImage.imageUrl });
        }

        // Default response if no image found
        return NextResponse.json(
            { imageUrl: '/images/default-dish.jpg' },
            { status: 404 }
        );
    } catch (error) {
        console.error('Error fetching image:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
