import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { existsSync } from 'fs';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const itemId = formData.get('itemId') as string;
        const files = formData.getAll('file') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files uploaded' },
                { status: 400 }
            );
        }

        if (!itemId) {
            return NextResponse.json(
                { error: 'No item ID provided' },
                { status: 400 }
            );
        }

        // Ensure the upload directory exists
        const uploadDir = join('public', 'images', 'uploads');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const uploadedImages = [];

        // Process each file
        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create a unique filename with original extension
            const fileExtension = file.name.split('.').pop();
            const uniqueFilename = `${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 15)}.${fileExtension}`;
            const imagePath = join(uploadDir, uniqueFilename);

            // Write the file
            await writeFile(imagePath, buffer);

            // Store in database
            const imageUrl = `/images/uploads/${uniqueFilename}`;
            const image = await prisma.image.create({
                data: {
                    itemId: parseInt(itemId),
                    imageUrl,
                },
            });

            uploadedImages.push({
                id: image.id,
                itemId: image.itemId,
                imageUrl: image.imageUrl,
            });
        }

        return NextResponse.json({
            success: true,
            images: uploadedImages,
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        return NextResponse.json(
            { error: 'Failed to upload images' },
            { status: 500 }
        );
    }
}
