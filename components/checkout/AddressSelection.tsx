'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDelivery, DeliveryAddress } from '@/app/DeliveryProvider';
import Script from 'next/script';

interface YMaps {
    Map: any;
    Placemark: any;
    GeoObject: any;
    Clusterer: any;
    geocode: (address: string) => Promise<any>;
    suggest: (query: string) => Promise<any>;
}

declare global {
    interface Window {
        ymaps: YMaps;
    }
}

// Интерфейс для адреса из базы данных
interface UserAddress {
    id: number;
    city: string;
    street: string;
    houseNumber: string;
    apartment?: string | null;
    entrance?: string | null;
    floor?: string | null;
    intercom?: string | null;
}

// Add this function after the imports but before the component
// Helper function to log server responses
async function logServerResponseByCoords(lat: number, lng: number) {
    console.log('--------------------------------');
    console.log('📤 LOGGING SERVER RESPONSE FOR COORDINATES:', { lat, lng });

    try {
        // Format the URL for the API call
        const requestUrl = `/api/yandex/search-by-coords?coords=${lat},${lng}`;
        console.log('📡 REQUEST URL:', requestUrl);

        // Make the API call
        const response = await fetch(requestUrl);
        console.log('📥 RAW SERVER RESPONSE:', response);

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        // Parse the JSON
        const data = await response.json();
        console.log('🔍 SERVER RESPONSE DATA:', JSON.stringify(data, null, 2));

        return data;
    } catch (error) {
        console.error('❌ ERROR getting data from server:', error);
        return null;
    } finally {
        console.log('--------------------------------');
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
    const [scriptUrl, setScriptUrl] = useState<string>('');
    const [isLoadingScript, setIsLoadingScript] = useState(true);
    const mapRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [visibleCoords, setVisibleCoords] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    // Добавляем состояние для хранения адресов пользователя
    const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

    // Initialize form with saved delivery address
    const [formData, setFormData] = useState<Partial<DeliveryAddress>>({
        street: deliveryAddress?.street || '',
        houseNumber: deliveryAddress?.houseNumber || '',
        apartment: deliveryAddress?.apartment || '',
        entrance: deliveryAddress?.entrance || '',
        floor: deliveryAddress?.floor || '',
        intercom: deliveryAddress?.intercom || '',
        city: deliveryAddress?.city || '',
        fullAddress: deliveryAddress?.fullAddress || '',
    });

    // Add state variables for field-specific suggestions and loading states
    const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
    const [streetSuggestions, setStreetSuggestions] = useState<any[]>([]);
    const [houseNumberSuggestions, setHouseNumberSuggestions] = useState<any[]>(
        []
    );
    const [isLoadingCity, setIsLoadingCity] = useState(false);
    const [isLoadingStreet, setIsLoadingStreet] = useState(false);
    const [isLoadingHouseNumber, setIsLoadingHouseNumber] = useState(false);

    // Add debounce refs for each field
    const debounceCityRef = useRef<NodeJS.Timeout | null>(null);
    const debounceStreetRef = useRef<NodeJS.Timeout | null>(null);
    const debounceHouseRef = useRef<NodeJS.Timeout | null>(null);

    // Загружаем адреса пользователя при монтировании компонента
    useEffect(() => {
        const fetchUserAddresses = async () => {
            try {
                setIsLoadingAddresses(true);
                const response = await fetch('/api/users/addresses');

                if (!response.ok) {
                    throw new Error('Failed to fetch user addresses');
                }

                const data = await response.json();
                setUserAddresses(data.addresses || []);
            } catch (error) {
                console.error('Error fetching user addresses:', error);
            } finally {
                setIsLoadingAddresses(false);
            }
        };

        fetchUserAddresses();
    }, []);

    // Get script URL from server
    useEffect(() => {
        const getScriptUrl = async () => {
            try {
                setIsLoadingScript(true);

                // Добавляем повторные попытки для большей надежности
                let retries = 3;
                let response = null;
                let error = null;

                while (retries > 0 && !response) {
                    try {
                        response = await fetch('/api/yandex/script-url');
                        if (!response.ok) {
                            throw new Error(`HTTP error: ${response.status}`);
                        }
                    } catch (err) {
                        error = err;
                        retries--;
                        // Ждем перед повторной попыткой
                        if (retries > 0) {
                            await new Promise((resolve) =>
                                setTimeout(resolve, 500)
                            );
                        }
                    }
                }

                // Если все попытки не удались, выбрасываем последнюю ошибку
                if (!response && error) {
                    throw error;
                }

                if (!response) {
                    throw new Error('Не удалось получить URL скрипта карты');
                }

                const data = await response.json();

                if (data.error) {
                    throw new Error(data.error);
                }

                setScriptUrl(data.scriptUrl || '');

                if (!data.scriptUrl) {
                    console.error('No script URL returned from server');
                    setError('API ключ Яндекс.Карт не настроен');
                }
            } catch (error) {
                console.error('Error getting map script URL:', error);
                setError(
                    'Не удалось инициализировать сервис карт. Вы можете ввести адрес вручную.'
                );
                // Даже при ошибке позволяем компоненту работать с ручным вводом
                setIsLoadingScript(false);
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

                    // DISABLE PLACEMARKS - Remove the placemark creation code
                    // This removes the custom placemark
                    // const placemark = new window.ymaps.Placemark(
                    //     [55.76, 37.64],
                    //     {},
                    //     {
                    //         draggable: true,
                    //     }
                    // );
                    // map.geoObjects.add(placemark);

                    // Disable all Yandex placemarks by setting up options
                    map.options.set('yandexMapDisablePoiInteractivity', true);
                    map.options.set('suppressMapOpenBlock', true);

                    // Set object manager to not show placemarks/features
                    const objectManagerOptions = {
                        clusterize: false,
                        gridSize: 0,
                        minClusterSize: 1000000, // Effectively disable clustering by setting a very high number
                        filter: function () {
                            return false;
                        }, // Filter out all objects
                    };

                    // Modify the map click handler to not use the placemark
                    map.events.add('click', function (e: any) {
                        const coords = e.get('coords');
                        console.log('Map clicked at coordinates:', coords);

                        // Set visible coordinates for display in UI
                        setVisibleCoords({
                            lat: coords[0],
                            lng: coords[1],
                        });

                        // No placemark to update
                        // Instead, just show the coordinates directly in the search field
                        const coordsString = `${coords[0].toFixed(
                            6
                        )}, ${coords[1].toFixed(6)}`;

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

                                if (data) {
                                    // Use the new parseYandexAddress function instead of parseAddress
                                    const components = parseYandexAddress(data);

                                    // Update form and search query with new address
                                    setFormData({
                                        ...formData,
                                        ...components,
                                        coordinates: {
                                            lat: coords[0],
                                            lng: coords[1],
                                        },
                                    });

                                    // Update the search input field with the new address
                                    setSearchQuery(data.address || '');

                                    // Update the input field directly to ensure it's visible
                                    const addressInput =
                                        document.getElementById(
                                            'address-input'
                                        ) as HTMLInputElement;
                                    if (addressInput) {
                                        addressInput.value = data.address || '';
                                        // Trigger a change event to ensure React state updates
                                        const event = new Event('input', {
                                            bubbles: true,
                                        });
                                        addressInput.dispatchEvent(event);
                                    }
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

                    // Replace all placemark-related code
                    // Update setMapInstance but remove setPlacemarkInstance
                    setMapInstance(map);

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
        if (!query) {
            setSuggestions([]);
            return;
        }

        setSearchQuery(query);
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
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error searching address:', error);
            setError('Не удалось получить варианты адресов');
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
            let addressData;

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
                    addressData = data;

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

            // Use the parseYandexAddress function to get components for the form
            let components;
            if (addressData) {
                components = parseYandexAddress(addressData);
            } else {
                components = parseAddress(formattedAddress);
            }

            // Update form data
            setFormData({
                ...formData,
                ...components,
                coordinates: coordinates
                    ? {
                          lat: coordinates[0],
                          lng: coordinates[1],
                      }
                    : undefined,
            });

            // Update map and placemark if they exist
            if (mapInstance && coordinates) {
                try {
                    console.log('Updating map with coordinates:', coordinates);
                    mapInstance.setCenter(coordinates, 16);
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
                    if (mapInstance && coords) {
                        mapInstance.setCenter(coords, 16);
                    }
                }
            }
        } catch (error) {
            console.error('Error processing GeoJSON response:', error);
        }
    };

    // Parse address into components
    const parseAddress = (address: string): Partial<DeliveryAddress> => {
        // Split by commas and remove whitespace
        const parts = address.split(',').map((part) => part.trim());

        // Now let's extract components more intelligently
        let city = '';
        let street = '';
        let houseNumber = '';

        // If we have at least 3 parts, we'll use them for city, street, house number
        if (parts.length >= 3) {
            // Typical format: Country, City, Street, House Number, etc.
            // We'll skip the country (first element) and use appropriate positions
            city = parts[1] || ''; // City is usually the second component
            street = parts[2] || ''; // Street is usually the third component

            // House number could be the fourth component or part of the third
            if (parts.length >= 4) {
                houseNumber = parts[3];
            } else {
                // Try to extract house number from street if it contains numbers
                const match = street.match(/(\d+[\w\/\-]*\s*$)/); // Match numbers at end of string
                if (match) {
                    houseNumber = match[1].trim();
                    street = street.replace(match[1], '').trim();
                }
            }
        } else if (parts.length === 2) {
            // If only 2 parts, assume city and street
            city = parts[0] || '';
            street = parts[1] || '';
        } else if (parts.length === 1) {
            // If only 1 part, use it as street
            street = parts[0] || '';
        }

        // Clean up any remaining issues
        if (!city && parts.length > 0) {
            city = parts[0]; // Use first segment as city if nothing else worked
        }

        console.log('Parsed address components:', {
            original: address,
            city,
            street,
            houseNumber,
        });

        return {
            city,
            street,
            houseNumber,
            fullAddress: address,
        };
    };

    // Enhance the handleInputChange function to update the geosuggest input as well
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Update the specific form field
        setFormData({
            ...formData,
            [name]: value,
        });

        // Now update the search query / main geosuggest input to reflect all fields
        // We'll use setTimeout to ensure this happens after the form state updates
        setTimeout(() => {
            // Get the updated form data
            const updatedFormData = {
                ...formData,
                [name]: value,
            };

            // Create the full address string based on city, street and house number
            // Only include fields that have values
            const parts = [];
            if (updatedFormData.city) parts.push(updatedFormData.city);
            if (updatedFormData.street) parts.push(updatedFormData.street);
            if (updatedFormData.houseNumber)
                parts.push(updatedFormData.houseNumber);

            // Create combined address string
            const fullAddress = parts.join(', ');

            // Update the search query
            setSearchQuery(fullAddress);

            // Also update the input field directly
            const addressInput = document.getElementById(
                'address-input'
            ) as HTMLInputElement;
            if (addressInput) {
                addressInput.value = fullAddress;
            }

            // Also update the fullAddress property in formData
            setFormData((prev) => ({
                ...prev,
                fullAddress,
            }));

            console.log(
                `Address field "${name}" updated to "${value}", full address: "${fullAddress}"`
            );
        }, 0);
    };

    // Функция для выбора адреса из выпадающего списка
    const handleSelectSavedAddress = async (address: UserAddress) => {
        // Преобразуем адрес из БД в формат DeliveryAddress
        const selectedAddress: DeliveryAddress = {
            city: address.city || '',
            street: address.street || '',
            houseNumber: address.houseNumber || '',
            apartment: address.apartment || '',
            entrance: address.entrance || '',
            floor: address.floor || '',
            intercom: address.intercom || '',
            fullAddress: `${address.city}, ${address.street}, ${address.houseNumber}`,
        };

        // Обновляем форму
        setFormData({
            ...formData,
            ...selectedAddress,
        });

        // Обновляем адрес доставки
        setDeliveryAddress(selectedAddress);

        // Обновляем поисковый запрос
        setSearchQuery(selectedAddress.fullAddress);

        // Запрашиваем координаты для адреса и обновляем карту
        if (mapInstance) {
            try {
                setIsLoading(true);
                const fullAddress = `${address.city}, ${address.street}, ${address.houseNumber}`;

                // Используем API для получения координат
                const response = await fetch(
                    `/api/yandex/server-geocode?address=${encodeURIComponent(
                        fullAddress
                    )}`
                );

                if (response.ok) {
                    const data = await response.json();
                    console.log('Geocoding result for saved address:', data);

                    if (data && data.coordinates) {
                        // Обновляем видимые координаты
                        setVisibleCoords({
                            lat: data.coordinates.lat,
                            lng: data.coordinates.lng,
                        });

                        // Центрируем карту на полученных координатах с высоким зумом
                        mapInstance.setCenter(
                            [data.coordinates.lat, data.coordinates.lng],
                            17
                        );
                    }
                }
            } catch (error) {
                console.error('Error geocoding saved address:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Работа компонента даже без Яндекс.Карт - ручной ввод адреса
    const handleManualAddressInput = () => {
        if (!formData.city || !formData.street || !formData.houseNumber) {
            setError('Пожалуйста, заполните все обязательные поля адреса');
            return;
        }

        // Формируем полный адрес
        const fullAddress = `${formData.city}, ${formData.street}, ${formData.houseNumber}`;

        // Обновляем поле поиска
        setSearchQuery(fullAddress);

        // Создаем объект адреса
        const address: DeliveryAddress = {
            city: formData.city || '',
            street: formData.street || '',
            houseNumber: formData.houseNumber || '',
            apartment: formData.apartment || '',
            entrance: formData.entrance || '',
            floor: formData.floor || '',
            intercom: formData.intercom || '',
            fullAddress: fullAddress,
        };

        // Устанавливаем адрес доставки
        setDeliveryAddress(address);
    };

    // Save delivery address
    const handleSaveAddress = () => {
        // Проверяем наличие всех необходимых полей
        if (!formData.city || !formData.street || !formData.houseNumber) {
            setError('Пожалуйста, заполните все обязательные поля');
            return;
        }

        // Вызываем функцию ручного ввода для корректного обновления адреса
        handleManualAddressInput();

        // Создаем объект адреса доставки
        const address: DeliveryAddress = {
            city: formData.city || '',
            street: formData.street || '',
            houseNumber: formData.houseNumber || '',
            apartment: formData.apartment || '',
            entrance: formData.entrance || '',
            floor: formData.floor || '',
            intercom: formData.intercom || '',
            fullAddress:
                formData.fullAddress ||
                `${formData.city}, ${formData.street}, ${formData.houseNumber}`,
        };

        // Добавляем координаты, если они есть
        if (visibleCoords) {
            address.coordinates = {
                lat: visibleCoords.lat,
                lng: visibleCoords.lng,
            };
        }

        // Сохраняем адрес в API
        const saveAddressToDb = async () => {
            try {
                const response = await fetch('/api/users/addresses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        city: address.city,
                        street: address.street,
                        houseNumber: address.houseNumber,
                        apartment: address.apartment,
                        entrance: address.entrance,
                        floor: address.floor,
                        intercom: address.intercom,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to save address');
                }

                // Обновляем список адресов пользователя
                const fetchAddressesResponse = await fetch(
                    '/api/users/addresses'
                );
                if (fetchAddressesResponse.ok) {
                    const data = await fetchAddressesResponse.json();
                    setUserAddresses(data.addresses || []);
                }
            } catch (error) {
                console.error('Error saving address:', error);
            }
        };

        // Вызываем функцию сохранения
        saveAddressToDb();

        // Устанавливаем адрес доставки
        setDeliveryAddress(address);
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

            if (data) {
                // Update map if available
                if (mapInstance && data.coordinates) {
                    const coords = [data.coordinates.lat, data.coordinates.lng];
                    mapInstance.setCenter(coords, 16);
                }

                // Parse address components using structured data
                const components = parseYandexAddress(data);

                // Update form data
                setFormData({
                    ...formData,
                    ...components,
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

            if (data) {
                // Update map if available
                if (mapInstance && data.coordinates) {
                    const coords = [data.coordinates.lat, data.coordinates.lng];
                    mapInstance.setCenter(coords, 16);
                }

                // Parse address components using the new structured data parser
                const components = parseYandexAddress(data);

                // Update form data
                setFormData({
                    ...formData,
                    ...components,
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

    // Add this function to handle the structured Yandex response object
    const parseYandexAddress = (data: any): Partial<DeliveryAddress> => {
        console.log('Parsing Yandex address data:', data);

        let city = '';
        let street = '';
        let houseNumber = '';

        try {
            // Try to extract data from the structured components if available
            if (
                data.raw?.metaDataProperty?.GeocoderMetaData?.Address
                    ?.Components
            ) {
                const components =
                    data.raw.metaDataProperty.GeocoderMetaData.Address
                        .Components;

                // Find components by kind
                for (const component of components) {
                    if (component.kind === 'locality') {
                        city = component.name;
                    }
                    if (component.kind === 'street') {
                        street = component.name;
                    }
                    if (component.kind === 'house') {
                        houseNumber = component.name;
                    }
                }
            }

            // If structured data wasn't available, try the AddressDetails
            if (
                !city &&
                data.raw?.metaDataProperty?.GeocoderMetaData?.AddressDetails
                    ?.Country?.AdministrativeArea
            ) {
                const adminArea =
                    data.raw.metaDataProperty.GeocoderMetaData.AddressDetails
                        .Country.AdministrativeArea;

                // Try to get city (locality)
                if (adminArea.SubAdministrativeArea?.Locality?.LocalityName) {
                    city =
                        adminArea.SubAdministrativeArea.Locality.LocalityName;
                } else if (adminArea.Locality?.LocalityName) {
                    city = adminArea.Locality.LocalityName;
                }

                // Try to get street
                if (
                    adminArea.SubAdministrativeArea?.Locality?.Thoroughfare
                        ?.ThoroughfareName
                ) {
                    street =
                        adminArea.SubAdministrativeArea.Locality.Thoroughfare
                            .ThoroughfareName;
                } else if (adminArea.Locality?.Thoroughfare?.ThoroughfareName) {
                    street = adminArea.Locality.Thoroughfare.ThoroughfareName;
                }

                // Try to get house number
                if (
                    adminArea.SubAdministrativeArea?.Locality?.Thoroughfare
                        ?.Premise?.PremiseNumber
                ) {
                    houseNumber =
                        adminArea.SubAdministrativeArea.Locality.Thoroughfare
                            .Premise.PremiseNumber;
                } else if (
                    adminArea.Locality?.Thoroughfare?.Premise?.PremiseNumber
                ) {
                    houseNumber =
                        adminArea.Locality.Thoroughfare.Premise.PremiseNumber;
                }
            }

            // If we still don't have data, try the name and description fields
            if (!street && data.name) {
                // The name field often contains the street and house number
                const nameParts = data.name.split(',');
                if (nameParts.length > 0) {
                    // Try to extract house number if there's a space followed by numbers
                    const match = data.name.match(/(.*?)\s+(\d+[\w\/\-]*)$/);
                    if (match) {
                        street = match[1].trim();
                        if (!houseNumber) houseNumber = match[2].trim();
                    } else {
                        street = data.name;
                    }
                }
            }

            // For city, try from description if not found
            if (!city && data.description) {
                const descParts = data.description.split(',');
                if (descParts.length > 0) {
                    city = descParts[0].trim(); // First part of description is usually city
                }
            }
        } catch (error) {
            console.error('Error parsing Yandex address data:', error);
        }

        // If we still don't have the data, fall back to basic parsing
        if (!city || !street) {
            const basicParsed = parseAddress(data.address || '');
            if (!city) city = basicParsed.city || '';
            if (!street) street = basicParsed.street || '';
            if (!houseNumber) houseNumber = basicParsed.houseNumber || '';
        }

        // Log the extracted components
        console.log('Extracted address components:', {
            city,
            street,
            houseNumber,
            fullAddress: data.address || '',
        });

        return {
            city,
            street,
            houseNumber,
            fullAddress: data.address || '',
        };
    };

    // Search for cities
    const searchCity = useCallback((query: string) => {
        if (debounceCityRef.current) {
            clearTimeout(debounceCityRef.current);
        }

        debounceCityRef.current = setTimeout(async () => {
            if (!query) {
                setCitySuggestions([]);
                return;
            }

            setIsLoadingCity(true);
            try {
                // Explicitly set type=locality to only get cities, towns, etc.
                const response = await fetch(
                    `/api/yandex/suggest?query=${encodeURIComponent(
                        query
                    )}&type=locality`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch city suggestions');
                }

                const data = await response.json();
                console.log('City suggestions:', data);

                if (data && data.results) {
                    // Still apply filtering to ensure we only get localities
                    const cities = data.results.filter((result: any) => {
                        // Make sure it's a locality - either directly by API response type
                        // or by checking common keywords in Russian
                        return result.title.text && !result.subtitle;
                        // (result.subtitle.text.includes('город') ||
                        //     result.subtitle.text.includes('поселок') ||
                        //     result.subtitle.text.includes('село') ||
                        //     result.subtitle.text.includes(
                        //         'населенный пункт'
                        //     ) ||
                        //     !result.subtitle.text.includes('улица')) // Not a street
                    });

                    setCitySuggestions(cities.slice(0, 5));
                }
            } catch (error) {
                console.error('Error searching cities:', error);
            } finally {
                setIsLoadingCity(false);
            }
        }, 500);
    }, []);

    // Search for streets within a city
    const searchStreet = useCallback(
        (query: string) => {
            if (debounceStreetRef.current) {
                clearTimeout(debounceStreetRef.current);
            }

            debounceStreetRef.current = setTimeout(async () => {
                if (!query || !formData.city) {
                    setStreetSuggestions([]);
                    return;
                }

                setIsLoadingStreet(true);
                try {
                    // First get coordinates for the city to use as search bias
                    let cityCoordinates = null;
                    try {
                        const geocodeResponse = await fetch(
                            `/api/yandex/server-geocode?address=${encodeURIComponent(
                                formData.city || ''
                            )}`
                        );
                        if (geocodeResponse.ok) {
                            const geocodeData = await geocodeResponse.json();
                            if (geocodeData.coordinates) {
                                cityCoordinates = geocodeData.coordinates;
                            }
                        }
                    } catch (geocodeError) {
                        console.error(
                            'Error getting city coordinates:',
                            geocodeError
                        );
                    }

                    // Build additional parameters for geographic constraints
                    let additionalParams = '';
                    if (cityCoordinates) {
                        // Add ll (longitude,latitude) and spn (span) parameters to constrain search area
                        additionalParams = `&ll=${cityCoordinates.lng},${cityCoordinates.lat}&spn=0.2,0.2&results=5`;
                    }

                    // Use city as context with strict geographic boundaries
                    const response = await fetch(
                        `/api/yandex/suggest?query=${encodeURIComponent(
                            formData.city + ', ' + query
                        )}&type=street${additionalParams}`
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch street suggestions');
                    }

                    const data = await response.json();
                    console.log('Street suggestions:', data);

                    if (data && data.results) {
                        // Filter to show only streets AND verify they're in the correct city
                        const streets = data.results.filter((result: any) => {
                            // Make sure it's actually a street
                            const isStreet =
                                result.title &&
                                (result.title.text.includes('улица') ||
                                    result.title.text.includes('проспект') ||
                                    result.title.text.includes('переулок'));

                            // AND make sure it's in the correct city
                            const isInCity =
                                result.subtitle &&
                                result.subtitle.text
                                    .toLowerCase()
                                    .includes(
                                        (formData.city || '').toLowerCase()
                                    );

                            return isStreet && isInCity;
                        });

                        setStreetSuggestions(streets.slice(0, 5));
                    }
                } catch (error) {
                    console.error('Error searching streets:', error);
                } finally {
                    setIsLoadingStreet(false);
                }
            }, 500);
        },
        [formData.city]
    );

    // Search for house numbers on a street
    const searchHouseNumber = useCallback(
        (query: string) => {
            if (debounceHouseRef.current) {
                clearTimeout(debounceHouseRef.current);
            }

            debounceHouseRef.current = setTimeout(async () => {
                if (!query || !formData.city || !formData.street) {
                    setHouseNumberSuggestions([]);
                    return;
                }

                setIsLoadingHouseNumber(true);
                try {
                    // First get coordinates for the street to use as search bias
                    let streetCoordinates = null;
                    try {
                        const geocodeResponse = await fetch(
                            `/api/yandex/server-geocode?address=${encodeURIComponent(
                                (formData.city || '') +
                                    ', ' +
                                    (formData.street || '')
                            )}`
                        );
                        if (geocodeResponse.ok) {
                            const geocodeData = await geocodeResponse.json();
                            if (geocodeData.coordinates) {
                                streetCoordinates = geocodeData.coordinates;
                            }
                        }
                    } catch (geocodeError) {
                        console.error(
                            'Error getting street coordinates:',
                            geocodeError
                        );
                    }

                    // Build additional parameters for geographic constraints
                    let additionalParams = '';
                    if (streetCoordinates) {
                        // Use tighter constraints for house numbers (smaller span)
                        additionalParams = `&ll=${streetCoordinates.lng},${streetCoordinates.lat}&spn=0.05,0.05&results=5`;
                    }

                    // Combine city, street and house number for the search with strict bounds
                    const searchText = `${formData.city}, ${formData.street}, ${query}`;
                    const response = await fetch(
                        `/api/yandex/suggest?query=${encodeURIComponent(
                            searchText
                        )}&type=house${additionalParams}`
                    );

                    if (!response.ok) {
                        throw new Error('Failed to fetch house suggestions');
                    }

                    const data = await response.json();
                    console.log('House suggestions:', data);

                    if (data && data.results) {
                        // Apply stronger filters to ensure house numbers are on the correct street
                        const houses = data.results.filter((result: any) => {
                            // Must contain a number
                            const hasNumber = /\d+/.test(result.title.text);

                            // Must be for our specific street (strict match)
                            const streetNameLower = (
                                formData.street || ''
                            ).toLowerCase();
                            const isOnStreet =
                                // Check in title
                                (result.title &&
                                    result.title.text
                                        .toLowerCase()
                                        .includes(streetNameLower)) ||
                                // Check in subtitle
                                (result.subtitle &&
                                    result.subtitle.text
                                        .toLowerCase()
                                        .includes(streetNameLower));

                            // Also verify it's in our city
                            const cityNameLower = (
                                formData.city || ''
                            ).toLowerCase();
                            const isInCity =
                                result.subtitle &&
                                result.subtitle.text
                                    .toLowerCase()
                                    .includes(cityNameLower);

                            return hasNumber && isOnStreet && isInCity;
                        });

                        setHouseNumberSuggestions(houses.slice(0, 5));
                    }
                } catch (error) {
                    console.error('Error searching house numbers:', error);
                } finally {
                    setIsLoadingHouseNumber(false);
                }
            }, 500);
        },
        [formData.city, formData.street]
    );

    // Handle selection of city suggestion
    const handleSelectCity = async (suggestion: any) => {
        // Extract city name
        let cityName = suggestion.title.text;
        // If the title contains comma-separated parts, take only the first part
        if (cityName.includes(',')) {
            cityName = cityName.split(',')[0].trim();
        }

        console.log(`Selected city: ${cityName}`);

        // Update form data
        const newFormData = {
            ...formData,
            city: cityName,
            // Clear street and house number when city changes
            street: '',
            houseNumber: '',
        };
        setFormData(newFormData);

        // Update search query with just the city
        const newSearchQuery = cityName;
        setSearchQuery(newSearchQuery);

        // Update input directly
        const addressInput = document.getElementById(
            'address-input'
        ) as HTMLInputElement;
        if (addressInput) {
            addressInput.value = newSearchQuery;
        }

        // Try to get coordinates for the city and update map
        try {
            const response = await fetch(
                `/api/yandex/server-geocode?address=${encodeURIComponent(
                    cityName
                )}`
            );
            if (response.ok) {
                const data = await response.json();
                console.log('City geocoding result:', data);

                if (data && data.coordinates && mapInstance) {
                    // Update map to city center
                    mapInstance.setCenter(
                        [data.coordinates.lat, data.coordinates.lng],
                        12
                    );

                    // Update visible coordinates
                    setVisibleCoords({
                        lat: data.coordinates.lat,
                        lng: data.coordinates.lng,
                    });
                }
            }
        } catch (error) {
            console.error('Error geocoding city:', error);
        }

        // Clear suggestions
        setCitySuggestions([]);
    };

    // Handle selection of street suggestion
    const handleSelectStreet = async (suggestion: any) => {
        // Extract street name
        let streetName = suggestion.title.text;
        // If the title contains the city or other info, clean it up
        if (streetName.includes(',')) {
            const parts = streetName.split(',').map((p: string) => p.trim());
            // Try to find the part that looks like a street
            const streetPart = parts.find(
                (p: string) =>
                    p.includes('улица') ||
                    p.includes('проспект') ||
                    p.includes('переулок')
            );
            streetName = streetPart || parts[0];
        }

        console.log(`Selected street: ${streetName}`);

        // Update form data
        const newFormData = {
            ...formData,
            street: streetName,
            // Clear house number when street changes
            houseNumber: '',
        };
        setFormData(newFormData);

        // Update search query
        const newSearchQuery = `${formData.city}, ${streetName}`;
        setSearchQuery(newSearchQuery);

        // Update input directly
        const addressInput = document.getElementById(
            'address-input'
        ) as HTMLInputElement;
        if (addressInput) {
            addressInput.value = newSearchQuery;
        }

        // Try to get coordinates for the street and update map
        try {
            const response = await fetch(
                `/api/yandex/server-geocode?address=${encodeURIComponent(
                    newSearchQuery
                )}`
            );
            if (response.ok) {
                const data = await response.json();
                console.log('Street geocoding result:', data);

                if (data && data.coordinates && mapInstance) {
                    // Update map to street location
                    mapInstance.setCenter(
                        [data.coordinates.lat, data.coordinates.lng],
                        15
                    );

                    // Update visible coordinates
                    setVisibleCoords({
                        lat: data.coordinates.lat,
                        lng: data.coordinates.lng,
                    });
                }
            }
        } catch (error) {
            console.error('Error geocoding street:', error);
        }

        // Clear suggestions
        setStreetSuggestions([]);
    };

    // Handle selection of house number suggestion
    const handleSelectHouseNumber = async (suggestion: any) => {
        // Extract house number - this might be in different formats
        const fullText = suggestion.title.text;
        let houseNumber = '';

        // Try to extract the house number
        const match = fullText.match(/\b(\d+\w*)\b/); // Extract the first number with optional letters
        if (match) {
            houseNumber = match[1];
        } else {
            // Just use the full text if no number found
            houseNumber = fullText;
        }

        console.log(`Selected house number: ${houseNumber}`);

        // Update form data
        const newFormData = {
            ...formData,
            houseNumber: houseNumber,
        };
        setFormData(newFormData);

        // Update search query
        const newSearchQuery = `${formData.city}, ${formData.street}, ${houseNumber}`;
        setSearchQuery(newSearchQuery);

        // Update input directly
        const addressInput = document.getElementById(
            'address-input'
        ) as HTMLInputElement;
        if (addressInput) {
            addressInput.value = newSearchQuery;
        }

        // Try to get coordinates for the full address and update map
        try {
            const response = await fetch(
                `/api/yandex/server-geocode?address=${encodeURIComponent(
                    newSearchQuery
                )}`
            );
            if (response.ok) {
                const data = await response.json();
                console.log('Full address geocoding result:', data);

                if (data && data.coordinates && mapInstance) {
                    // Update map to exact location with highest zoom
                    mapInstance.setCenter(
                        [data.coordinates.lat, data.coordinates.lng],
                        17
                    );

                    // Update visible coordinates
                    setVisibleCoords({
                        lat: data.coordinates.lat,
                        lng: data.coordinates.lng,
                    });

                    // Update form with structured address data
                    const components = parseYandexAddress(data);
                    setFormData((prev) => ({
                        ...prev,
                        ...components,
                        houseNumber, // Ensure we keep the selected house number
                    }));
                }
            }
        } catch (error) {
            console.error('Error geocoding full address:', error);
        }

        // Clear suggestions
        setHouseNumberSuggestions([]);
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

            <h3 className='text-xl font-bold mb-4'>Адрес доставки</h3>

            {error && (
                <div className='mb-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'>
                    <p>{error}</p>
                </div>
            )}

            {/* Добавляем выпадающий список с адресами пользователя */}
            {userAddresses.length > 0 && (
                <div className='mb-6'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Выберите сохраненный адрес
                    </label>
                    <select
                        className='w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                        onChange={(e) => {
                            if (e.target.value && e.target.value !== 'new') {
                                const selectedAddress = userAddresses.find(
                                    (addr) =>
                                        addr.id === parseInt(e.target.value)
                                );
                                if (selectedAddress) {
                                    // Вызываем асинхронную функцию без ожидания результата
                                    handleSelectSavedAddress(selectedAddress);
                                }
                            }
                        }}
                        defaultValue=''
                    >
                        <option value='' disabled>
                            Выберите адрес
                        </option>
                        {userAddresses.map((address) => (
                            <option key={address.id} value={address.id}>
                                {address.city}, {address.street},{' '}
                                {address.houseNumber}
                                {address.apartment
                                    ? `, кв. ${address.apartment}`
                                    : ''}
                            </option>
                        ))}
                        <option value='new'>Ввести новый адрес</option>
                    </select>
                </div>
            )}

            {/* Примечание о ручном вводе */}
            {!isYandexReady && !isLoadingScript && (
                <div className='mb-4 p-3 bg-blue-50 text-blue-700 rounded-md'>
                    <p>Адрес можно ввести вручную, заполнив форму ниже.</p>
                </div>
            )}

            {/* Address search input - показываем, только если карта доступна */}
            {(isYandexReady || !scriptUrl) && (
                <div className='mb-4'>
                    <label
                        htmlFor='address-input'
                        className='block text-sm font-medium text-gray-700 mb-1'
                    >
                        Найти адрес
                    </label>
                    <div className='relative'>
                        <input
                            type='text'
                            id='address-input'
                            placeholder='Введите адрес...'
                            value={searchQuery}
                            onChange={(e) =>
                                handleAddressSearch(e.target.value)
                            }
                            className='w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                        />
                        {isLoading && (
                            <div className='absolute right-3 top-3'>
                                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-red-600'></div>
                            </div>
                        )}
                    </div>

                    {/* Suggestions dropdown */}
                    {suggestions.length > 0 && (
                        <ul className='mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-md shadow-lg z-10'>
                            {suggestions.map((suggestion, index) => (
                                <li
                                    key={index}
                                    onClick={() =>
                                        handleSelectSuggestion(suggestion)
                                    }
                                    className='p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200'
                                >
                                    <div className='font-medium'>
                                        {suggestion.displayName ||
                                            suggestion.name ||
                                            suggestion.text ||
                                            suggestion.title?.text}
                                    </div>
                                    {(suggestion.description ||
                                        suggestion.subtitle?.text) && (
                                        <div className='text-sm text-gray-500'>
                                            {suggestion.description ||
                                                suggestion.subtitle?.text}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Map placeholder */}
            {isYandexReady && (
                <div
                    ref={mapRef}
                    className='h-60 mb-6 bg-gray-200 rounded-md'
                    style={{ width: '100%' }}
                ></div>
            )}

            {/* Address form */}
            <h4 className='font-medium text-lg mb-4'>Детали адреса</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                <div>
                    <label
                        htmlFor='city'
                        className='block text-sm font-medium text-gray-700 mb-1'
                    >
                        Город*
                    </label>
                    <input
                        type='text'
                        id='city'
                        name='city'
                        value={formData.city || ''}
                        onChange={(e) => {
                            handleInputChange(e);
                            // Для ручного ввода без карты
                            if (e.target.value) {
                                handleManualAddressInput();
                            }
                        }}
                        required
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                    />
                </div>

                <div>
                    <label
                        htmlFor='street'
                        className='block text-sm font-medium text-gray-700 mb-1'
                    >
                        Улица*
                    </label>
                    <input
                        type='text'
                        id='street'
                        name='street'
                        value={formData.street || ''}
                        onChange={(e) => {
                            handleInputChange(e);
                            // Для ручного ввода без карты
                            if (formData.city && e.target.value) {
                                handleManualAddressInput();
                            }
                        }}
                        required
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                    />
                </div>

                <div>
                    <label
                        htmlFor='houseNumber'
                        className='block text-sm font-medium text-gray-700 mb-1'
                    >
                        Номер дома*
                    </label>
                    <input
                        type='text'
                        id='houseNumber'
                        name='houseNumber'
                        value={formData.houseNumber || ''}
                        onChange={(e) => {
                            handleInputChange(e);
                            // Для ручного ввода без карты
                            if (
                                formData.city &&
                                formData.street &&
                                e.target.value
                            ) {
                                handleManualAddressInput();
                            }
                        }}
                        required
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                    />
                </div>

                <div>
                    <label
                        htmlFor='apartment'
                        className='block text-sm font-medium text-gray-700 mb-1'
                    >
                        Квартира
                    </label>
                    <input
                        type='text'
                        id='apartment'
                        name='apartment'
                        value={formData.apartment || ''}
                        onChange={handleInputChange}
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                    />
                </div>
            </div>

            <h4 className='font-medium text-lg mb-4'>
                Дополнительная информация
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div>
                    <label
                        htmlFor='entrance'
                        className='block text-sm font-medium text-gray-700 mb-1'
                    >
                        Подъезд
                    </label>
                    <input
                        type='text'
                        id='entrance'
                        name='entrance'
                        value={formData.entrance || ''}
                        onChange={handleInputChange}
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                    />
                </div>

                <div>
                    <label
                        htmlFor='floor'
                        className='block text-sm font-medium text-gray-700 mb-1'
                    >
                        Этаж
                    </label>
                    <input
                        type='text'
                        id='floor'
                        name='floor'
                        value={formData.floor || ''}
                        onChange={handleInputChange}
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                    />
                </div>

                <div>
                    <label
                        htmlFor='intercom'
                        className='block text-sm font-medium text-gray-700 mb-1'
                    >
                        Домофон
                    </label>
                    <input
                        type='text'
                        id='intercom'
                        name='intercom'
                        value={formData.intercom || ''}
                        onChange={handleInputChange}
                        className='w-full p-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500'
                    />
                </div>
            </div>

            <div className='mt-6'>
                <button
                    onClick={handleSaveAddress}
                    disabled={
                        !formData.city ||
                        !formData.street ||
                        !formData.houseNumber
                    }
                    className={`w-full p-3 rounded-md font-medium ${
                        !formData.city ||
                        !formData.street ||
                        !formData.houseNumber
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                >
                    Сохранить адрес
                </button>
                <p className='text-xs text-gray-500 mt-2'>
                    * Обязательные поля
                </p>
            </div>
        </div>
    );
}
