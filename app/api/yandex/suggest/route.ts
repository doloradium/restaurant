import { NextRequest, NextResponse } from 'next/server';
import { useApiKey } from '../middleware';

export async function GET(request: NextRequest) {
    try {
        // Get query parameter from URL
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('query');

        console.log('Suggest query:', query);

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        // Get API key using middleware
        let apiKey;
        try {
            apiKey = useApiKey(request);
            console.log(
                'Using API key from middleware for suggest API:',
                apiKey
            ); // Log the key for debugging
        } catch (error) {
            console.error('API key error:', error);
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Make direct request to Yandex API with the proper format
        const url = `https://suggest-maps.yandex.ru/v1/suggest?apikey=${apiKey}&text=${encodeURIComponent(
            query
        )}`;
        console.log('Making request to Yandex Suggest API (redacted key)');

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
        console.error('Error in suggest API route:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch suggestions',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
