import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url!);
    const id = searchParams.get('id');

    let reviews;
    if (id) {
        reviews = await prisma.review.findMany({
            where: { itemId: Number(id) },
            include: { user: true },
        });
    } else {
        reviews = await prisma.review.findMany({
            include: { user: true },
        });
    }
    return NextResponse.json(reviews);
}
