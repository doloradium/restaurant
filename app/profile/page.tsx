import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
    console.log('ProfilePage: Starting');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;
    console.log('ProfilePage: Tokens present:', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
    });

    let user = null;
    let payload = null;

    if (accessToken) {
        console.log('ProfilePage: Verifying access token');
        payload = await verifyAccessToken(accessToken);
        console.log('ProfilePage: Access token payload:', payload);
    }

    if (!payload && refreshToken) {
        console.log('ProfilePage: Verifying refresh token');
        const refreshPayload = await verifyRefreshToken(refreshToken);
        console.log('ProfilePage: Refresh token payload:', refreshPayload);
        if (refreshPayload) {
            payload = refreshPayload;
        }
    }

    if (payload && payload.userId) {
        console.log('ProfilePage: Finding user with ID:', payload.userId);
        try {
            user = await prisma.user.findUnique({
                where: { id: Number(payload.userId) },
                select: {
                    id: true,
                    name: true,
                    surname: true,
                    email: true,
                    phoneNumber: true,
                    street: true,
                    house: true,
                    apartment: true,
                    role: true,
                    rating: true,
                },
            });
            console.log('ProfilePage: Found user:', user);
        } catch (error) {
            console.error('ProfilePage: Error finding user:', error);
        }
    } else {
        console.log('ProfilePage: No valid payload or userId');
    }

    if (!user) {
        throw new Error('Не авторизован');
    }

    return <ProfileClient user={user} />;
}
