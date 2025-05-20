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

                    // Handle map click to update address
                    map.events.add('click', function (e: any) {
                        const coords = e.get('coords');
                        console.log('Map clicked at coordinates:', coords);

                        // Update placemark position
                        placemark.geometry.setCoordinates(coords);

                        // Reverse geocode to get address from coordinates
                        window.ymaps
                            .geocode(`${coords[0]},${coords[1]}`)
                            .then((res: any) => {
                                const firstGeoObject = res.geoObjects.get(0);
                                if (firstGeoObject) {
                                    const address =
                                        firstGeoObject.getAddressLine();
                                    console.log(
                                        'Clicked location address:',
                                        address
                                    );

                                    // Parse address into components
                                    const components = parseAddress(address);

                                    // Update form and search query with new address
                                    setFormData({
                                        ...formData,
                                        ...components,
                                        fullAddress: address,
                                        coordinates: {
                                            lat: coords[0],
                                            lng: coords[1],
                                        },
                                    });

                                    // Update the search input field
                                    setSearchQuery(address);
                                }
                            });
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
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            debouncedSearch(e.target.value);
                        }}
                        placeholder='Search for address...'
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent'
                    />
                    {isLoading && (
                        <div className='absolute right-3 top-3'>
                            <div className='animate-spin h-5 w-5 border-2 border-red-500 rounded-full border-t-transparent'></div>
                        </div>
                    )}

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
