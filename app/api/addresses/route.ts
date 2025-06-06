import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db-helpers';
import { verifyAccessToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const {
            userId,
            city,
            street,
            houseNumber,
            apartment,
            entrance,
            floor,
            intercom,
        } = await req.json();

        // Проверяем авторизацию
        const accessToken = req.cookies.get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = await verifyAccessToken(accessToken);
        if (
            !payload ||
            (payload.userId !== userId && payload.role !== 'ADMIN')
        ) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Проверяем обязательные поля
        if (!userId || !city || !street || !houseNumber) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Создаем адрес в базе данных
        const address = await dbHelpers.address.create({
            userId: Number(userId),
            city,
            street,
            houseNumber,
            apartment,
            entrance,
            floor,
            intercom,
        });

        return NextResponse.json(address);
    } catch (error) {
        console.error('Error creating address:', error);
        return NextResponse.json(
            { error: 'Failed to create address' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url!);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Проверяем авторизацию
        const accessToken = req.cookies.get('accessToken')?.value;
        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const payload = await verifyAccessToken(accessToken);
        if (
            !payload ||
            (payload.userId !== Number(userId) && payload.role !== 'ADMIN')
        ) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Получаем адреса пользователя
        const addresses = await dbHelpers.address.findMany({
            where: {
                userId: Number(userId),
            },
        });

        return NextResponse.json(addresses);
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch addresses' },
            { status: 500 }
        );
    }
}
