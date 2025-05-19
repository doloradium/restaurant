import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
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

    return NextResponse.json(item);
}
