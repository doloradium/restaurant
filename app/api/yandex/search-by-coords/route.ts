import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        // Get coords parameter from URL
        const coordsParam = req.nextUrl.searchParams.get('coords');

        if (!coordsParam) {
            return NextResponse.json(
                { error: 'Coordinates parameter is required' },
                { status: 400 }
            );
        }

        // Split the coordinates
        const [lat, lng] = coordsParam.split(',').map(Number);

        if (isNaN(lat) || isNaN(lng)) {
            return NextResponse.json(
                { error: 'Invalid coordinates format' },
                { status: 400 }
            );
        }

        // Check API key
        const apiKey = process.env.GEOCODER_KEY;

        if (!apiKey) {
            console.warn(
                'Missing Yandex API key (GEOCODER_KEY), returning backup response'
            );
            return createBackupResponse(lat, lng);
        }

        // Make request to Yandex API
        const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${lng},${lat}&format=json&lang=ru_RU`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error(
                `API request failed: ${response.status} ${response.statusText}`
            );
            return createBackupResponse(lat, lng);
        }

        const data = await response.json();

        // Process the response
        const geoObject =
            data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

        if (!geoObject) {
            return createBackupResponse(lat, lng);
        }

        const address =
            geoObject.metaDataProperty?.GeocoderMetaData?.text || '';
        const components =
            geoObject.metaDataProperty?.GeocoderMetaData?.Address?.Components ||
            [];

        // Format our response
        const formattedResponse = {
            address,
            coordinates: { lat, lng },
            raw: geoObject,
            components: components.map((c: any) => ({
                kind: c.kind,
                name: c.name,
            })),
        };

        return NextResponse.json(formattedResponse);
    } catch (error) {
        console.error('Error in search-by-coords API:', error);
        return NextResponse.json(
            { error: 'Failed to search by coordinates' },
            { status: 500 }
        );
    }
}

// Create a backup response when API is not available
function createBackupResponse(lat: number, lng: number) {
    return NextResponse.json({
        address: `Примерные координаты: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: { lat, lng },
        components: [
            { kind: 'country', name: 'Россия' },
            { kind: 'locality', name: 'Неизвестный город' },
            { kind: 'street', name: 'Неизвестная улица' },
            { kind: 'house', name: '1' },
        ],
        raw: {
            metaDataProperty: {
                GeocoderMetaData: {
                    text: `Примерные координаты: ${lat.toFixed(
                        6
                    )}, ${lng.toFixed(6)}`,
                    Address: {
                        Components: [
                            { kind: 'country', name: 'Россия' },
                            { kind: 'locality', name: 'Неизвестный город' },
                            { kind: 'street', name: 'Неизвестная улица' },
                            { kind: 'house', name: '1' },
                        ],
                    },
                },
            },
        },
    });
}
