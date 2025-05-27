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

        return NextResponse.json({
            ...item,
            images: Array.isArray(images) ? images : [],
        });
    } catch (error) {
        console.error('Error fetching item:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
