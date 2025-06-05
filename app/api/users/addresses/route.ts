import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    try {
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

        // Получаем адреса пользователя из БД
        const addresses = await prisma.address.findMany({
            where: { userId: userId },
            orderBy: { id: 'asc' },
        });

        return NextResponse.json({ addresses });
    } catch (error) {
        console.error('Error fetching user addresses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch addresses' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        // Получаем данные из запроса
        const data = await req.json();
        const {
            city,
            street,
            houseNumber,
            apartment,
            entrance,
            floor,
            intercom,
        } = data;

        // Проверяем обязательные поля
        if (!city || !street || !houseNumber) {
            return NextResponse.json(
                { error: 'Missing required fields' },
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

        // Проверяем, существует ли уже такой адрес
        const existingAddress = await prisma.address.findFirst({
            where: {
                userId,
                city,
                street,
                houseNumber,
                apartment: apartment || null,
            },
        });

        if (existingAddress) {
            return NextResponse.json({ address: existingAddress });
        }

        // Создаем новый адрес
        const newAddress = await prisma.address.create({
            data: {
                userId,
                city,
                street,
                houseNumber,
                apartment: apartment || null,
                entrance: entrance || null,
                floor: floor || null,
                intercom: intercom || null,
            },
        });

        return NextResponse.json({ address: newAddress });
    } catch (error) {
        console.error('Error creating address:', error);
        return NextResponse.json(
            { error: 'Failed to create address' },
            { status: 500 }
        );
    }
}
