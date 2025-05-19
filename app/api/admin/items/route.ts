import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const items = await prisma.item.findMany({
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

        return NextResponse.json(items);
    } catch (error) {
        console.error('Error fetching items:', error);
        return NextResponse.json(
            { error: 'Failed to fetch items' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const item = await prisma.item.create({
            data,
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

        return NextResponse.json(item);
    } catch (error) {
        console.error('Error creating item:', error);
        return NextResponse.json(
            { error: 'Failed to create item' },
            { status: 500 }
        );
    }
}
