import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        // Get API key from correct environment variable
        const apiKey = process.env.GEOSUGGEST_KEY;

        console.log('Using GEOSUGGEST_KEY for map API');

        if (!apiKey) {
            console.error('Missing Yandex API key (GEOSUGGEST_KEY)');
            return NextResponse.json(
                { error: 'Map service configuration error' },
                { status: 500 }
            );
        }

        // Construct the Yandex Maps API script URL with the API key and Russian language
        const scriptUrl = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;

        console.log(
            'Generated Yandex Maps script URL (without API key for security):',
            'https://api-maps.yandex.ru/2.1/?apikey=*****&lang=ru_RU'
        );

        return NextResponse.json({ scriptUrl });
    } catch (error) {
        console.error('Error generating script URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate script URL' },
            { status: 500 }
        );
    }
}
