import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // Clear courier token cookie
        const response = NextResponse.json({ success: true });
        response.cookies.delete('courier_token');

        return response;
    } catch (error) {
        console.error('Courier logout error:', error);
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}
