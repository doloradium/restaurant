'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    FaCheckCircle,
    FaHome,
    FaHistory,
    FaMapMarkerAlt,
    FaPhone,
    FaUtensils,
} from 'react-icons/fa';

const ConfirmationPage = () => {
    const router = useRouter();

    // Mock order data (in a real app, this would come from your order state or API)
    const orderDetails = {
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleString(),
        items: [
            { id: 1, name: 'Salmon Nigiri', quantity: 2, price: 7.99 },
            { id: 5, name: 'Dragon Roll', quantity: 1, price: 16.99 },
            { id: 9, name: 'Vegetable Roll', quantity: 1, price: 10.99 },
        ],
        subtotal: 43.96,
        deliveryFee: 3.99,
        tax: 3.74,
        total: 51.69,
        deliveryAddress: '123 Main Street, Apt 4B, Cityville, State 12345',
        estimatedDelivery: '35-45 minutes',
        paymentMethod: 'Credit Card (ending in 4242)',
    };

    return (
        <div className='bg-gray-50 min-h-screen py-12'>
            <div className='container mx-auto px-4'>
                <div className='max-w-3xl mx-auto'>
                    {/* Success Header */}
                    <div className='bg-white rounded-lg shadow-sm p-8 mb-8 text-center'>
                        <div className='text-green-500 text-7xl mb-4 flex justify-center'>
                            <FaCheckCircle />
                        </div>
                        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                            Thank You for Your Order!
                        </h1>
                        <p className='text-gray-600 mb-6'>
                            Your order has been received and is being processed.
                        </p>
                        <div className='bg-gray-50 p-4 rounded-md inline-block'>
                            <div className='text-lg font-bold text-gray-800'>
                                Order #: {orderDetails.orderId}
                            </div>
                            <div className='text-sm text-gray-600'>
                                Placed on: {orderDetails.date}
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className='bg-white rounded-lg shadow-sm overflow-hidden mb-8'>
                        <div className='p-6 border-b border-gray-200'>
                            <h2 className='text-xl font-bold text-gray-800'>
                                Order Details
                            </h2>
                        </div>

                        <div className='p-6'>
                            <div className='mb-8'>
                                <h3 className='text-lg font-medium text-gray-800 mb-4'>
                                    Items Ordered
                                </h3>
                                <div className='space-y-4'>
                                    {orderDetails.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className='flex justify-between items-center border-b border-gray-100 pb-3'
                                        >
                                            <div className='flex-1'>
                                                <div className='font-medium text-gray-800'>
                                                    {item.name}
                                                </div>
                                                <div className='text-sm text-gray-600'>
                                                    Quantity: {item.quantity}
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <div className='font-medium text-gray-800'>
                                                    $
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </div>
                                                <div className='text-sm text-gray-600'>
                                                    ${item.price.toFixed(2)}{' '}
                                                    each
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
                                {/* Delivery Information */}
                                <div>
                                    <h3 className='text-lg font-medium text-gray-800 mb-4 flex items-center'>
                                        <FaMapMarkerAlt className='mr-2 text-red-500' />{' '}
                                        Delivery Information
                                    </h3>
                                    <div className='bg-gray-50 p-4 rounded-md'>
                                        <p className='text-gray-700 mb-2'>
                                            <span className='font-medium'>
                                                Address:
                                            </span>{' '}
                                            {orderDetails.deliveryAddress}
                                        </p>
                                        <p className='text-gray-700'>
                                            <span className='font-medium'>
                                                Estimated Delivery Time:
                                            </span>{' '}
                                            {orderDetails.estimatedDelivery}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div>
                                    <h3 className='text-lg font-medium text-gray-800 mb-4 flex items-center'>
                                        <FaUtensils className='mr-2 text-red-500' />{' '}
                                        Payment Information
                                    </h3>
                                    <div className='bg-gray-50 p-4 rounded-md'>
                                        <p className='text-gray-700 mb-4'>
                                            <span className='font-medium'>
                                                Payment Method:
                                            </span>{' '}
                                            {orderDetails.paymentMethod}
                                        </p>
                                        <div className='space-y-1 text-sm'>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-600'>
                                                    Subtotal
                                                </span>
                                                <span className='font-medium'>
                                                    $
                                                    {orderDetails.subtotal.toFixed(
                                                        2
                                                    )}
                                                </span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-600'>
                                                    Delivery Fee
                                                </span>
                                                <span className='font-medium'>
                                                    $
                                                    {orderDetails.deliveryFee.toFixed(
                                                        2
                                                    )}
                                                </span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <span className='text-gray-600'>
                                                    Tax
                                                </span>
                                                <span className='font-medium'>
                                                    $
                                                    {orderDetails.tax.toFixed(
                                                        2
                                                    )}
                                                </span>
                                            </div>
                                            <div className='flex justify-between pt-2 border-t border-gray-200 mt-2'>
                                                <span className='font-bold text-gray-800'>
                                                    Total
                                                </span>
                                                <span className='font-bold text-red-600'>
                                                    $
                                                    {orderDetails.total.toFixed(
                                                        2
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Status */}
                            <div className='mb-8'>
                                <h3 className='text-lg font-medium text-gray-800 mb-4'>
                                    Order Status
                                </h3>
                                <div className='relative'>
                                    <div className='absolute left-7 top-0 h-full border-l-2 border-green-200'></div>
                                    <ul className='space-y-8'>
                                        <li className='relative'>
                                            <div className='flex items-center'>
                                                <div className='z-10 bg-green-500 rounded-full h-4 w-4 absolute left-5 -translate-x-1/2'></div>
                                                <div className='ml-10'>
                                                    <h4 className='font-medium text-gray-800'>
                                                        Order Received
                                                    </h4>
                                                    <p className='text-sm text-gray-600'>
                                                        We've received your
                                                        order and are processing
                                                        it.
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                        <li className='relative'>
                                            <div className='flex items-center'>
                                                <div className='z-10 bg-gray-300 rounded-full h-4 w-4 absolute left-5 -translate-x-1/2'></div>
                                                <div className='ml-10'>
                                                    <h4 className='font-medium text-gray-600'>
                                                        Preparing Your Order
                                                    </h4>
                                                    <p className='text-sm text-gray-500'>
                                                        Our chefs are preparing
                                                        your fresh sushi.
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                        <li className='relative'>
                                            <div className='flex items-center'>
                                                <div className='z-10 bg-gray-300 rounded-full h-4 w-4 absolute left-5 -translate-x-1/2'></div>
                                                <div className='ml-10'>
                                                    <h4 className='font-medium text-gray-600'>
                                                        Out for Delivery
                                                    </h4>
                                                    <p className='text-sm text-gray-500'>
                                                        Your order is on its way
                                                        to you.
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                        <li className='relative'>
                                            <div className='flex items-center'>
                                                <div className='z-10 bg-gray-300 rounded-full h-4 w-4 absolute left-5 -translate-x-1/2'></div>
                                                <div className='ml-10'>
                                                    <h4 className='font-medium text-gray-600'>
                                                        Delivered
                                                    </h4>
                                                    <p className='text-sm text-gray-500'>
                                                        Enjoy your meal!
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className='bg-gray-50 p-6 rounded-lg'>
                                <h3 className='text-lg font-medium text-gray-800 mb-4'>
                                    Need Help?
                                </h3>
                                <p className='text-gray-600 mb-4'>
                                    If you have any questions about your order,
                                    please contact us:
                                </p>
                                <div className='flex flex-col md:flex-row gap-4'>
                                    <div className='flex items-center'>
                                        <FaPhone className='text-red-500 mr-2' />
                                        <a
                                            href='tel:+15551234567'
                                            className='text-red-600 hover:text-red-700'
                                        >
                                            (555) 123-4567
                                        </a>
                                    </div>
                                    <div className='md:ml-8'>
                                        Order Reference: {orderDetails.orderId}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Link
                            href='/'
                            className='flex-1 flex justify-center items-center py-3 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-200'
                        >
                            <FaHome className='mr-2' /> Return to Home
                        </Link>
                        <Link
                            href='/menu'
                            className='flex-1 flex justify-center items-center py-3 px-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition duration-200'
                        >
                            <FaHistory className='mr-2' /> Order Again
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;
