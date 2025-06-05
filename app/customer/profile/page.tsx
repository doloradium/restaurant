import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ProfileClient from './ProfileClient';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    console.log('CustomerProfilePage: Starting');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;
    console.log('CustomerProfilePage: Tokens present:', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
    });

    // If no tokens present, redirect to login page immediately
    if (!accessToken && !refreshToken) {
        console.log('CustomerProfilePage: No tokens, redirecting to login');
        redirect('/login');
    }

    let user = null;
    let payload = null;

    if (accessToken) {
        console.log('CustomerProfilePage: Verifying access token');
        payload = await verifyAccessToken(accessToken);
        console.log('CustomerProfilePage: Access token payload:', payload);
    }

    if (!payload && refreshToken) {
        console.log('CustomerProfilePage: Verifying refresh token');
        const refreshPayload = await verifyRefreshToken(refreshToken);
        console.log(
            'CustomerProfilePage: Refresh token payload:',
            refreshPayload
        );
        if (refreshPayload) {
            payload = refreshPayload;
        }
    }

    if (payload && payload.userId) {
        console.log(
            'CustomerProfilePage: Finding user with ID:',
            payload.userId
        );
        try {
            // Get user from database
            const dbUser = await prisma.user.findUnique({
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

            if (dbUser) {
                // Get primary address for backward compatibility
                if (dbUser.addresses && dbUser.addresses.length > 0) {
                    const primaryAddress = dbUser.addresses[0];
                    // Create user object with additional properties for the client
                    user = {
                        ...dbUser,
                        street: primaryAddress.street,
                        house: primaryAddress.houseNumber,
                        apartment: primaryAddress.apartment || '',
                    };
                } else {
                    user = {
                        ...dbUser,
                        street: '',
                        house: '',
                        apartment: '',
                    };
                }
                console.log('CustomerProfilePage: Found user:', user);
            }
        } catch (error) {
            console.error('CustomerProfilePage: Error finding user:', error);
        }
    } else {
        console.log('CustomerProfilePage: No valid payload or userId');
    }

    if (!user) {
        console.log(
            'CustomerProfilePage: User not found, redirecting to login'
        );
        redirect('/login');
    }

    return <ProfileClient user={user} />;
}
