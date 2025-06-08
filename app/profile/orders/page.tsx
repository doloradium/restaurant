import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth';

export default async function OrdersPage() {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // If no tokens present, redirect to login page immediately
    if (!accessToken && !refreshToken) {
        redirect('/login');
    }

    // Redirect to the profile page with the orders tab active
    // This will be handled client-side in the ProfileClient component
    redirect('/profile?tab=orders');
}
