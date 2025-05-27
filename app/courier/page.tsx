'use client';

import { useState, useEffect } from 'react';
import { useCourierAuth } from '../CourierAuthProvider';
import { toast } from 'react-hot-toast';

// Define Order interface to match the data structure
interface OrderItem {
    id: number;
    itemId: number;
    orderId: number;
    quantity: number;
    item: {
        id: number;
        name: string;
        description: string;
        price: number;
        categoryId: number;
    };
}

interface Order {
    id: number;
    userId: number;
    courierId: number | null;
    paymentType: string;
    isPaid: boolean;
    isCompleted: boolean;
    dateOrdered: string;
    dateArrived: string | null;
    status:
        | 'PENDING'
        | 'CONFIRMED'
        | 'PREPARING'
        | 'READY'
        | 'DELIVERED'
        | 'COMPLETED'
        | 'CANCELLED';
    orderItems: OrderItem[];
    user: {
        id: number;
        name: string;
        email: string;
        phoneNumber: string | null;
        street: string | null;
        house: string | null;
        apartment: string | null;
    };
}

export default function CourierDashboard() {
    const { courierUser } = useCourierAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch orders assigned to the courier
    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/courier/orders', {
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data.orders);
        } catch (error: any) {
            setError(error.message || 'Error fetching orders');
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (courierUser) {
            fetchOrders();
        }
    }, [courierUser]);

    // Update order status
    const updateOrderStatus = async (
        orderId: number,
        currentStatus: string
    ) => {
        try {
            // Determine the next status based on current status
            let newStatus: 'DELIVERED' | 'COMPLETED';

            if (currentStatus === 'READY') {
                newStatus = 'DELIVERED';
            } else if (currentStatus === 'DELIVERED') {
                newStatus = 'COMPLETED';
            } else {
                return; // No valid status change
            }

            // Update the order
            const response = await fetch(`/api/courier/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            // Update local state - either update the order or remove it if it's now COMPLETED
            if (newStatus === 'COMPLETED') {
                setOrders(orders.filter((order) => order.id !== orderId));
                toast.success('Order marked as completed');
            } else {
                setOrders(
                    orders.map((order) =>
                        order.id === orderId
                            ? { ...order, status: newStatus }
                            : order
                    )
                );
                toast.success(`Order status updated to ${newStatus}`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Error updating order status');
            setError(error.message || 'Error updating order status');
            console.error('Error updating order status:', error);
        }
    };

    // Format address
    const formatAddress = (order: Order) => {
        const { street, house, apartment } = order.user;
        let address = '';

        if (street) address += street;
        if (house) address += `, ${house}`;
        if (apartment) address += `, apt. ${apartment}`;

        return address || 'No address provided';
    };

    // Get appropriate button text and color based on order status
    const getButtonProps = (status: string) => {
        if (status === 'READY') {
            return {
                text: 'Mark as Delivered',
                className: 'bg-blue-500 hover:bg-blue-600',
                nextStatus: 'DELIVERED',
            };
        } else if (status === 'DELIVERED') {
            return {
                text: 'Complete Delivery',
                className: 'bg-green-500 hover:bg-green-600',
                nextStatus: 'COMPLETED',
            };
        }
        return {
            text: 'Invalid Status',
            className: 'bg-gray-500',
            nextStatus: '',
        };
    };

    if (isLoading) {
        return (
            <div className='flex justify-center items-center h-64'>
                <div className='animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500'></div>
                <span className='ml-4 text-xl'>Loading deliveries...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div
                className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
                role='alert'
            >
                <strong className='font-bold'>Error:</strong>
                <span className='block sm:inline'> {error}</span>
            </div>
        );
    }

    return (
        <div>
            <div className='flex justify-between items-center mb-6'>
                <h1 className='text-2xl font-bold'>My Deliveries</h1>
                <button
                    onClick={fetchOrders}
                    className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
                >
                    Refresh Deliveries
                </button>
            </div>

            {orders.length === 0 ? (
                <div className='bg-white p-8 rounded-lg shadow text-center'>
                    <h2 className='text-xl mb-2'>No pending deliveries</h2>
                    <p className='text-gray-600'>
                        You don't have any orders to deliver at the moment.
                    </p>
                </div>
            ) : (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className='bg-white p-6 rounded-lg shadow-md'
                        >
                            <div className='flex justify-between items-center mb-4'>
                                <div>
                                    <h3 className='text-lg font-bold'>
                                        Order #{order.id}
                                    </h3>
                                    <p className='text-sm text-gray-600'>
                                        {new Date(
                                            order.dateOrdered
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <span
                                        className={`px-3 py-1 rounded text-white ${
                                            order.status === 'READY'
                                                ? 'bg-blue-500'
                                                : 'bg-green-500'
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <hr className='my-3' />

                            {/* Customer info */}
                            <div className='mb-4'>
                                <h4 className='font-bold mb-2'>Customer:</h4>
                                <p>Name: {order.user.name}</p>
                                <p>
                                    Phone:{' '}
                                    {order.user.phoneNumber || 'Not provided'}
                                </p>
                                <p>Address: {formatAddress(order)}</p>
                            </div>

                            <hr className='my-3' />

                            <h4 className='font-bold mb-2'>Items:</h4>
                            <ul className='space-y-2 mb-4'>
                                {order.orderItems.map((item) => (
                                    <li
                                        key={item.id}
                                        className='flex justify-between'
                                    >
                                        <span className='font-medium'>
                                            {item.quantity}x {item.item.name}
                                        </span>
                                        <span className='text-gray-600'>
                                            $
                                            {(
                                                item.item.price * item.quantity
                                            ).toFixed(2)}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <hr className='my-3' />

                            {/* Payment info */}
                            <div className='mb-4'>
                                <p className='font-medium'>
                                    Payment: {order.paymentType}
                                </p>
                                <p className='font-medium'>
                                    Payment Status:{' '}
                                    {order.isPaid ? 'Paid' : 'Not Paid'}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    updateOrderStatus(order.id, order.status)
                                }
                                className={`${
                                    getButtonProps(order.status).className
                                } w-full text-white py-2 px-4 rounded mt-4`}
                            >
                                {getButtonProps(order.status).text}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
