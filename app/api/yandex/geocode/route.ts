import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Get geocode parameter from URL
        const searchParams = request.nextUrl.searchParams;
        const address = searchParams.get('address');

        console.log('Geocoding address:', address);

        if (!address) {
            console.error('Missing address parameter');
            return NextResponse.json(
                { error: 'Address parameter is required' },
                { status: 400 }
            );
        }

        // Use existing GEOSUGGEST_KEY from .env
        const apiKey = process.env.GEOSUGGEST_KEY;
        console.log('API key exists:', !!apiKey);

        if (!apiKey) {
            console.error('GEOSUGGEST_KEY environment variable is not set');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Make direct request to Yandex API with the proper format
        // Yandex API requires the correct parameters and format
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${encodeURIComponent(
            address
        )}`;

        // Log the URL without the API key for debugging
        console.log('Making request to Yandex API (redacted key)');

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });

        console.log('Yandex API response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(
                `Yandex API error: ${response.status} - ${errorText}`
            );
            return NextResponse.json(
                {
                    error: `API response error: ${response.status}`,
                    details: errorText,
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in geocode API route:', error);

        return NextResponse.json(
            {
                error: 'Failed to geocode address',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
