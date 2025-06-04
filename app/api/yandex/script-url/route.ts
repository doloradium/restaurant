import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        // Get API key from environment variables
        const apiKey = process.env.YANDEX_API_KEY;

        if (!apiKey) {
            console.error('Missing Yandex API key');
            return NextResponse.json(
                { error: 'Map service configuration error' },
                { status: 500 }
            );
        }

        // Construct the Yandex Maps API script URL with the API key
        const scriptUrl = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=en_US`;

        return NextResponse.json({ scriptUrl });
    } catch (error) {
        console.error('Error generating script URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate script URL' },
            { status: 500 }
        );
    }
}
