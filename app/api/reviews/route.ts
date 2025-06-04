import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';

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

export async function POST(req: NextRequest) {
    try {
        // Get authentication token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Необходимо авторизоваться для отправки отзыва' },
                { status: 401 }
            );
        }

        // Verify user token
        const payload = await verifyAccessToken(accessToken);
        if (!payload || !payload.userId) {
            return NextResponse.json(
                { error: 'Недействительный токен' },
                { status: 401 }
            );
        }

        const userId = payload.userId;

        // Parse the request body
        const { itemId, rating, text } = await req.json();

        // Validate required fields
        if (!itemId || !text) {
            return NextResponse.json(
                { error: 'Отсутствуют обязательные поля' },
                { status: 400 }
            );
        }

        // Check if the user has already reviewed this item
        const existingReview = await prisma.review.findFirst({
            where: {
                userId: Number(userId),
                itemId: Number(itemId),
            },
        });

        if (existingReview) {
            // Update the existing review
            const updatedReview = await prisma.review.update({
                where: { id: existingReview.id },
                data: {
                    text,
                },
                include: { user: true },
            });

            return NextResponse.json(updatedReview);
        } else {
            // Create a new review
            const newReview = await prisma.review.create({
                data: {
                    itemId: Number(itemId),
                    userId: Number(userId),
                    text,
                },
                include: { user: true },
            });

            return NextResponse.json(newReview);
        }
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'Не удалось создать отзыв' },
            { status: 500 }
        );
    }
}
