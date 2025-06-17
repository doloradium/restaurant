import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        if (!lat || !lng) {
            return NextResponse.json(
                { error: 'Latitude and longitude are required' },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEOCODER_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        const geocodeUrl = `https://geocode-maps.yandex.ru/v1/?apikey=${apiKey}&geocode=${lng},${lat}&format=json`;

        return NextResponse.json({
            url: geocodeUrl,
            coordinates: {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
            },
            apiKey: apiKey.substring(0, 8) + '...',
        });
    } catch (error) {
        console.error('Error generating geocode URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate geocode URL' },
            { status: 500 }
        );
    }
}
