import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const categoryId = parseInt(id);

        if (isNaN(categoryId)) {
            return NextResponse.json(
                { error: 'Invalid category ID' },
                { status: 400 }
            );
        }

        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
            include: {
                items: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category' },
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
        const categoryId = parseInt(id);

        console.log('Updating category with ID:', categoryId);

        if (isNaN(categoryId)) {
            console.error('Invalid category ID:', id);
            return NextResponse.json(
                { error: 'Invalid category ID' },
                { status: 400 }
            );
        }

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id: categoryId },
        });

        if (!existingCategory) {
            console.error('Category not found with ID:', categoryId);
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Parse the request body
        let data;
        try {
            data = await request.json();
            console.log('Request data for category update:', data);
        } catch (error) {
            console.error('Error parsing request body:', error);
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        // Check if name is provided
        if (!data.name) {
            console.error('Name is required for category update');
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Check for uniqueness
        if (data.name !== existingCategory.name) {
            const existingWithName = await prisma.category.findFirst({
                where: {
                    name: data.name,
                    id: { not: categoryId },
                },
            });

            if (existingWithName) {
                console.error('Category name already exists:', data.name);
                return NextResponse.json(
                    { error: 'Category name already exists' },
                    { status: 409 }
                );
            }
        }

        // Update the category
        try {
            const updatedCategory = await prisma.category.update({
                where: {
                    id: categoryId,
                },
                data: {
                    name: data.name,
                },
            });

            console.log('Category updated successfully:', updatedCategory);
            return NextResponse.json(updatedCategory);
        } catch (prismaError) {
            console.error('Prisma error updating category:', prismaError);
            return NextResponse.json(
                { error: 'Database error updating category' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
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
        const categoryId = parseInt(id);

        if (isNaN(categoryId)) {
            return NextResponse.json(
                { error: 'Invalid category ID' },
                { status: 400 }
            );
        }

        // Check if category exists
        const category = await prisma.category.findUnique({
            where: {
                id: categoryId,
            },
            include: {
                items: true,
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Cannot delete category with items
        if (category.items.length > 0) {
            return NextResponse.json(
                {
                    error: 'Cannot delete category with items',
                    itemCount: category.items.length,
                },
                { status: 400 }
            );
        }

        // Delete the category
        await prisma.category.delete({
            where: {
                id: categoryId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}
