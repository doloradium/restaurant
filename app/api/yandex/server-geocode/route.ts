import { NextRequest, NextResponse } from 'next/server';
import { useApiKey } from '../middleware';

export async function GET(request: NextRequest) {
    try {
        // Get address parameter from URL
        const searchParams = request.nextUrl.searchParams;
        const address = searchParams.get('address');

        console.log('Server-side geocoding for address:', address);

        if (!address) {
            return NextResponse.json(
                { error: 'Address parameter is required' },
                { status: 400 }
            );
        }

        // Get API key using middleware, specifically for geocoding service
        let apiKey = process.env.GEOCODER_KEY;
        console.log('Using geocoder API key:', apiKey);

        // The Yandex geocoder API format must match exactly what the API expects
        // Important: For Geocoder API, it's 1.x (not v1) and parameters must be in correct format
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${encodeURIComponent(
            address
        )}`;

        console.log('Making request to Yandex Geocoder API URL:', url);

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
                `Yandex Geocoder API error: ${response.status} - ${errorText}`
            );
            return NextResponse.json(
                {
                    error: `Geocoder API response error: ${response.status}`,
                    details: errorText,
                },
                { status: response.status }
            );
        }

        const data = await response.json();

        // Process data to extract coordinates
        try {
            // Navigate through the nested structure to get coordinates
            const geoObjectCollection = data.response?.GeoObjectCollection;
            const featureMembers = geoObjectCollection?.featureMember || [];

            if (featureMembers.length === 0) {
                return NextResponse.json(
                    { error: 'No geocoding results found' },
                    { status: 404 }
                );
            }

            const geoObject = featureMembers[0]?.GeoObject;
            if (!geoObject) {
                return NextResponse.json(
                    { error: 'Invalid geocoding result structure' },
                    { status: 500 }
                );
            }

            // Extract coordinates (they come as "longitude,latitude" in Yandex format)
            const point = geoObject.Point;
            const posString = point?.pos;

            if (!posString) {
                return NextResponse.json(
                    { error: 'No coordinates in geocoding result' },
                    { status: 500 }
                );
            }

            // Convert "longitude latitude" string to [latitude, longitude] array
            const [longitude, latitude] = posString.split(' ').map(Number);

            // Return simplified response with just what we need
            return NextResponse.json({
                address:
                    geoObject.metaDataProperty?.GeocoderMetaData?.text ||
                    address,
                coordinates: {
                    lat: latitude,
                    lng: longitude,
                },
            });
        } catch (processingError) {
            console.error(
                'Error processing geocoding response:',
                processingError
            );
            return NextResponse.json(
                {
                    error: 'Failed to process geocoding result',
                    details:
                        processingError instanceof Error
                            ? processingError.message
                            : String(processingError),
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Server-side geocoding error:', error);
        return NextResponse.json(
            {
                error: 'Failed to geocode address',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
