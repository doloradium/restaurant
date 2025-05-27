import { NextResponse } from 'next/server';

export async function GET() {
    // Use GEOCODER_KEY for the maps JS API instead of GEOSUGGEST_KEY
    const apiKey = process.env.GEOCODER_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        );
    }

    console.log('Using API key for Yandex Maps JS API:', apiKey);

    // Return the script URL with the actual API key
    // Updated to use the latest API version and proper parameters
    return NextResponse.json({
        scriptUrl: `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU&load=package.full`,
    });
}
