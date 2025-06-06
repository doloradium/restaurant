import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const reviews = await prisma.review.findMany({
            select: {
                id: true,
                text: true,
                rating: true,
                createdAt: true,
                item: {
                    select: {
                        name: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        surname: true,
                    },
                },
            },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const review = await prisma.review.create({
            data,
            select: {
                id: true,
                text: true,
                rating: true,
                createdAt: true,
                item: {
                    select: {
                        name: true,
                    },
                },
                user: {
                    select: {
                        name: true,
                        surname: true,
                    },
                },
            },
        });

        return NextResponse.json(review);
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'Failed to create review' },
            { status: 500 }
        );
    }
}
