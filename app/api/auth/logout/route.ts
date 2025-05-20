import { NextResponse } from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

export async function POST() {
    // Create response
    const response = NextResponse.json({ success: true });

    // Clear authentication cookies
    return clearAuthCookies(response);
}
