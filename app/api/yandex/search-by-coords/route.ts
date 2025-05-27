import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Get coordinate parameters from URL
        const searchParams = request.nextUrl.searchParams;
        const coords = searchParams.get('coords');
        const ll = searchParams.get('ll');
        const text = searchParams.get('text');

        // Extract coordinates from available parameters
        let lat, lng;

        if (coords) {
            [lat, lng] = coords.split(',').map((c) => parseFloat(c.trim()));
        } else if (text && text.includes(',')) {
            // Try to parse coordinates from text parameter
            [lat, lng] = text.split(',').map((c) => parseFloat(c.trim()));
        } else if (ll) {
            // Yandex sometimes uses ll in format "lng,lat"
            [lng, lat] = ll.split(',').map((c) => parseFloat(c.trim()));
        }

        console.log('Search by coordinates:', { lat, lng });

        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            return NextResponse.json(
                { error: 'Valid coordinates are required' },
                { status: 400 }
            );
        }

        // Get API key from environment
        const apiKey = process.env.GEOCODER_KEY || process.env.GEOSUGGEST_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        // Format coordinates according to Yandex Geocoder API documentation
        // The geocode parameter accepts coordinates directly in format "longitude,latitude"
        const formattedCoords = `${lng},${lat}`;

        // Use Yandex's Geocoder API v1 as per documentation
        const url = `https://geocode-maps.yandex.ru/v1/?apikey=${apiKey}&geocode=${formattedCoords}&format=json`;
        console.log('Making request to Yandex Geocoder API v1');

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

        // Process geocoder response - v1 API response format is different from 1.x
        try {
            if (!data.response || !data.response.GeoObjectCollection) {
                return NextResponse.json(
                    { error: 'Invalid response format from Geocoder API' },
                    { status: 500 }
                );
            }

            const collection = data.response.GeoObjectCollection;
            const featureMembers = collection.featureMember || [];

            if (featureMembers.length === 0) {
                return NextResponse.json(
                    { error: 'No results found for these coordinates' },
                    { status: 404 }
                );
            }

            const geoObject = featureMembers[0]?.GeoObject;
            if (!geoObject) {
                return NextResponse.json(
                    { error: 'Invalid response structure' },
                    { status: 500 }
                );
            }

            // Extract address from response
            const address =
                geoObject.metaDataProperty?.GeocoderMetaData?.text || '';

            // Check for additional place details
            const name = geoObject.name || '';
            const description = geoObject.description || '';

            // Return location details
            return NextResponse.json({
                address: address,
                name: name,
                description: description,
                coordinates: {
                    lat: lat,
                    lng: lng,
                },
                raw: geoObject, // Include raw data for debugging
            });
        } catch (processingError) {
            console.error(
                'Error processing geocoding response:',
                processingError
            );
            return NextResponse.json(
                {
                    error: 'Failed to process response',
                    details:
                        processingError instanceof Error
                            ? processingError.message
                            : String(processingError),
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Search by coordinates error:', error);
        return NextResponse.json(
            {
                error: 'Failed to search by coordinates',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
