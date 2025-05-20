import { NextResponse } from 'next/server';

export async function GET() {
    // Get the real API key from environment
    const apiKey = process.env.GEOSUGGEST_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        );
    }

    // Return the script URL with the actual API key
    return NextResponse.json({
        scriptUrl: `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`,
    });
}
