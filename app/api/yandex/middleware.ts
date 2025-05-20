import { NextRequest, NextResponse } from 'next/server';

// Simple function to check if an API request should use a token
export function useApiKey(request: NextRequest, service = 'suggest') {
    // Extract token from query parameters or headers
    const token =
        request.nextUrl.searchParams.get('token') ||
        request.headers.get('x-api-token');

    // Use different API keys based on the service
    let apiKey;

    // For geocoding services, try to use a specific geocoder key if available
    if (service === 'geocode') {
        apiKey = process.env.GEOCODER_KEY || process.env.GEOSUGGEST_KEY;
    } else {
        // For suggestions or other services, use the standard key
        apiKey = process.env.GEOSUGGEST_KEY;
    }

    if (!apiKey) {
        throw new Error('API key not configured');
    }

    return apiKey;
}
