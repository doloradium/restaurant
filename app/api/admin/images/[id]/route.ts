import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import fs from 'fs/promises';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const imageId = parseInt(id);

        if (isNaN(imageId)) {
            return NextResponse.json(
                { error: 'Invalid image ID' },
                { status: 400 }
            );
        }

        // First, get the image to know its path
        const image = await prisma.image.findUnique({
            where: {
                id: imageId,
            },
        });

        if (!image) {
            return NextResponse.json(
                { error: 'Image not found' },
                { status: 404 }
            );
        }

        // Delete from database first
        await prisma.image.delete({
            where: {
                id: imageId,
            },
        });

        try {
            // Then try to delete the file
            if (image.imageUrl.startsWith('/images/uploads/')) {
                const filename = image.imageUrl.split('/').pop();
                if (filename) {
                    const filePath = join(
                        process.cwd(),
                        'public',
                        'images',
                        'uploads',
                        filename
                    );
                    await fs.unlink(filePath);
                }
            }
        } catch (fileError) {
            console.error('Error deleting image file:', fileError);
            // Continue even if file deletion fails
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        );
    }
}
