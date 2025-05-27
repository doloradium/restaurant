import { NextRequest, NextResponse } from 'next/server';
import { useApiKey } from '../middleware';

export async function GET(request: NextRequest) {
    try {
        // Get address parameter from URL
        const searchParams = request.nextUrl.searchParams;
        const address = searchParams.get('address');
        const uri = searchParams.get('uri');

        console.log(
            'Server-side geocoding for address:',
            address,
            'or URI:',
            uri
        );

        if (!address && !uri) {
            return NextResponse.json(
                { error: 'Address or URI parameter is required' },
                { status: 400 }
            );
        }

        // Get API key using middleware, specifically for geocoding service
        let apiKey = process.env.GEOCODER_KEY;
        console.log('Using geocoder API key:', apiKey);

        let url;

        // Handle different request types
        if (uri && uri.includes('org?oid=')) {
            // This is an organization URI request
            // Format: https://search-maps.yandex.ru/v1/?text=org_123456&type=biz&lang=ru_RU&results=1
            const orgId = uri.match(/oid=(\d+)/)?.[1];
            if (!orgId) {
                return NextResponse.json(
                    { error: 'Invalid organization URI format' },
                    { status: 400 }
                );
            }

            url = `https://search-maps.yandex.ru/v1/?apikey=${apiKey}&text=org_${orgId}&type=biz&lang=ru_RU&results=1`;
            console.log(
                'Making organization search request to Yandex API:',
                url
            );
        } else {
            // Regular geocoding request
            // The Yandex geocoder API format must match exactly what the API expects
            // Important: For Geocoder API, it's 1.x (not v1) and parameters must be in correct format
            url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${encodeURIComponent(
                address || ''
            )}`;
            console.log('Making request to Yandex Geocoder API URL:', url);
        }

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
            let coordinates;
            let resultAddress;

            // Handle different response formats
            if (uri && data.features) {
                // Organization search API response format
                const feature = data.features[0];
                if (
                    feature &&
                    feature.geometry &&
                    feature.geometry.coordinates
                ) {
                    const [longitude, latitude] = feature.geometry.coordinates;
                    coordinates = { lat: latitude, lng: longitude };
                    resultAddress = feature.properties.name || address || uri;
                }
            } else {
                // Regular geocoder API response format
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
                coordinates = { lat: latitude, lng: longitude };
                resultAddress =
                    geoObject.metaDataProperty?.GeocoderMetaData?.text ||
                    address ||
                    '';
            }

            if (!coordinates) {
                return NextResponse.json(
                    { error: 'Could not extract coordinates from response' },
                    { status: 500 }
                );
            }

            // Return simplified response with just what we need
            return NextResponse.json({
                address: resultAddress,
                coordinates: coordinates,
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
