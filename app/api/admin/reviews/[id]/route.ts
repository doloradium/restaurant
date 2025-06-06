import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const reviewId = parseInt(id);

        if (isNaN(reviewId)) {
            return NextResponse.json(
                { error: 'Invalid review ID' },
                { status: 400 }
            );
        }

        const review = await prisma.review.findUnique({
            where: {
                id: reviewId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                    },
                },
                item: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!review) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(review);
    } catch (error) {
        console.error('Error fetching review:', error);
        return NextResponse.json(
            { error: 'Failed to fetch review' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const reviewId = parseInt(id);

        console.log('Updating review with ID:', reviewId);

        if (isNaN(reviewId)) {
            console.error('Invalid review ID:', id);
            return NextResponse.json(
                { error: 'Invalid review ID' },
                { status: 400 }
            );
        }

        // Check if review exists
        const existingReview = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!existingReview) {
            console.error('Review not found with ID:', reviewId);
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            );
        }

        // Parse request body
        let data;
        try {
            data = await request.json();
            console.log('Request data for review update:', data);
        } catch (error) {
            console.error('Error parsing request body:', error);
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        // Validate required fields
        if (!data.text) {
            console.error('Text is required for review update');
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            );
        }

        // Sanitize input data to only include valid fields
        const sanitizedData = {
            text: data.text,
            ...(data.userId && { userId: parseInt(data.userId) }),
            ...(data.itemId && { itemId: parseInt(data.itemId) }),
            ...(data.rating !== undefined && { rating: parseInt(data.rating) }),
        };

        console.log('Sanitized data for update:', sanitizedData);

        // Update the review
        try {
            const updatedReview = await prisma.review.update({
                where: {
                    id: reviewId,
                },
                data: sanitizedData,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            surname: true,
                            email: true,
                        },
                    },
                    item: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });

            console.log('Review updated successfully:', updatedReview);
            return NextResponse.json(updatedReview);
        } catch (prismaError) {
            console.error('Prisma error updating review:', prismaError);
            return NextResponse.json(
                { error: 'Database error updating review' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
            { error: 'Failed to update review' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const reviewId = parseInt(id);

        if (isNaN(reviewId)) {
            return NextResponse.json(
                { error: 'Invalid review ID' },
                { status: 400 }
            );
        }

        // Check if review exists
        const review = await prisma.review.findUnique({
            where: {
                id: reviewId,
            },
        });

        if (!review) {
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            );
        }

        // Delete the review
        await prisma.review.delete({
            where: {
                id: reviewId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { error: 'Failed to delete review' },
            { status: 500 }
        );
    }
}
