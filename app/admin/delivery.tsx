'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import {
    Button,
    Card,
    Menu,
    Table,
    Loader,
    Alert,
    MantineProvider,
    Badge,
    Avatar,
    Text,
    Group,
    Select,
} from '@mantine/core';
import {
    IconMapPin,
    IconTruck,
    IconCheck,
    IconAlertTriangle,
    IconUser,
    IconCalendar,
    IconHomeEdit,
    IconPhone,
} from '@tabler/icons-react';
import { Title } from 'react-admin';

// Types
interface Order {
    id: number;
    userId: number;
    courierId: number | null;
    paymentType: string;
    status: string;
    isPaid: boolean;
    isCompleted: boolean;
    dateOrdered: string;
    deliveryTime: string;
    user: {
        name: string;
        surname: string;
        phoneNumber: string | null;
    };
    address?: {
        street: string;
        houseNumber: string;
        apartment?: string | null;
        city: string;
    } | null;
}

interface Courier {
    id: number;
    name: string;
    surname: string;
}

interface Marker {
    id: number;
    coords: [number, number];
    orderId: number;
    isHighlighted: boolean;
    placemark?: any; // Reference to the Yandex Maps placemark object
}

// Declare the window ymaps object for TypeScript
declare global {
    interface Window {
        ymaps: any; // Use any type for ymaps to avoid TypeScript errors
    }
}

const DeliveryManagement = () => {
    // State for orders, couriers, selected order, markers, and map
    const [orders, setOrders] = useState<Order[]>([]);
    const [couriers, setCouriers] = useState<Courier[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [mapError, setMapError] = useState<boolean>(false);
    const [map, setMap] = useState<any>(null);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [hoveredOrderId, setHoveredOrderId] = useState<number | null>(null);
    const [clickedOrderId, setClickedOrderId] = useState<number | null>(null);
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [scriptUrl, setScriptUrl] = useState<string>('');
    const [isYandexReady, setIsYandexReady] = useState(false);
    const [isLoadingScript, setIsLoadingScript] = useState(true);
    const mapRef = useRef<HTMLDivElement>(null);

    // Load Yandex Maps script URL
    useEffect(() => {
        const getScriptUrl = async () => {
            try {
                setIsLoadingScript(true);
                const response = await fetch('/api/yandex/script-url');
                if (!response.ok) {
                    setMapError(true);
                    return;
                }

                const data = await response.json();
                setScriptUrl(data.scriptUrl);
            } catch (error) {
                console.error('Error loading Yandex Maps script URL:', error);
                setMapError(true);
            } finally {
                setIsLoadingScript(false);
            }
        };

        getScriptUrl();
    }, []);

    // Initialize Yandex Maps when script is loaded
    useEffect(() => {
        if (isYandexReady && mapRef.current && !map) {
            const initializeMap = () => {
                try {
                    // Verify ymaps is available
                    if (!window.ymaps) {
                        console.error('window.ymaps is not available');
                        setMapError(true);
                        return;
                    }

                    const yandexMap = new window.ymaps.Map(mapRef.current, {
                        center: [55.76, 37.64], // Default to Moscow center
                        zoom: 11,
                        controls: ['zoomControl'],
                    });

                    // Add a global function for debugging balloon clicks
                    window.debugSelectOrder = function (orderId) {
                        console.log(
                            'Debug: Button clicked for order ID:',
                            orderId
                        );
                        if (window.lastClickedTarget) {
                            console.log(
                                'Debug: Last clicked target:',
                                window.lastClickedTarget
                            );
                        }

                        // Try to select the order through the React state
                        if (typeof window.reactSelectOrder === 'function') {
                            window.reactSelectOrder(orderId);
                        }
                    };

                    // Expose the React state setter for debugging
                    window.reactSelectOrder = function (orderId) {
                        console.log(
                            'Debug: Calling React state setters for order ID:',
                            orderId
                        );
                        setSelectedOrderId(orderId);
                        setClickedOrderId(orderId);

                        // Try to center map and close balloons
                        try {
                            if (yandexMap && yandexMap.balloon) {
                                yandexMap.balloon.close();
                                console.log('Debug: Balloon closed');
                            }
                        } catch (e) {
                            console.error('Debug: Error closing balloon:', e);
                        }
                    };

                    // Setup click listener for the entire map to catch balloon button clicks
                    yandexMap.events.add('click', function (e: any) {
                        // Get the target element that was clicked
                        const target = e.get('domEvent').originalEvent.target;

                        // Store the last clicked target for debugging
                        window.lastClickedTarget = target;
                        console.log('Debug: Map click detected', target);

                        // Check if the clicked element is our button
                        if (
                            target.classList &&
                            target.classList.contains('select-order-btn')
                        ) {
                            console.log('Debug: Button element clicked');
                            const orderId = parseInt(
                                target.getAttribute('data-order-id'),
                                10
                            );
                            console.log(
                                'Debug: Order ID from button:',
                                orderId
                            );

                            if (!isNaN(orderId)) {
                                // Select the order and close balloon
                                console.log(
                                    'Debug: Setting selected order to:',
                                    orderId
                                );
                                window.reactSelectOrder(orderId);
                            }
                        }
                    });

                    setMap(yandexMap);
                } catch (error) {
                    console.error('Error initializing Yandex Map:', error);
                    setMapError(true);
                }
            };

            // Wait a bit to ensure the API is fully loaded
            const timer = setTimeout(() => {
                try {
                    initializeMap();
                } catch (error) {
                    console.error('Error initializing Yandex Maps:', error);
                    setMapError(true);
                }
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isYandexReady, mapRef, map]);

    // Load orders and couriers data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch orders ready for delivery
                const ordersResponse = await fetch(
                    '/api/admin/orders?status=READY'
                );
                if (!ordersResponse.ok)
                    throw new Error('Failed to fetch orders');
                const ordersData = await ordersResponse.json();

                console.log('Fetched orders data:', ordersData);

                setOrders(ordersData);

                // Fetch couriers
                const couriersResponse = await fetch(
                    '/api/admin/users?role=COURIER'
                );
                if (!couriersResponse.ok)
                    throw new Error('Failed to fetch couriers');
                const couriersData = await couriersResponse.json();
                setCouriers(couriersData);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Create markers only when orders or map change, not when hover state changes
    useEffect(() => {
        if (!map || orders.length === 0 || mapError) return;

        const createMarkers = async () => {
            const newMarkers: Marker[] = [];

            try {
                // Create a clusterer for the map
                const clusterer = new window.ymaps.Clusterer({
                    preset: 'islands#blueClusterIcons',
                    groupByCoordinates: false,
                    clusterDisableClickZoom: true,
                    clusterHideIconOnBalloonOpen: false,
                    geoObjectHideIconOnBalloonOpen: false,
                    // Enable balloons for clusters
                    openBalloonOnClick: true,
                    // Custom layout for cluster balloon
                    clusterBalloonContentLayout: 'cluster#balloonCarousel',
                    // Configure balloon options
                    clusterBalloonPagerSize: 5,
                    clusterBalloonPagerType: 'marker',
                });

                // Clear existing map objects
                map.geoObjects.removeAll();

                // Default Moscow coordinates to use as fallback
                const defaultCoords = [55.755826, 37.6173];

                // Process each order
                for (const order of orders) {
                    if (
                        !order.address ||
                        !order.address.street ||
                        !order.address.houseNumber
                    )
                        continue;

                    try {
                        const fullAddress = `${
                            order.address.city || 'Москва'
                        }, ${order.address.street} ${
                            order.address.houseNumber
                        }`;

                        let coordinates;
                        try {
                            const response = await fetch(
                                `/api/yandex/geocode?address=${encodeURIComponent(
                                    fullAddress
                                )}`
                            );

                            if (!response.ok) {
                                console.error(
                                    `Failed to geocode address: ${fullAddress}. Using default coordinates.`
                                );
                                coordinates = defaultCoords;
                            } else {
                                const data = await response.json();
                                coordinates =
                                    data.coordinates &&
                                    data.coordinates.length === 2
                                        ? data.coordinates
                                        : defaultCoords;
                            }
                        } catch (error) {
                            console.error(
                                `Error during geocoding for address ${fullAddress}:`,
                                error
                            );
                            coordinates = defaultCoords;
                        }

                        // Create a marker with either actual or fallback coordinates
                        const [lat, lng] = coordinates;

                        // Create a placemark with HTML button for selection
                        const placemark = new window.ymaps.Placemark(
                            [lat, lng],
                            {
                                orderId: order.id,
                                balloonContentHeader: `Заказ #${order.id}`,
                                balloonContentBody: `
                                    <div class="cluster-balloon-item">
                                        <p><strong>Клиент:</strong> ${
                                            order.user.name
                                        } ${order.user.surname}</p>
                                        <p><strong>Адрес:</strong> ${
                                            order.address.city || 'Москва'
                                        }, ${order.address.street} ${
                                    order.address.houseNumber
                                }${
                                    order.address.apartment
                                        ? `, кв. ${order.address.apartment}`
                                        : ''
                                }</p>
                                        <a href="javascript:void(0)" 
                                           onclick="console.log('Button clicked'); window.debugSelectOrder(${
                                               order.id
                                           }); return false;"
                                           class="select-order-btn" 
                                           data-order-id="${order.id}" 
                                           style="display: inline-block; background-color: #4a7aff; color: white; padding: 5px 10px; 
                                               border: none; border-radius: 4px; cursor: pointer; margin-top: 8px; text-decoration: none;">
                                           Выбрать заказ
                                        </a>
                                    </div>
                                `,
                                balloonContentFooter: `Доставка: ${
                                    formatDate(order.deliveryTime) ||
                                    'Время не указано'
                                }`,
                            },
                            {
                                preset:
                                    hoveredOrderId === order.id ||
                                    selectedOrderId === order.id
                                        ? 'islands#redDotIcon'
                                        : 'islands#blueDotIcon',
                                // Individual markers don't show balloons
                                openBalloonOnClick: false,
                            }
                        );

                        // Add click handler to select the order directly when clicking the marker
                        placemark.events.add('click', () => {
                            setSelectedOrderId(order.id);
                            setClickedOrderId(order.id);
                        });

                        // Add marker to clusterer
                        clusterer.add(placemark);

                        // Store marker reference
                        newMarkers.push({
                            id: newMarkers.length,
                            coords: [lat, lng],
                            orderId: order.id,
                            isHighlighted: hoveredOrderId === order.id,
                            placemark: placemark,
                        });
                    } catch (error) {
                        console.error(
                            `Error geocoding order ${order.id}:`,
                            error
                        );
                    }
                }

                // Add clusterer to map
                map.geoObjects.add(clusterer);
                setMarkers(newMarkers);

                // Only set initial bounds once when the map is first loaded
                if (newMarkers.length > 0 && markers.length === 0) {
                    map.setBounds(clusterer.getBounds(), {
                        checkZoomRange: true,
                    });
                }
            } catch (error) {
                console.error('Error creating map markers:', error);
                setMapError(true);
            }
        };

        createMarkers();
    }, [map, orders]);

    // Update marker colors when hover or selection state changes
    useEffect(() => {
        if (!map || markers.length === 0) return;

        markers.forEach((marker) => {
            if (marker.placemark) {
                marker.placemark.options.set(
                    'preset',
                    hoveredOrderId === marker.orderId ||
                        selectedOrderId === marker.orderId
                        ? 'islands#redDotIcon'
                        : 'islands#blueDotIcon'
                );
            }
        });
    }, [hoveredOrderId, selectedOrderId, markers, map]);

    // Center map on clicked order without changing zoom
    useEffect(() => {
        if (!map || !clickedOrderId) return;

        const orderMarker = markers.find(
            (marker) => marker.orderId === clickedOrderId
        );

        if (orderMarker) {
            // Get current zoom level
            const currentZoom = map.getZoom();

            // Set center at the current zoom level
            map.setCenter(orderMarker.coords, currentZoom, {
                duration: 500,
            });
        }
    }, [clickedOrderId, map, markers]);

    // Handle assigning courier to an order
    const assignCourier = async (orderId: number, courierId: number) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courierId,
                }),
            });

            if (!response.ok) throw new Error('Failed to assign courier');

            // Update local state
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, courierId } : order
                )
            );
        } catch (error) {
            console.error('Error assigning courier:', error);
            setError('Failed to assign courier');
        }
    };

    // Handle dispatching an order
    const dispatchOrder = async (orderId: number) => {
        try {
            const order = orders.find((o) => o.id === orderId);
            if (!order?.courierId) {
                setError('Cannot dispatch order without assigned courier');
                return;
            }

            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'DELIVERED', // Change status to DELIVERED
                }),
            });

            if (!response.ok) throw new Error('Failed to dispatch order');

            // Remove order from list
            setOrders((prevOrders) =>
                prevOrders.filter((order) => order.id !== orderId)
            );
        } catch (error) {
            console.error('Error dispatching order:', error);
            setError('Failed to dispatch order');
        }
    };

    const handleYandexLoad = () => {
        console.log('Yandex Maps API loaded');
        setIsYandexReady(true);
    };

    const handleYandexError = (e: any) => {
        console.error('Error loading Yandex Maps API:', e);
        setMapError(true);
    };

    // Format date in a readable way
    const formatDate = (dateString: string | undefined | null) => {
        try {
            if (!dateString) {
                return 'Дата не указана';
            }
            const date = new Date(dateString);
            // Check if date is valid
            if (isNaN(date.getTime())) {
                return 'Дата не указана';
            }
            return date.toLocaleString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            console.error('Error formatting date:', e);
            return 'Дата не указана';
        }
    };

    if (loading) {
        return (
            <MantineProvider>
                <div className='flex justify-center items-center h-96'>
                    <Loader size='xl' />
                </div>
            </MantineProvider>
        );
    }

    return (
        <MantineProvider withNormalizeCSS withGlobalStyles>
            <div>
                <Title title='Управление доставкой' />

                {error && (
                    <Alert
                        color='red'
                        title='Ошибка'
                        mb={20}
                        withCloseButton
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                )}

                {/* Yandex Maps Script */}
                {!isLoadingScript && scriptUrl && !mapError && (
                    <Script
                        src={scriptUrl}
                        onLoad={handleYandexLoad}
                        onError={handleYandexError}
                        strategy='afterInteractive'
                    />
                )}

                <div className='flex flex-col md:flex-row gap-6'>
                    {/* Map Container */}
                    <div className='w-full md:w-1/2'>
                        <Card shadow='md' p='xl' radius='md' withBorder mb={20}>
                            {mapError ? (
                                <div className='flex flex-col items-center justify-center h-[500px] bg-gray-100'>
                                    <IconAlertTriangle
                                        size={48}
                                        color='#ff6b6b'
                                    />
                                    <p className='mt-4 text-lg font-medium text-gray-700'>
                                        Сервис карт недоступен
                                    </p>
                                    <p className='text-sm text-gray-500 text-center mt-2'>
                                        Не удалось загрузить карту доставки. Вы
                                        все еще можете управлять заказами ниже.
                                    </p>
                                </div>
                            ) : (
                                <div
                                    ref={mapRef}
                                    style={{ width: '100%', height: '500px' }}
                                >
                                    {isLoadingScript && (
                                        <div className='flex justify-center items-center h-full'>
                                            <Loader
                                                size='lg'
                                                className='mx-auto my-10'
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Orders List */}
                    <div className='w-full md:w-1/2'>
                        <Card shadow='md' p='xl' radius='md' withBorder>
                            <Card.Section className='p-4 bg-gray-100 border-b border-gray-200'>
                                <Text className='text-lg font-bold'>
                                    Заказы готовые к доставке
                                </Text>
                            </Card.Section>

                            {loading ? (
                                <div className='py-8 flex justify-center'>
                                    <Loader size='sm' />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className='py-8 text-center'>
                                    <Text color='dimmed'>
                                        Нет заказов готовых к доставке
                                    </Text>
                                </div>
                            ) : (
                                <div className='max-h-[600px] !space-y-4 overflow-y-auto mt-4'>
                                    {orders.map((order) => (
                                        <Card
                                            key={order.id}
                                            shadow='sm'
                                            p='lg'
                                            radius='md'
                                            mb='sm'
                                            className={`!p-2 shadow-sm border-l-4 transition-all ${
                                                hoveredOrderId === order.id
                                                    ? 'border-l-blue-500 bg-blue-50'
                                                    : selectedOrderId ===
                                                      order.id
                                                    ? 'border-l-blue-500 bg-blue-50'
                                                    : 'border-l-transparent bg-white'
                                            }`}
                                            onMouseEnter={() =>
                                                setHoveredOrderId(order.id)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredOrderId(null)
                                            }
                                            onClick={() => {
                                                setClickedOrderId(order.id);
                                                setSelectedOrderId(order.id);
                                            }}
                                            style={{ cursor: 'pointer' }}
                                            withBorder
                                        >
                                            <div className='flex justify-between items-center mb-3'>
                                                <Badge
                                                    color='blue'
                                                    variant='filled'
                                                    size='lg'
                                                    className='font-bold'
                                                >
                                                    Заказ #{order.id}
                                                </Badge>
                                                <Text
                                                    size='sm'
                                                    className='font-bold'
                                                >
                                                    {formatDate(
                                                        order.deliveryTime
                                                    )}
                                                </Text>
                                            </div>

                                            <div className='flex items-center mb-3 gap-2'>
                                                <IconUser
                                                    size={18}
                                                    color='#666'
                                                />
                                                <Text className='font-medium'>
                                                    {order.user.name}{' '}
                                                    {order.user.surname}
                                                </Text>
                                            </div>

                                            {order.user.phoneNumber && (
                                                <div className='flex items-center gap-2 mb-3'>
                                                    <IconPhone
                                                        size={18}
                                                        color='#666'
                                                    />
                                                    <Text
                                                        size='sm'
                                                        color='dimmed'
                                                    >
                                                        {order.user.phoneNumber}
                                                    </Text>
                                                </div>
                                            )}

                                            <div className='flex items-start gap-2 mb-3'>
                                                <IconHomeEdit
                                                    size={18}
                                                    color='#666'
                                                />
                                                <Text size='sm'>
                                                    {order.address ? (
                                                        <>
                                                            {
                                                                order.address
                                                                    .street
                                                            }{' '}
                                                            {
                                                                order.address
                                                                    .houseNumber
                                                            }
                                                            {order.address
                                                                .apartment &&
                                                                `, кв. ${order.address.apartment}`}
                                                        </>
                                                    ) : (
                                                        'Адрес не указан'
                                                    )}
                                                </Text>
                                            </div>

                                            {/* Courier Assignment Dropdown */}
                                            <div className='flex items-center gap-2 mt-4'>
                                                <IconTruck
                                                    size={18}
                                                    color='#666'
                                                />
                                                <select
                                                    className='w-full p-2 border border-gray-300 rounded'
                                                    value={
                                                        order.courierId?.toString() ||
                                                        ''
                                                    }
                                                    onChange={(e) => {
                                                        const value =
                                                            e.target.value;
                                                        if (value) {
                                                            const courierId =
                                                                parseInt(value);
                                                            assignCourier(
                                                                order.id,
                                                                courierId
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <option value=''>
                                                        Выберите курьера
                                                    </option>
                                                    {couriers.map((courier) => (
                                                        <option
                                                            key={courier.id}
                                                            value={courier.id.toString()}
                                                        >
                                                            {courier.name}{' '}
                                                            {courier.surname}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Dispatch Button - show only when courier is assigned */}
                                            {order.courierId && (
                                                <Button
                                                    color='green'
                                                    className='mt-3 m-auto block py-1 px-2 text-white font-bold w-fit rounded-sm bg-blue-500'
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent card selection
                                                        dispatchOrder(order.id);
                                                    }}
                                                >
                                                    Отправить заказ
                                                </Button>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </MantineProvider>
    );
};

export default DeliveryManagement;
