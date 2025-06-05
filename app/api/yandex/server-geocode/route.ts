import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        // Get address parameter from URL
        const address = req.nextUrl.searchParams.get('address');

        if (!address) {
            return NextResponse.json(
                { error: 'Address parameter is required' },
                { status: 400 }
            );
        }

        // Check API key
        const apiKey = process.env.GEOCODER_KEY;

        if (!apiKey) {
            console.warn(
                'Missing Yandex API key (GEOCODER_KEY), returning backup response'
            );
            return createBackupResponse(address);
        }

        // Make request to Yandex API
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${encodeURIComponent(
            address
        )}&format=json&lang=ru_RU`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error(
                `API request failed: ${response.status} ${response.statusText}`
            );
            return createBackupResponse(address);
        }

        const data = await response.json();

        // Process the response
        const geoObject =
            data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

        if (!geoObject) {
            return createBackupResponse(address);
        }

        // Extract address and coordinates
        const formattedAddress =
            geoObject.metaDataProperty?.GeocoderMetaData?.text || '';
        const components =
            geoObject.metaDataProperty?.GeocoderMetaData?.Address?.Components ||
            [];

        // Extract coordinates
        let coordinates = null;
        const point = geoObject.Point?.pos;

        if (point && typeof point === 'string') {
            const [lng, lat] = point.split(' ').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                coordinates = { lat, lng };
            }
        }

        // Format our response
        const formattedResponse = {
            address: formattedAddress,
            coordinates,
            raw: geoObject,
            components: components.map((c: any) => ({
                kind: c.kind,
                name: c.name,
            })),
        };

        return NextResponse.json(formattedResponse);
    } catch (error) {
        console.error('Error in server-geocode API:', error);
        return NextResponse.json(
            { error: 'Failed to geocode address' },
            { status: 500 }
        );
    }
}

// Create a backup response when API is not available
function createBackupResponse(address: string) {
    // Generate some fake coordinates based on the address string
    // This is just for demo purposes
    const hash = address
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const lat = 55.75 + (hash % 10) / 100; // Around Moscow
    const lng = 37.62 + (hash % 20) / 100;

    return NextResponse.json({
        address,
        coordinates: { lat, lng },
        components: [
            { kind: 'country', name: 'Россия' },
            {
                kind: 'locality',
                name: address.split(',')[0] || 'Неизвестный город',
            },
            {
                kind: 'street',
                name: address.split(',')[1] || 'Неизвестная улица',
            },
            { kind: 'house', name: address.split(',')[2] || '1' },
        ],
        raw: {
            metaDataProperty: {
                GeocoderMetaData: {
                    text: address,
                    Address: {
                        Components: [
                            { kind: 'country', name: 'Россия' },
                            {
                                kind: 'locality',
                                name:
                                    address.split(',')[0] ||
                                    'Неизвестный город',
                            },
                            {
                                kind: 'street',
                                name:
                                    address.split(',')[1] ||
                                    'Неизвестная улица',
                            },
                            {
                                kind: 'house',
                                name: address.split(',')[2] || '1',
                            },
                        ],
                    },
                },
            },
            Point: {
                pos: `${lng} ${lat}`,
            },
        },
    });
}
