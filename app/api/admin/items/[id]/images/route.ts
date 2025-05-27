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

        const images = await prisma.image.findMany({
            where: {
                itemId: itemId,
            },
            orderBy: {
                id: 'asc',
            },
        });

        return NextResponse.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        return NextResponse.json(
            { error: 'Failed to fetch images' },
            { status: 500 }
        );
    }
}
