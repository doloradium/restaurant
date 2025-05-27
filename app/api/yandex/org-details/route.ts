import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        // Get URI parameter from URL
        const searchParams = request.nextUrl.searchParams;
        const uri = searchParams.get('uri');

        console.log('Organization details request for URI:', uri);

        if (!uri) {
            return NextResponse.json(
                { error: 'URI parameter is required' },
                { status: 400 }
            );
        }

        // Get API key from environment
        const apiKey = process.env.GEOSUGGEST_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            );
        }

        // Parse organization ID from URI
        let orgId;
        if (uri.includes('org?oid=')) {
            orgId = uri.match(/oid=(\d+)/)?.[1];
        } else if (uri.includes('ymapsbm1://org?oid=')) {
            orgId = uri.match(/oid=(\d+)/)?.[1];
        }

        if (!orgId) {
            return NextResponse.json(
                { error: 'Invalid organization URI format' },
                { status: 400 }
            );
        }

        // Format URL for the organization search API
        const url = `https://search-maps.yandex.ru/v1/?apikey=${apiKey}&text=org_${orgId}&type=biz&lang=ru_RU&results=1`;
        console.log('Making organization search request to Yandex API');

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

        // Process organization data
        try {
            if (!data.features || data.features.length === 0) {
                return NextResponse.json(
                    { error: 'Organization not found' },
                    { status: 404 }
                );
            }

            const organization = data.features[0];
            const properties = organization.properties || {};
            const geometry = organization.geometry || {};

            // Extract coordinates (Yandex returns [longitude, latitude])
            let coordinates = null;
            if (
                geometry.type === 'Point' &&
                Array.isArray(geometry.coordinates)
            ) {
                const [longitude, latitude] = geometry.coordinates;
                coordinates = { lat: latitude, lng: longitude };
            }

            // Return simplified organization details
            return NextResponse.json({
                name: properties.name || '',
                address: properties.description || '',
                coordinates: coordinates,
                fullDetails: properties,
                raw: organization, // Include raw data for debugging
            });
        } catch (processingError) {
            console.error(
                'Error processing organization data:',
                processingError
            );
            return NextResponse.json(
                {
                    error: 'Failed to process organization data',
                    details:
                        processingError instanceof Error
                            ? processingError.message
                            : String(processingError),
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Organization details error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch organization details',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}
