import { NextRequest, NextResponse } from 'next/server';

// This is a debug-only endpoint to verify environment variables are set properly
export async function GET(request: NextRequest) {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: 'Not available in production' },
            { status: 403 }
        );
    }

    // Return sanitized environment variables for debugging
    return NextResponse.json({
        hasGeosuggestKey: !!process.env.GEOSUGGEST_KEY,
        hasNextPublicGeosuggestKey: !!process.env.NEXT_PUBLIC_GEOSUGGEST_KEY,
        envKeys: Object.keys(process.env).filter(
            (key) => key.includes('GEOSUGGEST') || key.includes('NEXT_PUBLIC')
        ),
        nextConfigEnv: {
            hasNextPublicGeosuggestKey:
                !!process.env.NEXT_PUBLIC_GEOSUGGEST_KEY,
        },
    });
}
