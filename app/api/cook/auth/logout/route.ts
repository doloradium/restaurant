import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        // Clear cook token cookie
        const response = NextResponse.json({ success: true });
        response.cookies.delete('cook_token');

        return response;
    } catch (error) {
        console.error('Cook logout error:', error);
        return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
    }
}
