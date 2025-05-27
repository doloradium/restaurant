'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: string;
    createdAt: string;
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
    };
}

const ConfirmationPage = ({ params }: { params: { orderId: string } }) => {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await fetch(`/api/orders/${params.orderId}`, {
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setOrder(data);
                } else {
                    toast.error('Failed to load order details');
                    router.push('/');
                }
            } catch (error) {
                console.error('Error fetching order:', error);
                toast.error('Failed to load order details');
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrder();
    }, [params.orderId, router]);

    if (isLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500'></div>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className='min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50'>
            <div className='max-w-3xl mx-auto'>
                <div className='text-center mb-8'>
                    <FaCheckCircle className='mx-auto h-16 w-16 text-green-500' />
                    <h2 className='mt-4 text-3xl font-bold text-gray-900'>
                        Order Confirmed!
                    </h2>
                    <p className='mt-2 text-lg text-gray-600'>
                        Thank you for your order. We'll start preparing it right
                        away.
                    </p>
                </div>

                <div className='bg-white shadow rounded-lg divide-y divide-gray-200'>
                    <div className='p-6'>
                        <h3 className='text-lg font-medium text-gray-900 mb-4'>
                            Order Details
                        </h3>
                        <div className='space-y-4'>
                            <div className='flex justify-between text-sm'>
                                <span className='text-gray-500'>
                                    Order Number
                                </span>
                                <span className='text-gray-900 font-medium'>
                                    #{order.id}
                                </span>
                            </div>
                            <div className='flex justify-between text-sm'>
                                <span className='text-gray-500'>Date</span>
                                <span className='text-gray-900 font-medium'>
                                    {new Date(
                                        order.createdAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                            <div className='flex justify-between text-sm'>
                                <span className='text-gray-500'>Status</span>
                                <span className='text-gray-900 font-medium'>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='p-6'>
                        <h3 className='text-lg font-medium text-gray-900 mb-4'>
                            Order Items
                        </h3>
                        <div className='space-y-4'>
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className='flex justify-between items-center'
                                >
                                    <div>
                                        <p className='text-gray-900 font-medium'>
                                            {item.name}
                                        </p>
                                        <p className='text-gray-500 text-sm'>
                                            Quantity: {item.quantity}
                                        </p>
                                    </div>
                                    <p className='text-gray-900 font-medium'>
                                        $
                                        {(item.price * item.quantity).toFixed(
                                            2
                                        )}
                                    </p>
                                </div>
                            ))}
                            <div className='border-t border-gray-200 pt-4'>
                                <div className='flex justify-between items-center'>
                                    <p className='text-lg font-medium text-gray-900'>
                                        Total
                                    </p>
                                    <p className='text-2xl font-bold text-red-600'>
                                        ${order.total.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='p-6'>
                        <h3 className='text-lg font-medium text-gray-900 mb-4'>
                            Shipping Information
                        </h3>
                        <div className='space-y-2'>
                            <p className='text-gray-900'>
                                {order.shippingAddress.name}
                            </p>
                            <p className='text-gray-900'>
                                {order.shippingAddress.address}
                            </p>
                            <p className='text-gray-900'>
                                {order.shippingAddress.city}
                                {order.shippingAddress.state
                                    ? `, ${order.shippingAddress.state}`
                                    : ''}
                                {order.shippingAddress.zipCode
                                    ? ` ${order.shippingAddress.zipCode}`
                                    : ''}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='mt-8 text-center'>
                    <button
                        onClick={() => router.push('/')}
                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    >
                        <FaShoppingBag className='mr-2' />
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;
