import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reviewId = parseInt(params.id);
        if (!reviewId || isNaN(reviewId)) {
            return NextResponse.json(
                { error: 'Неверный ID отзыва' },
                { status: 400 }
            );
        }

        // Get authentication token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Необходимо авторизоваться' },
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

        // Find the review
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            return NextResponse.json(
                { error: 'Отзыв не найден' },
                { status: 404 }
            );
        }

        // Verify that the user owns this review
        if (review.userId !== Number(userId)) {
            return NextResponse.json(
                { error: 'У вас нет прав на редактирование этого отзыва' },
                { status: 403 }
            );
        }

        // Parse the request body
        const { rating, text } = await req.json();
        const ratingValue = rating ? parseInt(rating, 10) : 5;

        // Update the review
        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                rating: ratingValue,
                text: text || review.text,
            },
            include: { user: true },
        });

        return NextResponse.json(updatedReview);
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
            { error: 'Не удалось обновить отзыв' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reviewId = parseInt(params.id);
        if (!reviewId || isNaN(reviewId)) {
            return NextResponse.json(
                { error: 'Неверный ID отзыва' },
                { status: 400 }
            );
        }

        // Get authentication token from cookies
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Необходимо авторизоваться' },
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

        // Find the review
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            return NextResponse.json(
                { error: 'Отзыв не найден' },
                { status: 404 }
            );
        }

        // Verify that the user owns this review
        if (review.userId !== Number(userId)) {
            return NextResponse.json(
                { error: 'У вас нет прав на удаление этого отзыва' },
                { status: 403 }
            );
        }

        // Delete the review
        await prisma.review.delete({
            where: { id: reviewId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { error: 'Не удалось удалить отзыв' },
            { status: 500 }
        );
    }
}
