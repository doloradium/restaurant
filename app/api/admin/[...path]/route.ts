import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ResourceName = 'user' | 'category' | 'item' | 'order' | 'review';

function isValidResource(resource: string): resource is ResourceName {
    return ['user', 'category', 'item', 'order', 'review'].includes(resource);
}

async function handlePrismaOperation<T>(
    resource: ResourceName,
    operation: (client: PrismaClient) => Promise<T>
) {
    try {
        return await operation(prisma);
    } catch (error) {
        throw error;
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const [resource, id] = params.path;

    if (!isValidResource(resource)) {
        return NextResponse.json(
            { error: 'Invalid resource' },
            { status: 400 }
        );
    }

    try {
        if (id) {
            const data = await handlePrismaOperation(resource, (client) =>
                (client[resource] as any).findUnique({
                    where: { id: parseInt(id) },
                })
            );
            return NextResponse.json(data);
        } else {
            const data = await handlePrismaOperation(resource, (client) =>
                (client[resource] as any).findMany()
            );
            return NextResponse.json(data);
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Resource not found' },
            { status: 404 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const [resource] = params.path;

    if (!isValidResource(resource)) {
        return NextResponse.json(
            { error: 'Invalid resource' },
            { status: 400 }
        );
    }

    const body = await request.json();

    try {
        const data = await handlePrismaOperation(resource, (client) =>
            (client[resource] as any).create({
                data: body,
            })
        );
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create resource' },
            { status: 400 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const [resource, id] = params.path;

    if (!isValidResource(resource)) {
        return NextResponse.json(
            { error: 'Invalid resource' },
            { status: 400 }
        );
    }

    const body = await request.json();

    try {
        const data = await handlePrismaOperation(resource, (client) =>
            (client[resource] as any).update({
                where: { id: parseInt(id) },
                data: body,
            })
        );
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update resource' },
            { status: 400 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { path: string[] } }
) {
    const [resource, id] = params.path;

    if (!isValidResource(resource)) {
        return NextResponse.json(
            { error: 'Invalid resource' },
            { status: 400 }
        );
    }

    try {
        await handlePrismaOperation(resource, (client) =>
            (client[resource] as any).delete({
                where: { id: parseInt(id) },
            })
        );
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete resource' },
            { status: 400 }
        );
    }
}
