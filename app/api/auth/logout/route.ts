import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();

        // Create response with success message
        const response = NextResponse.json({
            message: 'Logged out successfully',
        });

        // Clear access token
        response.cookies.delete('accessToken');

        // Clear refresh token
        response.cookies.delete('refreshToken');

        return response;
    } catch (error) {
        console.error('Error during logout:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
