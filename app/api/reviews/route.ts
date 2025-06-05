import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url!);
        const id = searchParams.get('id');
        const limitParam = searchParams.get('limit');

        // Parse limit parameter
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        let reviews = [];
        if (id) {
            reviews = await prisma.review.findMany({
                where: { itemId: Number(id) },
                select: {
                    id: true,
                    itemId: true,
                    userId: true,
                    text: true,
                    rating: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            surname: true,
                        },
                    },
                },
                orderBy: { id: 'desc' }, // Most recent reviews first
            });
        } else {
            // Get reviews, potentially with a limit
            reviews = await prisma.review.findMany({
                select: {
                    id: true,
                    itemId: true,
                    userId: true,
                    text: true,
                    rating: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            surname: true,
                        },
                    },
                    item: {
                        select: {
                            name: true,
                        },
                    },
                },
                orderBy: { id: 'desc' }, // Most recent reviews first
                take: limit,
            });

            // Transform the reviews for display
            reviews = reviews.map((review) => {
                return {
                    ...review,
                    dishName: review.item?.name || '',
                };
            });
        }
        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        // Return an empty array rather than an error to prevent client-side issues
        return NextResponse.json([]);
    }
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
        const ratingValue = rating ? parseInt(rating, 10) : 0;

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
            return NextResponse.json(
                { error: 'Вы уже оставили отзыв на это блюдо' },
                { status: 400 }
            );
        }

        // Create a new review
        const newReview = await prisma.review.create({
            data: {
                itemId: Number(itemId),
                userId: Number(userId),
                text,
                rating: ratingValue,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                    },
                },
            },
        });

        return NextResponse.json(newReview);
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'Не удалось создать отзыв' },
            { status: 500 }
        );
    }
}
