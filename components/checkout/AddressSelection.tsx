'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDelivery, DeliveryAddress } from '@/app/DeliveryProvider';
import Script from 'next/script';

interface YMaps {
    Map: any;
    Placemark: any;
    geocode: (address: string) => Promise<any>;
    suggest: (query: string) => Promise<any>;
}

declare global {
    interface Window {
        ymaps: YMaps;
    }
}

export default function AddressSelection() {
    const { deliveryAddress, setDeliveryAddress } = useDelivery();
    const [isYandexReady, setIsYandexReady] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [mapInstance, setMapInstance] = useState<any>(null);
    const [placemarkInstance, setPlacemarkInstance] = useState<any>(null);
    const [scriptUrl, setScriptUrl] = useState<string>('');
    const [isLoadingScript, setIsLoadingScript] = useState(true);
    const mapRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [visibleCoords, setVisibleCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    // Initialize form with saved delivery address
    const [formData, setFormData] = useState<Partial<DeliveryAddress>>({
        street: deliveryAddress?.street || '',
        houseNumber: deliveryAddress?.houseNumber || '',
        apartment: deliveryAddress?.apartment || '',
        entrance: deliveryAddress?.entrance || '',
        floor: deliveryAddress?.floor || '',
        intercom: deliveryAddress?.intercom || '',
        city: deliveryAddress?.city || '',
        zipCode: deliveryAddress?.zipCode || '',
        fullAddress: deliveryAddress?.fullAddress || '',
    });

    // Get script URL from server
    useEffect(() => {
        const getScriptUrl = async () => {
            try {
                setIsLoadingScript(true);
                const response = await fetch('/api/yandex/script-url');
                if (!response.ok) {
                    throw new Error('Failed to get map script URL');
                }

                const data = await response.json();
                setScriptUrl(data.scriptUrl);
            } catch (error) {
                console.error('Error getting map script URL:', error);
                setError('Failed to initialize map service');
            } finally {
                setIsLoadingScript(false);
            }
        };

        getScriptUrl();
    }, []);

    // Handle Yandex Maps API loading
    const handleYandexLoad = () => {
        console.log('Yandex Maps API loaded');
        setIsYandexReady(true);
    };

    const handleYandexError = (e: any) => {
        console.error('Error loading Yandex Maps API:', e);
        setError('Failed to load map service');
    };

    // Initialize Yandex Maps
    useEffect(() => {
        if (isYandexReady && mapRef.current && !mapInstance) {
            const initializeMap = () => {
                try {
                    // Verify ymaps is available
                    if (!window.ymaps) {
                        console.error('window.ymaps is not available');
                        setError('Map service not available');
                        return;
                    }

                    console.log('Initializing map with Yandex Maps API');
                    const map = new window.ymaps.Map(mapRef.current, {
                        center: [55.76, 37.64], // Moscow center
                        zoom: 10,
                        controls: ['zoomControl', 'geolocationControl'],
                    });

                    const placemark = new window.ymaps.Placemark(
                        [55.76, 37.64],
                        {},
                        {
                            draggable: true,
                        }
                    );

                    map.geoObjects.add(placemark);

                    // Handle placemark drag end
                    placemark.events.add('dragend', function () {
                        const coordinates = placemark.geometry.getCoordinates();

                        // Geocode the coordinates to get the address
                        window.ymaps.geocode(coordinates).then((res: any) => {
                            const firstGeoObject = res.geoObjects.get(0);
                            if (firstGeoObject) {
                                const address = firstGeoObject.getAddressLine();
                                const components = parseAddress(address);

                                setFormData({
                                    ...formData,
                                    ...components,
                                    fullAddress: address,
                                });
                            }
                        });
                    });

                    // Handle map click to update address - ensure this works for any location
                    map.events.add('click', function (e: any) {
                        const coords = e.get('coords');
                        console.log('Map clicked at coordinates:', coords);

                        // Set visible coordinates for display in UI
                        setVisibleCoords({
                            lat: coords[0],
                            lng: coords[1],
                        });

                        // Update placemark position
                        placemark.geometry.setCoordinates(coords);

                        // Show coordinates in a tooltip nearby the cursor
                        const coordsString = `${coords[0].toFixed(
                            6
                        )}, ${coords[1].toFixed(6)}`;

                        // Create a tooltip balloon with coordinates
                        placemark.properties.set({
                            balloonContentHeader: 'Selected Location',
                            balloonContentBody: `<p>Coordinates: ${coordsString}</p>`,
                            balloonContentFooter:
                                '<p>Click "Save Address" to use this location</p>',
                        });

                        // Open the balloon
                        placemark.balloon.open();

                        // Perform geocoding using our server-side API for more reliable results
                        setIsLoading(true);

                        fetch(
                            `/api/yandex/search-by-coords?coords=${coords[0]},${coords[1]}`
                        )
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error(
                                        'Failed to geocode coordinates'
                                    );
                                }
                                return response.json();
                            })
                            .then((data) => {
                                console.log('Geocoded result:', data);

                                if (data && data.address) {
                                    // Parse address into components
                                    const components = parseAddress(
                                        data.address
                                    );

                                    // Update form and search query with new address
                                    setFormData({
                                        ...formData,
                                        ...components,
                                        fullAddress: data.address,
                                        coordinates: {
                                            lat: coords[0],
                                            lng: coords[1],
                                        },
                                    });

                                    // Update the search input field with the new address
                                    setSearchQuery(data.address);

                                    // Update the input field directly to ensure it's visible
                                    const addressInput =
                                        document.getElementById(
                                            'address-input'
                                        ) as HTMLInputElement;
                                    if (addressInput) {
                                        addressInput.value = data.address;
                                        // Trigger a change event to ensure React state updates
                                        const event = new Event('input', {
                                            bubbles: true,
                                        });
                                        addressInput.dispatchEvent(event);
                                    }

                                    // Update the balloon content with the address
                                    placemark.properties.set({
                                        balloonContentBody: `
                                            <p>Coordinates: ${coordsString}</p>
                                            <p>Address: ${data.address}</p>
                                        `,
                                    });
                                }
                            })
                            .catch((error) => {
                                console.error(
                                    'Error geocoding coordinates:',
                                    error
                                );
                                setError(`Geocoding failed: ${error.message}`);

                                // Even if geocoding fails, still update the coordinates in the input
                                const addressInput = document.getElementById(
                                    'address-input'
                                ) as HTMLInputElement;
                                if (addressInput) {
                                    addressInput.value = coordsString;
                                    const event = new Event('input', {
                                        bubbles: true,
                                    });
                                    addressInput.dispatchEvent(event);
                                }
                            })
                            .finally(() => {
                                setIsLoading(false);
                            });
                    });

                    // Handle placemark click events
                    placemark.events.add('click', function (e: any) {
                        const coords = placemark.geometry.getCoordinates();

                        // Set visible coordinates for display in UI
                        setVisibleCoords({
                            lat: coords[0],
                            lng: coords[1],
                        });

                        // Create a tooltip balloon with coordinates
                        placemark.properties.set({
                            balloonContentHeader: 'Selected Location',
                            balloonContentBody: `<p>Coordinates: ${coords[0].toFixed(
                                6
                            )}, ${coords[1].toFixed(6)}</p>`,
                            balloonContentFooter:
                                '<p>Click "Save Address" to use this location</p>',
                        });

                        // Open the balloon
                        placemark.balloon.open();

                        // Don't propagate the event to the map to avoid duplicate processing
                        e.stopPropagation();
                    });

                    // Add this code at the beginning of the map initialization to configure object behavior
                    map.options.set('objectsClickable', true);

                    // Replace the geoObjects click handler with this simplified version
                    map.geoObjects.events.add('click', async function (e: any) {
                        // Get the clicked object
                        const target = e.get('target');
                        if (!target) return;

                        try {
                            // Get the coordinates
                            const coords = target.geometry.getCoordinates();
                            console.log('OBJECT CLICKED AT:', coords);

                            // Store coordinates in UI state
                            setVisibleCoords({
                                lat: coords[0],
                                lng: coords[1],
                            });

                            // Try to get data from the object properties first (direct approach)
                            let objectName = '';
                            let objectAddress = '';

                            // Check if this is a business object with properties
                            if (target.properties) {
                                // Log all properties for debugging
                                console.log(
                                    'Object properties:',
                                    target.properties.getAll()
                                );

                                // First try CompanyMetaData (most detailed for businesses)
                                const companyData =
                                    target.properties.get('CompanyMetaData');
                                if (companyData) {
                                    console.log(
                                        'CompanyMetaData found:',
                                        companyData
                                    );
                                    objectName = companyData.name || '';
                                    objectAddress = companyData.address || '';
                                } else {
                                    // Try standard properties
                                    objectName =
                                        target.properties.get('name') || '';
                                    objectAddress =
                                        target.properties.get('description') ||
                                        target.properties.get('address') ||
                                        '';
                                }

                                // If we have a URI, we can use it to get more details
                                const uriData =
                                    target.properties.get('URIMetaData');
                                if (uriData && uriData.URI && uriData.URI.uri) {
                                    console.log(
                                        'Organization URI found:',
                                        uriData.URI.uri
                                    );
                                    try {
                                        // We have a direct organization URI - use our API to get details
                                        const encodedUri = encodeURIComponent(
                                            uriData.URI.uri
                                        );
                                        const response = await fetch(
                                            `/api/yandex/org-details?uri=${encodedUri}`
                                        );
                                        if (response.ok) {
                                            const data = await response.json();
                                            console.log(
                                                'Organization API response:',
                                                data
                                            );

                                            // Use this data if it's valid
                                            if (data.name && data.address) {
                                                objectName = data.name;
                                                objectAddress = data.address;
                                            }
                                        }
                                    } catch (uriError) {
                                        console.error(
                                            'Error fetching org details:',
                                            uriError
                                        );
                                    }
                                }
                            }

                            // If we couldn't get direct data, use our geocoding API as fallback
                            if (!objectName && !objectAddress) {
                                console.log(
                                    'No direct data found, using geocoding API'
                                );
                                try {
                                    const response = await fetch(
                                        `/api/yandex/search-by-coords?coords=${coords[0]},${coords[1]}`
                                    );
                                    if (response.ok) {
                                        const data = await response.json();
                                        console.log(
                                            'Geocoding API response:',
                                            data
                                        );
                                        if (data.address) {
                                            objectAddress = data.address;
                                        }
                                    }
                                } catch (geocodeError) {
                                    console.error(
                                        'Error geocoding coordinates:',
                                        geocodeError
                                    );
                                }
                            }

                            // Format the address string for the input field
                            let displayText = '';
                            if (objectName && objectAddress) {
                                displayText = `${objectName}, ${objectAddress}`;
                            } else if (objectName) {
                                displayText = objectName;
                            } else if (objectAddress) {
                                displayText = objectAddress;
                            } else {
                                // Last resort fallback to coordinates
                                displayText = `${coords[0].toFixed(
                                    6
                                )}, ${coords[1].toFixed(6)}`;
                            }

                            console.log('Setting input field to:', displayText);

                            // Update the input field with our extracted text
                            const addressInput = document.getElementById(
                                'address-input'
                            ) as HTMLInputElement;
                            if (addressInput) {
                                addressInput.value = displayText;
                                // Trigger change event to update React state
                                const event = new Event('input', {
                                    bubbles: true,
                                });
                                addressInput.dispatchEvent(event);
                                setSearchQuery(displayText);
                            }

                            // DO NOT stop propagation - let the default business card display
                        } catch (error) {
                            console.error(
                                'Error handling object click:',
                                error
                            );
                        }
                    });

                    setMapInstance(map);
                    setPlacemarkInstance(placemark);

                    // Set user's location if available
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(function (
                            position
                        ) {
                            const userCoords = [
                                position.coords.latitude,
                                position.coords.longitude,
                            ];
                            map.setCenter(userCoords);
                            placemark.geometry.setCoordinates(userCoords);

                            // Geocode to get address - convert coordinates to string for the API
                            window.ymaps
                                .geocode(`${userCoords[0]},${userCoords[1]}`)
                                .then((res: any) => {
                                    const firstGeoObject =
                                        res.geoObjects.get(0);
                                    if (firstGeoObject) {
                                        const address =
                                            firstGeoObject.getAddressLine();
                                        const components =
                                            parseAddress(address);

                                        setFormData({
                                            ...formData,
                                            ...components,
                                            fullAddress: address,
                                        });
                                    }
                                });
                        });
                    }
                } catch (error) {
                    console.error('Error initializing Yandex Maps:', error);
                    setError('Failed to initialize map');
                }
            };

            // Wait a bit to ensure the API is fully loaded
            const timer = setTimeout(() => {
                try {
                    initializeMap();
                } catch (error) {
                    console.error('Error initializing Yandex Maps:', error);
                    setError('Failed to initialize map');
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isYandexReady, mapRef, mapInstance, formData]);

    // Debounced search function
    const debouncedSearch = useCallback((query: string) => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            if (query) {
                handleAddressSearch(query);
            }
        }, 500); // 500ms delay
    }, []);

    // Handle address search
    const handleAddressSearch = async (query: string) => {
        if (!query) return;

        setIsLoading(true);
        try {
            // Use our server-side API instead of direct Yandex API calls
            const response = await fetch(
                `/api/yandex/suggest?query=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch suggestions');
            }

            const data = await response.json();

            if (data && data.results) {
                setSuggestions(data.results.slice(0, 5));
            }
        } catch (error) {
            console.error('Error searching address:', error);
            setError('Failed to search address');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle suggestion selection
    const handleSelectSuggestion = async (suggestion: any) => {
        setIsLoading(true);
        setError(''); // Clear any previous errors

        try {
            // Get display address from the suggestion
            const displayAddress = suggestion.subtitle
                ? `${suggestion.title.text}, ${suggestion.subtitle.text}`
                : suggestion.title.text;

            console.log('Selected suggestion:', suggestion);
            console.log('Selected address:', displayAddress);

            let coordinates;
            let formattedAddress = displayAddress;

            // First attempt: Use our server-side geocoding API
            try {
                console.log('Trying server-side geocoding...');
                const response = await fetch(
                    `/api/yandex/server-geocode?address=${encodeURIComponent(
                        displayAddress
                    )}`
                );

                if (response.ok) {
                    const data = await response.json();
                    console.log('Server geocoding response:', data);

                    if (data.coordinates) {
                        // Use type assertion to ensure TypeScript knows this is a valid coordinate pair
                        coordinates = [
                            data.coordinates.lat,
                            data.coordinates.lng,
                        ] as [number, number];
                        formattedAddress = data.address || displayAddress;
                        console.log(
                            'Server geocoding successful:',
                            coordinates
                        );
                    }
                } else {
                    const errorData = await response.json();
                    console.error('Server geocoding failed:', errorData);
                }
            } catch (geocodeError) {
                console.error('Server geocoding error:', geocodeError);
            }

            // Fallback to browser geolocation if server geocoding failed
            if (!coordinates) {
                console.log(
                    'Server geocoding failed, using browser geolocation'
                );
                try {
                    coordinates = await new Promise<[number, number]>(
                        (resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(
                                (position) =>
                                    resolve([
                                        position.coords.latitude,
                                        position.coords.longitude,
                                    ]),
                                (error) => reject(error),
                                { timeout: 5000, maximumAge: 10000 }
                            );
                        }
                    );
                    console.log('Using browser geolocation:', coordinates);
                } catch (geoError) {
                    console.error('Browser geolocation failed:', geoError);
                    // Last resort: Use Moscow center as default
                    coordinates = [55.76, 37.64] as [number, number];
                    console.log('Using default coordinates:', coordinates);
                }
            }

            // Create components from the address
            const components = parseAddress(formattedAddress);

            // Update form data
            setFormData({
                ...formData,
                ...components,
                fullAddress: formattedAddress,
                coordinates: coordinates
                    ? {
                          lat: coordinates[0],
                          lng: coordinates[1],
                      }
                    : undefined,
            });

            // Update map and placemark if they exist
            if (mapInstance && placemarkInstance && coordinates) {
                try {
                    console.log('Updating map with coordinates:', coordinates);
                    mapInstance.setCenter(coordinates, 16);
                    placemarkInstance.geometry.setCoordinates(coordinates);
                } catch (mapError) {
                    console.error('Error updating map:', mapError);
                }
            }

            // Clear any pending debounce timers
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            setSuggestions([]);
            setSearchQuery(formattedAddress);
        } catch (error) {
            console.error('Error selecting address:', error);

            // Even if we have an error, try to at least update the input field
            try {
                const displayAddress = suggestion.subtitle
                    ? `${suggestion.title.text}, ${suggestion.subtitle.text}`
                    : suggestion.title.text;
                setSearchQuery(displayAddress);
                setSuggestions([]);
            } catch (fallbackError) {
                console.error('Error in error fallback:', fallbackError);
            }

            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to select address'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle GeoJSON response from Yandex API
    const handleGeoJsonResponse = (geoJson: any) => {
        try {
            // Extract first feature from GeoJSON if available
            if (Array.isArray(geoJson) && geoJson.length > 0) {
                const feature = geoJson[0];

                if (
                    feature.geometry &&
                    feature.geometry.type === 'Point' &&
                    Array.isArray(feature.geometry.coordinates) &&
                    feature.geometry.coordinates.length >= 2
                ) {
                    // Extract coordinates - note that GeoJSON returns [longitude, latitude]
                    const lng = feature.geometry.coordinates[0];
                    const lat = feature.geometry.coordinates[1];
                    const coords = [lat, lng]; // Yandex Maps uses [lat, lng] format

                    console.log('GeoJSON coordinates extracted:', coords);

                    // Update map and placemark if they exist
                    if (mapInstance && placemarkInstance) {
                        mapInstance.setCenter(coords, 16);
                        placemarkInstance.geometry.setCoordinates(coords);

                        // Use reverse geocoding to get address from coordinates
                        window.ymaps
                            .geocode(`${coords[0]},${coords[1]}`)
                            .then((res: any) => {
                                const firstGeoObject = res.geoObjects.get(0);
                                if (firstGeoObject) {
                                    const address =
                                        firstGeoObject.getAddressLine();
                                    const locationName =
                                        feature.properties.name || '';

                                    // Format address with location name if available
                                    const formattedAddress = locationName
                                        ? `${address} (${locationName})`
                                        : address;

                                    console.log(
                                        'Formatted address:',
                                        formattedAddress
                                    );

                                    // Parse address components
                                    const components = parseAddress(address);

                                    // Update form data
                                    setFormData({
                                        ...formData,
                                        ...components,
                                        fullAddress: formattedAddress,
                                        coordinates: {
                                            lat: lat,
                                            lng: lng,
                                        },
                                    });

                                    // Update search query
                                    setSearchQuery(formattedAddress);
                                }
                            });
                    }
                }
            }
        } catch (error) {
            console.error('Error processing GeoJSON response:', error);
        }
    };

    // Parse address into components
    const parseAddress = (address: string): Partial<DeliveryAddress> => {
        // Simple parsing logic - in a real app you'd use Yandex's structured address components
        const parts = address.split(',').map((part) => part.trim());
        return {
            city: parts.length > 0 ? parts[0] : '',
            street: parts.length > 1 ? parts[1] : '',
            houseNumber: parts.length > 2 ? parts[2] : '',
            fullAddress: address,
        };
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Save delivery address
    const handleSaveAddress = () => {
        if (!formData.street || !formData.houseNumber || !formData.city) {
            setError('Street, house number, and city are required');
            return;
        }

        if (placemarkInstance) {
            const coordinates = placemarkInstance.geometry.getCoordinates();

            const address: DeliveryAddress = {
                street: formData.street || '',
                houseNumber: formData.houseNumber || '',
                apartment: formData.apartment || '',
                entrance: formData.entrance || '',
                floor: formData.floor || '',
                intercom: formData.intercom || '',
                city: formData.city || '',
                zipCode: formData.zipCode || '',
                fullAddress: formData.fullAddress || '',
                coordinates: {
                    lat: coordinates[0],
                    lng: coordinates[1],
                },
            };

            setDeliveryAddress(address);
        }
    };

    // Process external GeoJSON data (e.g. from API responses)
    const processExternalGeoJson = (jsonData: string) => {
        try {
            const geoJson = JSON.parse(jsonData);
            handleGeoJsonResponse(geoJson);
        } catch (error) {
            console.error('Error parsing GeoJSON data:', error);
            setError('Invalid location data format');
        }
    };

    // Example of how to use it:
    // Add a method to accept GeoJSON from an external source (like a paste or API response)
    const handleGeoJsonPaste = (
        e: React.ClipboardEvent<HTMLTextAreaElement>
    ) => {
        const text = e.clipboardData.getData('text');
        if (text) {
            processExternalGeoJson(text);
            // Prevent default paste behavior
            e.preventDefault();
        }
    };

    // Handle organization URI from Yandex Maps
    const handleOrganizationUri = async (uri: string) => {
        setIsLoading(true);
        setError('');
        try {
            console.log('Processing organization URI:', uri);
            const encodedUri = encodeURIComponent(uri);
            const response = await fetch(
                `/api/yandex/org-details?uri=${encodedUri}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || 'Failed to fetch organization details'
                );
            }

            const data = await response.json();
            console.log('Organization details:', data);

            if (data.coordinates && data.address) {
                // Update map if available
                if (mapInstance && placemarkInstance) {
                    const coords = [data.coordinates.lat, data.coordinates.lng];
                    mapInstance.setCenter(coords, 16);
                    placemarkInstance.geometry.setCoordinates(coords);
                }

                // Parse address components
                const components = parseAddress(data.address);

                // Update form data
                setFormData({
                    ...formData,
                    ...components,
                    fullAddress: data.address,
                    coordinates: data.coordinates,
                });

                // Update search query with organization name and address
                const displayAddress = data.name
                    ? `${data.name}, ${data.address}`
                    : data.address;
                setSearchQuery(displayAddress);

                // Update the input field directly
                const addressInput = document.getElementById(
                    'address-input'
                ) as HTMLInputElement;
                if (addressInput) {
                    addressInput.value = displayAddress;
                    const event = new Event('input', { bubbles: true });
                    addressInput.dispatchEvent(event);
                }
            } else {
                throw new Error(
                    'Organization details did not contain coordinates or address'
                );
            }
        } catch (error) {
            console.error('Error processing organization URI:', error);
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsLoading(false);
        }
    };

    // Handle coordinates from URL or text
    const handleCoordinates = async (coordsText: string) => {
        setIsLoading(true);
        setError('');
        try {
            console.log('Processing coordinates:', coordsText);

            // Extract coordinates from URL if needed
            let processedCoordsText = coordsText;

            // Check if it's a URL with text parameter containing coordinates
            if (
                coordsText.includes('api-maps.yandex.ru') &&
                coordsText.includes('text=')
            ) {
                const textMatch = coordsText.match(/text=([^&]+)/);
                if (textMatch && textMatch[1]) {
                    processedCoordsText = decodeURIComponent(textMatch[1]);
                    console.log(
                        'Extracted coordinates from URL text parameter:',
                        processedCoordsText
                    );
                }
            }

            // Check if it's a URL with ll parameter
            if (
                coordsText.includes('api-maps.yandex.ru') &&
                coordsText.includes('ll=')
            ) {
                const llMatch = coordsText.match(/ll=([^&]+)/);
                if (llMatch && llMatch[1]) {
                    // ll is in format "lng,lat" so we need to reverse it for display
                    const [lng, lat] = decodeURIComponent(llMatch[1]).split(
                        ','
                    );
                    processedCoordsText = `${lat},${lng}`;
                    console.log(
                        'Extracted and reversed coordinates from URL ll parameter:',
                        processedCoordsText
                    );
                }
            }

            // Support various coordinate formats as per Yandex documentation
            let coords = processedCoordsText;

            // Check if coordinates need to be formatted differently
            // Handle formats like "55.123 N, 37.456 E" or "55°30'10"N, 37°20'05"E"
            if (/[NSEW°'"]/.test(processedCoordsText)) {
                // This is a complex format, we'll pass it directly to the API
                // The API will handle the parsing
                console.log(
                    'Detected complex coordinate format, passing directly to API'
                );
            }

            // Make request to our API
            const response = await fetch(
                `/api/yandex/search-by-coords?coords=${encodeURIComponent(
                    coords
                )}`
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || 'Failed to fetch location details'
                );
            }

            const data = await response.json();
            console.log('Location details:', data);

            if (data.coordinates && data.address) {
                // Update map if available
                if (mapInstance && placemarkInstance) {
                    const coords = [data.coordinates.lat, data.coordinates.lng];
                    mapInstance.setCenter(coords, 16);
                    placemarkInstance.geometry.setCoordinates(coords);
                }

                // Parse address components
                const components = parseAddress(data.address);

                // Update form data
                setFormData({
                    ...formData,
                    ...components,
                    fullAddress: data.address,
                    coordinates: data.coordinates,
                });

                // Update search query with address
                const displayAddress = data.name
                    ? `${data.name}, ${data.address}`
                    : data.address;
                setSearchQuery(displayAddress);

                // Update the input field directly
                const addressInput = document.getElementById(
                    'address-input'
                ) as HTMLInputElement;
                if (addressInput) {
                    addressInput.value = displayAddress;
                    const event = new Event('input', { bubbles: true });
                    addressInput.dispatchEvent(event);
                }
            } else {
                throw new Error(
                    'Location details did not contain coordinates or address'
                );
            }
        } catch (error) {
            console.error('Error processing coordinates:', error);
            setError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsLoading(false);
        }
    };

    // Add paste handler for the address input
    const handleAddressInputPaste = (
        e: React.ClipboardEvent<HTMLInputElement>
    ) => {
        const pastedText = e.clipboardData.getData('text');

        // Check if it's a Yandex Maps URL with services/search
        if (pastedText.includes('api-maps.yandex.ru/services/search')) {
            console.log('Detected Yandex Maps search URL:', pastedText);

            // Check for organization URI
            if (
                pastedText.includes('uri=') &&
                pastedText.includes('org?oid=')
            ) {
                console.log('Detected organization URI in URL');

                // Extract the URI from the pasted text
                const uriMatch = pastedText.match(/uri=([^&]+)/);
                if (uriMatch && uriMatch[1]) {
                    const uri = decodeURIComponent(uriMatch[1]);
                    handleOrganizationUri(uri);
                    e.preventDefault();
                    return;
                }
            }

            // Check for coordinates in text parameter
            if (pastedText.includes('text=')) {
                const textMatch = pastedText.match(/text=([^&]+)/);
                if (textMatch && textMatch[1]) {
                    const textParam = decodeURIComponent(textMatch[1]);
                    // Check if text parameter contains coordinates (contains comma and numbers)
                    if (/\d+\.\d+\s*,\s*\d+\.\d+/.test(textParam)) {
                        console.log(
                            'Detected coordinates in text parameter:',
                            textParam
                        );
                        handleCoordinates(pastedText);
                        e.preventDefault();
                        return;
                    }
                }
            }

            // Check for ll parameter (longitude,latitude)
            if (pastedText.includes('ll=')) {
                console.log('Detected ll parameter in URL');
                handleCoordinates(pastedText);
                e.preventDefault();
                return;
            }
        }

        // Check if it looks like a Yandex Maps URI with organization
        else if (
            pastedText.includes('ymapsbm1://org?oid=') ||
            pastedText.includes('org?oid=')
        ) {
            console.log('Detected organization URI:', pastedText);
            handleOrganizationUri(pastedText);
            e.preventDefault();
            return;
        }

        // Check if it looks like coordinates directly (e.g., "55.7497,37.6084")
        else if (
            /^[-+]?\d+\.\d+\s*,\s*[-+]?\d+\.\d+$/.test(pastedText.trim())
        ) {
            console.log('Detected direct coordinates format:', pastedText);
            handleCoordinates(pastedText);
            e.preventDefault();
            return;
        }

        // Check if it's a complex coordinate format (degrees, minutes, seconds or with N,S,E,W)
        else if (/[°'"NSEW]/.test(pastedText) && /\d+/.test(pastedText)) {
            console.log('Detected complex coordinates format:', pastedText);
            handleCoordinates(pastedText);
            e.preventDefault();
            return;
        }
    };

    // Update the generateGeocodeApiUrl function to use the API endpoint rather than hardcoded key
    const generateGeocodeApiUrl = (lat: number, lng: number) => {
        // Instead of hardcoding the key, use our secure server endpoint that has access to env vars
        // Format: geocode=longitude,latitude (Yandex expects longitude first)
        return `/api/yandex/generate-geocode-url?lat=${lat}&lng=${lng}`;
    };

    return (
        <div className='bg-white rounded-lg shadow-md p-6'>
            {/* Only load Yandex Maps once we have the script URL */}
            {!isLoadingScript && scriptUrl && (
                <Script
                    src={scriptUrl}
                    onLoad={handleYandexLoad}
                    onError={handleYandexError}
                    strategy='afterInteractive'
                />
            )}

            {isLoadingScript && (
                <div className='flex justify-center my-4'>
                    <div className='animate-spin h-8 w-8 border-4 border-red-500 rounded-full border-t-transparent'></div>
                </div>
            )}

            <h3 className='text-xl font-bold mb-4'>Delivery Address</h3>

            {error && (
                <div className='bg-red-50 text-red-700 p-3 rounded-md mb-4'>
                    {error}
                </div>
            )}

            <div className='mb-6'>
                <div className='relative'>
                    <input
                        type='text'
                        id='address-input'
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            debouncedSearch(e.target.value);
                        }}
                        onPaste={handleAddressInputPaste}
                        placeholder='Search for address...'
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    />
                    {isLoading && (
                        <div className='absolute right-3 top-3'>
                            <div className='animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent'></div>
                        </div>
                    )}
                    <p className='text-xs text-gray-500 mt-1'>
                        Tip: You can paste a Yandex Maps link, coordinates, or
                        click on the map to select a location
                    </p>

                    {suggestions.length > 0 && (
                        <div className='absolute z-10 w-full bg-white mt-1 border border-gray-300 rounded-md shadow-lg'>
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className='p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0'
                                    onClick={() =>
                                        handleSelectSuggestion(suggestion)
                                    }
                                >
                                    <div className='font-medium'>
                                        {suggestion.title.text}
                                    </div>
                                    {suggestion.subtitle && (
                                        <div className='text-sm text-gray-500'>
                                            {suggestion.subtitle.text}
                                        </div>
                                    )}
                                    {suggestion.distance && (
                                        <div className='text-xs text-gray-400 mt-1'>
                                            {suggestion.distance.text}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className='mb-6'>
                <div
                    ref={mapRef}
                    style={{ height: '300px', width: '100%' }}
                    className='rounded-lg'
                ></div>

                {visibleCoords && (
                    <div className='mt-2 p-2 bg-gray-100 rounded-md text-sm'>
                        <p className='font-medium'>Selected Coordinates:</p>
                        <div className='flex items-center justify-between'>
                            <span className='text-gray-700'>
                                {visibleCoords.lat.toFixed(6)},{' '}
                                {visibleCoords.lng.toFixed(6)}
                            </span>
                            <div className='space-x-2'>
                                <button
                                    onClick={() => {
                                        const coordsText = `${visibleCoords.lat.toFixed(
                                            6
                                        )},${visibleCoords.lng.toFixed(6)}`;
                                        navigator.clipboard.writeText(
                                            coordsText
                                        );
                                        // Show a small notification
                                        alert(
                                            `Coordinates copied: ${coordsText}`
                                        );
                                    }}
                                    className='text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600'
                                >
                                    Copy
                                </button>
                                <button
                                    onClick={() => {
                                        // Get the coordinates string
                                        const coordsText = `${visibleCoords.lat.toFixed(
                                            6
                                        )},${visibleCoords.lng.toFixed(6)}`;

                                        // Update the address input field directly with the coordinates
                                        const addressInput =
                                            document.getElementById(
                                                'address-input'
                                            ) as HTMLInputElement;
                                        if (addressInput) {
                                            addressInput.value = coordsText;
                                            // Trigger a change event to ensure React state updates
                                            const event = new Event('input', {
                                                bubbles: true,
                                            });
                                            addressInput.dispatchEvent(event);
                                            setSearchQuery(coordsText);
                                        }
                                    }}
                                    className='text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600'
                                >
                                    Paste to Input
                                </button>
                                <button
                                    onClick={() => {
                                        // Generate the API URL using our secure endpoint
                                        fetch(
                                            `/api/yandex/generate-geocode-url?lat=${visibleCoords.lat}&lng=${visibleCoords.lng}`
                                        )
                                            .then((response) => response.json())
                                            .then((data) => {
                                                // Copy the URL to clipboard
                                                navigator.clipboard.writeText(
                                                    data.url
                                                );
                                                // Show the URL in an alert
                                                alert(
                                                    `Geocoder API URL copied:\n${data.url}`
                                                );
                                            })
                                            .catch((error) => {
                                                alert(
                                                    `Error generating URL: ${error.message}`
                                                );
                                            });
                                    }}
                                    className='text-xs bg-purple-500 text-white px-2 py-1 rounded hover:bg-purple-600'
                                >
                                    Copy API URL
                                </button>
                                <button
                                    onClick={() => {
                                        // Fetch data about this location from Yandex API and log it
                                        fetch(
                                            `/api/yandex/generate-geocode-url?lat=${visibleCoords.lat}&lng=${visibleCoords.lng}`
                                        )
                                            .then((response) => {
                                                if (!response.ok) {
                                                    throw new Error(
                                                        `Error: ${response.status}`
                                                    );
                                                }
                                                return response.json();
                                            })
                                            .then((data) => {
                                                console.log(
                                                    '--- GEOCODE URL GENERATED ---'
                                                );
                                                console.log(
                                                    'Direct API URL:',
                                                    data.url
                                                );
                                                console.log(
                                                    'Coordinates:',
                                                    data.coordinates
                                                );

                                                // Now fetch the actual data using our backend proxy
                                                return fetch(
                                                    `/api/yandex/search-by-coords?coords=${visibleCoords.lat},${visibleCoords.lng}`
                                                );
                                            })
                                            .then((response) => {
                                                if (!response.ok) {
                                                    throw new Error(
                                                        `Error: ${response.status}`
                                                    );
                                                }
                                                return response.json();
                                            })
                                            .then((data) => {
                                                console.log(
                                                    '--- OBJECT DATA FROM API ---'
                                                );
                                                console.log(
                                                    JSON.stringify(
                                                        data,
                                                        null,
                                                        2
                                                    )
                                                );
                                                console.log(
                                                    '----------------------------'
                                                );

                                                // Display the data in an alert as well
                                                alert(
                                                    `Object data fetched! Check console for full details.\n\nAddress: ${
                                                        data.address
                                                    }\nCoordinates: ${visibleCoords.lat.toFixed(
                                                        6
                                                    )}, ${visibleCoords.lng.toFixed(
                                                        6
                                                    )}`
                                                );
                                            })
                                            .catch((error) => {
                                                console.error(
                                                    'Error fetching object data:',
                                                    error
                                                );
                                                alert(
                                                    `Error fetching data: ${error.message}`
                                                );
                                            });
                                    }}
                                    className='text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600'
                                >
                                    Inspect Object
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden textarea for advanced GeoJSON paste functionality */}
                <div className='mt-2'>
                    <details className='text-sm text-gray-600'>
                        <summary className='cursor-pointer font-medium hover:text-red-600'>
                            Advanced: Paste GeoJSON coordinates
                        </summary>
                        <div className='mt-2'>
                            <textarea
                                placeholder='Paste GeoJSON data here...'
                                className='w-full p-2 border border-gray-300 rounded text-xs h-24 font-mono'
                                onPaste={handleGeoJsonPaste}
                            ></textarea>
                            <p className='text-xs text-gray-500 mt-1'>
                                You can paste GeoJSON data from Yandex API to
                                quickly set location
                            </p>
                        </div>
                    </details>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        City *
                    </label>
                    <input
                        type='text'
                        name='city'
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    />
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        ZIP Code
                    </label>
                    <input
                        type='text'
                        name='zipCode'
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    />
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Street *
                    </label>
                    <input
                        type='text'
                        name='street'
                        value={formData.street}
                        onChange={handleInputChange}
                        required
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    />
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        House Number *
                    </label>
                    <input
                        type='text'
                        name='houseNumber'
                        value={formData.houseNumber}
                        onChange={handleInputChange}
                        required
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    />
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Apartment
                    </label>
                    <input
                        type='text'
                        name='apartment'
                        value={formData.apartment}
                        onChange={handleInputChange}
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    />
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Entrance
                    </label>
                    <input
                        type='text'
                        name='entrance'
                        value={formData.entrance}
                        onChange={handleInputChange}
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    />
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Floor
                    </label>
                    <input
                        type='text'
                        name='floor'
                        value={formData.floor}
                        onChange={handleInputChange}
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    />
                </div>

                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Intercom
                    </label>
                    <input
                        type='text'
                        name='intercom'
                        value={formData.intercom}
                        onChange={handleInputChange}
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    />
                </div>
            </div>

            <button
                type='button'
                onClick={handleSaveAddress}
                className='w-full bg-red-600 text-white py-3 rounded-md font-medium hover:bg-red-700 transition duration-200'
            >
                Save Address
            </button>
        </div>
    );
}
