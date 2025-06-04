import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        // Get the address from query parameters
        const searchParams = req.nextUrl.searchParams;
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json(
                { error: 'Address parameter is required' },
                { status: 400 }
            );
        }

        // Use a geocoding service API key from environment variables
        const apiKey = process.env.YANDEX_API_KEY;
        if (!apiKey) {
            console.error('Missing Yandex API key');
            return NextResponse.json(
                { error: 'Geocoding service configuration error' },
                { status: 500 }
            );
        }

        // Call the Yandex Geocoder API
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${encodeURIComponent(
            address
        )}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                `Geocoding API responded with status: ${response.status}`
            );
        }

        const data = await response.json();

        // Parse the Yandex Geocoder response to extract coordinates
        const geoObject =
            data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
        if (!geoObject) {
            return NextResponse.json({ coordinates: null });
        }

        // Yandex returns coordinates as "longitude,latitude" so we need to reverse them
        const pointStr = geoObject.Point?.pos;
        if (!pointStr) {
            return NextResponse.json({ coordinates: null });
        }

        // Split the point string and return as [latitude, longitude]
        const [lng, lat] = pointStr.split(' ').map(parseFloat);

        return NextResponse.json({
            coordinates: [lat, lng],
            address:
                geoObject.metaDataProperty?.GeocoderMetaData?.text || address,
        });
    } catch (error) {
        console.error('Error in geocoding:', error);
        return NextResponse.json(
            { error: 'Failed to geocode address' },
            { status: 500 }
        );
    }
}
