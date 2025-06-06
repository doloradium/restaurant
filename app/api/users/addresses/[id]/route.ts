import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const addressId = parseInt(params.id);

        if (isNaN(addressId)) {
            return NextResponse.json(
                { error: 'Invalid address ID' },
                { status: 400 }
            );
        }

        // Получаем токены из куки
        const cookieStore = await cookies();
        const accessToken = cookieStore.get('accessToken')?.value;
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (!accessToken && !refreshToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Получаем идентификатор пользователя из токена
        let userId: number | null = null;

        if (accessToken) {
            const payload = await verifyAccessToken(accessToken);
            if (payload && payload.userId) {
                userId = Number(payload.userId);
            }
        }

        if (!userId && refreshToken) {
            const payload = await verifyRefreshToken(refreshToken);
            if (payload && payload.userId) {
                userId = Number(payload.userId);
            }
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Проверяем, существует ли адрес и принадлежит ли он пользователю
        const address = await prisma.address.findUnique({
            where: { id: addressId },
        });

        if (!address) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            );
        }

        if (address.userId !== userId) {
            return NextResponse.json(
                { error: 'Not authorized to delete this address' },
                { status: 403 }
            );
        }

        // Удаляем адрес
        await prisma.address.delete({
            where: { id: addressId },
        });

        return NextResponse.json(
            { message: 'Address deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting address:', error);
        return NextResponse.json(
            { error: 'Failed to delete address' },
            { status: 500 }
        );
    }
}
