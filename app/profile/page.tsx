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
                    role: true,
                    rating: true,
                    addresses: {
                        select: {
                            id: true,
                            city: true,
                            street: true,
                            houseNumber: true,
                            apartment: true,
                            entrance: true,
                            floor: true,
                            intercom: true,
                        },
                    },
                },
            });
            console.log('ProfilePage: Found user:', user);

            // Get primary address for backward compatibility
            if (user && user.addresses && user.addresses.length > 0) {
                const primaryAddress = user.addresses[0];
                user = {
                    ...user,
                    street: primaryAddress.street,
                    house: primaryAddress.houseNumber,
                    apartment: primaryAddress.apartment || '',
                };
            }
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
