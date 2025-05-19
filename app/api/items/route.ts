import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url!);
    const limit = parseInt(searchParams.get('limit') || '20', 10); // default 20
    const offset = parseInt(searchParams.get('offset') || '0', 10); // default 0

    const items = await prisma.item.findMany({
        skip: offset,
        take: limit,
        include: { category: true, reviews: true },
    });

    return NextResponse.json(items);
}
