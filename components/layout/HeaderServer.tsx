import Header from './Header';
import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function HeaderServer() {
    console.log('HeaderServer: Starting');
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;
    console.log('HeaderServer: Tokens present:', {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
    });

    let user = null;
    let payload = null;

    if (accessToken) {
        console.log('HeaderServer: Verifying access token');
        payload = await verifyAccessToken(accessToken);
        console.log('HeaderServer: Access token payload:', payload);
    }

    if (!payload && refreshToken) {
        console.log('HeaderServer: Verifying refresh token');
        const refreshPayload = await verifyRefreshToken(refreshToken);
        console.log('HeaderServer: Refresh token payload:', refreshPayload);
        if (refreshPayload) {
            payload = refreshPayload;
        }
    }

    if (payload && payload.userId) {
        console.log('HeaderServer: Finding user with ID:', payload.userId);
        try {
            user = await prisma.user.findUnique({
                where: { id: Number(payload.userId) },
                select: { id: true, name: true, email: true, role: true },
            });
            console.log('HeaderServer: Found user:', user);
        } catch (error) {
            console.error('HeaderServer: Error finding user:', error);
        }
    } else {
        console.log('HeaderServer: No valid payload or userId');
    }

    return <Header user={user} />;
}
