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
    street: string | null;
    house: string | null;
    apartment: string | null;
    dateOrdered: string;
    user: {
        name: string;
        surname: string;
        phoneNumber: string | null;
    };
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
}

// Add this interface to be compatible with AddressSelection.tsx approach
interface Window {
    ymaps: {
        Map: any;
        Placemark: any;
        Clusterer: any;
        geocode: (address: string) => Promise<any>;
    };
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

    // Geocode addresses and create markers when orders or map changes
    useEffect(() => {
        if (!map || orders.length === 0 || mapError) return;

        const geocodeAddresses = async () => {
            const newMarkers: Marker[] = [];

            try {
                // Create a clusterer for the map
                const clusterer = new window.ymaps.Clusterer({
                    preset: 'islands#redClusterIcons',
                    groupByCoordinates: false,
                    clusterDisableClickZoom: true,
                    clusterHideIconOnBalloonOpen: false,
                    geoObjectHideIconOnBalloonOpen: false,
                });

                // Clear existing map objects
                map.geoObjects.removeAll();

                // Process each order
                for (const order of orders) {
                    if (!order.street || !order.house) continue;

                    try {
                        const address = `${order.street} ${order.house}`;
                        const response = await fetch(
                            `/api/yandex/geocode?address=${encodeURIComponent(
                                address
                            )}`
                        );
                        if (!response.ok)
                            throw new Error(
                                `Failed to geocode address: ${address}`
                            );

                        const data = await response.json();
                        if (data.coordinates && data.coordinates.length === 2) {
                            const [lat, lng] = data.coordinates;

                            // Create a marker
                            const placemark = new window.ymaps.Placemark(
                                [lat, lng],
                                {
                                    balloonContent: `
                                        <strong>Order #${order.id}</strong><br/>
                                        Customer: ${order.user.name} ${
                                        order.user.surname
                                    }<br/>
                                        Address: ${order.street} ${
                                        order.house
                                    }${
                                        order.apartment
                                            ? `, apt ${order.apartment}`
                                            : ''
                                    }<br/>
                                        Phone: ${
                                            order.user.phoneNumber || 'N/A'
                                        }<br/>
                                        Ordered: ${new Date(
                                            order.dateOrdered
                                        ).toLocaleString()}
                                    `,
                                },
                                {
                                    preset: 'islands#redDotIcon',
                                    iconColor: '#FF0000',
                                }
                            );

                            // Store marker reference
                            newMarkers.push({
                                id: newMarkers.length,
                                coords: [lat, lng],
                                orderId: order.id,
                                isHighlighted: false,
                            });

                            // Add marker to clusterer
                            clusterer.add(placemark);
                        }
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

                // Auto-fit bounds if markers exist
                if (newMarkers.length > 0) {
                    map.setBounds(clusterer.getBounds(), {
                        checkZoomRange: true,
                    });
                }
            } catch (error) {
                console.error('Error creating map markers:', error);
                setMapError(true);
            }
        };

        geocodeAddresses();
    }, [map, orders]);

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
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
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
        <MantineProvider>
            <div>
                <Title title='Delivery Management' />

                {error && (
                    <Alert
                        color='red'
                        title='Error'
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
                    <div className='w-full md:w-2/3'>
                        <Card shadow='sm' p='lg' radius='md' withBorder mb={20}>
                            {mapError ? (
                                <div className='flex flex-col items-center justify-center h-[500px] bg-gray-100'>
                                    <IconAlertTriangle
                                        size={48}
                                        color='#ff6b6b'
                                    />
                                    <p className='mt-4 text-lg font-medium text-gray-700'>
                                        Maps functionality is unavailable
                                    </p>
                                    <p className='text-sm text-gray-500 text-center mt-2'>
                                        The delivery map service could not be
                                        loaded. You can still manage orders
                                        below.
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
                    <div className='w-full md:w-1/3'>
                        <Card shadow='sm' p='lg' radius='md' withBorder>
                            <Card.Section className='p-4 bg-gray-100 border-b border-gray-200'>
                                <Text className='text-lg font-bold'>
                                    Orders Ready for Delivery
                                </Text>
                            </Card.Section>

                            {loading ? (
                                <div className='py-8 flex justify-center'>
                                    <Loader size='sm' />
                                </div>
                            ) : orders.length === 0 ? (
                                <div className='py-8 text-center'>
                                    <Text color='dimmed'>
                                        No orders ready for delivery
                                    </Text>
                                </div>
                            ) : (
                                <div className='max-h-[600px] overflow-y-auto py-2'>
                                    {orders.map((order) => (
                                        <Card
                                            key={order.id}
                                            shadow='sm'
                                            p='sm'
                                            radius='md'
                                            mb='sm'
                                            className={`border-l-4 transition-all ${
                                                hoveredOrderId === order.id
                                                    ? 'border-l-blue-500 bg-blue-50'
                                                    : 'border-l-transparent bg-white'
                                            }`}
                                            onMouseEnter={() =>
                                                setHoveredOrderId(order.id)
                                            }
                                            onMouseLeave={() =>
                                                setHoveredOrderId(null)
                                            }
                                        >
                                            <div className='flex justify-between items-center mb-2'>
                                                <Badge
                                                    color='blue'
                                                    variant='filled'
                                                >
                                                    Order #{order.id}
                                                </Badge>
                                                <Text size='xs' color='dimmed'>
                                                    {formatDate(
                                                        order.dateOrdered
                                                    )}
                                                </Text>
                                            </div>

                                            <Group className='mb-2'>
                                                <Avatar
                                                    color='indigo'
                                                    radius='xl'
                                                >
                                                    <IconUser size={20} />
                                                </Avatar>
                                                <div>
                                                    <Text className='font-medium'>
                                                        {order.user.name}{' '}
                                                        {order.user.surname}
                                                    </Text>
                                                    {order.user.phoneNumber && (
                                                        <Text
                                                            size='xs'
                                                            color='dimmed'
                                                        >
                                                            <IconPhone
                                                                size={12}
                                                                style={{
                                                                    display:
                                                                        'inline',
                                                                    marginRight: 4,
                                                                }}
                                                            />
                                                            {
                                                                order.user
                                                                    .phoneNumber
                                                            }
                                                        </Text>
                                                    )}
                                                </div>
                                            </Group>

                                            <Group className='mb-3'>
                                                <IconHomeEdit size={14} />
                                                <Text size='sm'>
                                                    {order.street} {order.house}
                                                    {order.apartment &&
                                                        `, apt ${order.apartment}`}
                                                </Text>
                                            </Group>

                                            <div className='flex justify-between items-center mt-3'>
                                                <div
                                                    style={{
                                                        minWidth: '140px',
                                                    }}
                                                >
                                                    <Menu
                                                        shadow='md'
                                                        width={200}
                                                    >
                                                        <Menu.Target>
                                                            <Button
                                                                variant='light'
                                                                color='blue'
                                                                size='xs'
                                                                fullWidth
                                                                leftSection={
                                                                    <IconUser
                                                                        size={
                                                                            14
                                                                        }
                                                                    />
                                                                }
                                                            >
                                                                {order.courierId
                                                                    ? couriers.find(
                                                                          (c) =>
                                                                              c.id ===
                                                                              order.courierId
                                                                      )?.name ||
                                                                      'Unknown'
                                                                    : 'Assign courier'}
                                                            </Button>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item
                                                                onClick={() =>
                                                                    assignCourier(
                                                                        order.id,
                                                                        0
                                                                    )
                                                                }
                                                                color='red'
                                                            >
                                                                Unassign
                                                            </Menu.Item>
                                                            <Menu.Divider />
                                                            {couriers.map(
                                                                (courier) => (
                                                                    <Menu.Item
                                                                        key={
                                                                            courier.id
                                                                        }
                                                                        onClick={() =>
                                                                            assignCourier(
                                                                                order.id,
                                                                                courier.id
                                                                            )
                                                                        }
                                                                        leftSection={
                                                                            <IconUser
                                                                                size={
                                                                                    14
                                                                                }
                                                                            />
                                                                        }
                                                                    >
                                                                        {
                                                                            courier.name
                                                                        }{' '}
                                                                        {
                                                                            courier.surname
                                                                        }
                                                                    </Menu.Item>
                                                                )
                                                            )}
                                                        </Menu.Dropdown>
                                                    </Menu>
                                                </div>

                                                <Button
                                                    variant='filled'
                                                    color='green'
                                                    size='xs'
                                                    disabled={!order.courierId}
                                                    leftSection={
                                                        <IconTruck size={16} />
                                                    }
                                                    onClick={() =>
                                                        dispatchOrder(order.id)
                                                    }
                                                >
                                                    Dispatch
                                                </Button>
                                            </div>
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
