import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken } from './auth';
import { prisma } from './prisma';

interface SessionUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Session {
    user: SessionUser | null;
}

export async function getSession(): Promise<Session | null> {
    try {
        const cookieStore = cookies();
        const accessToken = cookieStore.get('accessToken')?.value;

        if (!accessToken) {
            return { user: null };
        }

        // Проверяем access token
        let payload = await verifyAccessToken(accessToken);

        if (!payload) {
            // Если access token недействителен, проверяем refresh token
            const refreshToken = cookieStore.get('refreshToken')?.value;

            if (!refreshToken) {
                return { user: null };
            }

            payload = await verifyRefreshToken(refreshToken);

            if (!payload) {
                return { user: null };
            }
        }

        // Получаем данные пользователя
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, name: true, email: true, role: true },
        });

        if (!user) {
            return { user: null };
        }

        return { user };
    } catch (error) {
        console.error('Error getting session:', error);
        return { user: null };
    }
}
