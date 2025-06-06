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

        // Try to get API key from correct environment variable
        const apiKey = process.env.GEOCODER_KEY;

        console.log(
            'Using GEOCODER_KEY (first few chars):',
            apiKey ? apiKey.substring(0, 5) + '...' : 'undefined'
        );

        if (!apiKey) {
            console.error('Missing GEOCODER_KEY');
            return NextResponse.json(
                { error: 'Geocoding service configuration error' },
                { status: 500 }
            );
        }

        // Call the Yandex Geocoder API
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${encodeURIComponent(
            address
        )}`;

        console.log('Calling geocoding API with address:', address);
        const response = await fetch(url);

        if (!response.ok) {
            console.error(
                `Geocoding API error: ${response.status} ${response.statusText}`
            );
            throw new Error(
                `Geocoding API responded with status: ${response.status}`
            );
        }

        const data = await response.json();

        // Parse the Yandex Geocoder response to extract coordinates
        const geoObject =
            data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
        if (!geoObject) {
            console.warn('No geo objects found for address:', address);
            return NextResponse.json({ coordinates: null });
        }

        // Yandex returns coordinates as "longitude,latitude" so we need to reverse them
        const pointStr = geoObject.Point?.pos;
        if (!pointStr) {
            console.warn(
                'No coordinates found in geo object for address:',
                address
            );
            return NextResponse.json({ coordinates: null });
        }

        // Split the point string and return as [latitude, longitude]
        const [lng, lat] = pointStr.split(' ').map(parseFloat);
        console.log(`Geocoded address: ${address} -> [${lat}, ${lng}]`);

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
